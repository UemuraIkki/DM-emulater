import type { GameState } from '../types/gameState';

import { startTurn, drawStep, endTurn } from './turnManager';
import { Phase, AttackStep } from '../types/gamePhase';
import { checkStateBasedActions } from './stateBasedActions';
import { tapCard, chargeMana, summonCreature, castSpell } from './actions';
import { moveCard } from './zoneMovement';
import { ZoneId } from '../types/gameState';

export type GameAction =
    | { type: 'INITIALIZE_GAME'; payload: GameState }
    | { type: 'NEXT_PHASE' }
    | { type: 'DRAW_CARD'; payload: { playerId: string } }
    | { type: 'MANA_CHARGE'; payload: { cardId: string; playerId: string } }
    | { type: 'PLAY_CARD'; payload: { cardId: string; playerId: string } } // Summon or Cast
    | { type: 'TAP_CARD'; payload: { cardId: string } } // Attack/Tap capability
    | { type: 'UNTAP_ALL'; payload: { playerId: string } }; // Debug/Manual Untap

export const gameReducer = (state: GameState | null, action: GameAction): GameState | null => {
    switch (action.type) {
        case 'INITIALIZE_GAME':
            // Ensure first turn starts correctly (Untap step is 501.1, game starts at 501)
            // But usually game init sets up the board state ready for Main or Draw?
            // Rules say game starts, active player becomes turn player, phase is Start of Turn.
            // So we might need to run startTurn logic immediately or let UI trigger it?
            // For now, just load state. User might click "Start Turn" or it happens auto.
            // Let's assume initialized state is "Ready to Start".
            return checkStateBasedActions(action.payload);

        case 'NEXT_PHASE': {
            if (!state) return null;
            const newState: GameState = {
                ...state,
                turnState: { ...state.turnState },
                cards: { ...state.cards }
            };
            const currentPhase = newState.turnState.phase;

            let phaseResultState = newState;

            switch (currentPhase) {
                case Phase.START_OF_TURN:
                    // 501 -> 502
                    phaseResultState.turnState.phase = Phase.DRAW;
                    phaseResultState = drawStep(phaseResultState);
                    break;

                case Phase.DRAW:
                    // 502 -> 503
                    phaseResultState.turnState.phase = Phase.MANA_CHARGE;
                    break;

                case Phase.MANA_CHARGE:
                    // 503 -> 504
                    phaseResultState.turnState.phase = Phase.MAIN;
                    break;

                case Phase.MAIN:
                    // 504 -> 505
                    phaseResultState.turnState.phase = Phase.ATTACK;
                    break;

                case Phase.ATTACK:
                    // 505 -> 511
                    phaseResultState.turnState.phase = Phase.END_OF_TURN;
                    phaseResultState = endTurn(phaseResultState);
                    break;

                case Phase.END_OF_TURN:
                    // 511 -> 501 (Next Turn)
                    // Switch Player
                    const playerIds = Object.keys(phaseResultState.players);
                    const currentIndex = playerIds.indexOf(phaseResultState.turnState.activePlayerId);
                    const nextIndex = (currentIndex + 1) % playerIds.length;

                    phaseResultState.turnState.activePlayerId = playerIds[nextIndex];
                    phaseResultState.turnState.phase = Phase.START_OF_TURN;
                    phaseResultState.turnState.turnNumber += 1;
                    phaseResultState.turnState.isFirstTurn = false; // No longer first turn of game
                    phaseResultState.turnState.attackStep = AttackStep.NONE;

                    // 501. Start of Turn Actions (Untap etc.)
                    phaseResultState = startTurn(phaseResultState);
                    break;
            }

            return checkStateBasedActions(phaseResultState);
        }



        case 'DRAW_CARD': {
            if (!state) return null;
            // Draw 1 card (Rule 502) - logic in drawStep draws for turn player, but here we force draw for specific player?
            // Reusing moveCard logic (Deck Top -> Hand)
            // We need to find top card of deck.
            const deck = Object.values(state.cards)
                .filter(c => c.ownerId === action.payload.playerId && c.zone === ZoneId.DECK)
                .sort((a, b) => (a.stackOrder || 0) - (b.stackOrder || 0)); // Ascending? Usually stackOrder 0 is bottom?

            // Assuming simplified stack: we just pick one. Ideally Top.
            // If random shuffle, any is fine.
            const topCard = deck[deck.length - 1];
            if (!topCard) return state; // Deck empty

            const newState = moveCard(state, topCard.id, ZoneId.HAND);
            return checkStateBasedActions(newState);
        }

        case 'MANA_CHARGE': {
            if (!state) return null;
            return chargeMana(state, action.payload.cardId);
        }

        case 'PLAY_CARD': {
            if (!state) return null;
            const card = state.cards[action.payload.cardId];
            if (!card) return state;

            const master = state.cardsMap[card.masterId];
            // Simple logic: Creature -> Summon, Spell -> Cast
            // Ideally should check CardType value more robustly
            const isSpell = master?.searchIndex?.isSpell;

            if (isSpell) {
                return castSpell(state, action.payload.cardId);
            } else {
                return summonCreature(state, action.payload.cardId);
            }
        }

        case 'TAP_CARD': {
            if (!state) return null;
            return tapCard(state, action.payload.cardId);
        }

        case 'UNTAP_ALL': {
            if (!state) return null;
            // Manual Untap
            const newState: GameState = {
                ...state,
                cards: { ...state.cards }
            };
            Object.values(newState.cards).forEach(c => {
                if (c.controllerId === action.payload.playerId) {
                    c.tapped = false;
                }
            });
            return newState;
        }

        default:
            return state;
    }
};
