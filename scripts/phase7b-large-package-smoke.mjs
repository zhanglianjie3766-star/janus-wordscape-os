import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const appUrl = process.env.TECHLEX_URL || 'http://127.0.0.1:5173';
const storageKey = 'techlex-os:v1';
const packagePath = path.join(root, 'data', 'test-fixtures', 'large-card-package-300.json');
const exportDir = path.join(root, 'data', 'exports');
const reportPath = path.join(exportDir, 'phase7b-large-package-smoke-report.json');
const desktopShot = path.join(exportDir, 'phase7b-large-package-desktop.png');
const mobileShot = path.join(exportDir, 'phase7b-large-package-mobile.png');

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

async function main() {
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Large package fixture is missing: ${packagePath}`);
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
      return data.cards?.length === 300 && Object.keys(data.memory_states ?? {}).length === 300;
    },
    storageKey,
    { timeout: 30_000 }
  );

  await page.locator('aside nav button').nth(2).click();
  await page.keyboard.press('Space');
  await page.keyboard.press('3');
  await page.waitForFunction(
    (key) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return false;
      }
      const data = JSON.parse(raw);
      return data.review_events?.length === 1;
    },
    storageKey,
    { timeout: 10_000 }
  );

  await page.locator('aside nav button').nth(6).click();
  await page.waitForSelector('text=Real-use integrity check');
  await page.screenshot({ path: desktopShot, fullPage: true });

  const desktopData = await readData(page);
  const rollbackExists = await page.evaluate(() => window.localStorage.getItem('techlex-os:last-import-rollback') !== null);
  const integrityStatusText = await page.locator('text=Real-use integrity check').locator('..').textContent();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('select').selectOption('settings');
  await page.waitForSelector('text=Real-use integrity check');
  await page.screenshot({ path: mobileShot, fullPage: true });

  const mobileBottomNavButtons = await page.locator('nav.fixed button').count();

  await browser.close();

  const report = {
    checked_at: new Date().toISOString(),
    app_url: appUrl,
    package_path: packagePath,
    cards: desktopData.cards.length,
    domain_packs: desktopData.domain_packs.length,
    memory_states: Object.keys(desktopData.memory_states ?? {}).length,
    review_events: desktopData.review_events.length,
    import_reports: desktopData.import_reports.length,
    rollback_snapshot_exists: rollbackExists,
    integrity_panel_text: integrityStatusText,
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
