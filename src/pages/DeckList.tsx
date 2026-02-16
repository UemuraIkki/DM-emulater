import { useEffect, useState } from 'react';
import { loadDecks, deleteDeck } from '../utils/deckStorage';
import type { Deck } from '../utils/deckStorage';
import { useNavigate } from 'react-router-dom';

export default function DeckList() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDecks = async () => {
        setLoading(true);
        try {
            const data = await loadDecks();
            setDecks(data);
        } catch (err) {
            console.error(err);
            alert("デッキの読み込みに失敗しました");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDecks();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("本当にこのデッキを削除しますか？")) return;

        try {
            await deleteDeck(id);
            setDecks(decks.filter(d => d.id !== id));
        } catch (err) {
            console.error(err);
            alert("削除に失敗しました");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ja-JP');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">保存されたデッキ</h1>

            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    <p>読み込み中...</p>
                </div>
            ) : decks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
                    <p className="text-gray-500 mb-4">保存されたデッキはありません。</p>
                    <button
                        onClick={() => navigate('/deck-builder')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                    >
                        新しいデッキを作成
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map((deck) => (
                        <div
                            key={deck.id}
                            onClick={() => navigate('/deck-builder', { state: { deckId: deck.id } })} // We might need to handle loading in DeckBuilder
                            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer relative group"
                        >
                            <h2 className="text-xl font-bold mb-2 pr-8 truncate">{deck.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                作成日: {formatDate(deck.created_at)}
                            </p>
                            <div className="flex gap-2">
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                    {deck.cards ? deck.cards.length : 0} 枚
                                </span>
                            </div>

                            <button
                                onClick={(e) => handleDelete(deck.id, e)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="削除"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
