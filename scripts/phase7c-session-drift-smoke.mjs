import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const appUrl = process.env.TECHLEX_URL || 'http://127.0.0.1:5173';
const storageKey = 'techlex-os:v1';
const packagePath = path.join(root, 'data', 'test-fixtures', 'large-card-package-1000.json');
const exportDir = path.join(root, 'data', 'exports');
const reportPath = path.join(exportDir, 'phase7c-session-drift-smoke-report.json');
const backupPath = path.join(exportDir, 'phase7c-backup-after-reviews.json');
const desktopShot = path.join(exportDir, 'phase7c-session-drift-desktop.png');
const mobileShot = path.join(exportDir, 'phase7c-session-drift-mobile.png');

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

async function readData(page) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, storageKey);
}

async function waitForReviewCount(page, count) {
  await page.waitForFunction(
    ([key, expected]) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return false;
      }
      const data = JSON.parse(raw);
      return data.review_events?.length === expected;
    },
    [storageKey, count],
    { timeout: 20_000 }
  );
}

async function rateVisibleCard(page, ratingKey, expectedCount) {
  const ratingLabels = {
    1: '忘记',
    2: '困难',
    3: '良好',
    4: '简单'
  };

  await page.locator('button', { hasText: '显示答案' }).click({ timeout: 20_000 });
  await page.locator('button', { hasText: ratingLabels[ratingKey] }).click({ timeout: 20_000 });
  await waitForReviewCount(page, expectedCount);
}

async function main() {
  if (!fs.existsSync(packagePath)) {
    throw new Error(`1000-card fixture is missing: ${packagePath}`);
  }

  fs.mkdirSync(exportDir, { recursive: true });
  await waitForApp();

  const browser = await chromium.launch({
    executablePath: findExecutable(),
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1365, height: 900 },
    deviceScaleFactor: 1,
    acceptDownloads: true
  });
  const page = await context.newPage();

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto(appUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });

  await page.locator('input[type="file"]').first().setInputFiles(packagePath);
  await page.waitForFunction(
    (key) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return false;
      }
      const data = JSON.parse(raw);
      return data.cards?.length === 1000 && Object.keys(data.memory_states ?? {}).length === 1000;
    },
    storageKey,
    { timeout: 40_000 }
  );

  await page.locator('aside nav button').nth(2).click();
  const ratingKeys = ['1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4'];
  for (const [index, ratingKey] of ratingKeys.entries()) {
    await rateVisibleCard(page, ratingKey, index + 1);
  }

  const reviewedData = await readData(page);
  fs.writeFileSync(backupPath, `${JSON.stringify(reviewedData, null, 2)}\n`, 'utf8');

  await page.locator('aside nav button').nth(5).click();
  await page.waitForSelector('text=复习队列漂移与恢复检查');
  const driftText = await page.locator('text=复习队列漂移与恢复检查').locator('..').textContent();
  await page.screenshot({ path: desktopShot, fullPage: true });

  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('aside nav button').nth(6).click();
  await page.locator('input[type="file"]').setInputFiles(backupPath);
  await page.waitForFunction(
    ([key, expectedCards, expectedReviews]) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return false;
      }
      const data = JSON.parse(raw);
      return data.cards?.length === expectedCards && data.review_events?.length === expectedReviews;
    },
    [storageKey, 1000, 12],
    { timeout: 20_000 }
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('header select').selectOption('stats');
  await page.waitForSelector('text=复习队列漂移与恢复检查');
  await page.screenshot({ path: mobileShot, fullPage: true });

  const restoredData = await readData(page);
  const weakItems = Object.values(restoredData.memory_states ?? {}).filter((state) => state.stage === 'downgrade' || state.stage === 'reinforce').length;
  const mobileBottomNavButtons = await page.locator('nav.fixed button').count();

  await browser.close();

  const report = {
    checked_at: new Date().toISOString(),
    app_url: appUrl,
    package_path: packagePath,
    cards_after_import: reviewedData.cards.length,
    review_events_before_restore: reviewedData.review_events.length,
    review_events_after_restore: restoredData.review_events.length,
    memory_states_after_restore: Object.keys(restoredData.memory_states ?? {}).length,
    weak_items_after_reviews: weakItems,
    drift_panel_text: driftText,
    backup_path: backupPath,
    backup_restore_preserved_review_events: restoredData.review_events.length === reviewedData.review_events.length,
    mobile_bottom_nav_buttons: mobileBottomNavButtons,
    screenshots: {
      desktop: desktopShot,
      mobile: mobileShot
    }
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
