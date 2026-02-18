import type { GameState } from '../types/gameState';

import { startTurn, drawStep, endTurn } from './turnManager';
import { Phase, AttackStep } from '../types/gamePhase';
import { checkStateBasedActions } from './stateBasedActions';
import { tapCard, chargeMana, summonCreature, castSpell, discardCard, breakShield, fortifyCastle } from './actions';
import { moveCard } from './zoneMovement';
import { ZoneId } from '../types/gameState';
import { tapManaForCost } from './manaSystem';
import { initiateAttack, resolveBattle } from './battleSystem';

export type GameAction =
    | { type: 'INITIALIZE_GAME'; payload: GameState }
    | { type: 'NEXT_PHASE' }
    | { type: 'DRAW_CARD'; payload: { playerId: string } }
    | { type: 'MANA_CHARGE'; payload: { cardId: string; playerId: string } }
    | { type: 'PLAY_CARD'; payload: { cardId: string; playerId: string } } // Summon or Cast
    | { type: 'TAP_CARD'; payload: { cardId: string } } // Attack/Tap capability
    | { type: 'UNTAP_ALL'; payload: { playerId: string } } // Debug/Manual Untap
    | { type: 'DISCARD_CARD'; payload: { cardId: string } }
    | { type: 'BREAK_SHIELD'; payload: { cardId: string } }
    | { type: 'ATTACK'; payload: { attackerId: string; targetId: string } }
    | { type: 'UNDO' }
    | { type: 'SEND_MESSAGE'; payload: { senderId: string; text: string } }
    | { type: 'MANUAL_MOVE_CARD'; payload: { cardId: string; toZone: ZoneId; options?: { tapped?: boolean; faceDown?: boolean; executionMessage?: string } } }
    | { type: 'LOSE_GAME'; payload: { playerId: string } };

