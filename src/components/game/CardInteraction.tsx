import React from 'react';
import type { GameState } from '../../types/gameState';
import type { UnifiedCard } from '../../types/card-master';
import { ZoneId } from '../../types/gameState';

interface CardInteractionProps {
    gameState: GameState;
    selectedCardId: string;
    cardsMap: Record<string, UnifiedCard>;
    playerId: string;
    onAction: (actionType: 'MANA' | 'PLAY' | 'TAP' | 'DISCARD' | 'BREAK_SHIELD') => void;
    onClose: () => void;
}

export const CardInteraction: React.FC<CardInteractionProps> = ({
    gameState,
    selectedCardId,
    cardsMap,
    playerId,
    onAction,
    onClose
}) => {
    const card = gameState.cards[selectedCardId];
    if (!card) return null;

    // Check ownership/control.
    const isMine = card.ownerId === playerId;

    if (!isMine) return null;

    // Determine Display Name
    const isHidden = card.zone === ZoneId.SHIELD || card.faceDown;
    const displayName = isHidden ? 'Face Down Card' : (cardsMap[card.masterId]?.name || 'Unknown Card');

    return (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 p-4 rounded-lg shadow-xl border border-indigo-200 flex gap-4 z-50">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase">Selected:</span>
                <span className="font-bold">{displayName}</span>
            </div>

            <div className="flex items-center gap-2">
                {/* Break Shield Action */}
                {card.zone === ZoneId.SHIELD && (
                    <button
                        onClick={() => onAction('BREAK_SHIELD')}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded text-sm font-bold shadow-sm"
                    >
                        Break Shield
                    </button>
                )}

                {/* Hand Actions */}
                {card.zone === ZoneId.HAND && (
                    <>
                        <button
                            onClick={() => onAction('MANA')}
                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm font-bold shadow-sm"
                        >
                            Charge Mana
                        </button>
                        <button
                            onClick={() => onAction('PLAY')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold shadow-sm"
                        >
                            Play
                        </button>
                        <button
                            onClick={() => onAction('DISCARD')}
                            className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-sm font-bold shadow-sm"
                        >
                            Discard
                        </button>
                    </>
                )}

                {/* Battle Zone Actions */}
                {card.zone === ZoneId.BATTLE_ZONE && !card.tapped && !isHidden && (
                    <button
                        onClick={() => onAction('TAP')}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-bold shadow-sm"
                    >
                        Tap / Attack
                    </button>
                )}

                {/* Mana Zone Actions */}
                {card.zone === ZoneId.MANA && !card.tapped && !isHidden && (
                    <button
                        onClick={() => onAction('TAP')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-sm font-bold shadow-sm"
                    >
                        Tap for Mana
                    </button>
                )}

                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 ml-2 font-bold text-lg"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};
