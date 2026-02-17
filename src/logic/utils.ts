import { CardType } from '../types/card-master';

/**
 * 316.1: クリーチャー、タマシード等、バトルゾーンに表向きで出せるカードの総称
 * Element: General term for cards that can be put into the Battle Zone face up.
 */
export const isElement = (cardType: CardType): boolean => {
    const elementTypes = [
        CardType.CREATURE,
        CardType.TAMASEED,
        CardType.CROSS_GEAR,
        CardType.FIELD,
        CardType.KODO,
        CardType.AURA,
        CardType.WEAPON,
        CardType.FORTRESS,
        CardType.CORE,
        CardType.ARTIFACT,
        CardType.DUELIST
    ];
    return elementTypes.includes(cardType);
};
