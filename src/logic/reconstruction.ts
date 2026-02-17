import { ZoneId } from '../types/gameState';
import type { GameState, CardState } from '../types/gameState';
import { moveCard } from './zoneMovement';
// import { checkStateBasedActions } from './stateBasedActions'; // Avoid circular dependency if possible, or use carefully

/**
 * Rule 801.4 Reconstruction
 * When an evolution creature leaves the Battle Zone, the cards under it are processed.
 * 
 * Process:
 * 1. Top card moves to destination (handled by moveCard).
 * 2. Check cards underneath.
 * 3. Valid creatures/fields stay in Battle Zone.
 * 4. Invalid objects (Spells, etc.) go to Graveyard.
 * 5. State (Tapped/Untapped) is inherited (801.4d).
 */
export const performReconstruction = (state: GameState, topCard: CardState, underCardIds: string[]): GameState => {
    let newState = { ...state, cards: { ...state.cards } };

    // The top card has already moved (assumed).
    // underCardIds are the IDs of cards that were attached to the top card.

    // We process them *from top to bottom* of the remaining stack?
    // Rule 801.4a: "The top card moves... The remaining cards are reorganized."
    // Rule 801.4b: "If the top card of the remaining stack is a creature, field, etc., it stays."
    // Rule 801.4c: "If not... it moves to graveyard... repeat."

    // In our simplified stack model, 'attachedTo' usually points to the top card.
    // But we need to know the order. 'stackOrder' field helps.
    // If top card leaves, the card with next highest stackOrder becomes the new top.

    // 1. Sort underCards by stackOrder (descending)
    const underCards = underCardIds
        .map(id => newState.cards[id])
        .filter(c => c !== undefined)
        .sort((a, b) => (b.stackOrder || 0) - (a.stackOrder || 0));

    if (underCards.length === 0) return newState;

    // The "Top" of the stack was the card that moved.
    // The next one is underCards[0].

    // We iterate through determining if they stick or move to GY.
    // But wait, if the NEW top card stays, the cards UNDER IT also stay as its materials (Rule 801.4b).
    // So we only check the *current* top of the remaining stack.

    // 801.4d: Inherit orientation from the card that left? 
    // "The creature retains the tapped/untapped state and summoning sickness state of the evolution creature."
    const inheritedTapped = topCard.tapped;
    const inheritedSummoningSickness = topCard.hasSummoningSickness;

    // Reset loop
    let currentTopIndex = 0;
    while (currentTopIndex < underCards.length) {
        const candidate = underCards[currentTopIndex];
        const master = newState.cardsMap[candidate.masterId];

        // Check validity to exist in Battle Zone
        const isCreature = master?.searchIndex?.isCreature; // Simplified check
        const isField = master?.searchIndex?.isField;       // Simplified check
        // Also Cross Gear, Fortress, etc.
        // Need usage of CardType enum strictly.
        // const type = master.sides[0].type;
        // const valid = type === CardType.CREATURE || type === CardType.FIELD ...

        const valid = isCreature || isField; // Placeholder logic

        if (valid) {
            // It stays!
            // It becomes a separate object in Battle Zone (Rule 801.4b).
            // It inherits state.
            candidate.tapped = inheritedTapped;
            candidate.hasSummoningSickness = inheritedSummoningSickness;
            candidate.attachedToId = undefined; // No longer attached to the card that left
            candidate.stackOrder = 0; // Reset stack order (it is now the base/top)

            // What about cards UNDER this candidate?
            // They remain attached to THIS candidate.
            // We need to update their 'attachedToId' to point to 'candidate.id'.
            for (let i = currentTopIndex + 1; i < underCards.length; i++) {
                const subCard = underCards[i];
                subCard.attachedToId = candidate.id;
                // Stack order relative to candidate logic?
                // If they were 2, 1, 0. Left is 3.
                // New top is 2. 1 and 0 are under 2.
                // Their relative order is fine.
            }

            // Stop processing. The rest of the stack is preserved under this new creature.
            break;
        } else {
            // Invalid (e.g. Spell in stack? Or just a card that can't exist alone like... wait, evolution sources are usually creatures.)
            // If it's a Spell that was somehow under there (Meteorburn?), it goes to GY.
            // Or if it's an Evolution Creature itself? It counts as Creature, so it stays.

            // Move to Graveyard (Rule 801.4c)
            // We use moveCard but we need to handle it carefully to not trigger recursive reconstruction again immediately?
            // "put into the graveyard"
            newState = moveCard(newState, candidate.id, ZoneId.GRAVEYARD);

            // Continue to next card
            currentTopIndex++;
        }
    }

    return newState;
};
