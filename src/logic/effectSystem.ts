import type { GameState, PendingEffect } from '../types/gameState';
import type { GameEvent } from '../types/effect';
// AbilityType is used? "type: AbilityType". It is not used in the code implementation I wrote? I wrote "type: string" for GameEvent.
// Check effectSystem.ts usage. I imported AbilityType but didn't use it.

// Registry of trigger handlers (static logic, not serialized state)
// Maps EventType -> Function[]
type TriggerHandler = (state: GameState, event: GameEvent) => PendingEffect | null;

const triggerRegistry: Record<string, TriggerHandler[]> = {};



/**
 * Rule 603. Triggered Abilities logic
 */
export const checkTriggers = (state: GameState, event: GameEvent): GameState => {
    const newState = JSON.parse(JSON.stringify(state)) as GameState;
    if (!newState.pendingEffects) newState.pendingEffects = [];

    const handlers = triggerRegistry[event.type] || [];
    const newEffects: PendingEffect[] = [];

    // 1. Scan for matching triggers
    // This is a simplified "virtual" scan. In reality, we'd iterate over all cards in zones
    // that match the trigger condition (e.g. "When a creature is destroyed...").
    // For this skeleton, we assume 'handlers' can determine if a specific card triggers.
    // Ideally, we iterate over all cards in relevant zones and check their abilities.

    // For this milestone, we demonstrate the logic structure:
    handlers.forEach(handler => {
        const effect = handler(newState, event);
        if (effect) {
            newEffects.push(effect);
        }
    });

    // 2. Add to Pending Stack based on Priority (Rule 101.4 / 603.3)
    // Turn Player's triggers go on stack first? Or execute first?
    // Rule: "Active Player's effects take precedence?"
    // Rule 603.3: If multiple abilities trigger, Turn Player chooses order for their effects, then Non-Turn Player.
    // They are added to the stack. Processing is LIFO? 
    // Actually, DM rules often say "Waiting to be resolved".
    // 603.3a: Turn player resolves their abilities first.

    // So we should separate by controller.
    const turnPlayerId = newState.turnState.activePlayerId;

    const turnPlayerEffects = newEffects.filter(e => e.controllerId === turnPlayerId);
    const nonTurnPlayerEffects = newEffects.filter(e => e.controllerId !== turnPlayerId);

    // If we are pushing to a LIFO stack where top executes first:
    // Pushing Non-Turn Player effects first, then Turn Player effects?
    // Wait, 603.3 says "Turn Player resolves first".
    // If stack is LIFO, Turn Player effects should be at the TOP.

    // Push Non-Turn Player effects (bottom)
    nonTurnPlayerEffects.forEach(e => newState.pendingEffects.push(e));

    // Push Turn Player effects (top)
    turnPlayerEffects.forEach(e => newState.pendingEffects.push(e));

    return newState;
};

/**
 * Register a static trigger logic (e.g. "When a creature enters...")
 */
export const registerTrigger = (eventType: string, handler: TriggerHandler) => {
    if (!triggerRegistry[eventType]) {
        triggerRegistry[eventType] = [];
    }
    triggerRegistry[eventType].push(handler);
};

/**
 * Execute the top effect on the stack
 */
export const resolveTopEffect = (state: GameState): GameState => {
    if (state.pendingEffects.length === 0) return state;

    const newState = JSON.parse(JSON.stringify(state)) as GameState;
    const effect = newState.pendingEffects.pop(); // LIFO

    if (effect && effect.resolve) {
        // execute logic
        // Note: resolve function serialization is tricky. 
        // Real implementation usually maps ID to logic.
        return effect.resolve(newState);
    }

    return newState;
};
