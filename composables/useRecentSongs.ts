/**
 * 최근 사용한 노래 관리 (IndexedDB)
 * - 중복 제거 (같은 이름의 노래는 최신으로 갱신)
 * - 최대 20곡 저장
 */

export interface RecentSong {
  id: string;
  name: string;
  blob: Blob;
  addedAt: number;
}

const DB_NAME = 'ImpossibleTimingDB';
const STORE_NAME = 'recent_songs';
const DB_VERSION = 2; // 버전 업 (기존 songs 스토어와 공존)
const MAX_SONGS = 20;

export const useRecentSongs = () => {
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject('IndexedDB error');

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 기존 스토어 유지하면서 새 스토어 생성
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('addedAt', 'addedAt', { unique: false });
        }

        // 기존 songs 스토어도 유지
        if (!db.objectStoreNames.contains('songs')) {
          db.createObjectStore('songs', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
    });
  };

  /**
   * 노래 추가 (중복 시 갱신, 최대 개수 초과 시 오래된 것 삭제)
   */
  const addSong = async (file: File): Promise<RecentSong> => {
    const db = await initDB();

    return new Promise(async (resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // 같은 이름의 노래가 있는지 확인
        const nameIndex = store.index('name');
        const existingRequest = nameIndex.getAll(file.name);

        existingRequest.onsuccess = async () => {
          const existing = existingRequest.result as RecentSong[];

          // 중복이면 삭제
          for (const song of existing) {
            store.delete(song.id);
          }

          // 새 노래 추가
          const newSong: RecentSong = {
            id: crypto.randomUUID(),
            name: file.name,
            blob: file,
            addedAt: Date.now()
          };

          store.add(newSong);

          // 최대 개수 제한 체크
          const allRequest = store.index('addedAt').getAll();
          allRequest.onsuccess = () => {
            const all = allRequest.result as RecentSong[];
            if (all.length > MAX_SONGS) {
              // 오래된 순으로 정렬 후 초과분 삭제
              const sorted = all.sort((a, b) => a.addedAt - b.addedAt);
              const toDelete = sorted.slice(0, all.length - MAX_SONGS);
              for (const song of toDelete) {
                store.delete(song.id);
              }
            }
          };

          resolve(newSong);
        };

        existingRequest.onerror = () => reject('Error checking duplicates');
      } catch (e) {
        reject(e);
      }
    });
  };

  /**
   * 모든 최근 노래 가져오기 (최신순)
   */
  const getSongs = async (): Promise<RecentSong[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const songs = (request.result as RecentSong[]).sort((a, b) => b.addedAt - a.addedAt);
        resolve(songs);
      };
      request.onerror = () => reject('Error fetching songs');
    });
  };

  /**
   * 노래 삭제
   */
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

  /**
   * 전체 삭제
   */
  const clearAll = async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error clearing songs');
    });
  };

  return {
    addSong,
    getSongs,
    deleteSong,
    clearAll
  };
};
