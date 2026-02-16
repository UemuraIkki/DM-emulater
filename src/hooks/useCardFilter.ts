import { useState, useMemo } from 'react';
import type { UnifiedCard } from '../utils/cardProcessor';

export type CivMode = 'include' | 'exact' | 'exclude';

export interface CardFilterState {
    searchQuery: string;
    civilizations: string[];
    civMode: CivMode;
    cardTypes: string[];
    costMin: string;
    costMax: string;
    powerMin: string;
    powerMax: string;
}

export const useCardFilter = (cards: UnifiedCard[]) => {
    const [filters, setFilters] = useState<CardFilterState>({
        searchQuery: '',
        civilizations: [],
        civMode: 'include',
        cardTypes: [],
        costMin: '',
        costMax: '',
        powerMin: '',
        powerMax: '',
    });

    const filteredCards = useMemo(() => {
        let result = cards;

        // 1. Text Search (Name, Text, Race)
        if (filters.searchQuery) {
            const lowerSearch = filters.searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(lowerSearch) ||
                c.searchIndex.text.includes(lowerSearch) ||
                c.searchIndex.races.some(r => r.toLowerCase().includes(lowerSearch))
            );
        }

        // 2. Civilization Filter
        if (filters.civilizations.length > 0) {
            const selectedCivs = filters.civilizations;

            if (filters.civMode === 'include') {
                result = result.filter(c =>
                    c.searchIndex.civilizations.some(civ => selectedCivs.includes(civ))
                );
            } else if (filters.civMode === 'exact') {
                result = result.filter(c => {
                    const cardCivs = c.searchIndex.civilizations;
                    if (cardCivs.length !== selectedCivs.length) return false;
                    return selectedCivs.every(civ => cardCivs.includes(civ));
                });
            } else if (filters.civMode === 'exclude') {
                result = result.filter(c =>
                    !c.searchIndex.civilizations.some(civ => selectedCivs.includes(civ))
                );
            }
        }

        // 3. Card Type Filter (Updated to use Flags)
        if (filters.cardTypes.length > 0) {
            result = result.filter(c => {
                return filters.cardTypes.some(filterType => {
                    // Match FilterPanel options
                    switch (filterType) {
                        case 'Creature': return c.searchIndex.isCreature;
                        case 'Spell': return c.searchIndex.isSpell;
                        case 'Twinpact': return c.cardType === 'Twinpact';
                        case 'Evolution Creature': return c.searchIndex.isEvolution;
                        case 'NEO Creature': return c.searchIndex.isNEO;
                        case 'Tamaseed': return c.searchIndex.isTamaseed;
                        case 'Cross Gear': return c.searchIndex.isCrossGear;
                        case 'Castle': return c.searchIndex.isCastle;
                        case 'Field': return c.searchIndex.isField;
                        case 'Psychic': return c.searchIndex.isPsychic || c.cardType === 'Psychic';
                        case 'Dragheart': return c.searchIndex.isDragheart || c.cardType === 'Dragheart';
                        case 'Game Start': return c.cardType === 'ZeroryuPart' || c.cardType === 'DolmadgeddonPart' || c.startsInBattleZone;
                        default: return false;
                    }
                });
            });
        }

        // 4. Cost Range
        const minCost = parseInt(filters.costMin, 10);
        const maxCost = parseInt(filters.costMax, 10);

        if (!isNaN(minCost) || !isNaN(maxCost)) {
            result = result.filter(c => {
                return c.searchIndex.costs.some(cost => {
                    if (!isNaN(minCost) && cost < minCost) return false;
                    if (!isNaN(maxCost) && cost > maxCost) return false;
                    return true;
                });
            });
        }

        // 5. Power Range
        const minPower = parseInt(filters.powerMin, 10);
        const maxPower = parseInt(filters.powerMax, 10);

        if (!isNaN(minPower) || !isNaN(maxPower)) {
            result = result.filter(c => {
                if (c.searchIndex.power.length === 0) return false;
                return c.searchIndex.power.some(p => {
                    if (!isNaN(minPower) && p < minPower) return false;
                    if (!isNaN(maxPower) && p > maxPower) return false;
                    return true;
                });
            });
        }

        return result.slice(0, 100);
    }, [cards, filters]);

    return {
        filters,
        setFilters,
        filteredCards
    };
};
