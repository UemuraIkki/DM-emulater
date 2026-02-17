import { ZoneId } from '../types/gameState';

export interface ZoneMetadata {
    isPublic: boolean;   // 400.2a (Is the zone public information?)
    isShared: boolean;   // 400.1 (Is the zone shared between players?)
    isOrdered: boolean;  // 400.4 (Is the order of cards in the zone fixed?)
}

// Map ZoneId to Metadata
export const ZONE_CONFIG: Record<ZoneId, ZoneMetadata> = {
    [ZoneId.BATTLE_ZONE]: { isPublic: true, isShared: true, isOrdered: false },
    [ZoneId.MANA]: { isPublic: true, isShared: false, isOrdered: false }, // Mana is unordered in modern rules? Or technically ordered but mostly irrelevant? Generally treated as unordered for tap purposes but tapped cards act differently.
    [ZoneId.GRAVEYARD]: { isPublic: true, isShared: false, isOrdered: true }, // Graveyard order matters
    [ZoneId.HYPER_SPATIAL]: { isPublic: true, isShared: false, isOrdered: false },
    [ZoneId.ABYSS]: { isPublic: true, isShared: false, isOrdered: false }, // Deep Abyss
    [ZoneId.DECK]: { isPublic: false, isShared: false, isOrdered: true },
    [ZoneId.HAND]: { isPublic: false, isShared: false, isOrdered: false }, // Hand is unordered
    [ZoneId.SHIELD]: { isPublic: false, isShared: false, isOrdered: true }, // Shield order matters (for Shield Trigger check order)
    [ZoneId.GR]: { isPublic: false, isShared: false, isOrdered: true }, // GR Deck is ordered
    [ZoneId.PENDING]: { isPublic: true, isShared: true, isOrdered: true }, // Pending zone usually public?
    [ZoneId.EXTERNAL]: { isPublic: true, isShared: true, isOrdered: false }, // External (Zeroryu)
    [ZoneId.EXILE]: { isPublic: true, isShared: true, isOrdered: false }
};
