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
        <div className="bg-slate-800 text-white p-2 flex flex-col gap-2 rounded shadow-lg border border-slate-700 w-48">
            {/* Turn Info */}
            <div className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400">TURN {turnState.turnNumber}</span>
                    <span className={`font-bold ${isMyTurn ? 'text-green-400' : 'text-red-400'}`}>
                        {isMyTurn ? 'YOUR TURN' : 'OPPONENT'}
                    </span>
                </div>
            </div>

            {/* Main Controls */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={() => dispatch({ type: 'DRAW_CARD', payload: { playerId } })}
                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded font-bold text-sm transition-colors"
                >
                    DRAW CARD
                </button>

                <button
                    onClick={() => dispatch({ type: 'NEXT_PHASE' })}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white py-2 px-4 rounded font-bold text-sm transition-colors"
                >
                    END TURN (Pass Phase)
                </button>
            </div>

            {/* Utility Controls */}
            <div className="grid grid-cols-2 gap-2 mt-2 border-t border-slate-700 pt-2">
                <button
                    onClick={() => dispatch({ type: 'UNTAP_ALL', payload: { playerId } })}
                    className="bg-emerald-700 hover:bg-emerald-600 text-xs py-1 px-2 rounded"
                >
                    Untap All
                </button>
                <button
                    onClick={() => dispatch({ type: 'UNDO' })}
                    className="bg-gray-600 hover:bg-gray-500 text-xs py-1 px-2 rounded font-bold"
                >
                    UNDO
                </button>
            </div>

            {/* Surrender Button */}
            <div className="mt-2 text-center">
                <button
                    onClick={() => {
                        if (confirm("Are you sure you want to surrender?")) {
                            dispatch({ type: 'LOSE_GAME', payload: { playerId } });
                        }
                    }}
                    className="text-[10px] text-red-500 hover:text-red-400 hover:underline"
                >
                    Surrender
                </button>
            </div>
        </div>
    );
};
