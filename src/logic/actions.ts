import type { GameState, CardId } from '../types/gameState';
import { ZoneId } from '../types/gameState';
import { moveCard } from './zoneMovement';
import { checkStateBasedActions } from './stateBasedActions';

/**
 * 701.2 Tap
 */
/**
 * 701.2 Tap
 */
export const tapCard = (state: GameState, cardId: CardId): GameState => {
    const newState = JSON.parse(JSON.stringify(state)) as GameState;
    const card = newState.cards[cardId];
    if (card && !card.tapped) {
        card.tapped = true;
    }
    return checkStateBasedActions(newState);
};

/**
 * 701.6 Destroy (Battle Zone -> Graveyard)
 */
export const destroyCard = (state: GameState, cardId: CardId): GameState => {
    const newState = moveCard(state, cardId, ZoneId.GRAVEYARD);
    return checkStateBasedActions(newState);
};

/**
 * 701.7 Discard (Hand -> Graveyard)
 */
export const discardCard = (state: GameState, cardId: CardId): GameState => {
    const newState = moveCard(state, cardId, ZoneId.GRAVEYARD);
    return checkStateBasedActions(newState);
};

/**
 * 701.8 Charge Mana (Hand -> Mana)
 */
export const chargeMana = (state: GameState, cardId: CardId): GameState => {
    const newState = moveCard(state, cardId, ZoneId.MANA);
    return checkStateBasedActions(newState);
};

/**
 * 701.14 Break Shield
 */
export const breakShield = (state: GameState, shieldId: CardId): GameState => {
    const newState = moveCard(state, shieldId, ZoneId.HAND);
    return checkStateBasedActions(newState);
};

/**
 * 701.3 Summon Creature
 */
export const summonCreature = (state: GameState, cardId: CardId): GameState => {
    const newState = moveCard(state, cardId, ZoneId.BATTLE_ZONE);
    return checkStateBasedActions(newState);
};

/**
 * 701.4 Cast Spell
 */
/**
 * 701.4 Cast Spell
 */
export const castSpell = (state: GameState, cardId: CardId): GameState => {
    // 1. Move to Pending (Rule 409.1)
    let newState = moveCard(state, cardId, ZoneId.PENDING);

    // 2. Resolve Effect (Placeholder)
    console.log(`Resolving spell ${cardId}...`);
    // TODO: Execute effect logic here

    // 3. Move to Graveyard (Rule 605.2f)
    newState = moveCard(newState, cardId, ZoneId.GRAVEYARD);

    return checkStateBasedActions(newState);
};

/**
 * 701.15 Fortify (Castle -> Shield Zone)
 */
export const fortifyCastle = (state: GameState, cardId: CardId): GameState => {
    // castles attach to shields, but for now just move to shield zone face up?
    // Rule says "Attach to shield".
    // If we don't have attachment logic, we just put it in shield zone.
    // However, user said "ZoneId.SHIELD_ZONE".
    const newState = moveCard(state, cardId, ZoneId.SHIELD);

    // Castles are usually face up? check rules. 
    // "Fortify" targets a shield.
    // For now, let's just move it there to satisfy the requirement "go to SHIELD_ZONE".
    if (newState.cards[cardId]) {
        newState.cards[cardId].faceDown = false; // Castles are face up
    }

    return checkStateBasedActions(newState);
};
