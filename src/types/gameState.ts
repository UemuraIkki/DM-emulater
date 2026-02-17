export type CardId = string; // UUID
export type PlayerId = string;

/**
 * Rule 400.1 + System Zones
 */
export enum ZoneId {
    // Player Specific (Rule 410)
    DECK = 'DECK',
    HAND = 'HAND',
    GRAVEYARD = 'GRAVEYARD',
    MANA = 'MANA',
    SHIELD = 'SHIELD',
    HYPER_SPATIAL = 'HYPER_SPATIAL',
    GR = 'GR',

    // Shared (Rule 403)
    BATTLE_ZONE = 'BATTLE_ZONE',

    // System
    PENDING = 'PENDING', // Rule 409 - Resolution waiting state
    EXTERNAL = 'EXTERNAL', // Rule 100.5 - For Zeroryu etc.
    EXILE = 'EXILE', // Removed from game
    ABYSS = 'ABYSS' // Rule 410.4 - Deep Abyss
}

/**
 * Represents the dynamic state of a card instance in the game.
 * Rule 403.4, 405.4, 409
 */
export interface CardState {
    id: CardId;
    masterId: string; // References UnifiedCard.id (e.g. "dm23rp2x-071")

    ownerId: PlayerId; // The player who owns the card (deck owner)
    controllerId: PlayerId; // The player currently controlling the card

    // Location
    zone: ZoneId;

    // Orientation & Visibility
    tapped: boolean;
    faceDown: boolean; // True for Shields, Mana (some), Deck

    // Stacking / Attachment (Rule 403.4)
    /**
     * If this card is part of a stack (e.g., evolution source, seal),
     * this points to the ID of the top-most card (the "Creature" entity).
     * If undefined, this card is the top card or a standalone card.
     */
    attachedTo?: CardId;

    /**
     * Order in the stack. 0 is the bottom-most card.
     * The top card will have the highest index.
     */
    stackOrder?: number;

    // Battle Zone Specific
    // 301.5 Summoning Sickness
    hasSummoningSickness: boolean;

    // 303 / 305 / 310 Attachment Logic
    attachedToId?: CardId;

    // 306.3 / 308.3 / 310.3 Orientation
    isDefaultHorizontal: boolean;
}

/**
 * Represents the state of a single player.
 */
export interface PlayerState {
    id: PlayerId;
    name: string;
    shieldCount: number; // Derived or direct count
    manaCount: number; // Derived or direct count
    // Other player-specific counters (e.g., extra turns, flags) can go here
}

import { Phase, AttackStep } from './gamePhase';

/**
 * Represents the state of the current turn (Rules 500-512)
 */
export interface TurnState {
    activePlayerId: PlayerId; // ターンプレイヤー (102.1)
    phase: Phase;
    attackStep: AttackStep;
    turnNumber: number;

    // 先攻1ターン目のドロースキップ判定用 (500.6)
    isFirstTurn: boolean;

    // 505. Attack Context (攻撃中の詳細情報)
    currentAttack?: {
        attackerId: CardId;
        targetId: string;      // PlayerId or CardId (Creature)
        blockerId?: CardId;    // 507.2a
        breakingShieldIds: CardId[]; // 509.3
        pendingTriggers: CardId[]; // S-Trigger / G-Strike waiting list
    };
}

/**
 * Representative of the entire Game State
 */
export interface GameState {
    players: Record<PlayerId, PlayerState>;
    cards: Record<CardId, CardState>; // Normalized state: All cards in one map
    turnState: TurnState; // Turn Progression
    // Removed simple 'step' and 'turnPlayerId' as they are now in turnState
}
