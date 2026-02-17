import type { GameState } from '../types/gameState';

import { startTurn, drawStep, endTurn } from './turnManager';
import { Phase, AttackStep } from '../types/gamePhase';

export type GameAction =
    | { type: 'INITIALIZE_GAME'; payload: GameState }
    | { type: 'NEXT_PHASE' };

export const gameReducer = (state: GameState | null, action: GameAction): GameState | null => {
    switch (action.type) {
        case 'INITIALIZE_GAME':
            // Ensure first turn starts correctly (Untap step is 501.1, game starts at 501)
            // But usually game init sets up the board state ready for Main or Draw?
            // Rules say game starts, active player becomes turn player, phase is Start of Turn.
            // So we might need to run startTurn logic immediately or let UI trigger it?
            // For now, just load state. User might click "Start Turn" or it happens auto.
            // Let's assume initialized state is "Ready to Start".
            return action.payload;

        case 'NEXT_PHASE': {
            if (!state) return null;
            const newState = JSON.parse(JSON.stringify(state)) as GameState;
            const currentPhase = newState.turnState.phase;

            switch (currentPhase) {
                case Phase.START_OF_TURN:
                    // 501 -> 502
                    newState.turnState.phase = Phase.DRAW;
                    return drawStep(newState);

                case Phase.DRAW:
                    // 502 -> 503
                    newState.turnState.phase = Phase.MANA_CHARGE;
                    return newState;

                case Phase.MANA_CHARGE:
                    // 503 -> 504
                    newState.turnState.phase = Phase.MAIN;
                    return newState;

                case Phase.MAIN:
                    // 504 -> 505
                    newState.turnState.phase = Phase.ATTACK;
                    return newState;

                case Phase.ATTACK:
                    // 505 -> 511
                    newState.turnState.phase = Phase.END_OF_TURN;
                    return endTurn(newState);

                case Phase.END_OF_TURN:
                    // 511 -> 501 (Next Turn)
                    // Switch Player
                    const playerIds = Object.keys(newState.players);
                    const currentIndex = playerIds.indexOf(newState.turnState.activePlayerId);
                    const nextIndex = (currentIndex + 1) % playerIds.length;

                    newState.turnState.activePlayerId = playerIds[nextIndex];
                    newState.turnState.phase = Phase.START_OF_TURN;
                    newState.turnState.turnNumber += 1;
                    newState.turnState.isFirstTurn = false; // No longer first turn of game
                    newState.turnState.attackStep = AttackStep.NONE;

                    // 501. Start of Turn Actions (Untap etc.)
                    return startTurn(newState);

                default:
                    return state;
            }
        }

        default:
            return state;
    }
};
