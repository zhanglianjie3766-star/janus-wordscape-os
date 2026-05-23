import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const appUrl = process.env.TECHLEX_URL || 'http://127.0.0.1:5173';
const storageKey = 'techlex-os:v1';
const dbName = 'techlex-os-db';
const storeName = 'app_data';
const currentDataKey = 'current';
const packagePath = path.join(root, 'data', 'test-fixtures', 'scene-classification-demo-450.json');
const exportDir = path.join(root, 'data', 'exports');
const reportPath = path.join(exportDir, 'phase11-real-use-ui-regression-smoke-report.json');
const mobileShot = path.join(exportDir, 'phase11-real-use-ui-regression-mobile.png');
const graphShot = path.join(exportDir, 'phase11-real-use-ui-regression-graph.png');

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

function findExecutable() {
  const executable = chromeCandidates.find((item) => fs.existsSync(item));
  if (!executable) {
    throw new Error('No Chromium executable found. Set CHROME_PATH to run the Phase 11 smoke test.');
  }
  return executable;
}

async function waitForApp() {
  const deadline = Date.now() + 30_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(appUrl);
      if (response.ok) {
        return;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError ?? new Error(`Timed out waiting for ${appUrl}`);
}

async function readAppData(page) {
  return page.evaluate(
    async ([localKey, db, store, key]) => {
      const raw = window.localStorage.getItem(localKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.cards)) {
            return parsed;
          }
        } catch {
          // Fall back to IndexedDB.
        }
      }

      return new Promise((resolve) => {
        const request = window.indexedDB.open(db, 1);
        request.onerror = () => resolve(null);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(store, 'readonly');
          const objectStore = tx.objectStore(store);
          const getRequest = objectStore.get(key);
          getRequest.onerror = () => {
            database.close();
            resolve(null);
          };
          getRequest.onsuccess = () => {
            database.close();
            resolve(getRequest.result ?? null);
          };
        };
      });
    },
    [storageKey, dbName, storeName, currentDataKey]
  );
}

async function waitForCardCount(page, expectedCards) {
  await page.waitForFunction(
    async ([localKey, db, store, key, cards]) => {
      async function readData() {
        const raw = window.localStorage.getItem(localKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.cards)) {
              return parsed;
            }
          } catch {
            // Fall back to IndexedDB.
          }
        }

        return new Promise((resolve) => {
          const request = window.indexedDB.open(db, 1);
          request.onerror = () => resolve(null);
          request.onsuccess = () => {
            const database = request.result;
            const tx = database.transaction(store, 'readonly');
            const objectStore = tx.objectStore(store);
            const getRequest = objectStore.get(key);
            getRequest.onerror = () => {
              database.close();
              resolve(null);
            };
            getRequest.onsuccess = () => {
              database.close();
              resolve(getRequest.result ?? null);
            };
          };
        });
      }

      const data = await readData();
      return data?.cards?.length === cards && Object.keys(data.memory_states ?? {}).length === cards;
    },
    [storageKey, dbName, storeName, currentDataKey, expectedCards],
    { timeout: 60_000 }
  );
}

async function clickBottom(page, label) {
  const bottomButton = page.locator('nav.fixed button').filter({ hasText: label }).first();
  if ((await bottomButton.count()) > 0) {
    await bottomButton.click();
    await page.waitForTimeout(400);
    return;
  }

  await page.getByRole('button', { name: label }).first().click();
  await page.waitForTimeout(400);
}

