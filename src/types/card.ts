// 106. Civilizations
export enum Civilization {
    LIGHT = 'LIGHT',       // 光 (Yellow)
    WATER = 'WATER',       // 水 (Blue)
    DARKNESS = 'DARKNESS', // 闇 (Black/Purple)
    FIRE = 'FIRE',         // 火 (Red)
    NATURE = 'NATURE',     // 自然 (Green)
    ZERO = 'ZERO'          // 無色 (White)
}

// 105. Orientation / Tap State
export enum TapState {
    UNTAPPED = 'UNTAPPED', // 縦
    TAPPED = 'TAPPED',     // 横 (使用済み/攻撃中)
    INVERTED = 'INVERTED'  // 逆さま (マナゾーン)
}

// 109.2b & 113.2 Card Structure (Zone Entity)
// カードは単体とは限らず、進化元やシールドプラスで「束」になる
export interface CardStack {
    topCardId: string;     // 一番上のカード (ID)
    underCardIds: string[]; // 下にあるカード (進化元/封印/シールドプラス)

    // 116. Seal (封印)
    // 封印はカードの上に「裏向き」で置かれる特殊なカード
    sealedCardIds: string[];
}
