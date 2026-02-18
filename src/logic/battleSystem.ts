import type { GameState, CardId } from '../types/gameState';
import { ZoneId } from '../types/gameState';
import { getPower } from './cardStatus';
import { checkStateBasedActions } from './stateBasedActions';
import { breakShield } from './actions';
import { moveCard } from './zoneMovement';

/**
 * Initiates an attack.
 * Returns updated state with attack details.
 */
export const initiateAttack = (
    state: GameState,
    attackerId: CardId,
    targetId: string, // CardId (Creature) or PlayerId
    isDirectButton: boolean = false
): GameState => {
    let newState = { ...state };

    // Tap attacker
    const attacker = newState.cards[attackerId];
    if (attacker) {
        attacker.tapped = true;
    }

    // Set Attack State
    // If targetId is a player ID, it's a direct attack or shield break
    // Determine which shields are broken later or if it's direct.

    newState.turnState.currentAttack = {
        attackerId,
        targetId,
        breakingShieldIds: [],
        pendingTriggers: []
    };

    // Log
    const attackerName = state.cardsMap[attacker.masterId]?.name;
    const targetName = state.players[targetId] ? `Player ${targetId}` : state.cardsMap[state.cards[targetId]?.masterId]?.name || 'Unknown';
    newState.logs = [...(newState.logs || []), `${attackerName} attacks ${targetName}!`];

    return newState;
};

/**
 * Resolves the battle.
 * 
 * 1. If attacking creature -> Compare Power.
 * 2. If attacking player -> Break Shield(s) OR Direct Attack (Win).
 */
export const resolveBattle = (state: GameState): GameState => {
    let newState = { ...state };
    const attack = newState.turnState.currentAttack;
    if (!attack) return newState;

    const attacker = newState.cards[attack.attackerId];
    if (!attacker) return newState; // Attacker gone?

    // Target is Player (Shields)
    if (newState.players[attack.targetId]) {
        const targetPlayerId = attack.targetId;
        const shields = Object.values(newState.cards).filter(
            c => c.ownerId === targetPlayerId && c.zone === ZoneId.SHIELD
        );

        if (shields.length > 0) {
            // Break Shields
            // For now, let's assume W-Breaker etc is 1, unless defined.
            // We just break the first shield found for simplicity or manual selection? 
            // In digital games, usually attacker picks or it's random/ordered. 
            // Let's break the top shield.

            // TODO: Breaker capability (W-Breaker etc)
            const breakCount = 1;
            const shieldsToBreak = shields.slice(0, breakCount);

            shieldsToBreak.forEach(shield => {
                newState.logs = [...(newState.logs || []), `Shield Broken!`];
                // Use breakShield logic which moves to hand (and will check triggers later)
                newState = breakShield(newState, shield.id);
            });
        } else {
            // Direct Attack -> WIN
            newState.logs = [...(newState.logs || []), `Direct Attack! ${attacker.ownerId} Wins!`];
            newState.winner = attacker.ownerId;
        }
    }
    // Target is Creature
    else {
        const target = newState.cards[attack.targetId];
        if (target) {
            const attackerPower = getPower(newState, attacker.id);
            const targetPower = getPower(newState, target.id);

            newState.logs = [...(newState.logs || []), `Battle: ${attackerPower} vs ${targetPower}`];

            if (attackerPower > targetPower) {
                // Target destoryed
                newState = moveCard(newState, target.id, ZoneId.GRAVEYARD);
            } else if (attackerPower < targetPower) {
                // Attacker destroyed
                newState = moveCard(newState, attacker.id, ZoneId.GRAVEYARD);
            } else {
                // Both destroyed
                newState = moveCard(newState, attacker.id, ZoneId.GRAVEYARD);
                newState = moveCard(newState, target.id, ZoneId.GRAVEYARD);
            }
        }
    }

    // Cleanup Attack State
    newState.turnState.currentAttack = undefined;

    return checkStateBasedActions(newState);
};