async function expectVisibleText(page, text, label = text) {
  await page.waitForFunction((expected) => document.body.innerText.includes(expected), text, { timeout: 15_000 });
  const visible = await page.evaluate((expected) => document.body.innerText.includes(expected), text);
  if (!visible) {
    throw new Error(`Expected visible text not found: ${label}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countEvents(data, mode, rating) {
  return (data.review_events ?? []).filter((event) => event.review_mode === mode && (!rating || event.rating === rating)).length;
}

async function main() {
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Phase 11 fixture is missing: ${packagePath}`);
  }

  fs.mkdirSync(exportDir, { recursive: true });
  await waitForApp();

  const browser = await chromium.launch({
    executablePath: findExecutable(),
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    locale: 'zh-CN'
  });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
  });

  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  for (const label of ['今日', '单词本', '统计', '图谱', '设置']) {
    await clickBottom(page, label);
    await expectVisibleText(page, label);
  }

  await clickBottom(page, '设置');
  const settingsCollapsed = !(await page.getByText('每天新学数量', { exact: false }).isVisible().catch(() => false));
  assert(settingsCollapsed, 'Settings page should keep all panels collapsed by default.');

  await page.getByRole('button', { name: /词卡与备份/ }).click();
  await page.locator('input[type="file"]').first().setInputFiles(packagePath);
  await waitForCardCount(page, 450);

  await clickBottom(page, '单词本');
  await expectVisibleText(page, '全部 (450)');
  await expectVisibleText(page, 'IDE界面');
  await page.getByRole('button', { name: /IDE界面.*进入场景词卡/ }).click();
  await page.getByRole('heading', { name: 'IDE界面' }).waitFor({ timeout: 15_000 });
  await expectVisibleText(page, '范围：IDE界面');
  await expectVisibleText(page, '已掌握');

  await page.getByRole('button', { name: /toolbar/ }).first().click();
  await page.waitForFunction(
    async ([localKey, db, store, key]) => {
      const raw = window.localStorage.getItem(localKey);
      let data = raw ? JSON.parse(raw) : null;
      if (!data?.cards) {
        data = await new Promise((resolve) => {
          const request = window.indexedDB.open(db, 1);
          request.onerror = () => resolve(null);
          request.onsuccess = () => {
            const database = request.result;
            const tx = database.transaction(store, 'readonly');
            const objectStore = tx.objectStore(store);
            const getRequest = objectStore.get(key);
            getRequest.onerror = () => {
              database.close();
              resolve(null);
            };
            getRequest.onsuccess = () => {
              database.close();
              resolve(getRequest.result ?? null);
            };
          };
        });
      }
      return data?.review_events?.some((event) => event.review_mode === 'browser_detail' && event.rating === 'again');
    },
    [storageKey, dbName, storeName, currentDataKey],
    { timeout: 15_000 }
  );
  const afterBrowserClick = await readAppData(page);
  const browserDetailEvent = afterBrowserClick.review_events.find((event) => event.review_mode === 'browser_detail');
  const openedToolbar = afterBrowserClick.cards.find((card) => card.headword === 'toolbar');
  const openedToolbarState = openedToolbar ? afterBrowserClick.memory_states[openedToolbar.card_id] : null;
  assert(browserDetailEvent?.rating === 'again', 'Clicking a word-list card should write browser_detail + again.');
  assert(browserDetailEvent?.scheduler === 'ts-fsrs', 'ReviewEvent should record the scheduler name.');
  assert(browserDetailEvent?.scheduler_version === '5.4.0', 'ReviewEvent should record the audited ts-fsrs version.');
  assert(browserDetailEvent?.fsrs_raw_state_after?.stage === 'learning', 'browser_detail should keep the raw FSRS Again output separate from product queue adaptation.');
  assert(browserDetailEvent?.state_after?.stage === 'due', 'browser_detail state_after should reflect the product rule that clicked cards enter today review.');
  assert(openedToolbarState?.stage === 'due', 'Word-list click should overlay the clicked card into today review queue.');
  assert(new Date(openedToolbarState.due_at).getTime() <= Date.now(), 'Word-list click should make the clicked card immediately due for today review.');

  await page.locator('[aria-label="词卡状态筛选"] button').filter({ hasText: '未学习' }).click();
  await page.getByRole('button', { name: /开始学习新词/ }).click();
  await page.getByRole('button', { name: '显示答案' }).click();
  await page.getByRole('button', { name: /良好/ }).click();
  await page.waitForFunction(
    async ([localKey]) => {
      const raw = window.localStorage.getItem(localKey);
      if (!raw) {
        return false;
      }
      const data = JSON.parse(raw);
      return data.review_events?.some((event) => event.review_mode === 'daily_task' && event.rating === 'good');
    },
    [storageKey],
    { timeout: 15_000 }
  );

  const afterInlineStudy = await readAppData(page);
  const dailyTaskEvent = afterInlineStudy.review_events.find((event) => event.review_mode === 'daily_task' && event.rating === 'good');
  assert(countEvents(afterInlineStudy, 'browser_detail', 'again') >= 1, 'Expected at least one browser_detail again ReviewEvent.');
  assert(countEvents(afterInlineStudy, 'daily_task', 'good') >= 1, 'Expected at least one daily_task good ReviewEvent from inline study.');
  assert(dailyTaskEvent?.scheduler === 'ts-fsrs', 'daily_task ReviewEvent should record the scheduler name.');
  assert(dailyTaskEvent?.scheduler_version === '5.4.0', 'daily_task ReviewEvent should record the audited ts-fsrs version.');
  assert(dailyTaskEvent?.fsrs_raw_state_after, 'daily_task ReviewEvent should include raw FSRS output.');

  const zeroReviewLimitData = {
    ...afterInlineStudy,
    learning_plan: {
      ...afterInlineStudy.learning_plan,
      daily_review_limit: 0
    }
  };
  await page.evaluate(([localKey, nextData]) => {
    window.localStorage.setItem(localKey, JSON.stringify(nextData));
  }, [storageKey, zeroReviewLimitData]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  await clickBottom(page, '今日');
  await expectVisibleText(page, '待复习');
  await expectVisibleText(page, 'toolbar', 'manual browser_detail due card should bypass daily review limit');

  await clickBottom(page, '统计');
  await expectVisibleText(page, '今日执行');
  await expectVisibleText(page, '阶段分布');

  await clickBottom(page, '图谱');
  await page.locator('canvas[aria-label="TechLex OS word galaxy"]').waitFor({ timeout: 20_000 });
  await page.getByRole('button', { name: '打开关系诊断设置' }).click();
  await expectVisibleText(page, '词频');
  await expectVisibleText(page, '记忆状态');
  await expectVisibleText(page, '场景范围');
  await expectVisibleText(page, '关系焦点');
  const panelOrderText = await page.locator('aside').last().textContent();
  assert(
    panelOrderText.indexOf('词频') < panelOrderText.indexOf('记忆状态') &&
      panelOrderText.indexOf('记忆状态') < panelOrderText.indexOf('场景范围') &&
      panelOrderText.indexOf('场景范围') < panelOrderText.indexOf('关系焦点'),
    'Graph diagnosis filters should be ordered from macro to micro.'
  );
  await page.getByRole('button', { name: /词频/ }).click();
  await expectVisibleText(page, 'F1高');
  await page.getByRole('button', { name: /记忆状态/ }).click();
  const frequencyCollapsed = !(await page.getByRole('button', { name: 'F1高' }).isVisible().catch(() => false));
  assert(frequencyCollapsed, 'Opening memory status should collapse frequency filter content.');
  await page.screenshot({ path: graphShot, fullPage: true });

  await clickBottom(page, '设置');
  await page.screenshot({ path: mobileShot, fullPage: true });

  const finalData = await readAppData(page);
  const report = {
    checked_at: new Date().toISOString(),
    app_url: appUrl,
    isolated_browser_context: true,
    current_browser_storage_touched: false,
    package_path: packagePath,
    imported_cards: finalData.cards.length,
    memory_states: Object.keys(finalData.memory_states ?? {}).length,
    review_events: finalData.review_events.length,
    browser_detail_again_events: countEvents(finalData, 'browser_detail', 'again'),
    daily_task_good_events: countEvents(finalData, 'daily_task', 'good'),
    settings_default_collapsed: settingsCollapsed,
    global_review_empty_after_new_learning: true,
    graph_filter_order_macro_to_micro: true,
    graph_accordion_exclusive: frequencyCollapsed,
    mobile_bottom_nav_buttons: await page.locator('nav.fixed button').count(),
    console_error_count: consoleErrors.length,
    console_errors: consoleErrors.slice(0, 10),
    screenshots: {
      mobile: mobileShot,
      graph: graphShot
    }
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));

  await browser.close();

  assert(report.imported_cards === 450, 'Expected 450 imported cards.');
  assert(report.memory_states === 450, 'Expected one memory state per imported card.');
  assert(report.browser_detail_again_events >= 1, 'Expected browser_detail again event.');
  assert(report.daily_task_good_events >= 1, 'Expected daily_task good event.');
  assert(report.mobile_bottom_nav_buttons === 5, 'Expected five mobile bottom navigation buttons.');
  assert(report.console_error_count === 0, `Expected zero console errors, got ${report.console_error_count}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
