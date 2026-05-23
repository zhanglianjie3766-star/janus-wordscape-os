import { useCallback, useEffect, useRef, useState } from 'react';
import { loadData, loadPersistedData, saveData, type PersistenceLoadSource } from './storage';
import type { AppData } from './types';

export type PersistenceUiStatus = {
  source: PersistenceLoadSource | 'loading';
  migrated_from_localstorage: boolean;
  save_pending?: boolean;
  last_saved_at?: string;
  error?: string;
};

export function usePersistentAppData() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceUiStatus>({
    source: 'loading',
    migrated_from_localstorage: false
  });
  const writeIdRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    void loadPersistedData().then((result) => {
      if (!mounted) {
        return;
      }

      setData(result.data);
      setPersistenceStatus({
        source: result.source,
        migrated_from_localstorage: result.migrated_from_localstorage,
        error: result.error
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((next: AppData) => {
    const writeId = writeIdRef.current + 1;
    writeIdRef.current = writeId;
    setData(next);
    setPersistenceStatus((current) => ({
      ...current,
      save_pending: true,
      error: undefined
    }));

    void saveData(next)
      .then((result) => {
        if (writeIdRef.current !== writeId) {
          return;
        }
        setPersistenceStatus((current) => ({
          ...current,
          source: result.source,
          migrated_from_localstorage: current.migrated_from_localstorage,
          save_pending: false,
          last_saved_at: result.saved_at,
          error: result.error
        }));
      })
      .catch((error) => {
        if (writeIdRef.current !== writeId) {
          return;
        }
        setPersistenceStatus((current) => ({
          ...current,
          save_pending: false,
          error: error instanceof Error ? error.message : String(error)
        }));
      });
  }, []);

  return {
    data,
    persist,
    persistenceStatus
  };
}
