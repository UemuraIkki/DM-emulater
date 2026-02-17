import { ZoneId } from '../../types/gameState';
import type { GameState, CardState, PlayerId } from '../../types/gameState';
import type { UnifiedCard } from '../../types/card-master';

interface GameBoardProps {
    gameState: GameState;
    playerId: PlayerId;
    cardsMap: Record<string, UnifiedCard>;
    onCardClick?: (cardId: string) => void;
    onZoneClick?: (playerId: PlayerId, zone: ZoneId) => void;
    selectedCardId?: string | null;
}

// Simple Card Component for Game Board
const GameCard = ({
    cardState,
    cardData,
    hidden,
    onClick,
    isSelected
}: {
    cardState: CardState,
    cardData?: UnifiedCard,
    hidden?: boolean,
    onClick?: () => void,
    isSelected?: boolean
}) => {
    if (hidden || cardState.faceDown) {
        return (
            <div
                className={`w-12 h-16 md:w-16 md:h-24 bg-indigo-900 border-2 border-indigo-700 rounded shadow-sm flex items-center justify-center ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
                onClick={onClick}
            >
                <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (!cardData) return <div className="w-12 h-16 md:w-16 md:h-24 bg-gray-200 rounded">?</div>;

    return (
        <div
            className={`w-12 h-16 md:w-16 md:h-24 bg-white border border-gray-300 rounded shadow-sm flex flex-col items-center p-0.5 md:p-1 text-[8px] md:text-[10px] overflow-hidden relative select-none cursor-pointer transition-transform
                ${cardState.tapped ? 'transform rotate-90 origin-center' : ''}
                ${isSelected ? 'ring-2 ring-yellow-400 scale-105 z-10' : 'hover:scale-105'}
            `}
            title={cardData.name}
            onClick={onClick}
        >
            <div className={`font-bold leading-tight text-center line-clamp-2 ${cardData.civilizations?.includes('FIRE') ? 'text-red-600' : cardData.civilizations?.includes('WATER') ? 'text-blue-600' : cardData.civilizations?.includes('NATURE') ? 'text-green-600' : cardData.civilizations?.includes('LIGHT') ? 'text-yellow-600' : cardData.civilizations?.includes('DARKNESS') ? 'text-slate-800' : 'text-gray-800'}`}>
                {cardData.name}
            </div>
            <div className="mt-auto text-[8px] font-bold text-gray-400">{cardData.searchIndex.costs?.[0]}</div>
            {cardData.subPart && <div className="mt-1 text-gray-500 text-[8px] border-t w-full text-center pt-0.5">{cardData.subPart.name}</div>}
        </div>
    );
};

// Zone Component
const ZoneArea = ({ title, cards, className, onClick, isOpponent }: { title: string, cards: React.ReactNode, className?: string, onClick?: () => void, isOpponent?: boolean }) => (
    <div
        className={`border ${isOpponent ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-slate-50/50'} rounded p-2 flex flex-col ${className} ${onClick ? 'cursor-pointer hover:bg-opacity-80' : ''} transition-colors relative`}
        onClick={onClick}
    >
        <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${isOpponent ? 'text-red-400' : 'text-slate-400'}`}>{title}</div>
        <div className="flex-1 flex flex-wrap content-start gap-1 overflow-auto pointer-events-auto">
            {cards}
        </div>
    </div>
);

export const GameBoard = ({ gameState, playerId, cardsMap, onCardClick, onZoneClick, selectedCardId }: GameBoardProps) => {
    // Helper to get cards in a zone
    const getZoneCards = (pid: PlayerId, zone: ZoneId) => {
        return Object.values(gameState.cards)
            .filter(c => c.ownerId === pid && c.zone === zone)
            .sort((a, b) => (a.stackOrder || 0) - (b.stackOrder || 0)); // Sort by stack order if relevant
    };

    const renderCards = (cards: CardState[], forceHidden = false) => {
        return cards.map(c => (
            <GameCard
                key={c.id}
                cardState={c}
                cardData={cardsMap[c.masterId]}
                hidden={forceHidden}
                onClick={() => onCardClick?.(c.id)}
                isSelected={selectedCardId === c.id}
            />
        ));
    };

    // Assuming 2 players: Me and Opponent
    const opponentId = Object.keys(gameState.players).find(id => id !== playerId) || 'opponent';

    // My Zones
    const myHand = getZoneCards(playerId, ZoneId.HAND);
    const myMana = getZoneCards(playerId, ZoneId.MANA);
    const myShields = getZoneCards(playerId, ZoneId.SHIELD);
    const myBattleZone = getZoneCards(playerId, ZoneId.BATTLE_ZONE);
    const myDeck = getZoneCards(playerId, ZoneId.DECK);
    const myHyper = getZoneCards(playerId, ZoneId.HYPER_SPATIAL);
    const myGraveyard = getZoneCards(playerId, ZoneId.GRAVEYARD);

    // Opponent Zones
    const oppHand = getZoneCards(opponentId, ZoneId.HAND);
    const oppMana = getZoneCards(opponentId, ZoneId.MANA);
    const oppShields = getZoneCards(opponentId, ZoneId.SHIELD);
    const oppBattleZone = getZoneCards(opponentId, ZoneId.BATTLE_ZONE);
    const oppDeck = getZoneCards(opponentId, ZoneId.DECK);
    const oppHyper = getZoneCards(opponentId, ZoneId.HYPER_SPATIAL);
    const oppGraveyard = getZoneCards(opponentId, ZoneId.GRAVEYARD);

    return (
        <div className="w-full h-full bg-slate-100 flex flex-col p-2 gap-2 overflow-hidden">
            {/* Opponent Area (Rotated) */}
            <div className="flex-[0.8] flex flex-col transform rotate-180 gap-2 mb-2 p-2 bg-red-50/20 rounded-lg border border-red-100 shadow-inner">
                {/* Opponent's "Bottom" row (from their perspective) -> Top visually for us after rotation */}
                <div className="flex-1 flex gap-2">
                    <div className="w-1/4 flex flex-col gap-1">
                        <ZoneArea
                            title="Mana"
                            cards={renderCards(oppMana, true)}  // Usually public, but maybe inverted for opponent view? Keep public for now.
                            className="flex-1"
                            isOpponent
                            onClick={() => onZoneClick?.(opponentId, ZoneId.MANA)}
                        />
                        <ZoneArea
                            title="Graveyard"
                            cards={renderCards(oppGraveyard.slice(-1))}
                            className="h-1/3"
                            isOpponent
                            onClick={() => onZoneClick?.(opponentId, ZoneId.GRAVEYARD)}
                        />
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                        <ZoneArea
                            title="Shields"
                            cards={renderCards(oppShields, true)}
                            className="h-1/2 flex-row"
                            isOpponent
                        />
                        {/* Hand is hidden for us */}
                        <ZoneArea
                            title="Hand"
                            cards={renderCards(oppHand, true)} // Force Hidden
                            className="h-1/2 flex-row"
                            isOpponent
                        />
                    </div>

                    <div className="w-1/5 flex flex-col gap-1">
                        <ZoneArea title="Deck" cards={<div className="text-xs text-center">{oppDeck.length}</div>} className="h-1/3" isOpponent />
                        <ZoneArea
                            title="Hyper Spatial"
                            cards={renderCards(oppHyper, true)}
                            className="flex-1"
                            isOpponent
                            onClick={() => onZoneClick?.(opponentId, ZoneId.HYPER_SPATIAL)}
                        />
                    </div>
                </div>
            </div>

            {/* Battle Zone (Shared Center) */}
            <div className="flex-1 bg-green-50/30 border border-green-100 rounded flex flex-col relative py-2">
                <div className="text-xs text-green-800/50 absolute top-1 left-2 font-bold z-0 pointer-events-none">BATTLE ZONE</div>

                {/* Opponent Creatures (Top of Battle Zone, Rotated) */}
                <div className="flex-1 flex items-start justify-center px-4 transform rotate-180">
                    {renderCards(oppBattleZone)}
                </div>

                {/* My Creatures (Bottom of Battle Zone) */}
                <div className="flex-1 flex items-end justify-center px-4">
                    {renderCards(myBattleZone)}
                </div>
            </div>

            {/* My Player Area */}
            <div className="flex-[0.8] flex gap-2 mt-2 p-2 bg-slate-50/50 rounded-lg border border-slate-200">
                {/* Left Side: Mana & Graveyard */}
                <div className="w-1/4 flex flex-col gap-1">
                    <ZoneArea
                        title="Mana"
                        cards={renderCards(myMana)}
                        className="flex-1"
                        onClick={() => onZoneClick?.(playerId, ZoneId.MANA)}
                    />
                    <ZoneArea
                        title="Graveyard"
                        cards={renderCards(myGraveyard.slice(-1))} // Show top card only
                        className="h-1/3"
                        onClick={() => onZoneClick?.(playerId, ZoneId.GRAVEYARD)}
                    />
                </div>

                {/* Center: Shield & Hand */}
                <div className="flex-1 flex flex-col gap-2">
                    <ZoneArea title="Shields" cards={renderCards(myShields)} className="h-1/2 flex-row" />
                    <ZoneArea title="Hand" cards={renderCards(myHand)} className="h-1/2 flex-row" />
                </div>

                {/* Right Side: Deck & Extra */}
                <div className="w-1/5 flex flex-col gap-1">
                    <ZoneArea title="Deck" cards={<div className="text-xs text-center">{myDeck.length}</div>} className="h-1/3" />
                    <ZoneArea
                        title="Hyper Spatial"
                        cards={renderCards(myHyper)}
                        className="flex-1"
                        onClick={() => onZoneClick?.(playerId, ZoneId.HYPER_SPATIAL)}
                    />
                </div>
            </div>
        </div>
    );
};
