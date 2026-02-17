import { supabase } from '../lib/supabase';
import type { UnifiedCard } from '../types/card-master';

export interface Deck {
    id: string;
    name: string;
    cards: UnifiedCard[]; // Stored as jsonb
    created_at: string;
}

// Save deck (upsert)
export const saveDeck = async (deck: { id?: string; name: string; cards: UnifiedCard[] }): Promise<Deck | null> => {
    // If no ID, supabase will generate one if we omit it? 
    // Actually for upsert, if we want to update, we need ID. If new, we don't.
    // But upsert checks for conflict.
    // If we pass an ID that doesn't exist, it inserts.
    // We should treat it as: if ID exists, update. If not, insert.

    // Transform UnifiedCard[] to JSON-serializable if necessary, 
    // but UnifiedCard is JSON safe (assuming no functions/dates).

    const payload: any = {
        name: deck.name,
        cards: deck.cards,
        updated_at: new Date().toISOString(),
    };

    if (deck.id) {
        payload.id = deck.id;
    }

    const { data, error } = await supabase
        .from('decks')
        .upsert(payload)
        .select()
        .single();

    if (error) {
        console.error('Error saving deck:', error);
        throw error;
    }
    return data;
};

// Load all decks
export const loadDecks = async (): Promise<Deck[]> => {
    const { data, error } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading decks:', error);
        throw error;
    }
    return data || [];
};

// Get single deck
export const getDeck = async (id: string): Promise<Deck | null> => {
    const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error getting deck:', error);
        return null;
    }
    return data;
};

// Delete deck
export const deleteDeck = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting deck:', error);
        throw error;
    }
};
