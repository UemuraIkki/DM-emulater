export interface CardData {
    id: string;
    name: string;
    type: string;
    civilization: string;
    race: string;
    cost: string; // Scraper returns string, might need parsing to number for sort
    power: string;
    text: string[];
    flavor: string;
    imageUrl?: string;
    url: string;
}

export interface Deck {
    cards: CardData[];
}

export type Zone = 'main' | 'hyperSpatial' | 'gr';
