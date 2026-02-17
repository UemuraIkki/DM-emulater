// 500.1 Main Steps
export enum Phase {
    START_OF_TURN = 'START_OF_TURN',   // 501
    DRAW = 'DRAW',                     // 502
    MANA_CHARGE = 'MANA_CHARGE',       // 503
    MAIN = 'MAIN',                     // 504
    ATTACK = 'ATTACK',                 // 505
    END_OF_TURN = 'END_OF_TURN'        // 511
}

// 505.1 Attack Sub-steps
export enum AttackStep {
    NONE = 'NONE',
    DECLARE_ATTACK = 'DECLARE_ATTACK', // 506
    DECLARE_BLOCK = 'DECLARE_BLOCK',   // 507
    BATTLE = 'BATTLE',                 // 508
    DIRECT_ATTACK = 'DIRECT_ATTACK',   // 509 (Break Shields / Win)
    END_OF_ATTACK = 'END_OF_ATTACK'    // 510
}
