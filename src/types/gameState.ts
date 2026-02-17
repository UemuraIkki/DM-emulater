export type CardId = string; // UUID
export type PlayerId = string;

/**
 * Rule 400.1 + System Zones
 */
export const ZoneId = {
    // Player Specific (Rule 410)
    DECK: 'DECK',
    HAND: 'HAND',
    GRAVEYARD: 'GRAVEYARD',
    MANA: 'MANA',
    SHIELD: 'SHIELD',
    HYPER_SPATIAL: 'HYPER_SPATIAL',
    GR: 'GR',

    // Shared (Rule 403)
    BATTLE_ZONE: 'BATTLE_ZONE',

    // System
    PENDING: 'PENDING', // Rule 409 - Resolution waiting state
    EXTERNAL: 'EXTERNAL', // Rule 100.5 - For Zeroryu etc.
    EXILE: 'EXILE', // Removed from game
    ABYSS: 'ABYSS' // Rule 410.4 - Deep Abyss
} as const;

export type ZoneId = typeof ZoneId[keyof typeof ZoneId];

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
    // 306.3 / 308.3 / 310.3 Orientation
    isDefaultHorizontal: boolean;

    // 816. Hyper Mode
    isHyperMode: boolean; // ハイパーモード解放中か

    // 805. Psychic / 807. Dragheart / 809. Forbidden
    isFlipped: boolean; // 裏面（覚醒/龍解/禁断解放）になっているか

    // 804. God Link / 812. Zeroryu
    linkedCardIds: string[]; // リンクしている相方のIDリスト
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
import type { AbilityType, ContinuousEffect } from './effect';

export interface PendingEffect {
    id: string;
    sourceCardId: string;
    abilityType: AbilityType;
    controllerId: PlayerId; // Player who controls the effect
    // Logic to execute when resolved
    // We can't easily serialize functions in state if we want to persist it,
    // but for runtime state it's fine. Ideally this points to a static resolver ID.
    // For now, let's keep it abstract or usage-defined.
    resolve?: (state: GameState) => GameState;
}

/**
 * Representative of the entire Game State
 */
import type { UnifiedCard } from './card-master';

/**
 * Representative of the entire Game State
 */
export interface GameState {
    players: Record<PlayerId, PlayerState>;
    cards: Record<CardId, CardState>; // Normalized state: All cards in one map
    turnState: TurnState; // Turn Progression

    // Master Data for Logic Resolution
    cardsMap: Record<string, UnifiedCard>;

    // Rule 605.1 Effect Management
    pendingEffects: PendingEffect[]; // Stack LIFO or Priority Queue based on Rule 101.4 (Turn Player priority)
    continuousEffects: ContinuousEffect[]; // Active continuous effects

    // Game Result
    winner?: PlayerId | 'DRAW';

    // Undo History
    history?: Omit<GameState, 'history'>[];
}
