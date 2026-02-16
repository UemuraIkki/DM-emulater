// --- 1. Static Data vs Dynamic Instance ---

/**
 * Game-specific card instance.
 * Distinct from CardData (static master data).
 */
export interface CardInstance {
    /** Unique ID for this specific card instance in the game */
    id: string;
    /** Reference to the static CardData ID */
    cardDataId: string;
    /** ID of the player who owns this card */
    ownerId: string;
    /** ID of the player who currently controls this card */
    controllerId: string;
    /** Current zone the card is in */
    zone: Zone;
    /** Tapped state (true = tapped) */
    tapped: boolean;
    /** Face down state (true = face down, like shields or mana) */
    faceDown: boolean;
    /** Whether the card is currently being used as a Shield Trigger */
    isShieldTrigger: boolean;
    /** IDs of cards stacked under this card (e.g., evolution source, seal) */
    stackedCardIds: string[];
}

// --- 2. Zone Definition ---

/** 
 * Constants for Duel Masters Zones.
 */
export const Zone = {
    Deck: 'DECK',
    Hand: 'HAND',
    BattleZone: 'BATTLE_ZONE',
    ManaZone: 'MANA_ZONE',
    ShieldZone: 'SHIELD_ZONE',
    Graveyard: 'GRAVEYARD',
    HyperSpatialZone: 'HYPER_SPATIAL_ZONE',
    GRZone: 'GR_ZONE',
    ExileZone: 'EXILE_ZONE',
} as const;

export type Zone = typeof Zone[keyof typeof Zone];

// --- 3. Player & Game State ---

/**
 * State of a single player including their zones.
 */
export interface PlayerState {
    id: string;
    name: string;
    /**
     * Zones holding card instances.
     */
    zones: {
        [key in Zone]: CardInstance[];
    };
    shields: CardInstance[]; // Convenience reference to zones[Zone.ShieldZone]
    mana: CardInstance[];    // Convenience reference to zones[Zone.ManaZone]
    hand: CardInstance[];    // Convenience reference to zones[Zone.Hand]
}

/**
 * Overall Game State
 */
export interface GameState {
    /** Map of playerId -> PlayerState */
    players: Record<string, PlayerState>;
    /** ID of the player whose turn it currently is */
    turnPlayerId: string;
    /** Current phase of the turn */
    phase: GamePhase;
    /** Chat or log history */
    chatHistory: {
        sender: string;
        message: string;
        timestamp: number;
    }[];
    /** Global game status */
    status: 'WAITING' | 'PLAYING' | 'FINISHED';
    winnerId?: string;
}

export const GamePhase = {
    Start: 'START',
    Draw: 'DRAW',
    Mana: 'MANA',
    Main: 'MAIN',
    Attack: 'ATTACK',
    End: 'END',
} as const;

export type GamePhase = typeof GamePhase[keyof typeof GamePhase];

// --- 4. Actions (Discriminated Union) ---

export type GameAction =
    | MoveCardAction
    | TapCardAction
    | DrawCardAction
    | ShuffleDeckAction
    | ManaChargeAction
    | ShieldBreakAction
    | DirectAttackAction
    | PassTurnAction;

export interface MoveCardAction {
    type: 'MOVE_CARD';
    cardId: string;
    fromZone: Zone;
    toZone: Zone;
    /** Target index in the destination zone (optional) */
    index?: number;
}

export interface TapCardAction {
    type: 'TAP_CARD';
    cardId: string;
}

export interface DrawCardAction {
    type: 'DRAW_CARD';
    playerId: string;
    count: number;
}

export interface ShuffleDeckAction {
    type: 'SHUFFLE_DECK';
    playerId: string;
}

export interface ManaChargeAction {
    type: 'MANA_CHARGE';
    playerId: string;
    cardId: string;
}

export interface ShieldBreakAction {
    type: 'SHIELD_BREAK';
    breakerCardId: string;
    targetShieldId: string;
}

export interface DirectAttackAction {
    type: 'DIRECT_ATTACK';
    attackerCardId: string;
    targetPlayerId: string;
}

export interface PassTurnAction {
    type: 'PASS_TURN';
    playerId: string;
}
