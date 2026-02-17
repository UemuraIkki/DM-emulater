import { ZoneId } from '../types/gameState';
import type { CardState, GameState } from '../types/gameState';

/**
 * Moves a card to a new zone, applying Rule 400.5 (State Reset).
 * 
 * Rule 400.5: When a card moves from one zone to another, it is treated as a new object.
 * Previous states (tapped, modifiers, etc.) are lost unless specified otherwise.
 * 
 * Exceptions:
 * - 400.5b: Mana Zone (tapped) -> Battle Zone => Enters UNTAPPED.
 * - 410.4: ABYSS Zone constraint (Cannot move from Abyss).
 */
export const moveCard = (
    state: GameState,
    cardId: string,
    targetZone: ZoneId,
    targetOwnerId?: string // If control changes or just moving to own zone
): GameState => {
    // Clone state for immutability
    const newState: GameState = JSON.parse(JSON.stringify(state));
    const card = newState.cards[cardId];

    if (!card) {
        console.error(`Card ${cardId} not found.`);
        return state; // No change
    }

    // Rule 410.4: ABYSS Constraint
    if (card.zone === ZoneId.ABYSS) {
        console.warn(`Rule 410.4: Card ${card.masterId} cannot move from ABYSS zone.`);
        return state; // Prevent move
    }

    // Determine new owner if provided, else keep same
    const newOwnerId = targetOwnerId || card.ownerId;

    // Logic for State Reset (Rule 400.5)
    // Create new clean state
    const newCardState: CardState = {
        ...card,
        zone: targetZone,
        ownerId: newOwnerId,
        controllerId: newOwnerId, // Control resets to owner usually, unless effect says otherwise. For move, usually it goes to owner's zone.

        // Reset Status
        tapped: false, // Reset tap state
        faceDown: false, // Default face up, specific zones override below
        hasSummoningSickness: true, // Reset summoning sickness (will be true for creatures)
        attachedToId: undefined, // Detach
        stackOrder: 0, // Reset stack
    };

    // Specific Zone Rules overrides

    // Shield: Enters Face Down
    if (targetZone === ZoneId.SHIELD) {
        newCardState.faceDown = true;
    }
    // Mana: Enters Untapped (Rule 400.5b check is implicit as we reset tapped=false)
    // However, if manual tappable, user might choose. But default is untapped.

    // GR / Deck: Face Down
    if (targetZone === ZoneId.GR || targetZone === ZoneId.DECK) {
        newCardState.faceDown = true;
    }

    // Battle Zone: 
    if (targetZone === ZoneId.BATTLE_ZONE) {
        // Summoning Sickness applies (Rule 301.5) - Default true is sufficient.
        // Tapped? Usually enters untapped unless "enters tapped" ability exists.
        // We assume default rules here.
    }

    // Mana Zone:
    if (targetZone === ZoneId.MANA) {
        // Multi-color / tapped rules processed elsewhere? 
        // Or if we need to check if it enters tapped due to civilization (Rule 208.1)?
        // For now, basic movement.
    }

    // Update State
    newState.cards[cardId] = newCardState;

    return newState;
};
