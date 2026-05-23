import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const appUrl = process.env.TECHLEX_URL || 'http://127.0.0.1:5173';
const storageKey = 'techlex-os:v1';
const rollbackKey = 'techlex-os:last-import-rollback';
const dbName = 'techlex-os-db';
const storeName = 'app_data';
const currentDataKey = 'current';
const packagePath = path.join(root, 'data', 'test-fixtures', 'obsidian-grade-word-galaxy-package.json');
const exportDir = path.join(root, 'data', 'exports');
const reportPath = path.join(exportDir, 'phase10-obsidian-word-galaxy-smoke-report.json');
const desktopShot = path.join(exportDir, 'phase10-obsidian-word-galaxy-desktop.png');
const mobileShot = path.join(exportDir, 'phase10-obsidian-word-galaxy-mobile.png');

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
    throw new Error('No Chromium executable found. Set CHROME_PATH to run the smoke test.');
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

async function clearBrowserPersistence(page) {
  await page.evaluate(
    ([key, rollback, db]) =>
      new Promise((resolve) => {
        window.localStorage.removeItem(key);
        window.localStorage.removeItem(rollback);
        const request = window.indexedDB.deleteDatabase(db);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
        request.onblocked = () => resolve(false);
      }),
    [storageKey, rollbackKey, dbName]
  );
}

async function waitForDbCards(page, expectedCards) {
  await page.waitForFunction(
    async ([db, storeNameArg, key, cards]) => {
      const data = await new Promise((resolve) => {
        const request = window.indexedDB.open(db, 1);
        request.onerror = () => resolve(null);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(storeNameArg, 'readonly');
          const store = tx.objectStore(storeNameArg);
          const getRequest = store.get(key);
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

      return data?.cards?.length === cards && Object.keys(data.memory_states ?? {}).length === cards;
    },
    [dbName, storeName, currentDataKey, expectedCards],
    { timeout: 60_000 }
  );
}

async function openGalaxy(page) {
  const headerSelect = page.locator('header select').filter({ visible: true }).first();
  if ((await headerSelect.count()) > 0) {
    await headerSelect.selectOption('galaxy');
    return;
  }
  const sideNavButton = page.getByRole('button', { name: '图谱' });
  if ((await sideNavButton.count()) > 0) {
    await sideNavButton.click();
    return;
  }
  await page.locator('aside nav button').nth(3).click();
}

async function openSettings(page) {
  const headerSelect = page.locator('header select').filter({ visible: true }).first();
  if ((await headerSelect.count()) > 0) {
    await headerSelect.selectOption('settings');
    return;
  }
  const settingsButton = page.getByRole('button', { name: '设置' }).first();
  if ((await settingsButton.count()) > 0) {
    await settingsButton.click();
    return;
  }
  await page.locator('nav.fixed button').last().click();
}

async function main() {
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Obsidian-grade fixture is missing: ${packagePath}`);
  }

  fs.mkdirSync(exportDir, { recursive: true });
  await waitForApp();

  const browser = await chromium.launch({
    executablePath: findExecutable(),
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1365, height: 900 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto(appUrl, { waitUntil: 'networkidle' });
  await clearBrowserPersistence(page);
  await page.reload({ waitUntil: 'networkidle' });
  await openSettings(page);
  await page.locator('input[type="file"]').first().setInputFiles(packagePath);
  await waitForDbCards(page, 4);

  await openGalaxy(page);
  await page.getByRole('heading', { name: '图谱' }).waitFor();
  await page.waitForSelector('canvas[aria-label="TechLex OS word galaxy"]');
  await page.waitForSelector('text=双向链接');
  await page.waitForSelector('text=多标签');
  await page.waitForSelector('text=Hub Path');

  const canvasCount = await page.locator('canvas[aria-label="TechLex OS word galaxy"]').count();
  const svgCircleCount = await page.locator('svg circle').count();
  const svgLineCount = await page.locator('svg line').count();
  const panelText = (await page.locator('main aside').last().textContent()) ?? '';

  await page.getByRole('button', { name: '复制 Obsidian Markdown' }).click();
  const markdown = await page.locator('textarea').inputValue();

  const search = page.getByPlaceholder(/tag:scene/);
  await search.fill('tag:ide link:plugin');
  await page.waitForTimeout(300);
  await page.locator('select').last().selectOption('1');
  await page.waitForTimeout(500);
  const localCanvasCount = await page.locator('canvas[aria-label="TechLex OS word galaxy"]').count();
  await page.screenshot({ path: desktopShot, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await openGalaxy(page);
  await page.getByRole('heading', { name: '图谱' }).waitFor();
  await page.waitForSelector('canvas[aria-label="TechLex OS word galaxy"]');
  await page.screenshot({ path: mobileShot, fullPage: true });
  const mobileBottomNavButtons = await page.locator('nav.fixed button').count();

  await browser.close();

  const report = {
    checked_at: new Date().toISOString(),
    app_url: appUrl,
    package_path: packagePath,
    imported_cards: 4,
    canvas_count: canvasCount,
    local_canvas_count: localCanvasCount,
    legacy_svg_circle_count: svgCircleCount,
    legacy_svg_line_count: svgLineCount,
    has_canvas_renderer: canvasCount === 1,
    has_tag_panel: panelText.includes('多标签'),
    has_backlink_panel: panelText.includes('反链') || panelText.includes('反向链接'),
    has_wikilink_panel: panelText.includes('双向链接'),
    markdown_has_yaml: markdown.includes('---'),
    markdown_has_backlinks: markdown.includes('## Backlinks'),
    markdown_has_real_backlink: markdown.includes('[[plugin]]') || markdown.includes('[[integration]]'),
    markdown_has_related_cards: markdown.includes('## Related Cards'),
    mobile_bottom_nav_buttons: mobileBottomNavButtons,
    console_error_count: consoleErrors.length,
    console_errors: consoleErrors.slice(0, 5),
    panel_text: panelText,
    markdown_preview: markdown,
    screenshots: {
      desktop: desktopShot,
      mobile: mobileShot
    }
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));

  if (!report.has_canvas_renderer) {
    throw new Error('Phase 10 graph renderer smoke failed: expected Canvas renderer.');
  }
  if (report.console_error_count > 0) {
    throw new Error(`Phase 10 graph renderer smoke failed with ${report.console_error_count} console errors.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
