import { useGameStore } from '../../../stores/gameStore';
import { usePhoneStore } from '../../../stores/phoneStore';
import { Package, X, Zap, Gift, Shirt, Book } from 'lucide-react';
import type { Item, ItemCategory } from '../../../types';

export default function InventoryApp() {
    const { student } = useGameStore();
    const { closeApp } = usePhoneStore();

    if (!student) return null;

    const items = student.inventory || [];

    const getRarityColor = (rarity: Item['rarity']) => {
        switch (rarity) {
            case 'epic': return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
            case 'rare': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
            case 'uncommon': return 'text-green-400 border-green-500/50 bg-green-500/10';
            default: return 'text-dark-300 border-dark-700 bg-dark-800/50';
        }
    };

    const getCategoryIcon = (cat: ItemCategory) => {
        switch (cat) {
            case 'food': return Zap;
            case 'gift': return Gift;
            case 'clothing': return Shirt;
            case 'book': return Book;
            default: return Package;
        }
    };

    return (
        <div className="flex flex-col h-full bg-dark-950 text-white animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold">我的背包</h2>
                        <div className="text-[10px] text-dark-500">{items.length} / 50 物品</div>
                    </div>
                </div>
                <button onClick={closeApp} className="p-1 rounded-full hover:bg-dark-800 text-dark-400 transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-dark-500 space-y-2">
                        <Package className="w-12 h-12 opacity-20" />
                        <p className="text-xs">背包空空如也...</p>
                        <p className="text-[10px] text-dark-600">快去「购物」APP 买点东西吧</p>
                    </div>
                ) : (
                    items.map((item, idx) => {
                        const Icon = getCategoryIcon(item.category);
                        return (
                            <div
                                key={`${item.id}_${idx}`}
                                className={`p-3 rounded-xl border flex gap-3 items-start transition-all hover:bg-white/5 ${getRarityColor(item.rarity)}`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-dark-950/30 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 opacity-80" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="text-xs font-bold truncate">{item.name}</h3>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 bg-black/20 font-mono">
                                            ¥{item.value}
                                        </span>
                                    </div>
                                    <p className="text-[10px] opacity-70 line-clamp-2 leading-relaxed">
                                        {item.description}
                                    </p>

                                    {/* Usage Hint (Phase 4 placeholder) */}
                                    {item.usageType === 'consumable' && (
                                        <div className="mt-2 flex justify-end">
                                            <button className="text-[9px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white transition-colors cursor-pointer">
                                                使用
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
