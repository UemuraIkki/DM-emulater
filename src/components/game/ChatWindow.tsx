import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, PlayerId } from '../../types/gameState';

interface ChatWindowProps {
    messages: ChatMessage[];
    playerId: PlayerId;
    onSendMessage: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, playerId, onSendMessage }) => {
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            onSendMessage(inputText.trim());
            setInputText('');
        }
    };

    return (
        <div className="fixed top-16 right-4 w-72 h-48 flex flex-col bg-slate-900/90 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden backdrop-blur-sm">
            <div className="bg-slate-800 px-3 py-1 flex justify-between items-center text-xs text-slate-400 font-bold border-b border-slate-700">
                <span>CHAT</span>
                <span className="text-[10px] bg-slate-700 px-1 rounded ml-auto">{messages.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs text-slate-300" ref={scrollRef}>
                {messages.length === 0 && <div className="text-slate-600 text-center italic mt-4">Start chatting...</div>}
                {messages.map((msg) => {
                    const isMe = msg.senderId === playerId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-2 py-1 rounded break-words ${isMe ? 'bg-indigo-900/50 text-indigo-100' : 'bg-slate-800/80 text-slate-300'}`}>
                                {!isMe && <div className="text-[9px] text-slate-500 mb-0.5">{msg.senderId}</div>}
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-slate-700 p-1 flex bg-slate-800">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-slate-900 text-white text-xs px-2 py-1 rounded-l border border-slate-700 focus:border-indigo-500 focus:outline-none"
                    placeholder="Message..."
                />
                <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 rounded-r font-bold transition-colors"
                >
                    Send
                </button>
            </form>
        </div>
    );
};
