
import { ZoneId } from '../types/gameState';
import type { GameState, CardState } from '../types/gameState';
import { moveCard } from './zoneMovement';

import { getPower } from './cardStatus';

/**
 * Rule 703. State-Based Actions
 * Checks game state for specific conditions and applies necessary changes.
 * Repeats until no SBA occur (Rule 703.2).
 */
export const checkStateBasedActions = (state: GameState): GameState => {
    let newState = { ...state, cards: { ...state.cards } }; // Clone top level
    let anyChange = false;
    let iterations = 0;
    const MAX_ITERATIONS = 20; // Safety break

    do {
        anyChange = false;
        iterations++;

        // 1. Win/Loss Check (703.4a, 703.4b, 104.1)
        // Deck Out Check:
        Object.values(newState.players).forEach(player => {
            const deckCount = Object.values(newState.cards).filter(
                c => c.ownerId === player.id && c.zone === ZoneId.DECK
            ).length;

            // Note: Rule 104.1 says you lose when you *attempt* to draw from empty deck.
            // SBA 703.4b: "If a player attempted to draw a card ... and couldn't...".
            // So Deck==0 alone isn't a loss UNTIL draw attempt.
            // However, 703.4a Direct Attack is instant.

            // For now, we don't auto-lose on Deck=0 here unless we track "failed draw".
            // Assuming "Draw Action" handles the loss flag if filtering.
            // If the game has a "PendingLoss" flag on player, execute it here.
        });

        // 2. Destroy Power 0 or Less (703.4c)
        // Scan all creatures in Battle Zone
        const creatures = Object.values(newState.cards).filter(
            c => c.zone === ZoneId.BATTLE_ZONE
        );

        for (const creature of creatures) {
            const currentPower = getPower(creature, newState);
            if (currentPower <= 0) {
                // Destroy (Risk of loop if continuous effect keeps putting it back? Rule says destroy.)
                const nextState = moveCard(newState, creature.id, ZoneId.GRAVEYARD);
                newState = nextState;
                anyChange = true;
                break; // Restart loop
            }
        }
        if (anyChange) continue;

        // 3. Battle Loss (703.4d)
        // Check for creatures that lost a battle and are waiting to be destroyed.
        // Needs "Battle Result" state. 
        // Implementing placeholder:
        // if (creature.pendingDestruction) ...

        // 4. Invalid Objects Cleanup (703.4g, 703.4m, 703.4i)
        // Example: DRAGOON WEAPON or CROSS GEAR not attached properly? (Rule dependent)
        // Example: Card under Evolution that shouldn't be there?

        // 5. Seal / D2 Field Logic (703.4j, 703.4l)
        // D2 Field Legend Rule: If new D2 field enters, others go to graveyard.
        // Check if multiple D2 fields exist in Battle Zone? (Usually global or per player?)
        // Rule 703.4l: "If there is more than one D2 Field in the Battle Zone..." (Global unique?)
        // Assuming Global Unique for D2 Fields (only one allowed in BZ across both players? Or per player?)
        // Wiki says: "Battle Zone can only have one D2 Field". Global.

        const d2Fields = Object.values(newState.cards).filter(c =>
            c.zone === ZoneId.BATTLE_ZONE &&
            newState.cardsMap[c.masterId]?.cardType === 'D2Field' // Hypothetical Type check
        );

        if (d2Fields.length > 1) {
            // Keep the most recent one. 
            // We need 'timestamp' or check which one entered last.
            // Current state doesn't track entry timestamp clearly.
            // For now, skip or implement LIFO if we tracked it.
        }

    } while (anyChange && iterations < MAX_ITERATIONS);

    return newState;
};
