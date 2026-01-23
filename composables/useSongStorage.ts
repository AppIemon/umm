
export interface StoredSong {
  id: string;
  name: string;
  blob: Blob;
  date: number;
}

const DB_NAME = 'ImpossibleTimingDB';
const STORE_NAME = 'songs';
const DB_VERSION = 1;

export const useSongStorage = () => {
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => reject('IndexedDB error');

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
    });
  };

  const saveSong = async (file: File): Promise<StoredSong> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const song: StoredSong = {
        id: crypto.randomUUID(),
        name: file.name,
        blob: file,
        date: Date.now()
      };

      const request = store.add(song);

      request.onsuccess = () => resolve(song);
      request.onerror = () => reject('Error saving song');
    });
  };

  const getSongs = async (): Promise<StoredSong[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by date desc
        const songs = (request.result as StoredSong[]).sort((a, b) => b.date - a.date);
        resolve(songs);
      };
      request.onerror = () => reject('Error fetching songs');
    });
  };

  const deleteSong = async (id: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error deleting song');
    });
  };

  return {
    saveSong,
    getSongs,
    deleteSong
  };
};
