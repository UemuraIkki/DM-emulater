import React from 'react';
import type { UnifiedCard } from '../utils/cardProcessor';
import { getCardBackground } from '../utils/civilizationColor';

interface CardProps {
    card: UnifiedCard;
    onClick?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
    className?: string;
    showDetails?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, onContextMenu, className = '' }) => {
    const { mainPart, subPart, cardType } = card;

    // Civilization color mapping using helper
    const civString = card.searchIndex.civilizations.join('/');
    const backgroundStyle = {
        background: getCardBackground(civString)
    };

    return (
        <div
            className={`p-2 border border-gray-400 rounded-lg shadow-sm text-sm cursor-pointer hover:shadow-md transition card-hover select-none relative group h-64 flex flex-col justify-between overflow-hidden ${className}`}
            onClick={onClick}
            onContextMenu={onContextMenu}
            style={backgroundStyle}
        >
            {/* Header */}
            <div className="flex justify-between items-start font-bold border-b border-black/20 pb-1 mb-1">
                <span className="truncate flex-1 text-xs md:text-sm text-black/90 drop-shadow-sm">{card.name}</span>
                <span className="text-xs ml-1 whitespace-nowrap bg-black/10 px-1 rounded text-black/80 font-mono">
                    {card.searchIndex.costs.join('/')}
                </span>
            </div>

            {/* Badges for Card Type */}
            <div className="flex gap-1 mb-1 flex-wrap">
                {cardType !== 'Normal' && (
                    <span className={`text-[10px] px-1 rounded text-white shadow-sm ${cardType === 'Twinpact' ? 'bg-blue-600' :
                            cardType === 'Psychic' ? 'bg-purple-600' :
                                cardType === 'Dragheart' ? 'bg-pink-600' :
                                    cardType === 'Evolution' ? 'bg-green-600' : // Evolution often green or special
                                        cardType === 'ZeroryuPart' || cardType === 'DolmadgeddonPart' ? 'bg-black' :
                                            'bg-gray-600'
                        }`}>
                        {cardType}
                    </span>
                )}
            </div>

            <div className="text-[10px] opacity-80 gap-1 flex flex-wrap mb-1 text-black/80 font-medium">
                <span className="truncate max-w-full">{mainPart.type}</span>
                {mainPart.race && <span>- {mainPart.race}</span>}
            </div>


            {/* Main Effect Text */}
            <div className="flex-1 text-[10px] leading-tight text-black/80 whitespace-pre-wrap overflow-hidden relative">
                {/* Simplified text view */}
                <div className="line-clamp-6">
                    {mainPart.text ? (Array.isArray(mainPart.text) ? mainPart.text.join('\n') : mainPart.text) : ''}
                </div>
            </div>

            {/* Footer / Power */}
            <div className="mt-1 pt-1 border-t border-black/10 flex justify-between items-center text-xs font-bold text-black/70">
                {mainPart.power && <span>BP: {mainPart.power}</span>}
                {subPart && (
                    <span className="text-[9px] bg-white/30 px-1 rounded">
                        Twinpact
                    </span>
                )}
            </div>

            {/* Full card hover overlay potentially? Or just basic styling */}
        </div>
    );
};
