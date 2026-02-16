import { v4 as uuidv4 } from 'uuid'; // Standard UUID if available, or custom
import {
    GameState,
    PlayerId,
    ZoneId,
    CardState,
    PlayerState
} from '../types/gameState';
import { Deck } from '../utils/deckStorage';
import { UnifiedCard } from '../utils/cardProcessor';
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
    return {
        id: generateId(),
        masterId: masterCard.id, // ID from UnifiedCard
        ownerId,
        controllerId: ownerId,
        zone,
        tapped,
        faceDown,
        summoningSickness: true, // Creatures have summoning sickness by default
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

        if (card.cardType === 'ZeroryuPart' || card.cardType === 'DolmadgeddonPart') {
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
        cs.summoningSickness = false; // Usually game start cards ignore this or handle differently
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

    return {
        players,
        cards,
        turnPlayerId: userPlayerId,
        step: 'start'
    };
};
