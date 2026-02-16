

const BattleRoom = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-100">
            <div className="max-w-md text-center">
                <h1 className="text-4xl font-bold text-slate-800 mb-4">対戦ルーム</h1>
                <p className="text-xl text-slate-600 mb-8">オンライン対戦は近日公開予定！</p>
                <div className="p-6 bg-white rounded-lg shadow-lg border border-slate-200">
                    <p className="text-gray-500">
                        この機能は現在開発中です。アップデートをお待ちください。
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BattleRoom;
