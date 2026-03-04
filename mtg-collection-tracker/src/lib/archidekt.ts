import { Card } from '@/types';

/**
 * Extract the deck ID from an Archidekt URL.
 * Supports formats like:
 *   https://archidekt.com/decks/12345
 *   https://archidekt.com/decks/12345/deck-name
 *   https://www.archidekt.com/decks/12345
 *   archidekt.com/decks/12345
 *   12345  (raw ID)
 */
export function extractDeckId(input: string): string | null {
  const trimmed = input.trim();

  // Raw numeric ID
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // URL pattern
  const match = trimmed.match(/archidekt\.com\/(?:api\/)?decks\/(\d+)/i);
  return match ? match[1] : null;
}

interface ArchidektCard {
  quantity: number;
  card: {
    oracleCard: {
      name: string;
    };
    edition: {
      editioncode: string;
      name: string;
    };
    collectorNumber?: string;
  };
  categories: string[];
}

interface ArchidektDeckResponse {
  id: number;
  name: string;
  cards: ArchidektCard[];
}

/**
 * Fetch a deck from the Archidekt API via our proxy route.
 * Maybeboard cards are always included but tagged with maybeboard: true.
 */
export async function fetchArchidektDeck(
  deckId: string,
): Promise<{ name: string; cards: Card[] }> {
  const response = await fetch(`/api/archidekt/${deckId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Deck not found. Make sure the URL or ID is correct and the deck is public.');
    }
    throw new Error(`Failed to fetch deck (HTTP ${response.status})`);
  }

  const data: ArchidektDeckResponse = await response.json();

  const cards: Card[] = data.cards
    .map((c) => {
      const cats = c.categories.map((cat) => cat.toLowerCase());
      return {
        name: c.card.oracleCard.name,
        quantity: c.quantity,
        setCode: c.card.edition?.editioncode || undefined,
        setName: c.card.edition?.name || undefined,
        collectorNumber: c.card.collectorNumber || undefined,
        maybeboard: cats.includes('maybeboard') || undefined,
      };
    });

  return { name: data.name, cards };
}

// ---------------------------------------------------------------------------
// Collection helpers
// ---------------------------------------------------------------------------

export type CollectionInput =
  | { type: 'collectionId'; value: string }
  | { type: 'username'; value: string };

/**
 * Parse an Archidekt collection URL or bare identifier.
 *
 * Supported formats:
 *   https://archidekt.com/collection/v2/832552          ← shared collection link
 *   https://archidekt.com/collection/v2/832552?collectionGame=1
 *   https://archidekt.com/u/USERNAME/collection
 *   https://archidekt.com/u/USERNAME
 *   USERNAME  (raw)
 */
export function extractCollectionInput(input: string): CollectionInput | null {
  const trimmed = input.trim();

  // Shared collection link: /collection/v2/{id}
  const idMatch = trimmed.match(/archidekt\.com\/collection\/v2\/(\d+)/i);
  if (idMatch) return { type: 'collectionId', value: idMatch[1] };

  // Profile URL: /u/USERNAME or /u/USERNAME/collection
  const userMatch = trimmed.match(/archidekt\.com\/u\/([A-Za-z0-9_\-]+)/i);
  if (userMatch) return { type: 'username', value: userMatch[1] };

  // Raw username — alphanumeric + _ and -
  if (/^[A-Za-z0-9_\-]{1,64}$/.test(trimmed)) return { type: 'username', value: trimmed };

  return null;
}

interface ArchidektCollectionCard {
  quantity: number;
  card: {
    oracleCard: {
      name: string;
    };
    edition: {
      editioncode: string;
      name: string;
    };
    collectorNumber?: string;
  };
  foil?: boolean;
  condition?: string;
  language?: string;
}

interface ArchidektCollectionResponse {
  username: string;
  count: number;
  cards: ArchidektCollectionCard[];
}

/**
 * Fetch an Archidekt collection via our proxy route.
 * Accepts either a shared collection ID or a username.
 */
export async function fetchArchidektCollection(
  input: CollectionInput,
): Promise<{ username: string; cards: Card[] }> {
  const qs =
    input.type === 'collectionId'
      ? `collectionId=${encodeURIComponent(input.value)}`
      : `username=${encodeURIComponent(input.value)}`;

  const response = await fetch(`/api/archidekt/collection?${qs}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const msg =
      body?.error ||
      (response.status === 404
        ? 'Collection not found on Archidekt. Check the URL and make sure the collection is public.'
        : response.status === 403
          ? 'This collection is private. Make it public on Archidekt first.'
          : `Failed to fetch collection (HTTP ${response.status})`);
    throw new Error(msg);
  }

  const data: ArchidektCollectionResponse = await response.json();

  const cards: Card[] = data.cards.map((c) => ({
    name: c.card.oracleCard.name,
    quantity: c.quantity,
    setCode: c.card.edition?.editioncode || undefined,
    setName: c.card.edition?.name || undefined,
    collectorNumber: c.card.collectorNumber || undefined,
    foil: c.foil || undefined,
    condition: c.condition || undefined,
    language: c.language || undefined,
  }));

  return { username: data.username, cards };
}
