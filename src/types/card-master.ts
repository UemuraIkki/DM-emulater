import { Civilization } from './card';

// Rule 300.1 Card Types
export enum CardType {
    CREATURE = 'CREATURE',
    SPELL = 'SPELL',
    CROSS_GEAR = 'CROSS_GEAR',
    CASTLE = 'CASTLE',
    CELL = 'CELL', // G-Link Cell
    WEAPON = 'WEAPON', // Dragheart Weapon
    FORTRESS = 'FORTRESS', // Dragheart Fortress
    KODO = 'KODO', // Forbidden Kodo (Start card)
    FIELD = 'FIELD', // D2 Field etc
    CORE = 'CORE',
    AURA = 'AURA', // GR Aura
    GI = 'GI', // Zeroryu Gi
    SEIUN = 'SEIUN', // Zeroryu Seiun
    ARTIFACT = 'ARTIFACT',
    LAND = 'LAND',
    RULE_PLUS = 'RULE_PLUS',
    TAMASEED = 'TAMASEED',
    DUELIST = 'DUELIST' // Special
}

// Special Sub-types or Meta-types
export enum SpecialType {
    EVOLUTION = 'EVOLUTION',
    PSYCHIC = 'PSYCHIC',
    DRAGHEART = 'DRAGHEART',
    NEO = 'NEO',
    GR = 'GR',
    STAR_EVOLUTION = 'STAR_EVOLUTION',
    TWINPACT = 'TWINPACT',
    ZERORYU_PART = 'ZERORYU_PART',
    DOLMADGEDDON_PART = 'DOLMADGEDDON_PART',
    FORBIDDEN = 'FORBIDDEN'
}

export interface CardCharacteristics {
    name: string;        // 202.1
    cost: number;        // 201.1
    civilizations: Civilization[]; // 207.1
    type: CardType;   // 204.2 (Creature, Spell, etc.)
    specialTypes?: SpecialType[]; // 204.3 (Evolution, Psychic, etc.)
    stepTypes?: string[]; // Evolution / G-Link sources etc.
    races?: string[];    // 203.1
    power?: number;      // 206.1
    text?: string;        // 205.1
}

// Data from JSON (legacy support structure to be integrated)
export interface CardData {
    id: string;
    name: string;
    type: string;
    civilization: string;
    race: string;
    cost: string;
    power: string;
    text: string[];
    set: string;
    flavor: string;
    imageUrl?: string;
    url?: string;
}

export interface UnifiedCard {
    id: string; // Master ID
    name: string; // Search Helper

    // Rule 201.2b Twinpact or multiple sides
    sides: CardCharacteristics[];

    // Flags for logic convenience (derived from sides)
    cardType: SpecialType | 'Normal'; // High level "Deck Type" classification (e.g. is it a GR card? Psychic?)

    // Game Start Rules
    startsInBattleZone?: boolean;

    // Legacy/UI props (optional, for backward compat or ease of rendering)
    mainPart: CardData;
    subPart?: CardData;

    searchIndex: {
        civilizations: string[];
        costs: number[];
        races: string[];
        power: number[];
        text: string;
        // Type Flags for Advanced Filtering
        isSpell?: boolean;
        isEvolution?: boolean;
        isNEO?: boolean;
        isPsychic?: boolean;
        isDragheart?: boolean;
        isCreature?: boolean;
        isField?: boolean; // D2, Forbidden Field, etc.
        isCastle?: boolean;
        isCrossGear?: boolean;
        isTamaseed?: boolean;
        isCardType?: CardType[];
    };
}
