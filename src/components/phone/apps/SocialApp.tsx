import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../../stores/gameStore';
import { usePhoneStore } from '../../../stores/phoneStore';
import { MessageCircle, Search, Heart, User, Users, Send, ChevronLeft, Loader2, Aperture, Camera } from 'lucide-react';

type SocialTab = 'chat' | 'contacts' | 'moments' | 'me';

// Helper: Generate random age based on role
const getNPCAge = (role: string): number => {
    switch (role) {
        case 'professor': return 35 + Math.floor(Math.random() * 20); // 35-55
        case 'employer': return 28 + Math.floor(Math.random() * 15); // 28-43
        default: return 18 + Math.floor(Math.random() * 5); // 18-22 for students
    }
};

// Helper: Generate hobbies based on role
const getNPCHobbies = (role: string, personality: string): string[] => {
    const hobbyMap: Record<string, string[]> = {
        'professor': ['学术研究', '阅读', '写作', '品茶'],
        'roommate': ['打游戏', '看剧', '熬夜', '外卖'],
        'classmate': ['自习', '社团活动', '逛街', '拍照'],
        'crush': ['听音乐', '看电影', '散步', '摄影'],
        'partner': ['约会', '做饭', '旅行', '健身'],
        'friend': ['聚餐', '唱K', '桌游', '运动'],
        'employer': ['工作', '管理', '面试', '商务'],
        'forum_friend': ['发帖', '冲浪', '吃瓜', '追番'],
    };
    return hobbyMap[role] || ['学习', '交友', '探索'];
};

// Helper: Get relationship status label
const getRelationshipStatus = (score: number, role: string): { label: string; color: string } => {
    if (role === 'partner') return { label: '恋人', color: 'text-pink-500' };
    if (role === 'crush') return { label: '暗恋对象', color: 'text-pink-400' };
    if (score >= 80) return { label: '亲密好友', color: 'text-purple-500' };
    if (score >= 60) return { label: '好朋友', color: 'text-blue-500' };
    if (score >= 40) return { label: '朋友', color: 'text-green-500' };
    if (score >= 20) return { label: '熟人', color: 'text-yellow-500' };
    return { label: '认识', color: 'text-slate-400' };
};

// Helper: Get role label in Chinese
const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
        'roommate': '室友', 'classmate': '同学', 'professor': '老师',
        'crush': '暗恋对象', 'partner': '恋人', 'friend': '朋友',
        'rival': '对手', 'employer': '雇主', 'forum_friend': '网友',
    };
    return labels[role] || role;
};

