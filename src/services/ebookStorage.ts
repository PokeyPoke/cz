import type { StoredBook } from '@/types/ebook';

const DB_NAME = 'cz-ebooks';
const DB_VERSION = 1;
const STORE_NAME = 'books';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function generateId(): string {
  return `ebook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function saveBook(
  book: Omit<StoredBook, 'id' | 'uploadedAt' | 'currentWordIndex' | 'progressPercentage' | 'lastReadAt'> & {
    id?: string;
  },
): Promise<string> {
  const db = await openDb();
  const id = book.id || generateId();
  const now = new Date().toISOString();

  const stored: StoredBook = {
    ...book,
    id,
    uploadedAt: now,
    currentWordIndex: 0,
    progressPercentage: 0,
    lastReadAt: null,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(stored);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getBook(id: string): Promise<StoredBook | null> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function listBooks(): Promise<StoredBook[]> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const books = request.result || [];
      // Sort by last read desc
      books.sort((a, b) => {
        const aTime = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
        const bTime = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
        return bTime - aTime;
      });
      resolve(books);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateProgress(
  id: string,
  updates: {
    currentWordIndex?: number;
    progressPercentage?: number;
    lastReadAt?: string;
  },
): Promise<void> {
  const db = await openDb();
  const book = await getBook(id);
  if (!book) return;

  const updated: StoredBook = {
    ...book,
    currentWordIndex: updates.currentWordIndex ?? book.currentWordIndex,
    progressPercentage: updates.progressPercentage ?? book.progressPercentage,
    lastReadAt: updates.lastReadAt ?? new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(updated);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteBook(id: string): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get total word count across all stored books for reading stats.
 */
export async function getTotalWordsRead(): Promise<number> {
  const books = await listBooks();
  return books.reduce((sum, b) => {
    if (b.progressPercentage >= 100) return sum + b.wordCount;
    return sum + Math.round(b.wordCount * (b.progressPercentage / 100));
  }, 0);
}
