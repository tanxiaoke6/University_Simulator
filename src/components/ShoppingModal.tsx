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
                        <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-lg transition-colors cursor-pointer group">
                            <X className="w-6 h-6 text-dark-400 group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-4">
                    {ITEMS.map((item) => (
                        <div
                            key={item.id}
                            className="group relative glass-card-light p-5 border-dark-700 flex items-center justify-between transition-all hover:bg-dark-800/40 hover:border-primary-500/30"
                        >
                            <div className="flex gap-4 items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-dark-800 text-dark-400 group-hover:scale-110 transition-transform`}>
                                    {item.category === 'food' && <Zap className="w-6 h-6" />}
                                    {item.category === 'book' && <Book className="w-6 h-6" />}
                                    {item.category === 'electronics' && <Smartphone className="w-6 h-6" />}
                                    {item.category === 'gift' && <Gift className="w-6 h-6" />}
                                    {(!item.category || item.category === 'misc') && <Package className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-dark-100 group-hover:text-white transition-colors">{item.name}</h3>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${item.rarity === 'common' ? 'text-dark-400 border-dark-700' :
                                            item.rarity === 'uncommon' ? 'text-blue-400 border-blue-500/30' :
                                                item.rarity === 'rare' ? 'text-purple-400 border-purple-500/30' :
                                                    'text-amber-400 border-amber-500/30'
                                            }`}>
                                            {item.rarity}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-xs text-dark-500 line-clamp-1 max-w-[300px]">{item.description}</p>
                                        <div className="flex gap-1">
                                            {item.effects.map((eff, i) => (
                                                <span key={i} className="text-[10px] bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded border border-primary-500/20 whitespace-nowrap">
                                                    {eff.target === 'stamina' ? '体力' : eff.target === 'stress' ? '压力' : eff.target === 'iq' ? '智力' : eff.target}+{eff.value}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="text-lg font-mono font-bold text-green-400">¥{item.value}</span>
                                    <p className="text-[10px] text-dark-500 uppercase tracking-widest">售价</p>
                                </div>

                                <button
                                    onClick={() => handleBuy(item)}
                                    className="action-btn-primary bg-primary-600 hover:bg-primary-500 py-2 px-6 shadow-lg shadow-primary-900/40"
                                >
                                    购买
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / My Inventory Hint */}
                <div className="p-4 border-t border-dark-800 bg-dark-950/80 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-3 text-dark-500 text-xs">
                        <Package className="w-4 h-4" />
                        <span>我的包裹: {student.inventory.length} 件物品</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary-500" />
                        <p className="text-[10px] text-dark-600 italic">物品可以在右侧栏“我的包裹”中使用。</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