export default function SocialApp() {
    const { student, sendChatMessage, finishChat } = useGameStore();
    const { closeApp } = usePhoneStore();
    const [activeTab, setActiveTab] = useState<SocialTab>('chat');
    const [selectedNPCId, setSelectedNPCId] = useState<string | null>(null);
    const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
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

    // Moments Data (Mocked from Friends)
    const moments = npcs
        .filter(npc => npc.moments && npc.moments.length > 0)
        .flatMap(npc => npc.moments!.map(m => ({ ...m, authorName: npc.name, authorAvatar: npc.avatar || npc.name[0], role: npc.role })))
        .sort((a, b) => (JSON.stringify(b.timestamp) > JSON.stringify(a.timestamp) ? 1 : -1));

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
                <span className="font-bold text-sm">
                    {activeTab === 'chat' && `微信 (${npcs.length})`}
                    {activeTab === 'contacts' && '通讯录'}
                    {activeTab === 'moments' && '朋友圈'}
                    {activeTab === 'me' && '我'}
                </span>
                <div className="flex-1" />
                {activeTab === 'chat' && <Search className="w-5 h-5 text-slate-600" />}
                {activeTab === 'moments' && <Camera className="w-5 h-5 text-slate-900" />}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">

                {activeTab === 'chat' && (
                    <>
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
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className="text-[13px] font-bold text-slate-900 truncate">{npc.name}</h3>
                                                <span className="text-[9px] text-slate-400">14:20</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[11px] text-slate-500 truncate flex-1">
                                                    {npc.chatHistory && npc.chatHistory.length > 0
                                                        ? npc.chatHistory[npc.chatHistory.length - 1].content
                                                        : (npc.role === 'forum_friend' ? '[图片] 我在图书馆学习...' : npc.personality)}
                                                </p>
                                                {npc.role === 'forum_friend' && (
                                                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 text-[8px] font-bold">
                                                        贴吧好友
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'moments' && (
                    <div>
                        {/* Valid Header Background */}
                        <div className="h-64 bg-slate-800 relative mb-12">
                            <div className="absolute -bottom-8 right-4 flex items-end gap-3">
                                <div className="text-white font-bold text-sm mb-9 shadow-black drop-shadow-md">{student.name}</div>
                                <div className="w-16 h-16 rounded-lg bg-slate-200 border-2 border-white overflow-hidden">
                                    <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                                        {student.name[0]}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-8 pb-10">
                            {/* Mock Moment if empty */}
                            {moments.length === 0 && (
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded bg-slate-200 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-20 bg-slate-200 rounded" />
                                        <div className="h-20 w-full bg-slate-100 rounded" />
                                    </div>
                                </div>
                            )}

                            {/* Render Moments Here (If we had data) */}
                            {moments.map((moment, idx) => (
                                <div key={idx} className="flex gap-3 border-b border-slate-100 pb-4">
                                    <div className="w-10 h-10 rounded bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">
                                        {moment.authorAvatar}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-blue-900 text-sm mb-1">{moment.authorName}</h4>
                                        <p className="text-sm text-slate-800 leading-relaxed mb-2">{moment.content}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-slate-400">1小时前</span>
                                            <div className="w-8 h-5 bg-slate-100 rounded text-slate-500 flex items-center justify-center">
                                                <span className="text-[10px] font-bold">•••</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'contacts' && (
                    <div className="animate-fade-in">
                        {/* Profile View */}
                        {viewingProfileId ? (() => {
                            const npc = npcs.find(n => n.id === viewingProfileId);
                            if (!npc) return null;
                            const age = getNPCAge(npc.role);
                            const hobbies = getNPCHobbies(npc.role, npc.personality);
                            const relStatus = getRelationshipStatus(npc.relationshipScore, npc.role);
                            const genderLabel = npc.gender === 'male' ? '男' : '女';
                            const genderColor = npc.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600';

                            return (
                                <div className="flex flex-col h-full">
                                    {/* Profile Header */}
                                    <div className="bg-gradient-to-b from-slate-700 to-slate-800 p-4 text-center relative">
                                        <button
                                            onClick={() => setViewingProfileId(null)}
                                            className="absolute left-2 top-2 p-1 hover:bg-white/10 rounded-full"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-white" />
                                        </button>
                                        {/* Avatar */}
                                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg ${npc.role === 'professor' ? 'bg-slate-500' :
                                            npc.role === 'crush' || npc.role === 'partner' ? 'bg-gradient-to-br from-pink-400 to-rose-500' :
                                                'bg-gradient-to-br from-blue-400 to-indigo-500'
                                            }`}>
                                            {npc.avatar || npc.name[0]}
                                        </div>
                                        <h2 className="text-white font-bold text-lg mt-3">{npc.name}</h2>
                                        <div className="flex items-center justify-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${genderColor}`}>{genderLabel}</span>
                                            <span className="text-slate-300 text-xs">{age}岁</span>
                                            <span className="text-slate-400 text-xs">· {getRoleLabel(npc.role)}</span>
                                        </div>
                                        {(npc.role === 'partner' || npc.role === 'crush') && (
                                            <Heart className="absolute top-3 right-3 w-5 h-5 text-pink-400 fill-pink-400" />
                                        )}
                                    </div>

                                    {/* Profile Content */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                                        {/* Relationship Status */}
                                        <div className="bg-white rounded-xl p-3 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-slate-500">关系状态</span>
                                                <span className={`text-xs font-bold ${relStatus.color}`}>{relStatus.label}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${npc.relationshipScore >= 80 ? 'bg-gradient-to-r from-pink-400 to-rose-500' :
                                                        npc.relationshipScore >= 60 ? 'bg-blue-500' :
                                                            npc.relationshipScore >= 40 ? 'bg-green-500' :
                                                                'bg-yellow-500'
                                                        }`}
                                                    style={{ width: `${Math.max(0, Math.min(100, npc.relationshipScore))}%` }}
                                                />
                                            </div>
                                            <div className="text-right text-[10px] text-slate-400 mt-1">好感度: {npc.relationshipScore}/100</div>
                                        </div>

                                        {/* Personality */}
                                        <div className="bg-white rounded-xl p-3 shadow-sm">
                                            <h4 className="text-xs text-slate-500 mb-2">性格特点</h4>
                                            <p className="text-sm text-slate-800">{npc.personality}</p>
                                        </div>

                                        {/* Hobbies */}
                                        <div className="bg-white rounded-xl p-3 shadow-sm">
                                            <h4 className="text-xs text-slate-500 mb-2">兴趣爱好</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {hobbies.map((hobby, i) => (
                                                    <span key={i} className="px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                                                        {hobby}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedNPCId(npc.id);
                                                    setViewingProfileId(null);
                                                    setActiveTab('chat');
                                                }}
                                                className="flex-1 bg-[#07c160] text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                发消息
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })() : (
                            /* Contacts List */
                            <div>
                                {/* Search placeholder */}
                                <div className="p-2 bg-slate-100">
                                    <div className="bg-white rounded-md p-1.5 flex items-center justify-center gap-1 text-slate-400 text-[10px]">
                                        <Search className="w-3 h-3" />
                                        <span>搜索联系人</span>
                                    </div>
                                </div>

                                {/* NPC List by Category */}
                                {(() => {
                                    const contactNPCs = npcs.filter(n => n.role !== 'parent' && n.role !== 'game_assistant');
                                    const groups: { label: string; npcs: typeof contactNPCs }[] = [
                                        { label: '💕 特别关心', npcs: contactNPCs.filter(n => n.role === 'partner' || n.role === 'crush') },
                                        { label: '👥 好友', npcs: contactNPCs.filter(n => n.role === 'friend' || n.role === 'forum_friend') },
                                        { label: '🏠 室友', npcs: contactNPCs.filter(n => n.role === 'roommate') },
                                        { label: '📚 同学', npcs: contactNPCs.filter(n => n.role === 'classmate') },
                                        { label: '👔 老师/雇主', npcs: contactNPCs.filter(n => n.role === 'professor' || n.role === 'employer') },
                                    ].filter(g => g.npcs.length > 0);

                                    return groups.map((group, gIdx) => (
                                        <div key={gIdx}>
                                            <div className="px-3 py-2 bg-slate-50 text-xs text-slate-500 font-medium sticky top-0">
                                                {group.label}
                                            </div>
                                            {group.npcs.map(npc => (
                                                <button
                                                    key={npc.id}
                                                    onClick={() => setViewingProfileId(npc.id)}
                                                    className="w-full flex items-center gap-3 p-3 border-b border-slate-100 active:bg-slate-50 transition-colors text-left"
                                                >
                                                    <div className="relative shrink-0">
                                                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-white ${npc.role === 'professor' ? 'bg-slate-500' :
                                                            npc.role === 'crush' || npc.role === 'partner' ? 'bg-pink-400' :
                                                                'bg-blue-500'
                                                            }`}>
                                                            {npc.avatar || npc.name[0]}
                                                        </div>
                                                        {npc.role === 'partner' && (
                                                            <Heart className="absolute -bottom-1 -right-1 w-4 h-4 text-pink-500 fill-pink-500 bg-white rounded-full p-0.5" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm text-slate-900">{npc.name}</span>
                                                            <span className={`text-[10px] ${npc.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>
                                                                {npc.gender === 'male' ? '♂' : '♀'}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 truncate">{npc.personality}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-[10px] font-medium ${getRelationshipStatus(npc.relationshipScore, npc.role).color}`}>
                                                            {npc.relationshipScore}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ));
                                })()}

                                {npcs.filter(n => n.role !== 'parent' && n.role !== 'game_assistant').length === 0 && (
                                    <div className="p-8 text-center text-slate-400 text-xs mt-10">
                                        暂无联系人<br />去认识些新朋友吧
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'me' && (
                    <div className="p-4 text-center text-slate-400 text-xs mt-20">
                        个人中心功能开发中...
                    </div>
                )}

            </div>

            {/* Bottom Tab Bar */}
            <div className="h-14 bg-[#f7f7f7] border-t border-slate-200 flex items-center justify-around text-[10px] text-slate-500 pb-1">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'chat' ? 'text-[#07c160]' : ''}`}
                >
                    <MessageCircle className="w-6 h-6" fill={activeTab === 'chat' ? 'currentColor' : 'none'} />
                    <span>微信</span>
                </button>
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'contacts' ? 'text-[#07c160]' : ''}`}
                >
                    <Users className="w-6 h-6" fill={activeTab === 'contacts' ? 'currentColor' : 'none'} />
                    <span>通讯录</span>
                </button>
                <button
                    onClick={() => setActiveTab('moments')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'moments' ? 'text-[#07c160]' : ''}`}
                >
                    <Aperture className="w-6 h-6" />
                    <span>发现</span>
                </button>
                <button
                    onClick={() => setActiveTab('me')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'me' ? 'text-[#07c160]' : ''}`}
                >
                    <User className="w-6 h-6" fill={activeTab === 'me' ? 'currentColor' : 'none'} />
                    <span>我</span>
                </button>
            </div>
        </div>
    );
}
