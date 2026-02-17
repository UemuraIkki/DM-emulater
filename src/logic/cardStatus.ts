import type { GameState } from '../types/gameState';
import type { CardState } from '../types/gameState';
import type { CardCharacteristics } from '../types/card-master';

/**
 * Retrieves the current characteristics of a card, accounting for Flip, Hyper Mode, etc.
 */
export const getCurrentCharacteristics = (card: CardState, state: GameState): CardCharacteristics | undefined => {
    const master = state.cardsMap[card.masterId];
    if (!master) return undefined;

    // 1. Check if Flipped (Psychic / Dragheart / Forbidden / Twinpact cast side?)
    // Twinpact usually treated as separate play, but on board it's the creature side.
    // Sides[0] is usually the main side.
    // If flipped, is it sides[1]? 
    // Logic for "Flipped" depends on card type.
    // For now, default to sides[0] or sides[1] if flipped.

    let activeSideIndex = 0;
    if (card.isFlipped && master.sides.length > 1) {
        activeSideIndex = 1;
    }

    const characteristics = master.sides[activeSideIndex];
    return characteristics;
};

/**
 * Calculates the current power of a creature, applying continuous effects and Hyper Mode.
 * Rule 206. Power
 * Rule 608. Continuous Effects (Power Modifiers)
 * Rule 816. Hyper Mode
 */
export const getPower = (card: CardState, state: GameState): number => {
    const char = getCurrentCharacteristics(card, state);
    if (!char) return 0;

    let power = 0;

    // 1. Base Power
    // Rule 816: If Hyper Mode is active, use hyperPower if available.
    if (card.isHyperMode && char.hyperPower !== undefined) {
        power = char.hyperPower;
    } else if (char.power !== undefined) {
        power = char.power;
    }

    // 2. Apply Continuous Effects
    // Filter effects that apply to this card and are POWER_MODIFIER
    state.continuousEffects.forEach(effect => {
        if (effect.effectType === 'POWER_MODIFIER') {
            if (effect.targetCriteria(card)) {
                // Apply value. strict typing needed in real app.
                if (typeof effect.value === 'number') {
                    power += effect.value;
                }
            }
        }
    });

    // Floor at 0? 
    // Rule 703.4c says "Power 0 or less". So negative is possible and matters.
    return power;
};

/**
 * Retrieves the current text of the card, accounting for Hyper Mode.
 */
export const getText = (card: CardState, state: GameState): string => {
    const char = getCurrentCharacteristics(card, state);
    if (!char) return "";

    if (card.isHyperMode && char.hyperText) {
        return char.hyperText;
    }
    return char.text || "";
};
