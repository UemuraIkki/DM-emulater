import React from 'react';
import type { GameState, PlayerId } from '../../types/gameState';
import type { GameAction } from '../../logic/gameReducer';
import { Phase } from '../../types/gamePhase';

interface GameControlsProps {
    gameState: GameState;
    playerId: PlayerId;
    dispatch: React.Dispatch<GameAction>;
}

export const GameControls: React.FC<GameControlsProps> = ({ gameState, playerId, dispatch }) => {
    const { turnState } = gameState;
    const isMyTurn = turnState.activePlayerId === playerId;

    return (
        <div className="bg-slate-800 text-white p-2 flex flex-col gap-2 rounded shadow-lg border border-slate-700">
            {/* Turn Info */}
            <div className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400">TURN {turnState.turnNumber}</span>
                    <span className={`font-bold ${isMyTurn ? 'text-green-400' : 'text-red-400'}`}>
                        {isMyTurn ? 'YOUR TURN' : 'OPPONENT TURN'}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400">PHASE</span>
                    <span className="font-bold text-yellow-500">{turnState.phase}</span>
                </div>
            </div>

            {/* Main Controls - Block interaction if not my turn (optional for debug mode) */}
            <div className="flex gap-2">
                <button
                    onClick={() => dispatch({ type: 'NEXT_PHASE' })}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded font-bold text-sm transition-colors"
                >
                    NEXT PHASE
                </button>

                {turnState.phase !== Phase.START_OF_TURN && (
                    <button
                        onClick={() => {
                            // Fast forward to End Turn? Or just logic?
                            // Currently Reducer NEXT_PHASE handles transitions sequentially.
                            // We might need a "END_TURN" action or just spam next phase?
                            // For now, let's just use NEXT_PHASE as primary.
                            // Implementing specific loop here or in reducer is better.
                            // Let's assume user manually clicks Next Phase.
                        }}
                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-slate-300 py-2 px-4 rounded font-bold text-sm transition-colors opacity-50 cursor-not-allowed"
                        title="Use Next Phase"
                    >
                        END TURN
                    </button>
                )}
            </div>

            {/* Debug / Action Controls */}
            <div className="grid grid-cols-2 gap-2 mt-2 border-t border-slate-700 pt-2">
                <button
                    onClick={() => dispatch({ type: 'DRAW_CARD', payload: { playerId } })}
                    className="bg-indigo-700 hover:bg-indigo-600 text-xs py-1 px-2 rounded"
                >
                    DEBUG: Draw
                </button>
                <button
                    onClick={() => dispatch({ type: 'UNTAP_ALL', payload: { playerId } })}
                    className="bg-emerald-700 hover:bg-emerald-600 text-xs py-1 px-2 rounded"
                >
                    DEBUG: Untap All
                </button>
                <button
                    onClick={() => dispatch({ type: 'UNDO' })}
                    className="col-span-2 bg-gray-600 hover:bg-gray-500 text-xs py-1 px-2 rounded font-bold"
                >
                    UNDO
                </button>
            </div>
        </div>
    );
};
