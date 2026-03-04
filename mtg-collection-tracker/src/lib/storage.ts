import { Collection, Deck } from '@/types';

const COLLECTION_KEY = 'mtg-collection';
const DECKS_KEY = 'mtg-decks';

export function saveCollection(collection: Collection): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
  }
}

export function loadCollection(): Collection {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem(COLLECTION_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...parsed,
          uploadedAt: parsed.uploadedAt ? new Date(parsed.uploadedAt) : null,
        };
      }
    } catch (error) {
      console.error('Failed to load collection from localStorage:', error);
      localStorage.removeItem(COLLECTION_KEY);
    }
  }
  return { cards: [], uploadedAt: null };
}

export function saveDecks(decks: Deck[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  }
}

export function loadDecks(): Deck[] {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem(DECKS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.map((deck: Deck) => ({
          ...deck,
          uploadedAt: new Date(deck.uploadedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load decks from localStorage:', error);
      localStorage.removeItem(DECKS_KEY);
    }
  }
  return [];
}

export function clearAllData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(COLLECTION_KEY);
    localStorage.removeItem(DECKS_KEY);
  }
}

// ---------------------------------------------------------------------------
// Settings export / import
// ---------------------------------------------------------------------------

export interface SettingsExport {
  version: 1;
  exportedAt: string;
  collection: Collection;
  decks: Deck[];
}

/**
 * Serialise current collection + decks to a JSON blob and trigger a
 * browser download of the file.
 */
export function exportSettings(collection: Collection, decks: Deck[]): void {
  const payload: SettingsExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    collection,
    decks,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  a.download = `shortfall-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse a JSON backup file (produced by exportSettings) and return the
 * restored collection and decks, or throw on error.
 */
export function parseSettingsImport(
  json: string,
): { collection: Collection; decks: Deck[] } {
  const parsed: SettingsExport = JSON.parse(json);

  if (!parsed || parsed.version !== 1) {
    throw new Error(
      'Unrecognised backup format. Only v1 Shortfall backups are supported.',
    );
  }

  const collection: Collection = {
    ...parsed.collection,
    uploadedAt: parsed.collection.uploadedAt
      ? new Date(parsed.collection.uploadedAt)
      : null,
  };

  const decks: Deck[] = (parsed.decks ?? []).map((d) => ({
    ...d,
    uploadedAt: new Date(d.uploadedAt),
  }));

  return { collection, decks };
}
