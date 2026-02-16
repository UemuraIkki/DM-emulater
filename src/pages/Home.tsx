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
                    最強のデッキを構築し、メタを分析し、オンラインで対戦しよう。
                    ウェブで生まれ変わったクラシックなTCG体験。
                </p>
                <Link
                    to="/deck-builder"
                    className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
                >
                    デッキ作成を始める
                </Link>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Deck Builder Card */}
                    <Link to="/deck-builder" className="group">
                        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-blue-500 transition-colors h-full flex flex-col shadow-xl">
                            <div className="text-4xl mb-4">🃏</div>
                            <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">デッキ構築</h2>
                            <p className="text-slate-400 flex-1">
                                高度な検索、直感的な操作、そして充実したデッキ管理ツール。
                            </p>
                        </div>
                    </Link>

                    {/* Battle Room Card */}
                    <Link to="/battle" className="group">
                        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-red-500 transition-colors h-full flex flex-col shadow-xl">
                            <div className="text-4xl mb-4">⚔️</div>
                            <h2 className="text-2xl font-bold mb-2 group-hover:text-red-400 transition-colors">対戦ルーム</h2>
                            <p className="text-slate-400 flex-1">
                                世界中のプレイヤーと接続。リアルタイムのオンライン対戦でデッキを試そう。
                            </p>
                        </div>
                    </Link>

                    {/* History Card */}
                    <Link to="/history" className="group">
                        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-green-500 transition-colors h-full flex flex-col shadow-xl">
                            <div className="text-4xl mb-4">📜</div>
                            <h2 className="text-2xl font-bold mb-2 group-hover:text-green-400 transition-colors">対戦履歴</h2>
                            <p className="text-slate-400 flex-1">
                                過去の試合を振り返り、勝率を分析し、戦略を練り直そう。
                            </p>
                        </div>
                    </Link>

                </div>
            </section>
        </div>
    );
};

export default Home;
