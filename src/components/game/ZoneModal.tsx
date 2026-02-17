import React from 'react';
import type { CardState } from '../../types/gameState';
import type { UnifiedCard } from '../../types/card-master';

interface ZoneModalProps {
    title: string;
    cards: CardState[];
    cardsMap: Record<string, UnifiedCard>;
    onClose: () => void;
}

export const ZoneModal: React.FC<ZoneModalProps> = ({ title, cards, cardsMap, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-3/4 h-3/4 flex flex-col overflow-hidden relative border border-slate-300">
                {/* Header */}
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-md">
                    <h2 className="text-xl font-bold uppercase tracking-wider">{title} ({cards.length})</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors text-2xl font-bold leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 bg-slate-100">
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {cards.map((card) => {
                            const master = cardsMap[card.masterId];
                            return (
                                <div key={card.id} className="aspect-[2/3] relative group">
                                    <div className="absolute inset-0 bg-white rounded border border-slate-300 shadow-sm flex flex-col items-center justify-center p-1 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                                        {/* Simple visualization for now, matches GameBoard card style */}
                                        <div className="font-bold text-[10px] text-center line-clamp-2">{master?.name || 'Unknown'}</div>
                                        <div className="mt-auto text-[8px] font-bold text-gray-400">{master?.searchIndex?.costs?.[0]}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {cards.length === 0 && (
                            <div className="col-span-full flex items-center justify-center h-32 text-slate-400">
                                No cards in this zone.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
