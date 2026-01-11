import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../../stores/gameStore';
import { usePhoneStore } from '../../../stores/phoneStore';
import { MessageCircle, Search, Heart, User, Users, Send, ChevronLeft, Loader2 } from 'lucide-react';

export default function SocialApp() {
    const { student, sendChatMessage, finishChat } = useGameStore();
    const { closeApp } = usePhoneStore();
    const [selectedNPCId, setSelectedNPCId] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    if (!student) return null;

    const npcs = student.npcs || [];
    const selectedNPC = selectedNPCId ? npcs.find(n => n.id === selectedNPCId) : null;

    // Scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedNPC?.chatHistory]);

    const handleBack = () => {
        if (selectedNPCId) {
            finishChat(selectedNPCId);
            setSelectedNPCId(null);
        } else {
            closeApp();
        }
    };

    const handleSendMessage = async () => {
        if (!selectedNPCId || !chatInput.trim() || isSending) return;
        const msg = chatInput.trim();
        setChatInput('');
        setIsSending(true);
        try {
            await sendChatMessage(selectedNPCId, msg);
        } finally {
            setIsSending(false);
        }
    };

    const sortedNPCs = [...npcs].sort((a, b) => b.relationshipScore - a.relationshipScore);

    if (selectedNPC) {
        return (
            <div className="flex flex-col h-full bg-[#f2f2f2] text-slate-900 animate-fade-in relative z-10">
                <header className="flex items-center justify-between p-3 bg-[#ededed] border-b border-slate-300 shrink-0">
                    <div className="flex items-center gap-2">
                        <button onClick={handleBack} className="p-1 -ml-1 hover:bg-slate-200 rounded-full">
                            <ChevronLeft className="w-5 h-5 text-slate-700" />
                        </button>
                        <span className="font-bold text-sm truncate max-w-[150px]">{selectedNPC.name}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {selectedNPC.chatHistory?.length === 0 && (
                        <div className="text-center text-[10px] text-slate-400 py-4">
                            这里还很安静，试着说点什么吧
                        </div>
                    )}
                    {selectedNPC.chatHistory?.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center text-xs font-bold text-white ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                                    {msg.role === 'user' ? student.name[0] : (selectedNPC.avatar || selectedNPC.name[0])}
                                </div>
                                <div className={`px-3 py-2 rounded-lg text-xs leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-[#95ec69] text-slate-900 rounded-tr-none'
                                    : 'bg-white text-slate-900 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isSending && (
                        <div className="flex justify-start">
                            <div className="bg-white px-3 py-2 rounded-lg rounded-tl-none shadow-sm">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-2 bg-[#f7f7f7] border-t border-slate-300 shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="输入消息..."
                            className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-green-500"
                            disabled={isSending}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim() || isSending}
                            className={`px-3 py-2 rounded-md transition-colors ${chatInput.trim() ? 'bg-[#07c160] text-white' : 'bg-slate-200 text-slate-400'
                                }`}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 text-slate-900 animate-fade-in shadow-inner relative z-10">
            {/* Header (WeChat Style) */}
            <div className="flex items-center gap-3 p-3 bg-slate-100 border-b border-slate-300 sticky top-0 z-10">
                <button
                    onClick={closeApp}
                    className="p-1 -ml-1 hover:bg-slate-200 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <span className="font-bold text-sm">微信 ({npcs.length})</span>
                <div className="flex-1" />
                <Search className="w-5 h-5 text-slate-600" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                {/* Search Bar Placeholder */}
                <div className="p-2 bg-slate-100">
                    <div className="bg-white rounded-md p-1.5 flex items-center justify-center gap-1 text-slate-400 text-[10px]">
                        <Search className="w-3 h-3" />
                        <span>搜索</span>
                    </div>
                </div>

                {/* NPC List */}
                <div>
                    {sortedNPCs.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs mt-10">
                            暂无联系人<br />去认识些新朋友吧
                        </div>
                    ) : (
                        sortedNPCs.map((npc) => (
                            <button
                                key={npc.id}
                                onClick={() => setSelectedNPCId(npc.id)}
                                className="w-full flex items-center gap-3 p-3 border-b border-slate-50 active:bg-slate-100 transition-colors text-left"
                            >
                                <div className="relative shrink-0">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg ${npc.role === 'professor' ? 'bg-slate-600' : 'bg-blue-500'
                                        }`}>
                                        {npc.avatar ? npc.avatar : npc.name.substring(0, 1)}
                                    </div>
                                    {npc.role === 'crush' && (
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="text-[13px] font-bold text-slate-900 truncate">{npc.name}</h3>
                                        <span className="text-[9px] text-slate-400">14:20</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[11px] text-slate-500 truncate flex-1">
                                            {npc.chatHistory && npc.chatHistory.length > 0
                                                ? npc.chatHistory[npc.chatHistory.length - 1].content
                                                : npc.personality}
                                        </p>
                                        <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${npc.relationshipScore > 60 ? 'bg-pink-100 text-pink-600' :
                                            npc.relationshipScore > 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {npc.relationshipScore} ❤️
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Tab Bar (Fake) */}
            <div className="h-14 bg-slate-50 border-t border-slate-200 flex items-center justify-around text-[9px] text-slate-500 pb-2">
                <div className="flex flex-col items-center gap-0.5 text-green-600 cursor-pointer">
                    <MessageCircle className="w-6 h-6" />
                    <span>微信</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 cursor-pointer">
                    <Users className="w-6 h-6" />
                    <span>通讯录</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 cursor-pointer">
                    <User className="w-6 h-6" />
                    <span>我</span>
                </div>
            </div>
        </div>
    );
}

