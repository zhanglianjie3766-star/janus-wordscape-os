import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const appUrl = process.env.TECHLEX_URL || 'http://127.0.0.1:5173';
const storageKey = 'techlex-os:v1';
const packagePath = path.join(root, 'data', 'test-fixtures', 'large-card-package-2000.json');
const exportDir = path.join(root, 'data', 'exports');
const reportPath = path.join(exportDir, 'phase7d-performance-graph-smoke-report.json');
const desktopShot = path.join(exportDir, 'phase7d-performance-graph-desktop.png');
const mobileShot = path.join(exportDir, 'phase7d-performance-graph-mobile.png');

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
    throw new Error(`2000-card fixture is missing: ${packagePath}`);
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

  const importStartedAt = Date.now();
  await page.locator('input[type="file"]').first().setInputFiles(packagePath);
  await page.waitForFunction(
    (key) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return false;
      }
      const data = JSON.parse(raw);
      return data.cards?.length === 2000 && Object.keys(data.memory_states ?? {}).length === 2000;
    },
    storageKey,
    { timeout: 60_000 }
  );
  const importElapsedMs = Date.now() - importStartedAt;

  await page.locator('aside nav button').nth(6).click();
  await page.waitForSelector('text=Browser storage budget');
  const storageBudgetText = await page.locator('text=Browser storage budget').locator('..').textContent();

  await page.locator('aside nav button').nth(4).click();
  await page.waitForSelector('svg[role="img"]', { timeout: 30_000 });
  await page.waitForSelector('text=Rendered cards', { timeout: 30_000 });
  const galaxyText = await page.locator('text=Rendered cards').locator('..').textContent();
  const svgCircleCount = await page.locator('svg[role="img"] circle').count();
  const svgLineCount = await page.locator('svg[role="img"] line').count();
  await page.screenshot({ path: desktopShot, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('header select').selectOption('galaxy');
  await page.waitForSelector('text=Rendered cards', { timeout: 30_000 });
  await page.screenshot({ path: mobileShot, fullPage: true });

  const data = await readData(page);
  const localStorageBytes = await page.evaluate((key) => new Blob([window.localStorage.getItem(key) || '']).size, storageKey);
  const mobileBottomNavButtons = await page.locator('nav.fixed button').count();

  await browser.close();

  const report = {
    checked_at: new Date().toISOString(),
    app_url: appUrl,
    package_path: packagePath,
    import_elapsed_ms: importElapsedMs,
    cards: data.cards.length,
    memory_states: Object.keys(data.memory_states ?? {}).length,
    local_storage_bytes: localStorageBytes,
    local_storage_mb: Number((localStorageBytes / 1024 / 1024).toFixed(2)),
    storage_budget_text: storageBudgetText,
    galaxy_text: galaxyText,
    svg_circle_count: svgCircleCount,
    svg_line_count: svgLineCount,
    graph_render_cap_respected: galaxyText?.includes('250/2000') || galaxyText?.includes('250 of 2000'),
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
