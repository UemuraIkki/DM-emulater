import React from 'react';
import type { CardState } from '../../types/gameState';
import type { UnifiedCard } from '../../types/card-master';
import { ZoneId } from '../../types/gameState';

interface GameCardProps {
    cardState: CardState;
    cardData?: UnifiedCard;
    hidden?: boolean;
    onClick?: () => void;
    isSelected?: boolean;
}

const getCivColorClass = (card: UnifiedCard): string => {
    if (!card.searchIndex?.civilizations) return 'text-gray-800';
    const civs = card.searchIndex.civilizations;
    if (civs.includes('FIRE')) return 'text-red-600';
    if (civs.includes('WATER')) return 'text-blue-600';
    if (civs.includes('NATURE')) return 'text-green-600';
    if (civs.includes('LIGHT')) return 'text-yellow-600';
    if (civs.includes('DARKNESS')) return 'text-slate-800';
    return 'text-gray-800';
};

export const GameCard: React.FC<GameCardProps> = ({
    cardState,
    cardData,
    hidden,
    onClick,
    isSelected
}) => {
    // Privacy Logic: Shield Zone or FaceDown = Back of Card
    const isSecret = hidden || cardState.faceDown || cardState.zone === ZoneId.SHIELD;

    if (isSecret) {
        return (
            <div
                className={`w-12 h-16 md:w-16 md:h-24 bg-indigo-900 border-2 border-indigo-700 rounded shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${isSelected ? 'ring-2 ring-yellow-400 scale-105 z-10' : ''}`}
                onClick={onClick}
            >
                <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (!cardData) return <div className="w-12 h-16 md:w-16 md:h-24 bg-gray-200 rounded">?</div>;

    // Orientation Logic: Certain types are horizontal by default
    // We check mainPart.type for simplicity if available, or searchIndex
    const rawType = cardData.mainPart.type.toUpperCase();
    const isHorizontalType =
        rawType === 'FIELD' ||
        rawType === 'FORTRESS' ||
        rawType === 'CROSS GEAR' || // Space might vary
        rawType.includes('FIELD') ||
        rawType.includes('FORTRESS');

    const isHorizontal = isHorizontalType;
    const isTapped = cardState.tapped;

    // Rotation logic
    let rotationClass = '';
    if (isHorizontal) {
        rotationClass = isTapped ? 'rotate-180' : 'rotate-90';
    } else {
        rotationClass = isTapped ? 'rotate-90' : '';
    }

    // Summoning Sickness Visual
    const sicknessClass = cardState.hasSummoningSickness && !cardState.tapped ? 'opacity-90 saturate-50' : '';

    return (
        <div
            className={`w-12 h-16 md:w-16 md:h-24 bg-white border border-gray-300 rounded shadow-sm flex flex-col items-center p-0.5 md:p-1 text-[8px] md:text-[10px] overflow-hidden relative select-none cursor-pointer transition-transform origin-center
                ${rotationClass}
                ${isSelected ? 'ring-2 ring-yellow-400 scale-105 z-10' : 'hover:scale-105'}
                ${sicknessClass}
            `}
            title={cardData.name}
            onClick={onClick}
        >
            {/* Sickness Icon */}
            {cardState.hasSummoningSickness && !cardState.tapped && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-gray-400 rounded-full z-20 border border-white" title="Summoning Sickness" />
            )}

            <div className={`font-bold leading-tight text-center line-clamp-2 ${getCivColorClass(cardData)}`}>
                {cardData.name}
            </div>
            <div className="mt-auto text-[8px] font-bold text-gray-400">{cardData.searchIndex.costs?.[0]}</div>
            {cardData.subPart && <div className="mt-1 text-gray-500 text-[8px] border-t w-full text-center pt-0.5">{cardData.subPart.name}</div>}
        </div>
    );
};
