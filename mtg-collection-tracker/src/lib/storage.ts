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
    const data = localStorage.getItem(COLLECTION_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        uploadedAt: parsed.uploadedAt ? new Date(parsed.uploadedAt) : null,
      };
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
    const data = localStorage.getItem(DECKS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.map((deck: Deck) => ({
        ...deck,
        uploadedAt: new Date(deck.uploadedAt),
      }));
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
