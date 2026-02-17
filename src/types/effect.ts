import type { CardState } from './gameState';

// 603. Triggered Ability & 602. Activated Ability
// 603. Triggered Ability & 602. Activated Ability
export const AbilityType = {
    STATIC: 'STATIC',       // 604. Constant effect (e.g., "Blocker", "Power Attacker")
    TRIGGERED: 'TRIGGERED', // 603. "When...", "At the start of..."
    ACTIVATED: 'ACTIVATED', // 602. "Tap this creature to..."
    SPELL_EFFECT: 'SPELL_EFFECT' // 601. Spell resolution
} as const;

export type AbilityType = typeof AbilityType[keyof typeof AbilityType];

// 608. Continuous Effect
export interface ContinuousEffect {
    id: string;
    sourceCardId: string;
    effectType: 'POWER_MODIFIER' | 'GRANT_ABILITY' | 'COST_MODIFIER' | 'ZONE_RESTRICTION' | 'OTHER';
    value: any; // +4000, "BLOCKER", etc.
    duration: 'UNTIL_END_OF_TURN' | 'INFINITE' | 'WHILE_IN_ZONE';
    targetCriteria: (card: CardState) => boolean; // Filter function logic
}

// 609. Replacement Effect
// Represents an effect that replaces an event with another event (e.g., "Instead of being destroyed...")
export interface GameEvent {
    type: string; // 'MOVE_CARD', 'DESTROY', 'DRAW', etc.
    payload: any;
    sourceId?: string;
}

export interface ReplacementEffect {
    id: string;
    sourceCardId: string;
    condition: (event: GameEvent) => boolean;
    replace: (event: GameEvent) => GameEvent; // Returns the modified event
}
