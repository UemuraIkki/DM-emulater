import { useEffect, useState, useReducer } from 'react';
import { DeckSelector } from '../components/game/DeckSelector';
import { GameBoard } from '../components/game/GameBoard';
import { GameControls } from '../components/game/GameControls';
import { ManualActionModal } from '../components/game/ManualActionModal'; // Use ManualModal
import { ChatWindow } from '../components/game/ChatWindow';
import { initializeGame } from '../logic/gameInit';
import { gameReducer } from '../logic/gameReducer';
import { normalizeCards } from '../utils/cardProcessor';
import type { UnifiedCard } from '../types/card-master';
import type { CardData } from '../types';
import type { Deck } from '../utils/deckStorage';
import type { ZoneId } from '../types/gameState';

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

    // Chat
    const handleSendMessage = (text: string) => {
        dispatch({ type: 'SEND_MESSAGE', payload: { senderId: 'player1', text } });
    };

    // Manual Action
    const handleManualAction = (targetZone: ZoneId, options?: any) => {
        if (!selectedCardId) return;
        dispatch({
            type: 'MANUAL_MOVE_CARD',
            payload: { cardId: selectedCardId, toZone: targetZone, options }
        });
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
                    onZoneClick={(pid, zone) => console.log(`Clicked zone ${zone} of ${pid}`)} // Placeholder
                />
            </div>

            {/* Chat Window */}
            <ChatWindow
                messages={gameState.chatMessages || []}
                playerId="player1"
                onSendMessage={handleSendMessage}
            />

            {/* Manual Action Modal (Replaces old context interaction) */}
            {selectedCard && (
                <ManualActionModal
                    card={cardsMap[selectedCard.masterId]}
                    cardId={selectedCardId!}
                    currentZone={selectedCard.zone}
                    onClose={() => setSelectedCardId(null)}
                    onAction={handleManualAction}
                />
            )}

            {/* General Game Controls (Phases etc) */}
            <div className="absolute bottom-4 right-4 z-40 hidden">
                {/* Explicitly hidden or removed if we drift away from auto-turn structure? 
                     For Manual Mode, we might still want Next Phase to track turn counts.
                     Let's keep it but maybe minimize it. 
                 */}
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
