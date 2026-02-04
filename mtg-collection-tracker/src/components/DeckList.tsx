'use client';

import { Deck } from '@/types';

interface DeckListProps {
  decks: Deck[];
  onRemove: (id: string) => void;
}

export default function DeckList({ decks, onRemove }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No decks uploaded yet.</p>
        <p className="text-sm mt-1">Upload your deck lists above to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decks.map((deck) => (
        <div
          key={deck.id}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{deck.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {deck.cards.length} unique cards • {deck.cards.reduce((sum, c) => sum + c.quantity, 0)} total
            </p>
          </div>
          <button
            onClick={() => onRemove(deck.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Remove deck"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
