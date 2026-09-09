/**
 * Thin IndexedDB wrapper for offline-first data caching.
 *
 * Stores:
 *  - drugs       – DrugProfile[] keyed by drug id
 *  - pharmacies  – Pharmacy[] keyed by pharmacy id
 *  - regimens    – TrackedRegimen[] keyed by regimen id
 *  - ledger      – FillLedgerItem[] keyed by item id
 *  - meta        – cache timestamps keyed by store name
 */

const DB_NAME = 'lowbest-db';
const DB_VERSION = 1;

type StoreName = 'drugs' | 'pharmacies' | 'regimens' | 'ledger' | 'meta';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const stores: StoreName[] = ['drugs', 'pharmacies', 'regimens', 'ledger', 'meta'];
      for (const name of stores) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Write an array of records (each must have an `id` field) into a store. */
export async function putAll<T extends { id: string }>(
  store: StoreName,
  items: T[]
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    for (const item of items) {
      os.put(item);
    }
    tx.oncomplete = () => {
      // Record cache timestamp
      const metaTx = db.transaction('meta', 'readwrite');
      metaTx.objectStore('meta').put({ id: store, cachedAt: Date.now() });
      metaTx.oncomplete = () => resolve();
      metaTx.onerror = () => resolve(); // non-fatal
    };
    tx.onerror = () => reject(tx.error);
  });
}

/** Read all records from a store. */
export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const request = tx.objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

/** Returns the epoch ms when `store` was last cached, or 0 if never. */
export async function getCachedAt(store: StoreName): Promise<number> {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction('meta', 'readonly');
    const request = tx.objectStore('meta').get(store);
    request.onsuccess = () => resolve((request.result as { cachedAt: number } | undefined)?.cachedAt ?? 0);
    request.onerror = () => resolve(0);
  });
}

/** How stale is the cached data for a store (in ms)? */
export async function cacheAgeMs(store: StoreName): Promise<number> {
  const cachedAt = await getCachedAt(store);
  return cachedAt === 0 ? Infinity : Date.now() - cachedAt;
}

/** Clear all data from a store. */
export async function clearStore(store: StoreName): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
