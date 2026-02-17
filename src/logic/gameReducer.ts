import type { GameState } from '../types/gameState';

import { startTurn, drawStep, endTurn } from './turnManager';
import { Phase, AttackStep } from '../types/gamePhase';
import { checkStateBasedActions } from './stateBasedActions';
import { tapCard, chargeMana, summonCreature, castSpell, discardCard } from './actions';
import { moveCard } from './zoneMovement';
import { ZoneId } from '../types/gameState';

export type GameAction =
    | { type: 'INITIALIZE_GAME'; payload: GameState }
    | { type: 'NEXT_PHASE' }
    | { type: 'DRAW_CARD'; payload: { playerId: string } }
    | { type: 'MANA_CHARGE'; payload: { cardId: string; playerId: string } }
    | { type: 'PLAY_CARD'; payload: { cardId: string; playerId: string } } // Summon or Cast
    | { type: 'TAP_CARD'; payload: { cardId: string } } // Attack/Tap capability
    | { type: 'UNTAP_ALL'; payload: { playerId: string } } // Debug/Manual Untap
    | { type: 'DISCARD_CARD'; payload: { cardId: string } }
    | { type: 'UNDO' };

export const gameReducer = (state: GameState | null, action: GameAction): GameState | null => {
    if (action.type === 'INITIALIZE_GAME') {
        return checkStateBasedActions(action.payload);
    }

    if (!state) return null;

    // Handle UNDO
    if (action.type === 'UNDO') {
        if (!state.history || state.history.length === 0) return state;
        const previous = state.history[state.history.length - 1];
        // Restore previous state, but keep history minus the last one
        return {
            ...previous,
            history: state.history.slice(0, -1)
        };
    }

    // For other actions, capture current state for history
    // We omit 'history' from the saved state to avoid infinite recursion/bloat
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { history, ...stateWithoutHistory } = state;
    const newHistory = [...(history || []), stateWithoutHistory];

    // Compute new state
    let newState: GameState | null = state;

    switch (action.type) {
        case 'NEXT_PHASE': {
            const tempState: GameState = {
                ...state,
                turnState: { ...state.turnState },
                cards: { ...state.cards }
            };
            const currentPhase = tempState.turnState.phase;
            let phaseResultState = tempState;

            switch (currentPhase) {
                case Phase.START_OF_TURN:
                    phaseResultState.turnState.phase = Phase.DRAW;
                    phaseResultState = drawStep(phaseResultState);
                    break;
                case Phase.DRAW:
                    phaseResultState.turnState.phase = Phase.MANA_CHARGE;
                    break;
                case Phase.MANA_CHARGE:
                    phaseResultState.turnState.phase = Phase.MAIN;
                    break;
                case Phase.MAIN:
                    phaseResultState.turnState.phase = Phase.ATTACK;
                    break;
                case Phase.ATTACK:
                    phaseResultState.turnState.phase = Phase.END_OF_TURN;
                    phaseResultState = endTurn(phaseResultState);
                    break;
                case Phase.END_OF_TURN:
                    const playerIds = Object.keys(phaseResultState.players);
                    const currentIndex = playerIds.indexOf(phaseResultState.turnState.activePlayerId);
                    const nextIndex = (currentIndex + 1) % playerIds.length;
                    phaseResultState.turnState.activePlayerId = playerIds[nextIndex];
                    phaseResultState.turnState.phase = Phase.START_OF_TURN;
                    phaseResultState.turnState.turnNumber += 1;
                    phaseResultState.turnState.isFirstTurn = false;
                    phaseResultState.turnState.attackStep = AttackStep.NONE;
                    phaseResultState = startTurn(phaseResultState);
                    break;
            }
            newState = checkStateBasedActions(phaseResultState);
            break;
        }

        case 'DRAW_CARD': {
            const deck = Object.values(state.cards)
                .filter(c => c.ownerId === action.payload.playerId && c.zone === ZoneId.DECK)
                .sort((a, b) => (a.stackOrder || 0) - (b.stackOrder || 0));
            const topCard = deck[deck.length - 1];
            if (!topCard) {
                newState = state;
            } else {
                const moved = moveCard(state, topCard.id, ZoneId.HAND);
                newState = checkStateBasedActions(moved);
            }
            break;
        }

        case 'MANA_CHARGE': {
            newState = chargeMana(state, action.payload.cardId);
            break;
        }

        case 'PLAY_CARD': {
            const card = state.cards[action.payload.cardId];
            if (!card) {
                newState = state;
            } else {
                const master = state.cardsMap[card.masterId];
                const isSpell = master?.searchIndex?.isSpell;
                if (isSpell) {
                    newState = castSpell(state, action.payload.cardId);
                } else {
                    newState = summonCreature(state, action.payload.cardId);
                }
            }
            break;
        }

        case 'TAP_CARD': {
            newState = tapCard(state, action.payload.cardId);
            break;
        }

        case 'DISCARD_CARD': {
            newState = discardCard(state, action.payload.cardId);
            break;
        }

        case 'UNTAP_ALL': {
            const manualState: GameState = {
                ...state,
                cards: { ...state.cards }
            };
            Object.values(manualState.cards).forEach(c => {
                if (c.controllerId === action.payload.playerId) {
                    c.tapped = false;
                }
            });
            newState = manualState;
            break;
        }

        default:
            return state;
    }

    // Attach history to new state
    if (newState && newState !== state) {
        return {
            ...newState,
            history: newHistory
        };
    }

    return state;
};
