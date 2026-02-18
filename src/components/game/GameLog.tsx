import React, { useEffect, useState, useRef } from 'react';

interface GameLogProps {
    logs: string[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
    const [showHistory, setShowHistory] = useState(false);
    const [latestLog, setLatestLog] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Effect to show toast on new log
    useEffect(() => {
        if (logs.length > 0) {
            const newLog = logs[logs.length - 1];
            setLatestLog(newLog);
            setVisible(true);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setVisible(false);
            }, 3000);
        }
    }, [logs]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Auto-scroll history
    useEffect(() => {
        if (showHistory && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [showHistory, logs]);

    return (
        <>
            {/* Toast Notification (Bottom Left) */}
            <div
                className={`fixed bottom-24 left-4 z-50 transition-opacity duration-300 pointer-events-none ${visible ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="bg-slate-900/90 text-white px-4 py-2 rounded shadow-lg border-l-4 border-indigo-500 max-w-sm backdrop-blur-sm">
                    {latestLog}
                </div>
            </div>

            {/* Log History Button */}
            <button
                onClick={() => setShowHistory(!showHistory)}
                className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white px-3 py-2 rounded-full shadow-lg border border-slate-600 hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
                <span>📜</span>
                <span className="text-sm font-bold">Log</span>
                {logs.length > 0 && <span className="bg-red-500 text-xs rounded-full px-1.5 py-0.5">{logs.length}</span>}
            </button>

            {/* Log History Modal/Panel */}
            {showHistory && (
                <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={() => setShowHistory(false)}>
                    <div
                        className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 shadow-2xl border-l border-slate-700 flex flex-col pt-16 pb-20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-200">Battle Log History</h3>
                            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs text-slate-300" ref={scrollRef}>
                            {logs.map((log, i) => (
                                <div key={i} className="border-b border-slate-800 pb-1 last:border-0 border-l-2 border-transparent hover:border-indigo-500 pl-2 transition-colors">
                                    <span className="text-slate-500 mr-2">[{i + 1}]</span>
                                    {log}
                                </div>
                            ))}
                            {logs.length === 0 && <div className="text-center text-slate-600 italic">No logs yet.</div>}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
