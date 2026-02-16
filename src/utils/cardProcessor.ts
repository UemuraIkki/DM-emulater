import type { CardData } from '../types';

export interface UnifiedCard {
    id: string; // Base ID (e.g., "dm23rp2x-071")
    name: string;
    cardType: 'Normal' | 'Twinpact' | 'Psychic' | 'Dragheart' | 'GR' | 'Evolution' | 'ZeroryuPart' | 'DolmadgeddonPart';

    /** 
     * Special flag for cards that are part of the Main Deck count (40) 
     * but begin the game in the Battle Zone (e.g., Dokindam X "Forbidden Pulse").
     */
    startsInBattleZone?: boolean;

    mainPart: CardData;
    subPart?: CardData;

    // Search Index
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
    };
}

const parseCost = (costStr: string): number => {
    const num = parseInt(costStr, 10);
    return isNaN(num) ? 0 : num;
};

const parsePower = (powerStr: string): number => {
    if (!powerStr) return 0;
    const clean = powerStr.replace(/[^0-9]/g, '');
    const num = parseInt(clean, 10);
    return isNaN(num) ? 0 : num;
};

export const normalizeCards = (rawData: CardData[]): UnifiedCard[] => {
    const cardMap = new Map<string, { a?: CardData; b?: CardData }>();

    // 1. Group by ID base
    rawData.forEach(card => {
        let baseId = card.id;
        let suffix = '';

        if (card.id.endsWith('_a')) {
            baseId = card.id.slice(0, -2);
            suffix = 'a';
        } else if (card.id.endsWith('_b')) {
            baseId = card.id.slice(0, -2);
            suffix = 'b';
        }

        if (!cardMap.has(baseId)) {
            cardMap.set(baseId, {});
        }

        const entry = cardMap.get(baseId)!;
        if (suffix === 'a') {
            entry.a = card;
        } else if (suffix === 'b') {
            entry.b = card;
        } else {
            entry.a = card;
        }
    });

    const unifiedCards: UnifiedCard[] = [];

    cardMap.forEach((parts, baseId) => {
        const main = parts.a;
        if (!main) {
            return;
        }

        const sub = parts.b;

        // --- Type Detection Logic ---
        let cardType: UnifiedCard['cardType'] = 'Normal';
        let startsInBattleZone = false;

        const mainType = (main.type || '');
        const subType = sub ? (sub.type || '') : '';
        const combinedType = (mainType + subType);

        // 1. External Game Start Cards (Zeroryu / Dolmadgeddon) 
        if (mainType.includes('零龍の儀') || mainType.includes('零龍星雲')) {
            cardType = 'ZeroryuPart';
        } else if (mainType.includes('最終禁断フィールド')) {
            cardType = 'DolmadgeddonPart';
        }
        // 2. Main Deck Game Start Cards (Dokindam X types)
        else if (mainType.includes('禁断の鼓動')) {
            cardType = 'Normal';
            startsInBattleZone = true;
        }
        // 3. Special Zones
        else if (combinedType.includes('サイキック')) {
            cardType = 'Psychic';
        }
        else if (combinedType.includes('ドラグハート')) {
            cardType = 'Dragheart';
        }
        else if (mainType.includes('GR')) {
            cardType = 'GR';
        }
        // 4. Twinpact
        else if (sub && main.name === sub.name) {
            cardType = 'Twinpact';
        }
        // 5. Evolution (as a top-level category if desired, usually considered 'Normal' deck type but special)
        // We already have 'Evolution' in type definition, let's use it if strict.
        else if (mainType.includes('進化')) {
            cardType = 'Evolution';
        }

        // Build Search Index
        const civs = new Set<string>();
        const costs: number[] = [];
        const powers: number[] = [];
        const races = new Set<string>();
        let fullText = "";

        const processPart = (c: CardData) => {
            c.civilization.split('/').forEach(civ => civs.add(civ.trim()));
            costs.push(parseCost(c.cost));
            powers.push(parsePower(c.power));
            if (c.race) {
                c.race.split('/').forEach(r => races.add(r.trim()));
            }
            if (c.text) {
                fullText += (c.text.join('\n') + "\n");
            }
            fullText += (c.name + "\n");
        };

        processPart(main);
        if (sub) processPart(sub);

        // Detailed Flags for Filtering
        // Note: includes() is case sensitive for Japanese.
        const isSpell = combinedType.includes('呪文');
        const isEvolution = combinedType.includes('進化');
        const isNEO = combinedType.toUpperCase().includes('NEO') || combinedType.includes('ＮＥＯ'); // Handle full-width?
        const isPsychic = combinedType.includes('サイキック');
        const isDragheart = combinedType.includes('ドラグハート');
        const isCreature = combinedType.includes('クリーチャー');
        const isField = combinedType.includes('フィールド');
        const isCastle = combinedType.includes('城');
        const isCrossGear = combinedType.includes('クロスギア');
        const isTamaseed = combinedType.includes('タマシード');

        unifiedCards.push({
            id: baseId,
            name: main.name,
            cardType,
            startsInBattleZone,
            mainPart: main,
            subPart: sub,
            searchIndex: {
                civilizations: Array.from(civs),
                costs: Array.from(new Set(costs)).sort((a, b) => a - b),
                power: Array.from(new Set(powers)).sort((a, b) => a - b),
                races: Array.from(races),
                text: fullText.toLowerCase(),
                // Flags
                isSpell,
                isEvolution,
                isNEO,
                isPsychic,
                isDragheart,
                isCreature,
                isField,
                isCastle,
                isCrossGear,
                isTamaseed
            }
        });
    });

    return unifiedCards;
};
