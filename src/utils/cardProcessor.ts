import type { CardData } from '../types/card-master';
import type { UnifiedCard } from '../types/card-master';
import { CardType, SpecialType } from '../types/card-master';

export type { UnifiedCard };

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
            cardType = SpecialType.ZERORYU_PART;
        } else if (mainType.includes('最終禁断フィールド')) {
            cardType = SpecialType.DOLMADGEDDON_PART;
        }
        // 2. Main Deck Game Start Cards (Dokindam X types)
        else if (mainType.includes('禁断の鼓動')) {
            startsInBattleZone = true;
        }
        // 3. Special Zones
        else if (combinedType.includes('サイキック')) {
            cardType = SpecialType.PSYCHIC;
        }
        else if (combinedType.includes('ドラグハート')) {
            cardType = SpecialType.DRAGHEART;
        }
        else if (mainType.includes('GR')) {
            cardType = SpecialType.GR;
        }
        // 4. Twinpact
        else if (sub && main.name === sub.name) {
            cardType = SpecialType.TWINPACT;
        }
        // 5. Evolution
        else if (mainType.includes('進化')) {
            cardType = SpecialType.EVOLUTION;
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
        const isSpell = combinedType.includes('呪文');
        const isEvolution = combinedType.includes('進化');
        const isNEO = combinedType.toUpperCase().includes('NEO') || combinedType.includes('ＮＥＯ');
        const isPsychic = combinedType.includes('サイキック');
        const isDragheart = combinedType.includes('ドラグハート');
        const isCreature = combinedType.includes('クリーチャー');
        const isField = combinedType.includes('フィールド');
        const isCastle = combinedType.includes('城');
        const isCrossGear = combinedType.includes('クロスギア');
        const isTamaseed = combinedType.includes('タマシード');

        // Map to strict CardType list
        const typesList: CardType[] = [];
        if (isCreature) typesList.push(CardType.CREATURE);
        if (isSpell) typesList.push(CardType.SPELL);
        if (isCrossGear) typesList.push(CardType.CROSS_GEAR);
        if (isCastle) typesList.push(CardType.CASTLE);
        if (isField) typesList.push(CardType.FIELD);
        if (isTamaseed) typesList.push(CardType.TAMASEED);

        // Handle specialized types based on specific keywords if needed
        if (combinedType.includes('オーラ')) typesList.push(CardType.AURA);
        if (combinedType.includes('儀')) typesList.push(CardType.GI);

        unifiedCards.push({
            id: baseId,
            name: main.name,
            cardType,
            startsInBattleZone,
            sides: [], // Placeholder for Rule 201 implementation
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
                isTamaseed,
                isCardType: typesList
            }
        });
    });

    return unifiedCards;
};
