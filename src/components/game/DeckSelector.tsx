import { useEffect, useState } from 'react';
import { loadDecks } from '../../utils/deckStorage';
import type { Deck } from '../../utils/deckStorage';

interface DeckSelectorProps {
    onSelect: (deck: Deck) => void;
}

export const DeckSelector = ({ onSelect }: DeckSelectorProps) => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDecks().then(data => {
            setDecks(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    // Helper to get main civilization colors
    const getCivColors = (deck: Deck) => {
        const civs = new Set<string>();
        deck.cards.forEach(c => {
            const cCivs = c.searchIndex.civilizations;
            cCivs.forEach((civ: string) => civs.add(civ));
        });
        return Array.from(civs);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-slate-800">使用するデッキを選択</h2>
                    <p className="text-slate-500 text-sm">または新しいデッキを作成してください</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : decks.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            デッキが見つかりません。
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {decks.map(deck => (
                                <div
                                    key={deck.id}
                                    onClick={() => onSelect(deck)}
                                    className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition-all group"
                                >
                                    <h3 className="font-bold text-lg mb-2 text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                        {deck.name}
                                    </h3>
                                    <div className="flex gap-1 mb-3">
                                        {getCivColors(deck).slice(0, 5).map(civ => (
                                            <span key={civ} className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                                                {civ}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        cards: {deck.cards.length}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                    {/* Future: Close or Cancel button */}
                </div>
            </div>
        </div>
    );
};
