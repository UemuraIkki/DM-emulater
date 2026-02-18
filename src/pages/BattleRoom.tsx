import { useEffect, useState, useReducer } from 'react';
import { DeckSelector } from '../components/game/DeckSelector';
import { GameBoard } from '../components/game/GameBoard';
import { GameControls } from '../components/game/GameControls';
import { CardInteraction } from '../components/game/CardInteraction';
import { initializeGame } from '../logic/gameInit';
import { gameReducer } from '../logic/gameReducer';
import { normalizeCards } from '../utils/cardProcessor';
import type { UnifiedCard } from '../types/card-master';
import type { CardData } from '../types';
import type { Deck } from '../utils/deckStorage';
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
    const handleAction = (actionType: 'MANA' | 'PLAY' | 'TAP' | 'DISCARD' | 'BREAK_SHIELD') => {
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
            case 'BREAK_SHIELD':
                dispatch({ type: 'BREAK_SHIELD', payload: { cardId: selectedCardId } });
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
            {selectedCard && (
                <CardInteraction
                    gameState={gameState}
                    selectedCardId={selectedCardId!}
                    cardsMap={cardsMap}
                    playerId="player1"
                    onAction={handleAction}
                    onClose={() => setSelectedCardId(null)}
                />
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
