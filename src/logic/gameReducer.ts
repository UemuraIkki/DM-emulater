import type { GameState, CardState } from '../types/gameState';

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
    | { type: 'TOGGLE_TAP'; payload: { cardId: string } }
    | { type: 'MODIFY_POWER'; payload: { cardId: string; amount: number } }
    | { type: 'RESET_CARD'; payload: { cardId: string } }
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
            const originalCard = state.cards[cardId];

            if (!originalCard) {
                console.error(`[Manual] Card not found: ${cardId}`);
                return state;
            }

            // Valid Zone Check
            if (!Object.values(ZoneId).includes(toZone)) {
                console.error(`[Manual] Invalid Zone: ${toZone}`);
                return state;
            }

            // 1. Log
            const cardName = state.cardsMap[originalCard.masterId]?.name || 'Unknown Card';
            const logMsg = options?.executionMessage
                ? `[Manual] ${options.executionMessage} ${cardName}`
                : `[Manual] Moved ${cardName} to ${toZone}`;

            const newLogs = [...(state.logs || []), logMsg];

            // 2. FORCE MOVE (Bypass all logic checks)
            // We do NOT use moveCard helper here because it might contain valid-move logic.
            // We manually update the card's zone in the state.

            const newCardState: CardState = {
                ...originalCard,
                zone: toZone, // Force Zone Change
                // Apply options if provided
                tapped: options?.tapped !== undefined ? options.tapped : originalCard.tapped,
                faceDown: options?.faceDown !== undefined ? options.faceDown : originalCard.faceDown,

                // Reset pending states as this is a "Teleport"
                attachedTo: undefined,
                attachedToId: undefined,

                // If moving to Battle Zone, usually summoning sickness applies unless defined otherwise
                // But in Manual Mode, user might expect ready-to-use. 
                // Let's set SS to TRUE by default for BZ, but user can untap/remove SS via future buttons if needed.
                // actually, for "Game Debug", let's make it FALSE so they can attack immediately? 
                // User said "Strict Manual", usually implies "Do exactly what I say".
                // If I just move it, it should probably keep SS state or reset?
                // Standard convention: New object in BZ = SS.
                hasSummoningSickness: toZone === ZoneId.BATTLE_ZONE && originalCard.zone !== ZoneId.BATTLE_ZONE
                    ? true
                    : originalCard.hasSummoningSickness
            };

            // Remove from old zone arrays? 
            // The state relies on `cards` map + `getCardsInZone` (filter). 
            // There are no separate array structures for zones in `turnState` or `players` except implicitly.
            // Wait, looking at GameState, do we have zone arrays?
            // "cards: Record<string, CardState>"
            // So updating the card object IS moving it.

            // 3. Create New State directly
            return {
                ...state,
                cards: {
                    ...state.cards,
                    [cardId]: newCardState
                },
                logs: newLogs
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
            // Debug Logs for Board Wipe Investigation
            const getBZ = (s: GameState) => Object.values(s.cards).filter(c => c.zone === ZoneId.BATTLE_ZONE);
            console.log("BEFORE NEXT_PHASE - BattleZone Count:", getBZ(state).length);
            // console.log("BEFORE NEXT_PHASE - BattleZone IDs:", getBZ(state).map(c => c.id));

            // ... existing next phase logic ... 
            // (Keeping existing logic but ensuring it returns a new object strictly)
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

                    // Create new turn state explicitly
                    phaseResultState = {
                        ...phaseResultState,
                        turnState: {
                            ...phaseResultState.turnState,
                            activePlayerId: playerIds[nextIndex],
                            phase: Phase.START_OF_TURN,
                            turnNumber: phaseResultState.turnState.turnNumber + 1,
                            isFirstTurn: false,
                            attackStep: AttackStep.NONE
                        }
                    };

                    // Execute Start Turn (Untap, etc.) - This is where cards were being wiped
                    phaseResultState = startTurn(phaseResultState);
                    break;
            }
            newState = checkStateBasedActions(phaseResultState);

            console.log("AFTER NEXT_PHASE - BattleZone Count:", getBZ(newState).length);
            // console.log("AFTER NEXT_PHASE - BattleZone IDs:", getBZ(newState).map(c => c.id));
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

        case 'TOGGLE_TAP': {
            const card = state.cards[action.payload.cardId];
            if (card) {
                newState = {
                    ...state,
                    cards: {
                        ...state.cards,
                        [card.id]: {
                            ...card,
                            tapped: !card.tapped
                        }
                    }
                };
            }
            break;
        }

        case 'MODIFY_POWER': {
            const card = state.cards[action.payload.cardId];
            if (card) {
                const currentMod = card.powerModifier || 0;
                newState = {
                    ...state,
                    cards: {
                        ...state.cards,
                        [card.id]: {
                            ...card,
                            powerModifier: currentMod + action.payload.amount
                        }
                    }
                };
            }
            break;
        }

        case 'RESET_CARD': {
            const card = state.cards[action.payload.cardId];
            if (card) {
                newState = {
                    ...state,
                    cards: {
                        ...state.cards,
                        [card.id]: {
                            ...card,
                            tapped: false,
                            powerModifier: 0,
                            hasSummoningSickness: false // Optional: Clear sickness too?
                        }
                    }
                };
            }
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