export const gameReducer = (state: GameState | null, action: GameAction): GameState | null => {
    if (action.type === 'INITIALIZE_GAME') {
        const initializedState = checkStateBasedActions(action.payload);
        return {
            ...initializedState,
            chatMessages: action.payload.chatMessages || []
        };
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
        case 'SEND_MESSAGE': {
            const newMsg = {
                id: crypto.randomUUID(),
                senderId: action.payload.senderId,
                senderName: action.payload.senderId === 'player1' ? 'Player 1' : 'Opponent',
                text: action.payload.text,
                timestamp: Date.now()
            };
            // Explicit return to ensure immutability and array creation
            return {
                ...state,
                chatMessages: [...(state.chatMessages || []), newMsg]
            };
        }

        case 'MANUAL_MOVE_CARD': {
            // Robust Manual Move
            const { cardId, toZone, options } = action.payload;
            const card = state.cards[cardId];

            if (!card) {
                console.error(`[Manual] Card not found: ${cardId}`);
                return state;
            }

            // Valid Zone Check
            if (!Object.values(ZoneId).includes(toZone)) {
                console.error(`[Manual] Invalid Zone: ${toZone}`);
                return state;
            }

            // 1. Log
            const cardName = state.cardsMap[card.masterId]?.name || 'Unknown Card';
            const logMsg = options?.executionMessage
                ? `[Manual] ${options.executionMessage} ${cardName}`
                : `[Manual] Moved ${cardName} to ${toZone}`;

            let logs = [...(state.logs || []), logMsg];

            // 2. Move (Create new cards map)
            // Use moveCard logic but inline/ensure it's explicit for manual override
            // We want to FORCE move, ignoring restrictions like "Can't move from Abyss" if valid in sandbox?
            // But let's stick to moveCard for consistency, or standard manual override.
            // "Manual" implies god-mode, so let's bypass moveCard checks if needed, but moveCard is mostly safe.
            // Let's use moveCard but ensure we get a new state object.

            let movedState = moveCard(state, cardId, toZone);

            // 3. Apply Options (Tap, FaceDown) reliably on the NEW card instance
            // We must access movedState.cards to get the new instance
            const movedCard = movedState.cards[cardId];
            if (movedCard) {
                // Apply manual overrides
                const updatedCard = {
                    ...movedCard,
                    tapped: options?.tapped !== undefined ? options.tapped : movedCard.tapped,
                    faceDown: options?.faceDown !== undefined ? options.faceDown : movedCard.faceDown
                };
                movedState = {
                    ...movedState,
                    cards: {
                        ...movedState.cards,
                        [cardId]: updatedCard
                    }
                };
            }

            // Return final state with logs
            return {
                ...movedState,
                logs
            };
        }

        case 'LOSE_GAME': {
            // Surrender / Defeat
            const loserId = action.payload.playerId;
            const winnerId = Object.keys(state.players).find(id => id !== loserId) || 'DRAW';
            return {
                ...state,
                winner: winnerId,
                logs: [...(state.logs || []), `Player ${loserId} surrendered. Winner: ${winnerId}`]
            };
        }

        case 'NEXT_PHASE': {
            // ... existing next phase logic ... 
            // (Keeping existing logic but ensuring it returns a new object strictly)
            const tempState: GameState = {
                ...state,
                turnState: { ...state.turnState },
                cards: { ...state.cards }
            };
            // ... (rest of next phase logic is complex, assuming previous implementation was mostly correct but let's wrap it safe)
            // For brevity in this tool call, I will copy the previous NEXT_PHASE logic but formatted.
            // Actually, I should use the existing logic to avoid breaking it, just ensuring the Switch block structure.
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
                newState = { ...state, logs: [...(state.logs || []), "Deck empty!"] };
            } else {
                const moved = moveCard(state, topCard.id, ZoneId.HAND);
                newState = checkStateBasedActions(moved);
            }
            break;
        }

        // ... Keep other actions if needed, or rely on manual move.
        // Keeping MANA_CHARGE, PLAY_CARD, etc. for compatibility if UI calls them.
        case 'MANA_CHARGE': {
            newState = chargeMana(state, action.payload.cardId);
            break;
        }
        case 'PLAY_CARD': {
            // ... existing PLAY_CARD logic ...
            // For safety, let's keep the previous implementation or just map it to Manual Move?
            // The user asked for "Robust Manual Move Logic", forcing manual actions.
            // If PLAY_CARD is still used, it uses strict rules. 
            // Let's assume the UI primarily uses MANUAL_MOVE_CARD now.
            // I'll keep the previous block implementation to avoid regression if clicked.
            const card = state.cards[action.payload.cardId];
            if (!card) {
                newState = state;
            } else {
                const master = state.cardsMap[card.masterId];
                const cost = master?.searchIndex?.costs?.[0] || 0;
                const civs = master?.searchIndex?.civilizations || [];
                const manaResult = tapManaForCost(state, action.payload.playerId, cost, civs);
                if (manaResult.success) {
                    newState = manaResult.newState;
                    newState.logs = [...(newState.logs || []), `Played ${master.name}`];
                    if (master.searchIndex?.isSpell) {
                        newState = castSpell(newState, action.payload.cardId);
                    } else if (master.searchIndex?.isCastle) {
                        newState = fortifyCastle(newState, action.payload.cardId);
                    } else {
                        newState = summonCreature(newState, action.payload.cardId);
                        if (newState.cards[action.payload.cardId]) {
                            newState.cards[action.payload.cardId].hasSummoningSickness = true;
                        }
                    }
                } else {
                    console.warn("Not enough mana!");
                    newState = state;
                }
            }
            break;
        }

        case 'ATTACK': {
            newState = initiateAttack(state, action.payload.attackerId, action.payload.targetId);
            newState = resolveBattle(newState);
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

        case 'BREAK_SHIELD': {
            newState = breakShield(state, action.payload.cardId);
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

    if (newState && newState !== state) {
        return {
            ...newState,
            history: newHistory
        };
    }

    return state;
};

