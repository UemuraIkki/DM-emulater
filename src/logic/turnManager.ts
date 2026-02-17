import { ZoneId } from '../types/gameState';
import type { GameState } from '../types/gameState';
import { moveCard } from './zoneMovement';

/**
 * 501. Start of Turn
 */
export const startTurn = (state: GameState): GameState => {
    const activePlayerId = state.turnState.activePlayerId;
    const newState: GameState = {
        ...state,
        cards: { ...state.cards }
    };

    // 501.1 Untap Step
    // Untap all cards in Battle Zone and Mana Zone controlled by the active player.
    Object.values(newState.cards).forEach(card => {
        if (card.controllerId === activePlayerId &&
            (card.zone === ZoneId.BATTLE_ZONE || card.zone === ZoneId.MANA)) {
            card.tapped = false;
        }
    });

    // 501.2 Start of Turn Triggers (Future implementation)
    // resolveStartOfTurnTriggers(newState);

    return newState;
};

/**
 * 502. Draw Step
 */
export const drawStep = (state: GameState): GameState => {
    // 500.6 First Turn Rule: Skip draw if it's the very first turn of the game (and first player).
    if (state.turnState.isFirstTurn) {
        console.log("First Turn: Skipping Draw Step (Rule 500.6)");
        return state;
    }

    const activePlayerId = state.turnState.activePlayerId;
    const deckCards = Object.values(state.cards)
        .filter(c => c.ownerId === activePlayerId && c.zone === ZoneId.DECK)
        .sort((a, b) => (a.stackOrder || 0) - (b.stackOrder || 0));

    // Draw 1 card (502.1)
    if (deckCards.length > 0) {
        // Top card is usually last in array if we stack upwards, or first if we stack downwards.
        // Let's assume array index 0 is top for deck popping, or last. 
        // Based on gameInit shuffle, we pushed to array. 
        // In GameBoard, we just display count.
        // Let's adopt: Last element is TOP of deck.
        const topCard = deckCards[deckCards.length - 1];

        // Move to Hand
        return moveCard(state, topCard.id, ZoneId.HAND);
    } else {
        // Deck Out Failure (Rule 104.1) - Player loses
        // TODO: Implement Game Over logic
        console.log("Deck Out! Player loses.");
        return state;
    }
};

/**
 * 511. End of Turn
 */
export const endTurn = (state: GameState): GameState => {
    // 511.1 "At end of turn" triggers
    // 511.2 Cleanup "until end of turn" effects

    // For now, simple transition placeholder
    return state;
};
