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
    EXILE = 'EXILE' // Removed from game
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
    summoningSickness: boolean;
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

/**
 * Representative of the entire Game State
 */
export interface GameState {
    players: Record<PlayerId, PlayerState>;
    cards: Record<CardId, CardState>; // Normalized state: All cards in one map
    turnPlayerId: PlayerId;
    step: 'untap' | 'start' | 'draw' | 'main' | 'attack' | 'end'; // Basic step tracking
}
