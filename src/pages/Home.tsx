import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex-1 bg-slate-900 text-white">
            {/* Hero Section */}
            <section className="py-20 px-8 text-center bg-gradient-to-b from-slate-900 to-slate-800">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                    Duel Masters <span className="text-blue-400">Vault Clone</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-10">
                    Build the ultimate deck, analyze the meta, and battle online.
                    The classic TCG experience, reimagined for the web.
                </p>
                <Link
                    to="/deck-builder"
                    className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
                >
                    Start Building
                </Link>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Deck Builder Card */}
                    <Link to="/deck-builder" className="group">
                        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-blue-500 transition-colors h-full flex flex-col shadow-xl">
                            <div className="text-4xl mb-4">🃏</div>
                            <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Deck Builder</h2>
                            <p className="text-slate-400 flex-1">
                                Advanced search, intuitive drag-and-drop (coming soon), and comprehensive deck management tools.
                            </p>
                        </div>
                    </Link>

                    {/* Battle Room Card */}
                    <Link to="/battle" className="group">
                        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-red-500 transition-colors h-full flex flex-col shadow-xl">
                            <div className="text-4xl mb-4">⚔️</div>
                            <h2 className="text-2xl font-bold mb-2 group-hover:text-red-400 transition-colors">Battle Room</h2>
                            <p className="text-slate-400 flex-1">
                                Connect with players worldwide. Test your decks in real-time online battles.
                            </p>
                        </div>
                    </Link>

                    {/* History Card */}
                    <Link to="/history" className="group">
                        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-green-500 transition-colors h-full flex flex-col shadow-xl">
                            <div className="text-4xl mb-4">📜</div>
                            <h2 className="text-2xl font-bold mb-2 group-hover:text-green-400 transition-colors">Battle History</h2>
                            <p className="text-slate-400 flex-1">
                                Review your past matches, analyze win rates, and refine your strategies.
                            </p>
                        </div>
                    </Link>

                </div>
            </section>
        </div>
    );
};

export default Home;
