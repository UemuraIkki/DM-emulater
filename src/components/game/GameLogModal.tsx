
import React, { useRef, useEffect } from 'react';

interface GameLogModalProps {
    logs: string[];
    onClose: () => void;
}

export const GameLogModal: React.FC<GameLogModalProps> = ({ logs, onClose }) => {
    const endRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on mount
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-600 rounded-lg shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
                    <h3 className="text-white font-bold tracking-wider">GAME LOGS</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Log Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-black/40 font-mono text-xs">
                    {logs.length === 0 && (
                        <div className="text-slate-500 text-center mt-10">No logs recorded.</div>
                    )}
                    {logs.map((log, index) => (
                        <div key={index} className="text-slate-300 border-l-2 border-slate-700 pl-2 py-0.5 hover:bg-white/5 transition-colors">
                            <span className="text-slate-500 mr-2">[{index + 1}]</span>
                            {log}
                        </div>
                    ))}
                    <div ref={endRef} />
                </div>
            </div>
        </div>
    );
};
