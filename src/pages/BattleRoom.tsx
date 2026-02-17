import { useEffect, useState, useReducer } from 'react';
import { DeckSelector } from '../components/game/DeckSelector';
import { GameBoard } from '../components/game/GameBoard';
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
        // Initialize Game State
        // Assuming Player 1 is the user.
        const initialState = initializeGame(deck, 'player1', 'player2');
        dispatch({ type: 'INITIALIZE_GAME', payload: initialState });
        setGameStarted(true);
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
                {/* Background or Lobby UI could go here */}
                <DeckSelector onSelect={handleDeckSelect} />
            </div>
        );
    }

    if (!gameState) return <div>Error: Game State not initialized</div>;

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            <GameBoard
                gameState={gameState}
                playerId="player1"
                cardsMap={cardsMap}
            />
        </div>
    );
};

export default BattleRoom;
