import { ZoneModal } from './ZoneModal';
import { useState } from 'react';

// ... (Existing Imports)

// ... (ZoneButton, renderCardList, getZoneCards remain the same)

// Helper function to fix ReferenceError
const getZoneCards = (gameState: GameState, ownerId: string, zone: string) => {
    return Object.values(gameState.cards)
        .filter(c => c.ownerId === ownerId && c.zone === zone)
        .sort((a, b) => (a.stackOrder || 0) - (b.stackOrder || 0));
};

export const GameBoard: React.FC<GameBoardProps> = ({
    gameState,
    playerId,
    cardsMap,
    onCardClick,
    onZoneClick,
    selectedCardId
}) => {
    const [viewingZone, setViewingZone] = useState<{ title: string, cards: UnifiedCard[] } | null>(null);

    const opponentId = Object.keys(gameState.players).find(id => id !== playerId) || 'player2';

    // Data Retrieval
    const myHand = getZoneCards(gameState, playerId, ZoneId.HAND);
    const myMana = getZoneCards(gameState, playerId, ZoneId.MANA);
    const myShields = getZoneCards(gameState, playerId, ZoneId.SHIELD);
    const myBattle = getZoneCards(gameState, playerId, ZoneId.BATTLE_ZONE);
    const myGrave = getZoneCards(gameState, playerId, ZoneId.GRAVEYARD);
    const myHyper = getZoneCards(gameState, playerId, ZoneId.HYPER_SPATIAL);
    const myDeck = getZoneCards(gameState, playerId, ZoneId.DECK);

    const opHand = getZoneCards(gameState, opponentId, ZoneId.HAND);
    const opMana = getZoneCards(gameState, opponentId, ZoneId.MANA);
    const opShields = getZoneCards(gameState, opponentId, ZoneId.SHIELD);
    const opBattle = getZoneCards(gameState, opponentId, ZoneId.BATTLE_ZONE);
    const opGrave = getZoneCards(gameState, opponentId, ZoneId.GRAVEYARD);
    const opHyper = getZoneCards(gameState, opponentId, ZoneId.HYPER_SPATIAL);
    const opDeck = getZoneCards(gameState, opponentId, ZoneId.DECK);

    const myManaUntapped = myMana.filter(c => !c.tapped).length;
    const opManaUntapped = opMana.filter(c => !c.tapped).length;

    // Helper to open modal
    const openZone = (title: string, cards: any[]) => {
        const unified = cards.map(c => ({
            ...cardsMap[c.masterId],
            ...c // Merge runtime state
        }));
        setViewingZone({ title, cards: unified });
    };

    return (
        <div className="w-full h-full bg-[#1a1c23] flex flex-col overflow-hidden relative select-none">
            {/* Modal */}
            {viewingZone && (
                <ZoneModal
                    title={viewingZone.title}
                    cards={viewingZone.cards}
                    onClose={() => setViewingZone(null)}
                    onCardClick={(card) => {
                        onCardClick(card.id);
                        setViewingZone(null);
                    }}
                />
            )}

            {/* Manual Action Modal (Global) - Handled separately or via selected state? 
                Wait, currently ManualActionModal is instantiated where? 
                Ah, it seems it WAS in BattleRoom.tsx, but checks selectedCardId.
                Let's double check BattleRoom. 
                Wait, GameBoard props don't have onManualAction or similar.
                The prompt asked to "Click Handlers" to Open Modal.
                Checking BattleRoom...
            */}

            {/* --- GAME LOG OVERLAY --- */}
            <GameLog logs={gameState.logs || []} />

            {/* --- TOP AREA: OPPONENT (Fixed Rotation Container) --- */}
            <div className="h-[43%] flex flex-col bg-red-900/5 relative border-b border-white/5">
                <div className="flex-1 flex flex-col transform rotate-180 p-2">
                    {/* Visual Top (Physical Bottom): Battle Zone */}
                    <div className="flex-[2] flex justify-center items-center py-1 gap-2">
                        {renderCardList(opBattle, cardsMap, onCardClick, selectedCardId)}
                    </div>

                    {/* Shield Zone */}
                    <div className="h-20 flex justify-center items-center gap-1 my-1">
                        {renderCardList(opShields, cardsMap, onCardClick, selectedCardId, true)}
                    </div>

                    {/* Resources: Mana, Hand, Grave */}
                    <div className="flex-1 flex gap-2 items-start min-h-0">
                        {/* Mana (Right in 180 view => Left in visual) */}
                        <div
                            className="flex-1 h-full bg-slate-800/30 rounded p-1 flex flex-wrap content-start transform rotate-180 cursor-pointer hover:bg-slate-700/50 transition-colors"
                            style={{ alignContent: 'flex-start' }}
                            onClick={() => openZone("Opponent's Mana Zone", opMana)}
                        >
                            <div className="w-full text-[10px] text-slate-500 text-center mb-1">Mana {opManaUntapped}/{opMana.length}</div>
                            {renderCardList(opMana, cardsMap, onCardClick, selectedCardId)}
                        </div>

                        {/* Hand (Center) */}
                        <div className="flex-[2] h-full flex items-center justify-center bg-slate-900/20 rounded mx-1">
                            <div className="transform rotate-180 text-slate-400 font-bold">
                                Hand ({opHand.length})
                            </div>
                        </div>

                        {/* Grave / Hyper / Deck (Left in 180 view => Right in visual) */}
                        <div className="w-24 flex flex-col gap-1 transform rotate-180">
                            <ZoneButton label="Deck" count={opDeck.length} className="flex-1 border-dashed opacity-50" />
                            <ZoneButton
                                label="Grave"
                                count={opGrave.length}
                                onClick={() => openZone("Opponent's Graveyard", opGrave)}
                                className="flex-1"
                            />
                            <ZoneButton
                                label="Hyper"
                                count={opHyper.length}
                                onClick={() => openZone("Opponent's Hyper Spatial", opHyper)}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MIDDLE CENTER: INFO (Absolute Center) --- */}
            {/* Phase Indicator, Turn Count etc. */}
            <div className="absolute top-[43%] left-0 right-0 h-[14%] z-20 pointer-events-none flex items-center justify-center">
                <div className="bg-black/40 backdrop-blur-sm px-8 py-2 rounded-full border border-white/10 flex flex-col items-center">
                    <div className="text-xs text-slate-400 font-mono">TURN {gameState.turnState.turnNumber}</div>
                    <div className="text-xl font-bold text-indigo-400 tracking-widest glow">
                        {gameState.turnState.phase.replace('_', ' ')}
                    </div>
                    <div className={`text-[10px] font-bold mt-1 ${gameState.turnState.activePlayerId === playerId ? 'text-green-400' : 'text-red-400'}`}>
                        {gameState.turnState.activePlayerId === playerId ? 'YOUR TURN' : 'OPPONENT TURN'}
                    </div>
                </div>

                {gameState.winner && (
                    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center">
                        <div className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-pulse">
                            {gameState.winner === playerId ? 'VICTORY' : 'DEFEAT'}
                        </div>
                    </div>
                )}
            </div>

            {/* --- BOTTOM AREA: PLAYER --- */}
            <div className="h-[57%] flex flex-col bg-slate-900/10 p-2 pb-0 pt-8 relative">
                {/* Row 1: Battle Zone */}
                <div className="flex-[2] flex justify-center items-center py-2 gap-2 z-10 min-h-[150px] border-b border-white/5 bg-black/10">
                    {/* Placeholder Text if Empty */}
                    {myBattle.length === 0 && (
                        <div className="text-slate-700/30 font-bold text-4xl absolute select-none pointer-events-none">
                            BATTLE ZONE
                        </div>
                    )}
                    {renderCardList(myBattle, cardsMap, onCardClick, selectedCardId)}
                </div>

                {/* Row 2: Mana Zone (Center) */}
                <div className="flex-none h-32 flex justify-center items-center my-1 z-20">
                    <div
                        className="w-full max-w-3xl h-full bg-slate-800/40 rounded border border-slate-700/30 p-1 flex flex-wrap content-start items-start gap-1 overflow-visible transform rotate-180 hover:bg-slate-800 transition-colors cursor-pointer"
                        onClick={() => openZone("Your Mana Zone", myMana)}
                    >
                        <div className="w-full text-[10px] text-slate-400 text-center mb-1 transform rotate-180">Mana {myManaUntapped}/{myMana.length}</div>
                        {renderCardList(myMana, cardsMap, onCardClick, selectedCardId, false, 'transform rotate-180')}
                    </div>
                </div>

                {/* Row 3: Shields & Hand (Horizontal Split) */}
                <div className="flex-[2] flex gap-2 items-end min-h-0 pb-2">
                    {/* Left: Deck / Grave / Hyper */}
                    <div className="w-24 flex flex-col gap-1 h-32 justify-end mb-1 z-20 shrink-0">
                        <ZoneButton label="Deck" count={myDeck.length} className="flex-1 border-dashed opacity-50 hover:opacity-100" />
                        <ZoneButton
                            label="Grave"
                            count={myGrave.length}
                            onClick={() => openZone("Your Graveyard", myGrave)}
                            className="flex-1 bg-slate-800"
                        />
                        <ZoneButton
                            label="Hyper"
                            count={myHyper.length}
                            onClick={() => openZone("Your Hyper Spatial", myHyper)}
                            className="flex-1 bg-indigo-900"
                        />
                    </div>

                    {/* Shield Zone (Next to Hand) */}
                    <div className="flex-1 h-28 flex justify-center items-center bg-slate-900/20 rounded border border-white/5 gap-1 px-2 z-20">
                        {/* Shields Label? */}
                        {myShields.map((c, i) => (
                            <div key={c.id} className="transform hover:-translate-y-2 transition-transform">
                                <GameCard
                                    cardState={c}
                                    cardData={cardsMap[c.masterId]}
                                    hidden={true}
                                    onClick={() => onCardClick(c.id)}
                                    isSelected={selectedCardId === c.id}
                                />
                            </div>
                        ))}
                        {myShields.length === 0 && <span className="text-xs text-slate-600 font-bold uppercase">No Shields</span>}
                    </div>

                    {/* Hand (Right Side) */}
                    <div className="flex-[2] h-32 relative z-30">
                        <div className="absolute inset-x-0 bottom-[-10px] h-40 flex justify-center items-end gap-[-50px] px-8 hover:gap-[-10px] transition-all">
                            <div className="flex justify-center items-end -space-x-8 hover:-space-x-2 transition-all duration-300 w-full px-10">
                                {myHand.map((c, i) => (
                                    <div
                                        key={c.id}
                                        className="relative transform hover:-translate-y-8 hover:scale-110 hover:z-50 transition-all duration-200 cursor-pointer origin-bottom"
                                        style={{ marginBottom: i % 2 === 0 ? '0px' : '4px' }}
                                    >
                                        <GameCard
                                            cardState={c}
                                            cardData={cardsMap[c.masterId]}
                                            onClick={() => onCardClick(c.id)}
                                            isSelected={selectedCardId === c.id}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 bg-black/50 text-white text-xs px-2 rounded-bl">Hand: {myHand.length}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
