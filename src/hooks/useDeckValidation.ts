import { useMemo } from 'react';
import type { Zone } from '../types';
import type { UnifiedCard } from '../types/card-master';

interface DeckValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    mainDeckCount: number;
    hyperSpatialCount: number;
    grCount: number;
    externalCount: number;
}

import { SpecialType } from '../types/card-master';

export const getZone = (card: UnifiedCard): Zone | 'external' => {
    if (card.cardType === SpecialType.PSYCHIC || card.cardType === SpecialType.DRAGHEART) {
        return 'hyperSpatial';
    }
    if (card.cardType === SpecialType.GR) {
        return 'gr';
    }
    if (card.cardType === SpecialType.ZERORYU_PART || card.cardType === SpecialType.DOLMADGEDDON_PART) {
        return 'external'; // New zone in App logic
    }
    return 'main';
};

export const useDeckValidation = (
    mainDeck: UnifiedCard[],
    hyperSpatial: UnifiedCard[],
    gr: UnifiedCard[],
    external: UnifiedCard[] = []
): DeckValidationResult => {
    return useMemo(() => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // --- Helper to count names ---
        const checkNameLimits = (cards: UnifiedCard[], limit: number, zoneName: string) => {
            const counts: Record<string, number> = {};
            cards.forEach(c => {
                counts[c.name] = (counts[c.name] || 0) + 1;
            });

            Object.entries(counts).forEach(([name, count]) => {
                if (count > limit) {
                    errors.push(`"${name}" in ${zoneName} exceeds limit (${limit}). Current: ${count}.`);
                }
            });
        };

        // --- Main Deck Rules ---
        // 1. Count must be exactly 40
        if (mainDeck.length !== 40) {
            const diff = 40 - mainDeck.length;
            if (diff > 0) {
                errors.push(`Main Deck needs ${diff} more cards (Current: ${mainDeck.length}/40).`);
            } else {
                errors.push(`Main Deck has too many cards (Current: ${mainDeck.length}/40). Remove ${Math.abs(diff)} cards.`);
            }
        }
        // 2. Max 4 copies
        checkNameLimits(mainDeck, 4, 'Main Deck');

        // --- Game Start / Forbidden Rules (Rule 100.5) ---
        // 1. Check for Dokindam X in Main Deck
        const dokindamCount = mainDeck.filter(c => c.startsInBattleZone).length;
        if (dokindamCount > 1) {
            errors.push(`You can only have 1 "Forbidden" card that starts in Battle Zone (e.g. Dokindam X) in Main Deck.`);
        }

        // 2. Check External Cards (Zeroryu / Dolmadgeddon)
        const zeroryuParts = external.filter(c => c.cardType === SpecialType.ZERORYU_PART);
        const dolmadgeddonParts = external.filter(c => c.cardType === SpecialType.DOLMADGEDDON_PART);

        // Rule: Can only use ONE of: Dokindam OR Zeroryu OR Dolmadgeddon
        // If Dokindam is present...
        if (dokindamCount > 0) {
            if (zeroryuParts.length > 0) errors.push(`Cannot use Dokindam X and Zeroryu together.`);
            if (dolmadgeddonParts.length > 0) errors.push(`Cannot use Dokindam X and Dolmadgeddon X together.`);
        }
        // If Zeroryu is present...
        if (zeroryuParts.length > 0) {
            if (dolmadgeddonParts.length > 0) errors.push(`Cannot use Zeroryu and Dolmadgeddon X together.`);
        }

        // 3. Duplicate Check for External Zone (Rule: 1 copy per card)
        checkNameLimits(external, 1, 'External Zone');

        // 4. Set Completion Warning (Rule of thumb: 5 cards for a set)
        if (external.length > 0 && external.length !== 5) {
            warnings.push(`External Zone (Zeroryu/Dolmadgeddon) usually requires a complete set of 5 cards.`);
        }

        // --- Hyper Spatial Zone Rules ---
        // 1. Count: 0-8
        if (hyperSpatial.length > 8) {
            errors.push(`Hyper Spatial Zone exceeds limit (8). Current: ${hyperSpatial.length}.`);
        }
        // 2. Max 4 copies
        checkNameLimits(hyperSpatial, 4, 'Hyper Spatial Zone');

        // --- GR Zone Rules ---
        // 1. Count: 0 or exactly 12
        if (gr.length > 0 && gr.length !== 12) {
            errors.push(`GR Zone must have exactly 12 cards if used (Current: ${gr.length}).`);
        }
        // 2. Max 2 copies
        checkNameLimits(gr, 2, 'GR Zone');

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            mainDeckCount: mainDeck.length,
            hyperSpatialCount: hyperSpatial.length,
            grCount: gr.length,
            externalCount: external.length
        };
    }, [mainDeck, hyperSpatial, gr, external]);
};
