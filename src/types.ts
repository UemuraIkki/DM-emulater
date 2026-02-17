export type { CardData, UnifiedCard } from './types/card-master';

export interface Deck {
    cards: CardData[];
}

export type Zone = 'main' | 'hyperSpatial' | 'gr';
