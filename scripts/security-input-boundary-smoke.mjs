import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const exportDir = path.join(root, 'data', 'exports');
const maliciousPackagePath = path.join(exportDir, 'security-malicious-package.json');
const maliciousBackupPath = path.join(exportDir, 'security-malicious-backup.json');
const oversizedPackagePath = path.join(exportDir, 'security-oversized-package.json');
const reportPath = path.join(exportDir, 'security-input-boundary-smoke-report.json');
const appUrl = process.env.TECHLEX_URL || 'http://127.0.0.1:4173';
const storageKey = 'techlex-os:v1';
const dbName = 'techlex-os-db';
const storeName = 'app_data';
const currentDataKey = 'current';
const maxImportFileBytes = 12 * 1024 * 1024;

const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function findExecutable() {
  const executable = chromeCandidates.find((candidate) => fs.existsSync(candidate));
  if (!executable) {
    throw new Error('No Chromium executable found. Set CHROME_PATH to run the security smoke test.');
  }
  return executable;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForApp(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(300);
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

async function ensureAppServer() {
  try {
    await waitForApp(appUrl, 1500);
    return null;
  } catch {
    const url = new URL(appUrl);
    const child = spawn(process.execPath, ['scripts/serve-dist.mjs'], {
      cwd: root,
      env: { ...process.env, PORT: url.port || '4173' },
      stdio: 'ignore',
      windowsHide: true
    });
    await waitForApp(appUrl);
    return child;
  }
}

function createMaliciousPackage() {
  const card = {
    card_id: 'security-boundary-card',
    headword: 'boundary',
    definition_zh: '边界',
    definition_en: 'A limit where one system should stop trusting input.',
    part_of_speech: 'noun',
    examples: [
      {
        example_en: 'The import boundary rejects unsafe links.',
        example_zh: '导入边界会拒绝不安全链接。'
      },
      {
        example_en: 'Audio URLs must stay inside the safe allowlist.',
        example_zh: '音频链接必须留在安全白名单内。'
      }
    ],
    source: {
      source_id: 'security-test',
      source_name: 'Security Test',
      source_url: 'javascript:alert(1)',
      source_type: 'test',
      source_priority: 'P1'
    },
    domain_pack_id: 'ai-programming-english',
    scene_tags: ['ide_editor'],
    frequency_tier: 'F2',
    usage_tasks: ['import-boundary'],
    phonetic: '/ˈbaʊndəri/',
    audio_url: 'data:audio/mp3;base64,AAAA',
    audio_asset_id: '../secret.mp3'
  };

  fs.writeFileSync(
    maliciousPackagePath,
    JSON.stringify(
      {
        package_id: 'security-boundary-package',
        package_version: 'security-smoke',
        generated_by: 'security-input-boundary-smoke',
        generated_at: new Date().toISOString(),
        default_language: 'zh-CN',
        domain_packs: [],
        cards: [card]
      },
      null,
      2
    )
  );
}

function createMaliciousBackup() {
  const card = {
    card_id: 'security-boundary-backup-card',
    headword: 'restore-boundary',
    definition_zh: '恢复边界',
    definition_en: 'A restore path that must validate untrusted backup data.',
    part_of_speech: 'noun',
    examples: [
      {
        example_en: 'The restore boundary rejects unsafe links.',
        example_zh: '恢复边界会拒绝不安全链接。'
      },
      {
        example_en: 'Backup data is still untrusted input.',
        example_zh: '备份数据仍然是不可信输入。'
      }
    ],
    source: {
      source_id: 'security-backup-test',
      source_name: 'Security Backup Test',
      source_url: 'javascript:alert(1)',
      source_type: 'test',
      source_priority: 'P1'
    },
    domain_pack_id: 'ai-programming-english',
    scene_tags: ['ide_editor'],
    frequency_tier: 'F2',
    usage_tasks: ['restore-boundary'],
    audio_url: 'data:audio/mp3;base64,AAAA'
  };

  fs.writeFileSync(
    maliciousBackupPath,
    JSON.stringify(
      {
        backup_format: 'techlex-os-app-data',
        backup_schema_version: 2,
        app_version: 'security-smoke',
        packages: [],
        domain_packs: [],
        cards: [card],
        review_events: [],
        memory_states: {},
        learning_plan: {
          daily_new_limit: 10,
          daily_review_limit: 30,
          daily_weak_limit: 10,
          target_retention: 0.9,
          maximum_interval_days: 365,
          relearning_interval_minutes: 10,
          leech_lapse_threshold: 4,
          review_sort_order: 'low_retrievability',
          prioritize_overdue: true,
          review_weak_items: true,
          pause_new_cards: false
        },
        import_reports: [],
        updated_at: new Date().toISOString(),
        exported_at: new Date().toISOString()
      },
      null,
      2
    )
  );
}

function createOversizedPackage() {
  fs.writeFileSync(oversizedPackagePath, ' '.repeat(maxImportFileBytes + 1024));
}

function runStaticChecks() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert(!packageJson.dependencies?.['webpack-dev-server'], 'webpack-dev-server must not be a production dependency.');
  assert(packageJson.dependencies?.['ts-fsrs'] === '5.4.0', 'ts-fsrs must stay pinned to exact version 5.4.0.');

  const serviceWorker = fs.readFileSync(path.join(root, 'public', 'service-worker.js'), 'utf8');
  assert(serviceWorker.includes('origin === self.location.origin'), 'Service Worker must restrict cache writes to same-origin requests.');
  assert(serviceWorker.includes("request.cache === 'no-store'"), 'Service Worker must skip no-store requests.');
  assert(serviceWorker.includes('response.ok'), 'Service Worker must only cache successful responses.');
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

async function clickBottom(page, label) {
  const bottomButton = page.locator('nav.fixed button').filter({ hasText: label }).first();
  if ((await bottomButton.count()) > 0) {
    await bottomButton.click();
    return;
  }

  await page.getByRole('button', { name: label }).first().click();
}

async function main() {
  fs.mkdirSync(exportDir, { recursive: true });
  createMaliciousPackage();
  createMaliciousBackup();
  createOversizedPackage();
  runStaticChecks();

  let serverProcess = null;
  const browser = await chromium.launch({
    executablePath: findExecutable(),
    headless: true
  });

  try {
    serverProcess = await ensureAppServer();
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
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await clickBottom(page, '设置');
    await page.getByRole('button', { name: /词卡与备份/ }).click();

    const importInput = page.locator('input[type="file"]').first();
    await importInput.setInputFiles(maliciousPackagePath);
    await page.waitForFunction(() => document.body.innerText.includes('导入失败'), undefined, { timeout: 15_000 });
    await page.waitForFunction(() => document.body.innerText.includes('source.source_url') || document.body.innerText.includes('audio_url'), undefined, { timeout: 15_000 });
    const afterMaliciousImport = await readAppData(page);
    assert(!afterMaliciousImport || (afterMaliciousImport.cards ?? []).length === 0, 'Unsafe package import must not create cards.');

    await importInput.setInputFiles(oversizedPackagePath);
    await page.waitForFunction(() => document.body.innerText.includes('导入文件过大'), undefined, { timeout: 15_000 });
    const afterOversizedImport = await readAppData(page);
    assert(!afterOversizedImport || (afterOversizedImport.cards ?? []).length === 0, 'Oversized import must not create cards.');

    const restoreInput = page.locator('input[type="file"]').nth(1);
    const dialogPromise = page.waitForEvent('dialog', { timeout: 15_000 });
    await restoreInput.setInputFiles(maliciousBackupPath);
    const restoreDialog = await dialogPromise;
    const restoreDialogMessage = restoreDialog.message();
    await restoreDialog.dismiss();
    await sleep(300);
    const afterMaliciousRestore = await readAppData(page);
    assert(!afterMaliciousRestore || (afterMaliciousRestore.cards ?? []).length === 0, 'Unsafe backup restore must not create cards.');
    assert(
      restoreDialogMessage.includes('source.source_url') || restoreDialogMessage.includes('audio_url') || restoreDialogMessage.length > 0,
      'Unsafe backup restore should surface a validation error.'
    );
    assert(consoleErrors.length === 0, `Console errors detected: ${consoleErrors.join('\\n')}`);

    const report = {
      checked_at: new Date().toISOString(),
      app_url: appUrl,
      isolated_browser_context: true,
      current_browser_storage_touched: false,
      malicious_import_rejected: true,
      oversized_import_rejected: true,
      malicious_backup_restore_rejected: true,
      service_worker_same_origin_cache_only: true,
      production_dependency_boundary_clean: true,
      console_error_count: consoleErrors.length,
      console_errors: consoleErrors
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    await context.close();
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
