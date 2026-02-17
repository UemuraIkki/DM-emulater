import { ZoneId } from '../../types/gameState';
import type { GameState, CardState, PlayerId } from '../../types/gameState';
import type { UnifiedCard } from '../../types/card-master';

interface GameBoardProps {
    gameState: GameState;
    playerId: PlayerId;
    cardsMap: Record<string, UnifiedCard>;
    onCardClick?: (cardId: string) => void;
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
                className={`w-16 h-24 bg-indigo-900 border-2 border-indigo-700 rounded shadow-sm flex items-center justify-center ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
                onClick={onClick}
            >
                <span className="text-xs text-indigo-400">Back</span>
            </div>
        );
    }

    if (!cardData) return <div className="w-16 h-24 bg-gray-200 rounded">?</div>;

    return (
        <div
            className={`w-16 h-24 bg-white border border-gray-300 rounded shadow-sm flex flex-col items-center p-1 text-[10px] overflow-hidden relative select-none cursor-pointer transition-transform
                ${cardState.tapped ? 'transform rotate-90 origin-center' : ''}
                ${isSelected ? 'ring-2 ring-yellow-400 scale-105 z-10' : 'hover:scale-105'}
            `}
            title={cardData.name}
            onClick={onClick}
        >
            <div className="font-bold leading-tight text-center line-clamp-2">{cardData.name}</div>
            <div className="mt-auto text-[8px] font-bold text-gray-400">{cardData.searchIndex.costs?.[0]}</div>
            {cardData.subPart && <div className="mt-1 text-gray-500 text-[8px] border-t w-full text-center pt-0.5">{cardData.subPart.name}</div>}
        </div>
    );
};

// Zone Component
const ZoneArea = ({ title, cards, className }: { title: string, cards: React.ReactNode, className?: string }) => (
    <div className={`border border-slate-200 bg-slate-50/50 rounded p-2 flex flex-col ${className}`}>
        <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">{title}</div>
        <div className="flex-1 flex flex-wrap content-start gap-1 overflow-auto">
            {cards}
        </div>
    </div>
);

export const GameBoard = ({ gameState, playerId, cardsMap, onCardClick, selectedCardId }: GameBoardProps) => {
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

    return (
        <div className="w-full h-full bg-slate-100 flex flex-col p-2 gap-2 overflow-hidden">
            {/* Opponent Area */}
            <div className="h-1/4 bg-red-50/50 rounded border border-red-100 p-2 flex flex-col gap-1 relative">
                <div className="absolute top-1 left-2 text-xs text-red-300 font-bold">OPPONENT ({opponentId})</div>

                <div className="flex-1 flex justify-center items-center gap-4">
                    {/* Opponent Hand (Count Only) */}
                    <div className="w-16 h-24 bg-red-900/20 rounded border border-red-200 flex items-center justify-center flex-col">
                        <span className="text-xs text-red-400 font-bold">HAND</span>
                        <span className="text-xl font-bold text-red-600">{getZoneCards(opponentId, ZoneId.HAND).length}</span>
                    </div>

                    {/* Opponent Mana */}
                    <div className="w-16 h-24 bg-red-900/20 rounded border border-red-200 flex items-center justify-center flex-col">
                        <span className="text-xs text-red-400 font-bold">MANA</span>
                        <span className="text-xl font-bold text-red-600">{getZoneCards(opponentId, ZoneId.MANA).length}</span>
                    </div>

                    {/* Opponent Shield */}
                    <div className="w-16 h-24 bg-red-900/20 rounded border border-red-200 flex items-center justify-center flex-col">
                        <span className="text-xs text-red-400 font-bold">SHIELD</span>
                        <span className="text-xl font-bold text-red-600">{getZoneCards(opponentId, ZoneId.SHIELD).length}</span>
                    </div>

                    {/* Opponent Deck */}
                    <div className="w-16 h-24 bg-red-900/20 rounded border border-red-200 flex items-center justify-center flex-col">
                        <span className="text-xs text-red-400 font-bold">DECK</span>
                        <span className="text-xl font-bold text-red-600">{getZoneCards(opponentId, ZoneId.DECK).length}</span>
                    </div>
                </div>
            </div>

            {/* Battle Zone (Shared visually, but keeping separate for now or filter by controller) */}
            <div className="flex-1 bg-green-50/30 border border-green-100 rounded flex flex-col relative">
                <div className="text-xs text-green-800/50 absolute top-1 left-2 font-bold z-0">BATLE ZONE</div>
                <div className="flex-1 flex items-center justify-center z-10 p-4 gap-2">
                    {renderCards(myBattleZone)}
                </div>
            </div>

            {/* My Player Area */}
            <div className="h-1/3 flex gap-2">
                {/* Left Side: Mana */}
                <ZoneArea title="Mana" cards={renderCards(myMana)} className="w-1/4" />

                {/* Center: Shield & Hand */}
                <div className="flex-1 flex flex-col gap-2">
                    <ZoneArea title="Shields" cards={renderCards(myShields)} className="h-1/2 flex-row" />
                    <ZoneArea title="Hand" cards={renderCards(myHand)} className="h-1/2 flex-row" />
                </div>

                {/* Right Side: Deck & Extra */}
                <div className="w-1/5 flex flex-col gap-1">
                    <ZoneArea title="Deck" cards={<div className="text-xs">{myDeck.length} cards</div>} className="flex-1" />
                    <ZoneArea title="Hyper" cards={<div className="text-xs">{myHyper.length} cards</div>} className="h-1/3" />
                </div>
            </div>
        </div>
    );
};
