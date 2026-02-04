'use client';

import { Collection } from '@/types';

interface CollectionSummaryProps {
  collection: Collection;
  onClear: () => void;
}

export default function CollectionSummary({ collection, onClear }: CollectionSummaryProps) {
  if (!collection.uploadedAt || collection.cards.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p>No collection uploaded yet.</p>
        <p className="text-sm mt-1">Export your collection from Archidekt and upload it here.</p>
      </div>
    );
  }

  const totalCards = collection.cards.reduce((sum, card) => sum + card.quantity, 0);
  const uniqueCards = collection.cards.length;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Your Collection</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {uniqueCards.toLocaleString()} unique cards • {totalCards.toLocaleString()} total
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Uploaded {new Date(collection.uploadedAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onClear}
          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
