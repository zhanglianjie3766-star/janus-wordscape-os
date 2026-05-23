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
const lastGoodDataKey = 'last_good';
const packagePath = path.join(root, 'data', 'test-fixtures', 'large-card-package-3000.json');
const exportDir = path.join(root, 'data', 'exports');
const invalidPackagePath = path.join(exportDir, 'phase9-invalid-empty-package.json');
const reportPath = path.join(exportDir, 'phase9-indexeddb-recovery-smoke-report.json');
const desktopShot = path.join(exportDir, 'phase9-indexeddb-recovery-desktop.png');
const mobileShot = path.join(exportDir, 'phase9-indexeddb-recovery-mobile.png');

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

function writeInvalidPackage() {
  const invalid = {
    package_id: 'phase9-invalid-empty-package',
    package_version: 'phase9',
    generated_by: 'phase9-smoke',
    generated_at: new Date().toISOString(),
    default_language: 'zh-CN',
    domain_packs: [],
    cards: [
      {
        card_id: '',
        headword: '',
        examples: []
      }
    ]
  };

  fs.writeFileSync(invalidPackagePath, `${JSON.stringify(invalid, null, 2)}\n`, 'utf8');
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

async function readDbKey(page, key) {
  return page.evaluate(
    ([db, storeNameArg, recordKey]) =>
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
          const getRequest = store.get(recordKey);

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
    [dbName, storeName, key]
  );
}

async function writeDbKey(page, key, value) {
  await page.evaluate(
    ([db, storeNameArg, recordKey, recordValue]) =>
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
          const tx = database.transaction(storeNameArg, 'readwrite');
          const store = tx.objectStore(storeNameArg);
          store.put(recordValue, recordKey);
          tx.oncomplete = () => {
            database.close();
            resolve(true);
          };
          tx.onerror = () => {
            database.close();
            reject(tx.error);
          };
        };
      }),
    [dbName, storeName, key, value]
  );
}

async function deleteDatabase(page) {
  await page.evaluate(
    (db) =>
      new Promise((resolve) => {
        const request = window.indexedDB.deleteDatabase(db);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
        request.onblocked = () => resolve(false);
      }),
    dbName
  );
}

async function waitForDbCards(page, expectedCards, expectedReviews = null) {
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

function makeLegacyData(data) {
  const cards = data.cards.slice(0, 3);
  const cardIds = new Set(cards.map((card) => card.card_id));
  const memoryStates = {};

  for (const cardId of cardIds) {
    memoryStates[cardId] = data.memory_states[cardId];
  }

  return {
    ...data,
    packages: [],
    cards,
    review_events: [],
    memory_states: memoryStates,
    import_reports: [],
    updated_at: new Date().toISOString()
  };
}

async function main() {
  if (!fs.existsSync(packagePath)) {
    throw new Error(`3000-card fixture is missing: ${packagePath}`);
  }

  fs.mkdirSync(exportDir, { recursive: true });
  writeInvalidPackage();
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

  await page.goto(appUrl, { waitUntil: 'networkidle' });
  await clearBrowserPersistence(page);
  await page.reload({ waitUntil: 'networkidle' });

  await page.locator('input[type="file"]').first().setInputFiles(packagePath);
  await waitForDbCards(page, 3000);

  await page.locator('aside nav button').nth(2).click();
  await page.keyboard.press('Space');
  await page.keyboard.press('3');
  await waitForDbCards(page, 3000, 1);

  await page.locator('aside nav button').nth(6).click();
  await page.waitForSelector('text=Persistence prototype gate');
  const exportDownloadPromise = page.waitForEvent('download');
  await page.getByText('导出学习数据', { exact: true }).click();
  const exportDownload = await exportDownloadPromise;
  const exportedPath = path.join(exportDir, 'phase9-exported-backup.json');
  await exportDownload.saveAs(exportedPath);
  const exportedBackup = JSON.parse(fs.readFileSync(exportedPath, 'utf8'));

  const beforeCorruptionData = await readDbKey(page, currentDataKey);
  const lastGoodBeforeCorruption = await readDbKey(page, lastGoodDataKey);
  await writeDbKey(page, currentDataKey, { corrupted: true, reason: 'phase9 smoke test' });
  await page.reload({ waitUntil: 'networkidle' });
  await waitForDbCards(page, 3000, 1);
  await page.locator('aside nav button').nth(6).click();
  await page.waitForSelector('text=IndexedDB recovered', { timeout: 20_000 });
  const recoveryPanelText = await page.locator('text=Persistence prototype gate').locator('..').textContent();
  const afterRecoveryData = await readDbKey(page, currentDataKey);

  await page.locator('aside nav button').nth(0).click();
  await page.locator('input[type="file"]').first().setInputFiles(invalidPackagePath);
  await page.waitForSelector('text=当前学习数据未被修改', { timeout: 20_000 });
  const afterFailedImportData = await readDbKey(page, currentDataKey);

  const legacyData = makeLegacyData(afterRecoveryData);
  await deleteDatabase(page);
  await page.evaluate(
    ([key, rollback, legacy]) => {
      window.localStorage.setItem(key, JSON.stringify(legacy));
      window.localStorage.removeItem(rollback);
    },
    [storageKey, rollbackKey, legacyData]
  );
  await page.reload({ waitUntil: 'networkidle' });
  await waitForDbCards(page, 3, 0);
  await page.locator('aside nav button').nth(6).click();
  await page.waitForSelector('text=migrated from localStorage', { timeout: 20_000 });
  const migrationPanelText = await page.locator('text=Persistence prototype gate').locator('..').textContent();
  const migratedData = await readDbKey(page, currentDataKey);
  await page.screenshot({ path: desktopShot, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('header select').selectOption('settings');
  await page.waitForSelector('text=Persistence prototype gate');
  await page.screenshot({ path: mobileShot, fullPage: true });
  const mobileBottomNavButtons = await page.locator('nav.fixed button').count();

  await browser.close();

  const report = {
    checked_at: new Date().toISOString(),
    app_url: appUrl,
    package_path: packagePath,
    invalid_package_path: invalidPackagePath,
    exported_backup_path: exportedPath,
    exported_backup_cards: exportedBackup.cards.length,
    exported_backup_review_events: exportedBackup.review_events.length,
    last_good_cards_before_corruption: lastGoodBeforeCorruption.cards.length,
    current_cards_before_corruption: beforeCorruptionData.cards.length,
    recovered_cards_after_corruption: afterRecoveryData.cards.length,
    recovered_review_events_after_corruption: afterRecoveryData.review_events.length,
    failed_import_preserved_cards: afterFailedImportData.cards.length,
    failed_import_preserved_review_events: afterFailedImportData.review_events.length,
    legacy_migrated_cards: migratedData.cards.length,
    legacy_migrated_review_events: migratedData.review_events.length,
    recovery_panel_text: recoveryPanelText,
    migration_panel_text: migrationPanelText,
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
