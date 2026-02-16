export const getCardBackground = (civilization: string): string => {
    if (!civilization) {
        return '#EEEEEE'; // Default to Zero/Colorless if empty
    }

    // Map civilizations to colors
    const colorMap: Record<string, string> = {
        '光': '#FFF59D', // Light: Yellow-200
        '水': '#90CAF9', // Water: Blue-200
        '闇': '#B39DDB', // Darkness: DeepPurple-200 (Adjusted for readability as requested)
        '火': '#EF9A9A', // Fire: Red-200
        '自然': '#A5D6A7', // Nature: Green-200
        'ゼロ': '#EEEEEE', // Zero: Gray-200
    };

    // Split by slash (e.g., "光/水/火")
    const civs = civilization.split('/').map(c => c.trim());

    // Filter out invalid keys just in case
    const validColors = civs
        .map(c => colorMap[c])
        .filter(color => color !== undefined);

    if (validColors.length === 0) {
        return '#EEEEEE'; // Fallback
    }

    if (validColors.length === 1) {
        return validColors[0];
    }

    // Multi-color: Create linear gradient
    // Example: linear-gradient(135deg, #EF9A9A, #A5D6A7)
    return `linear-gradient(135deg, ${validColors.join(', ')})`;
};
