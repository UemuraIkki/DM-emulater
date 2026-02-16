import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { FilterPanel } from '../components/FilterPanel';
import { DeckList } from '../components/DeckBuilder/DeckList';
import type { Zone } from '../types';
import type { CardData } from '../types';
import { normalizeCards } from '../utils/cardProcessor';
import type { UnifiedCard } from '../utils/cardProcessor';
import { useDeckValidation, getZone } from '../hooks/useDeckValidation';
import { useCardFilter } from '../hooks/useCardFilter';
import { saveDeck, getDeck } from '../utils/deckStorage';
import { useNavigate, useLocation } from 'react-router-dom';

function DeckBuilder() {
    const [cards, setCards] = useState<UnifiedCard[]>([]);

    // Deck State for Zones
    const [mainDeck, setMainDeck] = useState<UnifiedCard[]>([]);
    const [hyperSpatial, setHyperSpatial] = useState<UnifiedCard[]>([]);
    const [grZone, setGrZone] = useState<UnifiedCard[]>([]);
    const [externalDeck, setExternalDeck] = useState<UnifiedCard[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [deckName, setDeckName] = useState("New Deck");
    const [deckId, setDeckId] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    // Advanced Filter Hook
    const { filters, setFilters, filteredCards } = useCardFilter(cards);

    // Validation Hook
    const validation = useDeckValidation(mainDeck, hyperSpatial, grZone, externalDeck);

    // Load cards and optional deck from navigation state
    useEffect(() => {
        fetch('/data/cards.json')
            .then(res => res.json())
            .then((data: CardData[]) => {
                const unified = normalizeCards(data);
                setCards(unified);
                setLoading(false);

                // Check if we need to load a deck
                if (location.state && location.state.deckId) {
                    loadDeck(location.state.deckId);
                }
            })
            .catch(err => {
                console.error("Failed to load cards", err);
                setLoading(false);
            });
    }, []);

    const loadDeck = async (id: string) => {
        setLoading(true);
        try {
            const deck = await getDeck(id);
            if (deck) {
                setDeckId(deck.id);
                setDeckName(deck.name);
                // Distribute cards to zones
                const main: UnifiedCard[] = [];
                const hyper: UnifiedCard[] = [];
                const gr: UnifiedCard[] = [];
                const external: UnifiedCard[] = [];

                deck.cards.forEach(card => {
                    const zone = getZone(card);
                    if (zone === 'hyperSpatial') hyper.push(card);
                    else if (zone === 'gr') gr.push(card);
                    else if (zone === 'external') external.push(card);
                    else main.push(card);
                });

                setMainDeck(main);
                setHyperSpatial(hyper);
                setGrZone(gr);
                setExternalDeck(external);
            }
        } catch (err) {
            console.error("Failed to load deck", err);
            alert("デッキの読み込みに失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!deckName.trim()) {
            alert("デッキ名を入力してください");
            return;
        }

        setSaving(true);
        try {
            const allCards = [...mainDeck, ...hyperSpatial, ...grZone, ...externalDeck];
            const savedDeck = await saveDeck({
                id: deckId || undefined,
                name: deckName,
                cards: allCards
            });

            if (savedDeck) {
                setDeckId(savedDeck.id);
                alert("保存しました！");
            }
        } catch (err) {
            console.error(err);
            alert("保存に失敗しました");
        } finally {
            setSaving(false);
        }
    };

    const handleClear = () => {
        if (confirm("デッキをクリアしますか？")) {
            setMainDeck([]);
            setHyperSpatial([]);
            setGrZone([]);
            setExternalDeck([]);
            setDeckId(null);
            setDeckName("New Deck");
        }
    };

    const addToDeck = (card: UnifiedCard) => {
        const zone = getZone(card);

        if (zone === 'hyperSpatial') {
            if (hyperSpatial.length >= 8) {
                alert("超次元ゾーンは8枚までです");
                return;
            }
            if (hyperSpatial.filter(c => c.name === card.name).length >= 4) {
                alert("同じカードは4枚までです");
                return;
            }
            setHyperSpatial([...hyperSpatial, card]);
        }
        else if (zone === 'gr') {
            if (grZone.length >= 12) {
                alert("GRゾーンは12枚までです");
                return;
            }
            if (grZone.filter(c => c.name === card.name).length >= 2) {
                alert("GRゾーンの同じカードは2枚までです");
                return;
            }
            setGrZone([...grZone, card]);
        }
        else if (zone === 'external') {
            // Validation handles restrictions
            setExternalDeck([...externalDeck, card]);
        }
        else {
            // Main Deck
            if (mainDeck.length >= 40) {
                alert("メインデッキは40枚までです");
                return;
            }
            if (mainDeck.filter(c => c.name === card.name).length >= 4) {
                alert("同じカードは4枚までです");
                return;
            }
            setMainDeck([...mainDeck, card]);
        }
    };

    const removeFromDeck = (index: number, zone: Zone | 'external') => {
        if (zone === 'main') {
            const newDeck = [...mainDeck];
            newDeck.splice(index, 1);
            setMainDeck(newDeck);
        } else if (zone === 'hyperSpatial') {
            const newDeck = [...hyperSpatial];
            newDeck.splice(index, 1);
            setHyperSpatial(newDeck);
        } else if (zone === 'gr') {
            const newDeck = [...grZone];
            newDeck.splice(index, 1);
            setGrZone(newDeck);
        } else if (zone === 'external') {
            const newDeck = [...externalDeck];
            newDeck.splice(index, 1);
            setExternalDeck(newDeck);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden font-sans text-gray-900 bg-gray-50">
            {/* Deck Sidebar - Fixed Height within Flex container */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col h-full shadow-xl z-20">
                <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        デッキ構築
                        {validation.valid ? (
                            <span className="text-green-500 text-sm bg-green-100 px-2 py-0.5 rounded-full">OK</span>
                        ) : (
                            <span className="text-red-500 text-sm bg-red-100 px-2 py-0.5 rounded-full">Incomplete</span>
                        )}
                    </h2>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                            className="flex-1 p-1 border rounded text-sm"
                            placeholder="デッキ名"
                        />
                    </div>

                    <div className="flex gap-2 text-sm">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex-1 py-1 px-3 rounded text-white font-bold transition-colors ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-500'}`}
                        >
                            {saving ? "保存中..." : "保存"}
                        </button>
                        <button
                            onClick={handleClear}
                            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                        >
                            クリア
                        </button>
                        <button
                            onClick={() => navigate('/decks')}
                            className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                        >
                            一覧
                        </button>
                    </div>

                    {/* Validation Errors */}
                    {!validation.valid && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 max-h-32 overflow-y-auto">
                            <ul className="list-disc pl-4 space-y-1">
                                {validation.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Validation Warnings */}
                    {validation.warnings.length > 0 && (
                        <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-100">
                            <ul className="list-disc pl-4 space-y-1">
                                {validation.warnings.map((warn, i) => (
                                    <li key={i}>{warn}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <DeckList
                        title="Main Deck"
                        cards={mainDeck}
                        max={40}
                        zone="main"
                        onRemove={(i) => removeFromDeck(i, 'main')}
                    />
                    <DeckList
                        title="Hyper Spatial"
                        cards={hyperSpatial}
                        max={8}
                        zone="hyperSpatial"
                        onRemove={(i) => removeFromDeck(i, 'hyperSpatial')}
                    />
                    <DeckList
                        title="GR Zone"
                        cards={grZone}
                        max={12}
                        zone="gr"
                        onRemove={(i) => removeFromDeck(i, 'gr')}
                    />
                    <DeckList
                        title="External Zone"
                        cards={externalDeck}
                        max="-"
                        zone="external"
                        onRemove={(i) => removeFromDeck(i, 'external')}
                    />
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
                    Total Cards: {mainDeck.length + hyperSpatial.length + grZone.length + externalDeck.length}
                </div>
            </div>

            {/* Main Content: Card List */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Sticky Filter Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 z-30 shadow-sm">
                    <div className="max-w-7xl mx-auto flex gap-2">
                        <input
                            type="text"
                            placeholder="カード名、テキスト、種族で検索..."
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={filters.searchQuery}
                            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                        />
                        <button
                            className={`px-4 py-2 rounded border ${showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-300'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            フィルター
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-2 max-w-7xl mx-auto relative z-40">
                            <FilterPanel
                                filters={filters}
                                onChange={setFilters}
                            />
                        </div>
                    )}
                </div>

                {/* Scrollable Card Grid */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-white/50">
                    <div className="max-w-7xl mx-auto pb-20">
                        {loading ? (
                            <div className="flex justify-center items-center h-64 text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
                                読み込み中...
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                                {filteredCards.map((card, i) => (
                                    <Card
                                        key={card.id + i}
                                        card={card}
                                        className="transform transition hover:-translate-y-1 hover:shadow-lg"
                                        onClick={() => addToDeck(card)}
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && filteredCards.length === 0 && (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
                                <p>条件に一致するカードが見つかりませんでした。</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeckBuilder;
