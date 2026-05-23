import type { AppBackup, AppData, LearningPlan } from './types';
import { mergeDomainPacks } from './domainPacks';
import { APP_VERSION, BACKUP_FORMAT, BACKUP_SCHEMA_VERSION } from './version';

const STORAGE_KEY = 'techlex-os:v1';
const LAST_IMPORT_ROLLBACK_KEY = 'techlex-os:last-import-rollback';
const DB_NAME = 'techlex-os-db';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';
const CURRENT_DATA_KEY = 'current';
const LAST_GOOD_DATA_KEY = 'last_good';
const LAST_ROLLBACK_DATA_KEY = 'last_import_rollback';
const LOCAL_STORAGE_SHADOW_LIMIT_BYTES = 2.5 * 1024 * 1024;

export type PersistenceLoadSource = 'indexeddb' | 'indexeddb_recovered' | 'indexeddb_corrupt' | 'legacy_localstorage' | 'localstorage_shadow' | 'empty' | 'fallback_localstorage';

export interface PersistenceLoadResult {
  data: AppData;
  source: PersistenceLoadSource;
  migrated_from_localstorage: boolean;
  error?: string;
}

export type PersistenceSaveSource = 'indexeddb' | 'fallback_localstorage';

export interface PersistenceSaveResult {
  source: PersistenceSaveSource;
  saved_at: string;
  error?: string;
}

const defaultLearningPlan: LearningPlan = {
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
};

function compactPackages(packages: AppData['packages']): AppData['packages'] {
  return packages.map((pkg) => ({
    ...pkg,
    cards: []
  }));
}

function byteLength(value: string): number {
  return new Blob([value]).size;
}

function isFullAppData(value: unknown): value is AppData {
  return typeof value === 'object' && value !== null && Array.isArray((value as Partial<AppData>).cards);
}

function isMetadataShadow(value: unknown): boolean {
  return typeof value === 'object' && value !== null && (value as { storage_engine?: unknown }).storage_engine === 'indexeddb';
}

function readLocalStorageData(): AppData | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return isFullAppData(parsed) && !isMetadataShadow(parsed) ? normalizeAppData(parsed) : null;
  } catch {
    return null;
  }
}

function writeLocalStorageShadow(data: AppData): void {
  const normalized = normalizeAppData(data);
  const full = JSON.stringify({
    ...normalized,
    updated_at: new Date().toISOString()
  });

  if (byteLength(full) <= LOCAL_STORAGE_SHADOW_LIMIT_BYTES) {
    window.localStorage.setItem(STORAGE_KEY, full);
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      storage_engine: 'indexeddb',
      storage_key: CURRENT_DATA_KEY,
      backup_format: normalized.backup_format,
      backup_schema_version: normalized.backup_schema_version,
      app_version: normalized.app_version,
      cards: normalized.cards.length,
      review_events: normalized.review_events.length,
      memory_states: Object.keys(normalized.memory_states).length,
      updated_at: new Date().toISOString()
    })
  );
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'));
  });
}

function readIndexedDbRecord<T>(key: string): Promise<T | null> {
  return openDatabase().then(
    (db) =>
      new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
        request.onerror = () => reject(request.error ?? new Error(`Failed to read ${key} from IndexedDB.`));
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error(`IndexedDB read transaction failed for ${key}.`));
        };
      })
  );
}

function writeIndexedDbRecord(key: string, value: unknown): Promise<void> {
  return openDatabase().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(value, key);

        request.onerror = () => reject(request.error ?? new Error(`Failed to write ${key} to IndexedDB.`));
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error(`IndexedDB write transaction failed for ${key}.`));
        };
      })
  );
}

let saveQueue: Promise<void> = Promise.resolve();

function deleteIndexedDbRecord(key: string): Promise<void> {
  return openDatabase().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onerror = () => reject(request.error ?? new Error(`Failed to delete ${key} from IndexedDB.`));
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error(`IndexedDB delete transaction failed for ${key}.`));
        };
      })
  );
}

export function normalizeAppData(input: unknown): AppData {
  const base = createEmptyData();

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return base;
  }

  const parsed = input as Partial<AppData>;

  return {
    ...base,
    ...parsed,
    backup_format: BACKUP_FORMAT,
    backup_schema_version: BACKUP_SCHEMA_VERSION,
    app_version: APP_VERSION,
    packages: Array.isArray(parsed.packages) ? compactPackages(parsed.packages) : base.packages,
    domain_packs: mergeDomainPacks(Array.isArray(parsed.domain_packs) ? parsed.domain_packs : []),
    cards: Array.isArray(parsed.cards) ? parsed.cards : base.cards,
    review_events: Array.isArray(parsed.review_events) ? parsed.review_events : base.review_events,
    memory_states: parsed.memory_states && typeof parsed.memory_states === 'object' ? parsed.memory_states : base.memory_states,
    learning_plan: {
      ...base.learning_plan,
      ...(parsed.learning_plan ?? {})
    },
    import_reports: Array.isArray(parsed.import_reports) ? parsed.import_reports : base.import_reports,
    updated_at: new Date().toISOString()
  };
}

export function createEmptyData(): AppData {
  return {
    backup_format: BACKUP_FORMAT,
    backup_schema_version: BACKUP_SCHEMA_VERSION,
    app_version: APP_VERSION,
    packages: [],
    domain_packs: mergeDomainPacks([]),
    cards: [],
    review_events: [],
    memory_states: {},
    learning_plan: defaultLearningPlan,
    import_reports: [],
    updated_at: new Date().toISOString()
  };
}

