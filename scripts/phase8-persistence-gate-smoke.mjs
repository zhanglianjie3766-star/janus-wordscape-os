import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const appUrl = process.env.TECHLEX_URL || 'http://127.0.0.1:5173';
const storageKey = 'techlex-os:v1';
const dbName = 'techlex-os-db';
const storeName = 'app_data';
const currentDataKey = 'current';
const packagePath = path.join(root, 'data', 'test-fixtures', 'large-card-package-3000.json');
const exportDir = path.join(root, 'data', 'exports');
const reportPath = path.join(exportDir, 'phase8-persistence-gate-smoke-report.json');
const desktopShot = path.join(exportDir, 'phase8-persistence-gate-desktop.png');
const mobileShot = path.join(exportDir, 'phase8-persistence-gate-mobile.png');

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
    ([key, db]) =>
      new Promise((resolve) => {
        window.localStorage.removeItem(key);
        window.localStorage.removeItem('techlex-os:last-import-rollback');
        const request = window.indexedDB.deleteDatabase(db);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
        request.onblocked = () => resolve(false);
      }),
    [storageKey, dbName]
  );
}

async function readIndexedDbData(page) {
  return page.evaluate(
    ([db, storeNameArg, key]) =>
      new Promise((resolve, reject) => {
        const request = window.indexedDB.open(db, 1);

        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(storeNameArg)) {
            database.createObjectStore(storeNameArg);
          }
        };

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(storeNameArg, 'readonly');
          const store = tx.objectStore(storeNameArg);
          const getRequest = store.get(key);

          getRequest.onerror = () => {
            database.close();
            reject(getRequest.error);
          };
          getRequest.onsuccess = () => {
            database.close();
            resolve(getRequest.result ?? null);
          };
        };
      }),
    [dbName, storeName, currentDataKey]
  );
}

async function waitForIndexedDbData(page, expectedCards, expectedReviews = null) {
  await page.waitForFunction(
    async ([db, storeNameArg, key, cards, reviews]) => {
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

      if (!data || data.cards?.length !== cards || Object.keys(data.memory_states ?? {}).length !== cards) {
        return false;
      }

      return reviews === null || data.review_events?.length === reviews;
    },
    [dbName, storeName, currentDataKey, expectedCards, expectedReviews],
    { timeout: 60_000 }
  );
}

async function main() {
  if (!fs.existsSync(packagePath)) {
    throw new Error(`3000-card fixture is missing: ${packagePath}`);
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
  await clearBrowserPersistence(page);
  await page.reload({ waitUntil: 'networkidle' });

  const importStartedAt = Date.now();
  await page.locator('input[type="file"]').first().setInputFiles(packagePath);
  await waitForIndexedDbData(page, 3000);
  const importElapsedMs = Date.now() - importStartedAt;

  const localStorageShadowBeforeReview = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key) || '';
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    return {
      bytes: new Blob([raw]).size,
      parsed,
      is_metadata_shadow: parsed?.storage_engine === 'indexeddb' && typeof parsed?.cards === 'number'
    };
  }, storageKey);

  await page.locator('aside nav button').nth(2).click();
  await page.keyboard.press('Space');
  await page.keyboard.press('3');
  await waitForIndexedDbData(page, 3000, 1);

  const localStorageShadowAfterReview = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key) || '';
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    return {
      bytes: new Blob([raw]).size,
      parsed,
      is_metadata_shadow: parsed?.storage_engine === 'indexeddb' && typeof parsed?.cards === 'number'
    };
  }, storageKey);

  await page.reload({ waitUntil: 'networkidle' });
  await waitForIndexedDbData(page, 3000, 1);
  await page.locator('aside nav button').nth(6).click();
  await page.waitForSelector('text=Persistence prototype gate');
  const persistenceText = await page.locator('text=Persistence prototype gate').locator('..').textContent();
  const storageBudgetText = await page.locator('text=Browser storage budget').locator('..').textContent();
  await page.screenshot({ path: desktopShot, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('header select').selectOption('settings');
  await page.waitForSelector('text=Persistence prototype gate');
  await page.screenshot({ path: mobileShot, fullPage: true });

  const data = await readIndexedDbData(page);
  const mobileBottomNavButtons = await page.locator('nav.fixed button').count();

  await browser.close();

  const report = {
    checked_at: new Date().toISOString(),
    app_url: appUrl,
    package_path: packagePath,
    import_elapsed_ms: importElapsedMs,
    indexeddb_cards: data.cards.length,
    indexeddb_memory_states: Object.keys(data.memory_states ?? {}).length,
    indexeddb_review_events: data.review_events.length,
    localstorage_shadow_before_review_bytes: localStorageShadowBeforeReview.bytes,
    localstorage_shadow_after_review_bytes: localStorageShadowAfterReview.bytes,
    localstorage_is_metadata_shadow: localStorageShadowAfterReview.is_metadata_shadow,
    localstorage_shadow_before_review: localStorageShadowBeforeReview.parsed,
    localstorage_shadow_after_review: localStorageShadowAfterReview.parsed,
    persistence_panel_text: persistenceText,
    storage_budget_text: storageBudgetText,
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
