import type { GameState } from '../types/gameState';

export type GameAction =
    | { type: 'INITIALIZE_GAME'; payload: GameState };

export const gameReducer = (state: GameState | null, action: GameAction): GameState | null => {
    switch (action.type) {
        case 'INITIALIZE_GAME':
            return action.payload;
        default:
            return state;
    }
};