export function loadData(): AppData {
  return readLocalStorageData() ?? createEmptyData();
}

export async function loadPersistedData(): Promise<PersistenceLoadResult> {
  try {
    const indexedDbData = await readIndexedDbRecord<unknown>(CURRENT_DATA_KEY);
    if (indexedDbData) {
      if (!isFullAppData(indexedDbData)) {
        const lastGoodData = await readIndexedDbRecord<unknown>(LAST_GOOD_DATA_KEY).catch(() => null);
        if (isFullAppData(lastGoodData)) {
          const recovered = normalizeAppData(lastGoodData);
          await writeIndexedDbRecord(CURRENT_DATA_KEY, recovered);
          writeLocalStorageShadow(recovered);
          return {
            data: recovered,
            source: 'indexeddb_recovered',
            migrated_from_localstorage: false,
            error: 'IndexedDB current record was invalid. Recovered from the last known good snapshot.'
          };
        }

        const localData = readLocalStorageData();
        if (localData) {
          await writeIndexedDbRecord(CURRENT_DATA_KEY, normalizeAppData(localData));
          await writeIndexedDbRecord(LAST_GOOD_DATA_KEY, normalizeAppData(localData));
          writeLocalStorageShadow(localData);
          return {
            data: localData,
            source: 'legacy_localstorage',
            migrated_from_localstorage: true,
            error: 'IndexedDB current record was invalid. Recovered by remigrating localStorage.'
          };
        }

        return {
          data: createEmptyData(),
          source: 'indexeddb_corrupt',
          migrated_from_localstorage: false,
          error: 'IndexedDB current record was invalid and no recovery snapshot was available.'
        };
      }

      const normalized = normalizeAppData(indexedDbData);
      return {
        data: normalized,
        source: 'indexeddb',
        migrated_from_localstorage: false
      };
    }

    const localData = readLocalStorageData();
    if (localData) {
      const normalized = normalizeAppData(localData);
      await writeIndexedDbRecord(CURRENT_DATA_KEY, normalized);
      await writeIndexedDbRecord(LAST_GOOD_DATA_KEY, normalized);
      writeLocalStorageShadow(localData);
      return {
        data: localData,
        source: 'legacy_localstorage',
        migrated_from_localstorage: true
      };
    }

    return {
      data: createEmptyData(),
      source: 'empty',
      migrated_from_localstorage: false
    };
  } catch (error) {
    const localData = readLocalStorageData();
    return {
      data: localData ?? createEmptyData(),
      source: 'fallback_localstorage',
      migrated_from_localstorage: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export function saveData(data: AppData): Promise<PersistenceSaveResult> {
  const normalized = normalizeAppData(data);
  writeLocalStorageShadow(normalized);

  const operation = async (): Promise<PersistenceSaveResult> => {
    const savedAt = new Date().toISOString();
    try {
      await writeIndexedDbRecord(CURRENT_DATA_KEY, normalized);
      await writeIndexedDbRecord(LAST_GOOD_DATA_KEY, normalized);
      return {
        source: 'indexeddb',
        saved_at: savedAt
      };
    } catch (error) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return {
          source: 'fallback_localstorage',
          saved_at: savedAt,
          error: error instanceof Error ? error.message : String(error)
        };
      } catch (fallbackError) {
        throw new Error(
          `Failed to persist app data. IndexedDB: ${error instanceof Error ? error.message : String(error)}. localStorage: ${
            fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
          }`
        );
      }
    }
  };

  const result = saveQueue.then(operation, operation);
  saveQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

export function flushSaveDataQueue(): Promise<void> {
  return saveQueue;
}

export function createBackup(data: AppData): AppBackup {
  return {
    ...normalizeAppData(data),
    exported_at: new Date().toISOString()
  };
}

export function saveLastImportRollback(data: AppData): void {
  const backup = createBackup(data);
  window.localStorage.setItem(
    LAST_IMPORT_ROLLBACK_KEY,
    JSON.stringify({
      storage_engine: 'indexeddb',
      storage_key: LAST_ROLLBACK_DATA_KEY,
      cards: backup.cards.length,
      review_events: backup.review_events.length,
      updated_at: backup.exported_at
    })
  );
  void writeIndexedDbRecord(LAST_ROLLBACK_DATA_KEY, backup).catch(() => {
    try {
      window.localStorage.setItem(LAST_IMPORT_ROLLBACK_KEY, JSON.stringify(backup));
    } catch {
      // Rollback is best-effort. Import validation still runs before data is replaced.
    }
  });
}

export function loadLastImportRollback(): AppData | null {
  const raw = window.localStorage.getItem(LAST_IMPORT_ROLLBACK_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return isFullAppData(parsed) ? normalizeAppData(parsed) : null;
  } catch {
    return null;
  }
}

export async function loadLastImportRollbackAsync(): Promise<AppData | null> {
  const indexedDbData = await readIndexedDbRecord<AppBackup>(LAST_ROLLBACK_DATA_KEY).catch(() => null);
  if (indexedDbData) {
    return normalizeAppData(indexedDbData);
  }

  return loadLastImportRollback();
}

export function hasLastImportRollback(): boolean {
  return window.localStorage.getItem(LAST_IMPORT_ROLLBACK_KEY) !== null;
}

export function clearLastImportRollback(): void {
  window.localStorage.removeItem(LAST_IMPORT_ROLLBACK_KEY);
  void deleteIndexedDbRecord(LAST_ROLLBACK_DATA_KEY);
}

export function resetData(): AppData {
  const empty = createEmptyData();
  return empty;
}
