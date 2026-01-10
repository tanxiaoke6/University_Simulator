import { useGameStore } from '../stores/gameStore';
import { ITEMS } from '../data/items';
import {
    X,
    ShoppingCart,
    Tag,
    Zap,
    Book,
    Smartphone,
    Gift,
    Package
} from 'lucide-react';
import type { Item } from '../types';

interface ShoppingModalProps {
    onClose: () => void;
}

export default function ShoppingModal({ onClose }: ShoppingModalProps) {
    const { student, updateStudent } = useGameStore();

    if (!student) return null;

    const handleBuy = (item: Item) => {
        if (student.money < item.value) {
            alert('钱不够了！去打工攒攒钱吧。');
            return;
        }

        const newMoney = student.money - item.value;
        const newInventory = [...student.inventory, item];

        updateStudent({
            money: newMoney,
            inventory: newInventory
        });

        // Optional: Simple feedback
        console.log(`Bought ${item.name}`);
    };



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-dark-950/60 animate-fade-in">
            <div className="max-w-4xl w-full glass-card h-[80vh] flex flex-col overflow-hidden border-primary-500/30">
                {/* Header */}
                <div className="p-6 border-b border-dark-800 flex items-center justify-between bg-dark-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white tracking-tight">学校超市</h2>
                            <p className="text-xs text-dark-400">金钱不仅仅是数字，更是资源。</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full border border-dark-700">
                            <span className="text-xs font-bold text-dark-500">我的余额</span>
                            <span className="text-sm font-mono font-bold text-green-400">¥{student.money}</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-dark-400" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ITEMS.map((item) => (
                            <div
                                key={item.id}
                                className="group relative glass-card-light p-5 border-dark-700 hover:border-primary-500/50 transition-all hover:bg-dark-800/40"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2 rounded-lg bg-dark-800 text-dark-400`}>
                                        {item.category === 'food' && <Zap className="w-5 h-5" />}
                                        {item.category === 'book' && <Book className="w-5 h-5" />}
                                        {item.category === 'electronics' && <Smartphone className="w-5 h-5" />}
                                        {item.category === 'gift' && <Gift className="w-5 h-5" />}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-lg font-mono font-bold text-green-400">¥{item.value}</span>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border mt-1 ${item.rarity === 'common' ? 'text-dark-400 border-dark-700' :
                                            item.rarity === 'uncommon' ? 'text-blue-400 border-blue-500/30' :
                                                item.rarity === 'rare' ? 'text-purple-400 border-purple-500/30' :
                                                    'text-amber-400 border-amber-500/30'
                                            }`}>
                                            {item.rarity}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-dark-100 group-hover:text-white transition-colors">{item.name}</h3>
                                <p className="text-xs text-dark-500 mt-2 line-clamp-2 h-8">{item.description}</p>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex flex-wrap gap-1">
                                        {item.effects.map((eff, i) => (
                                            <span key={i} className="text-[10px] bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded border border-primary-500/20">
                                                {eff.target === 'stamina' ? '体力' : eff.target === 'stress' ? '压力' : eff.target === 'iq' ? '智力' : eff.target}+{eff.value}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handleBuy(item)}
                                        className="action-btn-primary py-1.5 px-3 text-xs"
                                    >
                                        购买
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer / My Inventory Hint */}
                <div className="p-4 border-t border-dark-800 bg-dark-950/80 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-3 text-dark-500 text-xs">
                        <Package className="w-4 h-4" />
                        <span>我的包裹: {student.inventory.length} 件物品</span>
                    </div>
                    <p className="text-[10px] text-dark-600 italic">物品可以在右侧栏“我的包裹”中使用。</p>
                </div>
            </div>
        </div>
    );
}
