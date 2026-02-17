export const GAME_RULES = {
    // 100.2 Deck Construction
    DECK_SIZE: 40,
    MAX_SAME_CARD_COUNT: 4,

    // 100.3 Hyper Spatial
    MAX_HYPER_SPATIAL_SIZE: 8,

    // 100.4 GR Zone
    GR_ZONE_SIZE: 12,
    MAX_GR_SAME_CARD_COUNT: 2,

    // 100.5 Game Start Cards (Forbidden/Zeroryu)
    MAX_GAME_START_SET: 1,

    // 103.3 Initial Setup
    INITIAL_SHIELD_COUNT: 5,
    INITIAL_HAND_COUNT: 5,
} as const;
