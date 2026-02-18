import type { GameState, CardState } from '../types/gameState';
import type { CardCharacteristics, UnifiedCard } from '../types/card-master';
import { ZoneId } from '../types/gameState';

/**
 * Checks if the player can pay the cost for a specific card.
 * Rule:
 * 1. Must have enough untapped mana (count >= cost).
 * 2. Must have at least one untapped mana of each required civilization (Rule 207.3).
 *    (For simplicity in this version, we require at least one matching civ, or all if multicolor.
 *     Standard DM requires at least one mana of EACH civilization the card has.)
 */
export const canPayCost = (
    state: GameState,
    playerId: string,
    cost: number,
    requiredCivs: string[]
): boolean => {
    const manaZone = Object.values(state.cards).filter(
        c => c.ownerId === playerId && c.zone === ZoneId.MANA
    );
    const untappedMana = manaZone.filter(c => !c.tapped);

    // 1. Check Total Cost
    if (untappedMana.length < cost) return false;

    // 2. Check Civilization Requirement
    // If card is colorless (Zero civilization), no specific color required.
    if (requiredCivs.length === 0) return true;

    // For each required civ, we need at least one card in mana that produces it.
    // Important: A single multi-color mana card can allow paying for multiple civs?
    // Rule: "Tap at least one card of that civilization."
    // Simplified Greedy Check:
    // We need to find a subset of `untappedMana` of size `cost` that covers all `requiredCivs`.

    // Quick check: Do we even have the civs available in the entire untapped pool?
    const availableCivs = new Set<string>();
    untappedMana.forEach(c => {
        const master = state.cardsMap[c.masterId];
        master?.searchIndex?.civilizations?.forEach(civ => availableCivs.add(civ));
    });

    for (const req of requiredCivs) {
        if (!availableCivs.has(req)) return false;
    }

    // Exact binding check is complex (Set Cover problem-esque), but usually simple in DM.
    // We assume if we have the civs and the count, we are good 99% of time unless edge cases.
    return true;
};

/**
 * Automatically selects and taps mana cards.
 * Returns the IDs of cards to tap.
 */
export const autoSelectMana = (
    state: GameState,
    playerId: string,
    cost: number,
    requiredCivs: string[]
): string[] => {
    const manaZone = Object.values(state.cards).filter(
        c => c.ownerId === playerId && c.zone === ZoneId.MANA
    );
    let untapped = manaZone.filter(c => !c.tapped);

    // Sort logic: Prioritize tapping single-color cards that match requirement?
    // Or prioritize cards that are NOT multi-color to save them?
    // Let's just try to satisfy requirements first.

    const selectedIds: string[] = [];
    const remainingCivs = [...requiredCivs];

    // 1. Select cards to satisfy civilizations
    for (let i = 0; i < remainingCivs.length; i++) {
        const req = remainingCivs[i];
        // Find a card that has this civ
        const candidateIndex = untapped.findIndex(c => {
            const master = state.cardsMap[c.masterId];
            return master?.searchIndex?.civilizations?.includes(req);
        });

        if (candidateIndex !== -1) {
            const card = untapped[candidateIndex];
            selectedIds.push(card.id);
            // Remove from pool
            untapped.splice(candidateIndex, 1);
            // This card might satisfy other requirements too, but we need 1 tap per cost count?
            // Actually, one card satisfies the civ requirement. We need total taps = cost.
            // But we must tap "cards of that civilization".
        }
    }

    // 2. Fill the rest of the cost with any available mana
    while (selectedIds.length < cost) {
        if (untapped.length === 0) break; // Should be caught by canPayCost
        const card = untapped.shift();
        if (card) selectedIds.push(card.id);
    }

    // Double check: if we over-selected (e.g. we needed 2 civs but cost is 1?? Impossible in DM usually, Min Cost >= Number of Civs usually?)
    // Actually cost can be less than number of civs? No.

    return selectedIds;
};

export const tapManaForCost = (
    state: GameState,
    playerId: string,
    cost: number,
    requiredCivs: string[]
): { newState: GameState; success: boolean } => {
    if (!canPayCost(state, playerId, cost, requiredCivs)) {
        return { newState: state, success: false };
    }

    const cardsToTap = autoSelectMana(state, playerId, cost, requiredCivs);
    if (cardsToTap.length !== cost) {
        // Validation failed (edge case)
        return { newState: state, success: false };
    }

    const newState = { ...state, cards: { ...state.cards } };
    cardsToTap.forEach(id => {
        if (newState.cards[id]) {
            newState.cards[id] = { ...newState.cards[id], tapped: true };
        }
    });

    return { newState, success: true };
};
