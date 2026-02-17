
import { ZoneId } from '../types/gameState';
import type { GameState, PlayerId, CardState, PlayerState } from '../types/gameState';
import type { Deck } from '../utils/deckStorage';
import type { UnifiedCard } from '../types/card-master';
import { SpecialType, CardType } from '../types/card-master';
import { Phase, AttackStep } from '../types/gamePhase';
import { getZone } from '../hooks/useDeckValidation'; // Helper to determine zone

// Simple UUID generator if uuid package not available (likely valid for this env)
const generateId = (): string => {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
};

const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const createCardState = (
    masterCard: UnifiedCard,
    ownerId: PlayerId,
    zone: ZoneId,
    tapped: boolean = false,
    faceDown: boolean = false
): CardState => {
    // Logic for Default Orientation (Rule 306.3, 310.3, etc.)
    let isDefaultHorizontal = false;
    if (masterCard.sides && masterCard.sides.length > 0) {
        const type = masterCard.sides[0].type;
        if (type === CardType.FIELD || type === CardType.AURA || type === CardType.FORTRESS) {
            isDefaultHorizontal = true;
        }
    }

    return {
        id: generateId(),
        masterId: masterCard.id, // ID from UnifiedCard
        ownerId,
        controllerId: ownerId,
        zone,
        tapped,
        faceDown,
        // 301.5 Summoning Sickness
        hasSummoningSickness: true,

        // 303 / 305 / 310 Attachment Logic
        attachedToId: undefined,

        // 306.3 / 308.3 / 310.3 Orientation
        isDefaultHorizontal,

        // 816. Hyper Mode
        isHyperMode: false,

        // 805. Psychic / 807. Dragheart / 809. Forbidden
        isFlipped: false,

        // 804. God Link / 812. Zeroryu
        linkedCardIds: []
    };
};


export const initializeGame = (
    userDeck: Deck,
    userPlayerId: PlayerId = 'player1',
    opponentPlayerId: PlayerId = 'player2'
): GameState => {
    const cards: Record<string, CardState> = {};

    // -- 1. Process User Deck --
    const userCards: CardState[] = [];

    // Separate cards by intended zone logic
    const mainDeckCards: UnifiedCard[] = [];
    const hyperSpatialCards: UnifiedCard[] = [];
    const grCards: UnifiedCard[] = [];
    const gameStartBattleCards: UnifiedCard[] = [];
    const externalCards: UnifiedCard[] = [];

    userDeck.cards.forEach(card => {
        // Check for Game Start cards first
        if (card.startsInBattleZone) {
            gameStartBattleCards.push(card);
            return;
        }

        // Zone based on type
        const zoneType = getZone(card);

        // External? (Zeroryu, Dolmadgeddon) 
        // getZone might return 'external' or 'main' depending on implementation.
        // Let's rely on cardType checks from previous task if getZone is insufficient, 
        // but current getZone logic handles 'external'.

        if (card.cardType === SpecialType.ZERORYU_PART || card.cardType === SpecialType.DOLMADGEDDON_PART) {
            externalCards.push(card);
        } else if (zoneType === 'hyperSpatial') {
            hyperSpatialCards.push(card);
        } else if (zoneType === 'gr') {
            grCards.push(card);
        } else {
            // Main Deck
            mainDeckCards.push(card);
        }
    });

    // Shuffle Main Deck
    const shuffledMain = shuffle(mainDeckCards);

    // Distribute Main Deck
    // 5 to Shield
    const shields = shuffledMain.slice(0, 5);
    const hand = shuffledMain.slice(5, 10);
    const deckInfo = shuffledMain.slice(10);

    // Create CardStates

    // Shields (Face Down)
    shields.forEach((c) => {
        const cs = createCardState(c, userPlayerId, ZoneId.SHIELD, false, true);
        userCards.push(cs);
    });

    // Hand (Face Up to owner, but logically standard state)
    hand.forEach((c) => {
        const cs = createCardState(c, userPlayerId, ZoneId.HAND, false, false);
        userCards.push(cs);
    });

    // Deck (Face Down)
    deckInfo.forEach((c) => {
        const cs = createCardState(c, userPlayerId, ZoneId.DECK, false, true);
        userCards.push(cs);
    });

    // Hyper Spatial
    hyperSpatialCards.forEach(c => {
        const cs = createCardState(c, userPlayerId, ZoneId.HYPER_SPATIAL, false, false);
        userCards.push(cs);
    });

    // GR
    // GR is usually face down in a separate deck
    grCards.forEach(c => {
        const cs = createCardState(c, userPlayerId, ZoneId.GR, false, true);
        userCards.push(cs);
    });

    // Battle Zone (Game Start)
    gameStartBattleCards.forEach(c => {
        const cs = createCardState(c, userPlayerId, ZoneId.BATTLE_ZONE, false, false);
        // Dokindam is usually tapped or has special state, but simple for now
        cs.hasSummoningSickness = false; // Usually game start cards ignore this or handle differently
        userCards.push(cs);
    });

    // External
    externalCards.forEach(c => {
        const cs = createCardState(c, userPlayerId, ZoneId.EXTERNAL, false, false);
        userCards.push(cs);
    });

    // Add all to cards map
    userCards.forEach(c => {
        cards[c.id] = c;
    });

    // -- 2. Setup Players --
    const players: Record<PlayerId, PlayerState> = {
        [userPlayerId]: {
            id: userPlayerId,
            name: 'Player',
            shieldCount: 5,
            manaCount: 0
        },
        [opponentPlayerId]: {
            id: opponentPlayerId,
            name: 'Opponent',
            shieldCount: 5,
            manaCount: 0
        }
    };

    // -- 3. Setup Turn State --
    const turnState = {
        activePlayerId: userPlayerId,
        phase: Phase.START_OF_TURN,
        attackStep: AttackStep.NONE,
        turnNumber: 1,
        isFirstTurn: true,
        currentAttack: undefined
    };

    // Create Master Map
    const cardsMap: Record<string, UnifiedCard> = {};
    userDeck.cards.forEach(c => {
        cardsMap[c.id] = c;
    });

    return {
        players,
        cards,
        cardsMap,
        turnState,
        pendingEffects: [],
        continuousEffects: []
    };
};
