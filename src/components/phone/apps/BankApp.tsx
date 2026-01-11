import { useGameStore } from '../../../stores/gameStore';
import { usePhoneStore } from '../../../stores/phoneStore';
import { PiggyBank, X, TrendingUp, TrendingDown, CreditCard, PieChart } from 'lucide-react';
import { format } from 'date-fns'; // We might not have date-fns, use simple formatter

export default function BankApp() {
    const { student } = useGameStore();
    const { closeApp } = usePhoneStore();

    if (!student) return null;

    const { wallet, money } = student;
    const transactions = wallet?.transactions || [];

    // Combine cash and bank? No, just bank generally. But here we assume 'money' is Cash + Bank available.
    // Actually student.money is the main currency. accessing wallet.balance usually implies specific bank account.
    // Let's assume student.money is the total unified liquid assets for simplicity in Phase 1-2.

    return (
        <div className="flex flex-col h-full bg-red-600 text-white animate-fade-in relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-red-500 opacity-50" />
            <div className="absolute top-20 -left-10 w-32 h-32 rounded-full bg-red-700 opacity-50" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 relative z-10">
                <div className="flex items-center gap-2">
                    <PiggyBank className="w-6 h-6" />
                    <span className="font-bold text-lg">招商银行</span>
                </div>
                <button onClick={closeApp} className="p-1 rounded-full hover:bg-red-700 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Balance Card */}
            <div className="px-4 pb-6 relative z-10">
                <div className="text-white/80 text-xs mb-1">总资产 (CNY)</div>
                <div className="text-3xl font-bold mb-4 font-mono">¥ {student.money.toLocaleString()}</div>

                <div className="flex gap-3">
                    <button className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                        <CreditCard className="w-3 h-3" />
                        转账
                    </button>
                    <button className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                        <PieChart className="w-3 h-3" />
                        理财
                    </button>
                </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 bg-slate-50 rounded-t-[30px] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col relative z-10">
                <div className="p-5 pb-2">
                    <h3 className="text-slate-900 font-bold text-sm">收支明细</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 pt-0 no-scrollbar">
                    {transactions.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs py-10">
                            暂无交易记录
                        </div>
                    ) : (
                        [...transactions].reverse().map((t, i) => (
                            <div key={t.id || i} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                        {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-900 line-clamp-1">{t.description}</div>
                                        <div className="text-[10px] text-slate-400">Year {t.timestamp?.year || 1} Week {t.timestamp?.week || 1}</div>
                                    </div>
                                </div>
                                <div className={`text-sm font-bold font-mono ${t.type === 'income' ? 'text-red-500' : 'text-green-600'}`}>
                                    {t.type === 'income' ? '+' : '-'}{t.amount}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
