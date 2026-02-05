// Scryfall API utilities for fetching card prices

interface ScryfallCard {
  name: string;
  prices: {
    usd: string | null;
    usd_foil: string | null;
    eur: string | null;
  };
}

interface ScryfallCollectionResponse {
  data: ScryfallCard[];
  not_found: { name: string }[];
}

interface CardPrice {
  name: string;
  price: number | null;
  notFound: boolean;
}

// Fetch prices for multiple cards using Scryfall's collection endpoint
// Max 75 cards per request
async function fetchCardBatch(cardNames: string[]): Promise<CardPrice[]> {
  const identifiers = cardNames.map(name => ({ name }));
  
  try {
    const response = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifiers }),
    });

    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.status}`);
    }

    const data: ScryfallCollectionResponse = await response.json();
    
    const priceMap = new Map<string, number | null>();
    
    // Process found cards
    for (const card of data.data) {
      const price = card.prices.usd ? parseFloat(card.prices.usd) : null;
      priceMap.set(card.name.toLowerCase(), price);
    }
    
    // Process not found cards
    for (const notFound of data.not_found) {
      if (notFound.name) {
        priceMap.set(notFound.name.toLowerCase(), null);
      }
    }
    
    return cardNames.map(name => ({
      name,
      price: priceMap.get(name.toLowerCase()) ?? null,
      notFound: !priceMap.has(name.toLowerCase()) || priceMap.get(name.toLowerCase()) === null,
    }));
  } catch (error) {
    console.error('Error fetching card prices:', error);
    return cardNames.map(name => ({
      name,
      price: null,
      notFound: true,
    }));
  }
}

// Delay helper for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch prices for all cards, handling batching and rate limits
export async function fetchCardPrices(
  cards: { name: string; quantity: number }[],
  onProgress?: (progress: number) => void
): Promise<Map<string, number | null>> {
  const uniqueNames = [...new Set(cards.map(c => c.name))];
  const priceMap = new Map<string, number | null>();
  
  // Batch into groups of 75
  const batchSize = 75;
  const batches: string[][] = [];
  
  for (let i = 0; i < uniqueNames.length; i += batchSize) {
    batches.push(uniqueNames.slice(i, i + batchSize));
  }
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const results = await fetchCardBatch(batch);
    
    for (const result of results) {
      priceMap.set(result.name.toLowerCase(), result.price);
    }
    
    // Update progress
    if (onProgress) {
      onProgress(Math.round(((i + 1) / batches.length) * 100));
    }
    
    // Rate limit: 100ms between requests
    if (i < batches.length - 1) {
      await delay(100);
    }
  }
  
  return priceMap;
}

// Calculate total price for missing cards
export function calculateTotalPrice(
  cards: { cardName: string; shortage: number }[],
  priceMap: Map<string, number | null>
): { total: number; cardsWithPrice: number; cardsWithoutPrice: number } {
  let total = 0;
  let cardsWithPrice = 0;
  let cardsWithoutPrice = 0;
  
  for (const card of cards) {
    if (card.shortage <= 0) continue;
    
    const price = priceMap.get(card.cardName.toLowerCase());
    if (price !== null && price !== undefined) {
      total += price * card.shortage;
      cardsWithPrice++;
    } else {
      cardsWithoutPrice++;
    }
  }
  
  return { total, cardsWithPrice, cardsWithoutPrice };
}
