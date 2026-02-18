import React from 'react';
import type { UnifiedCard } from '../../types/card-master';
import { ZoneId } from '../../types/gameState';

interface ManualActionModalProps {
    card: UnifiedCard;
    cardId: string; // Instance ID
    currentZone: ZoneId;
    onClose: () => void;
    onAction: (targetZone: ZoneId, options?: { tapped?: boolean, faceDown?: boolean, executionMessage?: string }) => void;
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[1px]" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-[90%] max-w-sm overflow-hidden flex" onClick={e => e.stopPropagation()}>

                {/* Left: Card Preview (Mini) */}
                <div className="w-1/3 bg-black/30 p-2 flex items-center justify-center border-r border-slate-700">
                    {/* Placeholder for Card Image if available, else Name */}
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 mb-1">{card.id}</div>
                        <div className="font-bold text-slate-200 text-sm">{card.name}</div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex-1 flex flex-col max-h-[80vh] overflow-y-auto">
                    <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Manual Actions</span>
                        <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
                    </div>

                    <div className="p-2 space-y-3">
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
