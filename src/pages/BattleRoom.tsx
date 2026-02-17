import { useEffect, useState, useReducer } from 'react';
import { DeckSelector } from '../components/game/DeckSelector';
import { GameBoard } from '../components/game/GameBoard';
import { GameControls } from '../components/game/GameControls';
import { initializeGame } from '../logic/gameInit';
import { gameReducer } from '../logic/gameReducer';
import { normalizeCards } from '../utils/cardProcessor';
import type { UnifiedCard } from '../types/card-master';
import type { CardData } from '../types';
import type { Deck } from '../utils/deckStorage';
import type { GameState } from '../types/gameState';

const BattleRoom = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameState, dispatch] = useReducer(gameReducer, null);
    const [cardsMap, setCardsMap] = useState<Record<string, UnifiedCard>>({});
    const [loadingCards, setLoadingCards] = useState(true);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    // Initialize Cards Data
    useEffect(() => {
        fetch('/data/cards.json')
            .then(res => res.json())
            .then((data: CardData[]) => {
                const unified = normalizeCards(data);
                const map: Record<string, UnifiedCard> = {};
                unified.forEach(c => {
                    map[c.id] = c;
                });
                setCardsMap(map);
                setLoadingCards(false);
            })
            .catch(err => {
                console.error("Failed to load cards", err);
                setLoadingCards(false);
            });
    }, []);

    const handleDeckSelect = (deck: Deck) => {
        const initialState = initializeGame(deck, 'player1', 'player2');
        dispatch({ type: 'INITIALIZE_GAME', payload: initialState });
        setGameStarted(true);
    };

    const handleCardClick = (cardId: string) => {
        setSelectedCardId(prev => prev === cardId ? null : cardId);
    };

    // Actions
    const handleAction = (actionType: 'MANA' | 'PLAY' | 'TAP' | 'DISCARD') => {
        if (!selectedCardId || !gameState) return;

        const card = gameState.cards[selectedCardId];
        if (!card) return;

        switch (actionType) {
            case 'MANA':
                dispatch({ type: 'MANA_CHARGE', payload: { cardId: selectedCardId, playerId: 'player1' } });
                break;
            case 'PLAY':
                dispatch({ type: 'PLAY_CARD', payload: { cardId: selectedCardId, playerId: 'player1' } });
                break;
            case 'TAP':
                dispatch({ type: 'TAP_CARD', payload: { cardId: selectedCardId } });
                break;
            case 'DISCARD':
                dispatch({ type: 'DISCARD_CARD', payload: { cardId: selectedCardId } });
                break;
        }
        setSelectedCardId(null);
    };

    if (loadingCards) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-900 text-white">
                Loading Game Data...
            </div>
        );
    }

    if (!gameStarted) {
        return (
            <div className="flex-1 bg-slate-100 relative">
                <DeckSelector onSelect={handleDeckSelect} />
            </div>
        );
    }

    if (!gameState) return <div>Error: Game State not initialized</div>;

    const selectedCard = selectedCardId ? gameState.cards[selectedCardId] : null;

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
            <div className="flex-1 overflow-hidden">
                <GameBoard
                    gameState={gameState}
                    playerId="player1"
                    cardsMap={cardsMap}
                    onCardClick={handleCardClick}
                    selectedCardId={selectedCardId}
                />
            </div>

            {/* Selected Card Context Actions Overlay */}
            {selectedCard && selectedCard.controllerId === 'player1' && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 p-4 rounded-lg shadow-xl border border-indigo-200 flex gap-4 z-50">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase">Selected:</span>
                        <span className="font-bold">{cardsMap[selectedCard.masterId]?.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Hand Actions */}
                        {selectedCard.zone === 'HAND' && (
                            <>
                                <button
                                    onClick={() => handleAction('MANA')}
                                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm font-bold"
                                >
                                    Charge Mana
                                </button>
                                <button
                                    onClick={() => handleAction('PLAY')}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold"
                                >
                                    Play
                                </button>
                                <button
                                    onClick={() => handleAction('DISCARD')}
                                    className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-sm font-bold"
                                >
                                    Discard
                                </button>
                            </>
                        )}

                        {/* Battle Zone Actions */}
                        {selectedCard.zone === 'BATTLE_ZONE' && !selectedCard.tapped && (
                            <button
                                onClick={() => handleAction('TAP')}
                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-bold"
                            >
                                Tap / Attack
                            </button>
                        )}

                        {/* Mana Zone Actions */}
                        {selectedCard.zone === 'MANA' && !selectedCard.tapped && (
                            <button
                                onClick={() => handleAction('TAP')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-sm font-bold"
                            >
                                Tap for Mana
                            </button>
                        )}

                        <button
                            onClick={() => setSelectedCardId(null)}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* General Game Controls */}
            <div className="absolute bottom-4 right-4 z-40">
                <GameControls
                    gameState={gameState}
                    playerId="player1"
                    dispatch={dispatch}
                />
            </div>
        </div>
    );
};

export default BattleRoom;
