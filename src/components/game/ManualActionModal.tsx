import React from 'react';
import type { UnifiedCard } from '../../types/card-master';
import { ZoneId } from '../../types/gameState';

interface ManualActionModalProps {
    card: UnifiedCard;
    cardId: string; // Instance ID
    currentZone: ZoneId;
    onClose: () => void;
    onAction: (targetZone: ZoneId, options?: { tapped?: boolean, faceDown?: boolean, executionMessage?: string, amount?: number }) => void;
}

export const ManualActionModal: React.FC<ManualActionModalProps> = ({ card, cardId, currentZone, onClose, onAction }) => {

    // Helper to generate buttons
    const ActionButton = ({ label, zone, options, className }: { label: string, zone: ZoneId, options?: any, className?: string }) => (
        <button
            onClick={() => onAction(zone, options)}
            className={`w-full text-left px-3 py-2 text-xs font-bold rounded hover:bg-opacity-80 transition-colors ${className}`}
        >
            {label}
        </button>
    );

    // === DEBUG: Force Console Logging of Raw Data ===
    console.log("=== INSPECTING CARD DATA ===", card);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[1px]" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-[90%] max-w-sm overflow-hidden flex" onClick={e => e.stopPropagation()}>

                {/* Left: Card Preview (Mini) */}
                <div className="w-1/3 bg-black/30 p-2 flex flex-col items-center border-r border-slate-700 overflow-y-auto">
                    {/* Placeholder for Card Image if available, else Name */}
                    <div className="text-center mb-2 w-full">
                        <div className="text-[10px] text-slate-500 mb-1">{card.id}</div>
                        {/* Multi-sided Render */}
                        {card.sides && card.sides.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {card.sides.map((side, idx) => (
                                    <div key={idx} className="border-b border-slate-600 pb-2 last:border-0">
                                        <div className="font-bold text-slate-200 text-sm mb-1">{side.name}</div>
                                        <div className="text-[10px] text-slate-400">
                                            <div>Cost: {side.cost}</div>
                                            <div>Civ: {side.civilizations?.join('/') ?? "N/A"}</div>
                                            <div>Type: {side.type}</div>
                                        </div>
                                        {side.power !== undefined && (
                                            <div className="text-xs font-bold text-yellow-500">
                                                Power: {side.power}
                                            </div>
                                        )}
                                        <div className="text-[10px] text-slate-300 leading-tight whitespace-pre-wrap text-left w-full mt-1">
                                            {side.text || "No abilities found."}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Fallback for Single Side (should rarely happen if normalizeCards works, but good safety) */
                            <>
                                <div className="font-bold text-slate-200 text-sm mb-1">{card.name || "Unknown Name"}</div>
                                <div className="text-[10px] text-slate-400">
                                    <div>Cost: {card.mainPart?.cost ?? "N/A"}</div>
                                    <div>Civ: {card.mainPart?.civilization ?? "N/A"}</div>
                                </div>
                                {(card.mainPart?.power) && (
                                    <div className="text-xs font-bold text-yellow-500">
                                        Power: {card.mainPart?.power}
                                    </div>
                                )}
                                <div className="text-[10px] text-slate-300 leading-tight whitespace-pre-wrap text-left w-full px-1 border-t border-slate-700 pt-2 mt-2">
                                    {card.mainPart?.text || "No abilities found."}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex-1 flex flex-col max-h-[80vh] overflow-y-auto">
                    <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Manual Actions</span>
                        <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
                    </div>

                    <div className="p-2 space-y-3">
                        {/* Special Context Actions */}
                        {currentZone === ZoneId.HYPER_SPATIAL && (
                            <div className="space-y-1 mb-2">
                                <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Hyper Spatial</div>
                                <ActionButton
                                    label="To Battle Zone (Force)"
                                    zone={ZoneId.BATTLE_ZONE}
                                    options={{ executionMessage: 'Called from Hyper Spatial', force: true }}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-3 font-bold shadow-lg shadow-indigo-500/20"
                                />
                            </div>
                        )}

                        {/* Battle Zone Operations */}
                        <div className="space-y-1">
                            <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Battle Zone</div>
                            <ActionButton
                                label="Summon / Cast (Execute)"
                                zone={ZoneId.BATTLE_ZONE}
                                options={{ executionMessage: 'Summoned/Cast' }}
                                className="bg-green-700 text-white"
                            />
                            <ActionButton
                                label="Put (No Effect)"
                                zone={ZoneId.BATTLE_ZONE}
                                options={{ executionMessage: 'Put into Battle Zone' }}
                                className="bg-slate-700 text-slate-300"
                            />
                        </div>

                        {/* Grave / Hand / Mana */}
                        <div className="space-y-1">
                            <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Move To</div>
                            <div className="grid grid-cols-2 gap-1">
                                <ActionButton label="Mana (Tap)" zone={ZoneId.MANA} options={{ tapped: true }} className="bg-slate-700 text-slate-300" />
                                <ActionButton label="Mana (Untap)" zone={ZoneId.MANA} className="bg-slate-700 text-slate-300" />
                                <ActionButton label="Hand" zone={ZoneId.HAND} className="bg-blue-900/50 text-blue-200" />
                                <ActionButton label="Graveyard" zone={ZoneId.GRAVEYARD} className="bg-red-900/50 text-red-200" />
                            </div>
                        </div>

                        {/* Shields / Deck */}
                        <div className="space-y-1">
                            <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Special Zones</div>
                            <div className="grid grid-cols-2 gap-1">
                                <ActionButton label="Shield (Top)" zone={ZoneId.SHIELD} options={{ faceDown: true }} className="bg-yellow-900/40 text-yellow-200" />
                                <ActionButton label="Deck Top" zone={ZoneId.DECK} options={{ faceDown: true }} className="bg-slate-700 text-slate-300" />
                                <ActionButton label="Hyper Spatial" zone={ZoneId.HYPER_SPATIAL} className="bg-indigo-900 text-indigo-200" />
                            </div>
                        </div>

                        {/* State Control */}
                        <div className="space-y-1 border-t border-slate-700 pt-1">
                            <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Status Modifier</div>
                            <div className="grid grid-cols-2 gap-1">
                                <button onClick={() => onAction('TOGGLE_TAP' as ZoneId)} className="w-full text-center px-2 py-1 bg-slate-600 text-xs font-bold rounded">Tap / Untap</button>
                                <button onClick={() => onAction('RESET_CARD' as ZoneId)} className="w-full text-center px-2 py-1 bg-red-800 text-xs font-bold rounded">Reset Status</button>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <button onClick={() => onAction('MODIFY_POWER' as ZoneId, { amount: 1000 })} className="bg-green-800 text-[10px] font-bold py-1 rounded">+1000</button>
                                <button onClick={() => onAction('MODIFY_POWER' as ZoneId, { amount: 5000 })} className="bg-green-700 text-[10px] font-bold py-1 rounded">+5000</button>
                                <button onClick={() => onAction('MODIFY_POWER' as ZoneId, { amount: -5000 })} className="bg-red-900 text-[10px] font-bold py-1 rounded">-5000</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
