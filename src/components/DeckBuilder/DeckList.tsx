import React, { useState, useMemo } from 'react';
import type { UnifiedCard } from '../../utils/cardProcessor';
import type { Zone } from '../../types';

interface DeckListProps {
    title: string;
    cards: UnifiedCard[];
    max: number | string;
    zone: Zone | 'external';
    onRemove: (index: number) => void;
}

type SortOption = 'default' | 'cost_asc' | 'cost_desc' | 'count_desc';

export const DeckList: React.FC<DeckListProps> = ({ title, cards, max, zone, onRemove }) => {
    const [sortMode, setSortMode] = useState<SortOption>('default');

    const processedCards = useMemo(() => {
        // We need to preserve the original index for removal? 
        // If we sort, the index passed to onRemove will be wrong if we just map sorted array.
        // So we should sort a mapped array of { card, originalIndex }

        const withIndex = cards.map((card, index) => ({ card, index }));

        if (sortMode === 'default') {
            return withIndex;
        }

        return withIndex.sort((a, b) => {
            const cardA = a.card;
            const cardB = b.card;

            if (sortMode === 'cost_asc' || sortMode === 'cost_desc') {
                // Use lowest cost for sorting
                const costA = cardA.searchIndex.costs[0] || 0;
                const costB = cardB.searchIndex.costs[0] || 0;
                return sortMode === 'cost_asc' ? costA - costB : costB - costA;
            }

            if (sortMode === 'count_desc') {
                // Count how many of this card name are in the deck
                // This is inefficient to recalculate every sort compare, but deck size is small (40).
                const countA = cards.filter(c => c.name === cardA.name).length;
                const countB = cards.filter(c => c.name === cardB.name).length;
                if (countA !== countB) return countB - countA;
                return 0; // Stable
            }

            return 0;
        });
    }, [cards, sortMode]);

    return (
        <div className="mb-4" data-zone={zone}>
            <div className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2">
                <h3 className="text-sm font-bold">
                    {title} <span className={`${(typeof max === 'number' && cards.length === max) ? 'text-green-600' : 'text-gray-600'}`}>{cards.length}/{max}</span>
                </h3>

                <div className="relative">
                    <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value as SortOption)}
                        className="text-[10px] p-1 rounded border border-gray-300 bg-white"
                    >
                        <option value="default">デフォルト</option>
                        <option value="cost_asc">コスト ▲</option>
                        <option value="cost_desc">コスト ▼</option>
                        <option value="count_desc">枚数</option>
                    </select>
                </div>
            </div>

            {cards.length === 0 ? (
                <p className="text-xs text-gray-400 text-center italic py-2">カードがありません</p>
            ) : (
                <div className="space-y-1">
                    {processedCards.map(({ card, index }, i) => (
                        <div
                            key={`${i}-${card.id}`}
                            className="flex items-center justify-between text-xs p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer group relative"
                            onClick={() => onRemove(index)} // Pass original index
                            title={card.name}
                        >
                            <span className="truncate flex-1">{card.name}</span>
                            <span className="text-gray-400 ml-1 min-w-4 text-center">
                                {card.searchIndex.costs.join('/')}
                            </span>
                            <span className="absolute right-0 top-0 bottom-0 bg-red-50 text-red-500 px-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                ×
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
