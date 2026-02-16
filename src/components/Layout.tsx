import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
            {/* Header */}
            <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Logo / Title */}
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="text-xl font-bold tracking-wider">DM Vault Clone</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-1 md:gap-4">
                        <NavLink to="/" active={isActive('/')}>ホーム</NavLink>
                        <NavLink to="/deck-builder" active={isActive('/deck-builder')}>デッキ構築</NavLink>
                        <NavLink to="/battle" active={isActive('/battle')}>対戦ルーム</NavLink>
                        <NavLink to="/history" active={isActive('/history')}>履歴</NavLink>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
};

const NavLink: React.FC<{ to: string; active: boolean; children: React.ReactNode }> = ({ to, active, children }) => (
    <Link
        to={to}
        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${active
            ? 'bg-slate-800 text-white'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
    >
        {children}
    </Link>
);
