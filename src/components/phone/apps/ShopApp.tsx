import { useGameStore } from '../../../stores/gameStore';
import { usePhoneStore } from '../../../stores/phoneStore';
import { ITEMS } from '../../../data/items';
import {
    ChevronLeft,
    ShoppingCart,
    Zap,
    Book,
    Smartphone as PhoneIcon,
    Gift,
    Package,
    Search
} from 'lucide-react';
import type { Item } from '../../../types';

export default function ShopApp() {
    const { student, updateStudent, addNotification } = useGameStore();
    const { closeApp } = usePhoneStore();

    if (!student) return null;

    const handleBuy = (item: Item) => {
        if (student.money < item.value) {
            addNotification('钱不够了！去打工攒攒钱吧。', 'error');
            return;
        }

        const newMoney = student.money - item.value;
        const newInventory = [...student.inventory, item];

        updateStudent({
            money: newMoney,
            inventory: newInventory
        });

        addNotification(`成功购买 ${item.name}`, 'success');
    };

    return (
        <div className="flex flex-col h-full bg-dark-950 text-white animate-fade-in pb-12">
            {/* Header */}
            <header className="p-4 border-b border-dark-800 flex items-center gap-3 bg-dark-900/50 sticky top-0 z-10 backdrop-blur-md">
                <button onClick={closeApp} className="p-1 -ml-1 hover:bg-dark-800 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-dark-400" />
                </button>
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary-500" />
                    <h2 className="font-bold text-sm">校园超市</h2>
                </div>
                <div className="flex-1" />
                <div className="px-2 py-1 bg-dark-800 rounded-lg border border-dark-700">
                    <span className="text-[10px] font-mono font-bold text-green-400">¥{student.money}</span>
                </div>
            </header>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {ITEMS.map((item) => (
                    <div
                        key={item.id}
                        className="p-3 bg-dark-900/50 border border-dark-800 rounded-xl flex items-center justify-between gap-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 shrink-0">
                                {item.category === 'food' && <Zap className="w-5 h-5" />}
                                {item.category === 'book' && <Book className="w-5 h-5" />}
                                {item.category === 'electronics' && <PhoneIcon className="w-5 h-5" />}
                                {item.category === 'gift' && <Gift className="w-5 h-5" />}
                                {(!item.category || item.category === 'misc') && <Package className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-[13px] font-bold truncate">{item.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-green-400 font-bold">¥{item.value}</span>
                                    <span className="text-[8px] text-dark-500 uppercase px-1 border border-dark-700 rounded">
                                        {item.rarity}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleBuy(item)}
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 shrink-0"
                        >
                            购买
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer Status */}
            <div className="p-3 border-t border-dark-800 bg-dark-900/80 backdrop-blur-md flex items-center justify-between text-[10px] text-dark-400">
                <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>包裹: {student.inventory.length}</span>
                </div>
                <div className="flex items-center gap-1.5 italic">
                    <Search className="w-3.5 h-3.5" />
                    <span>正品保障 极速送达</span>
                </div>
            </div>
        </div>
    );
}
