import { ZoneId } from '../types/gameState';
import type { GameState } from '../types/gameState';

/**
 * Counts cards in a specific zone for a player, complying with Rule 409.1c (Ignore Pending).
 * 
 * Rule 409.1c: Cards in "Pending" state (e.g. being summoned) are logically in the source zone,
 * but are NOT counted towards the number of cards in that zone for effects.
 * 
 * However, in our system, PENDING is a distinct ZoneId. 
 * So if a card is in ZoneId.PENDING, it is NOT in ZoneId.HAND.
 * Thus simple filtering by ZoneId handles 409.1c implicitly if we moved it to Pending.
 * 
 * But if we need to count "Cards in Hand" excluding pending ones (which are already out of hand physically in our model),
 * we just count ZoneId.HAND.
 * 
 * If pending cards were "physically" in hand but "logically" pending, we would need filtering.
 * Since we move them to 'PENDING' zone, simple count works.
 */
export const getZoneCount = (state: GameState, playerId: string, zoneId: ZoneId): number => {
    return Object.values(state.cards).filter(card =>
        card.ownerId === playerId &&
        card.zone === zoneId
    ).length;
};

/**
 * Get the actual card objects in a zone
 */
export const getZoneCards = (state: GameState, playerId: string, zoneId: ZoneId) => {
    return Object.values(state.cards).filter(card =>
        card.ownerId === playerId &&
        card.zone === zoneId
    ).sort((a, b) => (a.stackOrder || 0) - (b.stackOrder || 0));
};
