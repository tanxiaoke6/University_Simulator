import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import {
    MessageCircle,
    Backpack,
    Globe,
    ChevronLeft,
    Send,
    Heart,
    Zap,
    Book
} from 'lucide-react';
import type { NPC } from '../types';

export default function Smartphone() {
    const { student, chatWithNPC, useItem } = useGameStore();
    const [activeApp, setActiveApp] = useState<'home' | 'wechat' | 'bag' | 'forum'>('home');
    const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);

    if (!student) return null;

    const renderHome = () => (
        <div className="grid grid-cols-3 gap-6 p-6 animate-fade-in">
            <button
                onClick={() => setActiveApp('wechat')}
                className="flex flex-col items-center gap-2 group"
            >
                <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-8 h-8" />
                </div>
                <span className="text-xs font-medium text-dark-200">微信</span>
            </button>

            <button
                onClick={() => setActiveApp('bag')}
                className="flex flex-col items-center gap-2 group"
            >
                <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Backpack className="w-8 h-8" />
                </div>
                <span className="text-xs font-medium text-dark-200">背包</span>
            </button>

            <button
                onClick={() => setActiveApp('forum')}
                className="flex flex-col items-center gap-2 group"
            >
                <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Globe className="w-8 h-8" />
                </div>
                <span className="text-xs font-medium text-dark-200">校内论坛</span>
            </button>
        </div>
    );

    const renderWeChat = () => (
        <div className="flex flex-col h-full animate-fade-in bg-dark-900/50 rounded-xl overflow-hidden">
            <header className="p-4 border-b border-dark-700 flex items-center gap-4 bg-dark-800">
                <button onClick={() => selectedNPC ? setSelectedNPC(null) : setActiveApp('home')}>
                    <ChevronLeft className="w-5 h-5 text-dark-400" />
                </button>
                <h3 className="font-bold text-sm">{selectedNPC ? selectedNPC.name : '微信 (Contacts)'}</h3>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {!selectedNPC ? (
                    student.npcs.map(npc => (
                        <button
                            key={npc.id}
                            onClick={() => setSelectedNPC(npc)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700 transition-colors border border-transparent hover:border-dark-600"
                        >
                            <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-dark-400">
                                {npc.name[0]}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-bold">{npc.name}</p>
                                <p className="text-[10px] text-dark-500">{npc.role}</p>
                            </div>
                            <div className="flex items-center gap-1 text-primary-400">
                                <Heart className="w-3 h-3 fill-current" />
                                <span className="text-xs">{npc.relationshipScore}</span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="space-y-4">
                        <div className="glass-card p-4 space-y-4 border-primary-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-xl">
                                    {selectedNPC.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{selectedNPC.name}</h4>
                                    <p className="text-xs text-dark-500">{selectedNPC.personality}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => chatWithNPC(selectedNPC.id)}
                                    disabled={student.attributes.stamina < 5}
                                    className="flex items-center justify-center gap-2 py-2 rounded-lg bg-primary-600/20 border border-primary-500/30 text-primary-400 hover:bg-primary-600/30 transition-all disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    <span className="text-xs font-bold">闲聊 (-5⚡)</span>
                                </button>
                                <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-dark-700 border border-dark-600 text-dark-300 opacity-50 cursor-not-allowed">
                                    <Globe className="w-4 h-4" />
                                    <span className="text-xs font-bold">约出 (等开发)</span>
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-dark-600">-- 发起聊天来增进感情吧 --</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderInventory = () => (
        <div className="flex flex-col h-full animate-fade-in bg-dark-900/50 rounded-xl overflow-hidden">
            <header className="p-4 border-b border-dark-700 flex items-center gap-4 bg-dark-800">
                <button onClick={() => setActiveApp('home')}>
                    <ChevronLeft className="w-5 h-5 text-dark-400" />
                </button>
                <h3 className="font-bold text-sm">我的背包 (Inventory)</h3>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
                {student.inventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-dark-600 gap-2">
                        <Backpack className="w-12 h-12 opacity-20" />
                        <p className="text-sm">空空如也</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {student.inventory.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="glass-card p-3 border-dark-700 hover:border-orange-500/30 transition-colors group">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                                        {item.category === 'food' ? <Zap className="w-4 h-4" /> : <Book className="w-4 h-4" />}
                                    </div>
                                    <span className="text-[9px] font-bold text-dark-500 uppercase">{item.rarity}</span>
                                </div>
                                <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                                <button
                                    onClick={() => useItem(item.id)}
                                    className="w-full mt-3 py-1.5 rounded-md bg-orange-600/20 text-orange-400 text-[10px] font-bold border border-orange-500/20 hover:bg-orange-600/30 transition-all"
                                >
                                    立即使用
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderForum = () => {
        const rumors = [
            "听说二食堂的红烧肉涨价了，真实度 80%...",
            "校草今天好像在图书馆表白成功了？",
            "这周的数学建模比赛题目太变态了吧！",
            "求问：哪位教授的期末考比较容易过？",
            "深夜宿舍楼传出异常响动，原来是有人在偷摸吃火锅...",
            "吐槽一下：图书馆的空调是坏了吗？热死了。",
            "急！求租一个校园电动车，有的私我。"
        ];

        return (
            <div className="flex flex-col h-full animate-fade-in bg-dark-900/50 rounded-xl overflow-hidden">
                <header className="p-4 border-b border-dark-700 flex items-center gap-4 bg-dark-800">
                    <button onClick={() => setActiveApp('home')}>
                        <ChevronLeft className="w-5 h-5 text-dark-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">校园论坛 (Campus Forum)</h3>
                        <p className="text-[10px] text-dark-500">当前在线: {Math.floor(Math.random() * 500) + 100}</p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {rumors.map((r, i) => (
                        <div key={i} className="p-3 bg-dark-800/40 rounded-lg border border-dark-700/50">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[8px] text-blue-400">#</div>
                                <span className="text-[10px] font-bold text-dark-400">校园八卦_{i + 102}</span>
                            </div>
                            <p className="text-xs text-dark-200">{r}</p>
                        </div>
                    ))}
                    <p className="text-[10px] text-center text-dark-600 py-4 italic">加载更多内容...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-sm mx-auto h-[480px] bg-dark-950 rounded-[40px] border-[8px] border-dark-800 shadow-2xl overflow-hidden flex flex-col group/phone">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-dark-800 rounded-b-xl z-20 flex items-center justify-center">
                <div className="w-12 h-1 bg-dark-900 rounded-full" />
            </div>

            {/* Status Bar */}
            <div className="h-10 px-6 pt-6 flex justify-between items-center z-10">
                <span className="text-[10px] font-bold text-white">09:41</span>
                <div className="flex gap-1 items-center">
                    <div className="w-3 h-3 bg-white/20 rounded-sm" />
                    <div className="w-5 h-2.5 bg-green-500 rounded-sm border border-white/20" />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeApp === 'home' && renderHome()}
                {activeApp === 'wechat' && renderWeChat()}
                {activeApp === 'bag' && renderInventory()}
                {activeApp === 'forum' && renderForum()}
            </div>

            {/* Home Indicator */}
            <div className="h-6 flex items-center justify-center shrink-0">
                <button
                    onClick={() => setActiveApp('home')}
                    className="w-1/3 h-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                />
            </div>
        </div>
    );
}
