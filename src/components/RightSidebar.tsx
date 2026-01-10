// Right Sidebar - Personal Belongings (Phone & Bag)
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { generateForumPosts, ForumPost } from '../services/aiService';
import {
    Heart,
    ChevronLeft,
    Smartphone as PhoneIcon,
    Backpack,
    Globe,
    Landmark,
    MessageCircle,
    Zap,
    Book,
    Send,
    User,
    Brain,
    Loader2,
    ThumbsUp,
    MessageSquareText,
    UserPlus,
    Camera,
    MoreVertical,
    Trash2,
    Eye,
    EyeOff,
    Trophy
} from 'lucide-react';
import type { NPC } from '../types';

export default function RightSidebar() {
    const { student, useItem, sendChatMessage, config, addFriendFromForum, toggleMomentsPermission, deleteFriend, likeMoment, commentOnMoment } = useGameStore();
    const [activeTab, setActiveTab] = useState<'apps' | 'items'>('apps');
    const [openApp, setOpenApp] = useState<'none' | 'wechat' | 'forum' | 'bank' | 'moments' | 'tiktok'>('none');
    const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);

    // Moments & WeChat State
    const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
    const [showWeChatMenu, setShowWeChatMenu] = useState(false);

    const [forumLoading, setForumLoading] = useState(false);
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [commentInput, setCommentInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when chat updates
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedNPC?.chatHistory]);

    // Load forum posts when forum opens (with weekly caching)
    useEffect(() => {
        if (openApp === 'forum' && student) {
            const weekKey = `${student.currentDate.year}_${student.currentDate.semester}_${student.currentDate.week}`;

            // Check cache first
            if (student.forumCache && student.forumCache[weekKey]) {
                setForumPosts(student.forumCache[weekKey]);
                return;
            }

            // Generate new if not cached
            setForumLoading(true);
            generateForumPosts(config.llm, student)
                .then(posts => {
                    setForumPosts(posts);
                    // Cache the posts
                    useGameStore.setState((state) => {
                        if (!state.student) return state;
                        return {
                            student: {
                                ...state.student,
                                forumCache: {
                                    ...(state.student.forumCache || {}),
                                    [weekKey]: posts
                                }
                            }
                        };
                    });
                })
                .finally(() => setForumLoading(false));
        }
    }, [openApp, student?.currentDate.year, student?.currentDate.semester, student?.currentDate.week, config.llm]);

    if (!student) return null;

    const handleSendMessage = async () => {
        if (!selectedNPC || !chatInput.trim() || isSending) return;

        const message = chatInput.trim();
        setChatInput('');
        setIsSending(true);

        try {
            await sendChatMessage(selectedNPC.id, message);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const renderApps = () => {
        if (openApp === 'wechat') return renderWeChat();
        if (openApp === 'forum') return renderForum();
        if (openApp === 'bank') return renderBank();
        if (openApp === 'moments') return renderMoments();
        if (openApp === 'tiktok') return renderTikTok();

        return (
            <div className="grid grid-cols-3 gap-4 p-4 animate-fade-in">
                <button
                    onClick={() => setOpenApp('wechat')}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-dark-300">微信</span>
                </button>

                <button
                    onClick={() => setOpenApp('moments')}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-400 to-pink-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-dark-300">朋友圈</span>
                </button>

                <button
                    onClick={() => setOpenApp('forum')}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Globe className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-dark-300">论坛</span>
                </button>

                <button
                    onClick={() => setOpenApp('bank')}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Landmark className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-dark-300">银行</span>
                </button>
            </div>
        );
    };

    const getRoleLabel = (role: string, id: string) => {
        if (id === 'game_assistant') return '系统助教';
        const roleMap: Record<string, string> = {
            'roommate': '室友',
            'classmate': '同学',
            'professor': '教授',
            'crush': '暧昧',
            'partner': '恋人',
            'friend': '朋友',
            'rival': '对手',
            'employer': '老板',
            'forum_friend': '论坛好友',
            'parent': '家长',
            'game_assistant': '系统助教'
        };
        return roleMap[role] || '好友';
    };

    const renderTikTok = () => (
        <div className="flex flex-col h-full animate-fade-in bg-black rounded-xl overflow-hidden min-h-[400px]">
            <header className="p-3 border-b border-dark-700/50 flex items-center gap-3 bg-dark-900/80 backdrop-blur-md sticky top-0 z-10">
                <button onClick={() => setOpenApp('none')}>
                    <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <h3 className="font-bold text-xs text-white">抖音 (Douyin)</h3>
            </header>
            <div className="flex-1 bg-black relative">
                <iframe
                    src="https://www.douyin.com/recommend?show_nav=0"
                    className="w-full h-full border-none"
                    title="Douyin"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                />

                {/* Fallback Overlay (visible if iframe fails or is blocked) */}
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity bg-opacity-90">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-500 mb-4 flex items-center justify-center pointer-events-auto">
                        <PhoneIcon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-white font-bold text-sm mb-2">正在载入推荐内容</h4>
                    <p className="text-[10px] text-dark-500 mb-6">如果无法加载，请尝试</p>
                    <a
                        href="https://www.douyin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-pink-600 text-white text-xs rounded-full font-bold pointer-events-auto"
                    >
                        打开网页版
                    </a>
                </div>
            </div>
        </div>
    );

    const renderMoments = () => {
        // Aggregate all visible moments
        const allMoments = student.npcs
            .filter(npc => npc.moments && npc.viewMomentsPermission !== false && npc.relationshipScore >= 0)
            .flatMap(npc => (npc.moments || []).map(moment => ({ ...moment, authorId: npc.id, authorName: npc.name, avatar: npc.avatar })))
            .sort((a, b) => {
                // Sort by time (newest first)
                if (a.timestamp.year !== b.timestamp.year) return b.timestamp.year - a.timestamp.year;
                if (a.timestamp.semester !== b.timestamp.semester) return b.timestamp.semester - a.timestamp.semester;
                return b.timestamp.week - a.timestamp.week;
            });

        return (
            <div className="flex flex-col h-full animate-fade-in bg-[#1a1a1a] rounded-xl overflow-hidden min-h-[400px]">
                <header className="p-3 border-b border-dark-700/50 flex items-center gap-3 bg-[#2a2a2a] shrink-0">
                    <button onClick={() => setOpenApp('none')}>
                        <ChevronLeft className="w-4 h-4 text-dark-400" />
                    </button>
                    <h3 className="font-bold text-xs text-white">朋友圈</h3>
                    <Camera className="w-4 h-4 text-white ml-auto" />
                </header>

                <div className="flex-1 overflow-y-auto bg-[#111]">
                    {/* Header Image */}
                    <div className="h-32 bg-gradient-to-br from-dark-800 to-dark-900 relative">
                        <div className="absolute -bottom-4 right-4 flex items-end gap-2">
                            <span className="text-white font-bold text-shadow mb-6">{student.name}</span>
                            <div className="w-16 h-16 rounded-xl bg-dark-700 border-2 border-[#1a1a1a] flex items-center justify-center overflow-hidden">
                                <User className="w-8 h-8 text-dark-400" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pb-4 space-y-6">
                        {allMoments.length === 0 ? (
                            <p className="text-center text-dark-500 text-xs py-8">暂时没有新的动态</p>
                        ) : (
                            allMoments.map(moment => (
                                <div key={moment.id} className="px-3 pb-4 border-b border-dark-800 flex gap-3">
                                    <div className="w-8 h-8 rounded bg-dark-700 shrink-0 flex items-center justify-center font-bold text-dark-300">
                                        {moment.authorName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#576b95] mb-1">{moment.authorName}</p>
                                        <p className="text-[11px] text-white leading-relaxed mb-2">{moment.content}</p>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[9px] text-dark-500">
                                                第{moment.timestamp.year}年 {moment.timestamp.semester === 1 ? '上' : '下'} 第{moment.timestamp.week}周
                                            </span>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMomentId(activeMomentId === moment.id ? null : moment.id)}
                                                    className="p-1 px-2 bg-dark-800 rounded text-dark-400 hover:text-white transition-colors"
                                                >
                                                    <MoreVertical className="w-3 h-3" />
                                                </button>

                                                {/* Like/Comment Popup */}
                                                {activeMomentId === moment.id && (
                                                    <div className="absolute right-full top-0 mr-2 bg-dark-700 rounded flex items-center overflow-hidden animate-fade-in whitespace-nowrap">
                                                        <button
                                                            onClick={() => {
                                                                likeMoment(moment.authorId, moment.id);
                                                                setActiveMomentId(null);
                                                            }}
                                                            className="px-3 py-1.5 flex items-center gap-1 hover:bg-dark-600 transition-colors"
                                                        >
                                                            <Heart className={`w-3 h-3 ${moment.likes.includes(student.name) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                                            <span className="text-[10px] text-white">{moment.likes.includes(student.name) ? '取消' : '赞'}</span>
                                                        </button>
                                                        <div className="w-[1px] h-3 bg-dark-600"></div>
                                                        <button
                                                            onClick={() => {
                                                                // Focus comment input logic could go here
                                                                setActiveMomentId(null);
                                                            }}
                                                            className="px-3 py-1.5 flex items-center gap-1 hover:bg-dark-600 transition-colors"
                                                        >
                                                            <MessageSquareText className="w-3 h-3 text-white" />
                                                            <span className="text-[10px] text-white">评论</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Likes & Comments Area */}
                                        {(moment.likes.length > 0 || moment.comments.length > 0) && (
                                            <div className="mt-2 bg-dark-800/50 rounded p-2">
                                                {moment.likes.length > 0 && (
                                                    <div className="flex items-center gap-1 text-[10px] text-[#576b95] border-b border-dark-700/50 pb-1 mb-1">
                                                        <Heart className="w-3 h-3 fill-current" />
                                                        <span>{moment.likes.join(', ')}</span>
                                                    </div>
                                                )}
                                                {/* Add Friend Button */}
                                                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                                    <span className="text-dark-400 text-[10px]">{moment.authorName}</span>
                                                    {!student.npcs.some(n => n.name === moment.authorName) && moment.authorName !== student.name && (
                                                        <button
                                                            onClick={() => {
                                                                addFriendFromForum(moment.authorName, 'E'); // Default personality
                                                                // Optional: Show a toast/notification
                                                                useGameStore.setState(state => ({
                                                                    student: {
                                                                        ...state.student!,
                                                                        notifications: [
                                                                            ...state.student!.notifications,
                                                                            {
                                                                                id: `friend_add_${Date.now()}`,
                                                                                message: `已添加 ${moment.authorName} 为好友`,
                                                                                type: 'success',
                                                                                read: false,
                                                                                timestamp: Date.now()
                                                                            }
                                                                        ]
                                                                    }
                                                                }));
                                                            }}
                                                            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-900/30 hover:bg-green-900/50 text-green-400 rounded transition-colors"
                                                            title="加好友"
                                                        >
                                                            <UserPlus className="w-3 h-3" />
                                                            <span className="text-[9px]">加好友</span>
                                                        </button>
                                                    )}
                                                    {student.npcs.some(n => n.name === moment.authorName) && moment.authorName !== student.name && (
                                                        <span className="text-[9px] text-dark-500 bg-dark-800 px-1.5 py-0.5 rounded">已添加</span>
                                                    )}
                                                </div>
                                                {moment.comments.map(c => (
                                                    <div key={c.id} className="text-[10px] leading-tight py-0.5">
                                                        <span className="text-[#576b95] font-bold">{c.author}: </span>
                                                        <span className="text-dark-300">{c.content}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Simple Comment Input for Demo */}
                                        <div className="mt-2 flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="评论..."
                                                className="flex-1 bg-transparent border-b border-dark-700 text-[10px] text-white focus:outline-none focus:border-green-500"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const target = e.target as HTMLInputElement;
                                                        if (target.value.trim()) {
                                                            commentOnMoment(moment.authorId, moment.id, target.value.trim());
                                                            target.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderWeChat = () => {
        // Get current NPC data from store (for real-time updates)
        const currentNPC = selectedNPC ? student.npcs.find(n => n.id === selectedNPC.id) : null;
        const chatHistory = currentNPC?.chatHistory || [];

        return (
            <div className="flex flex-col animate-fade-in bg-[#1a1a1a] rounded-xl overflow-hidden" style={{ height: '450px' }}>
                {/* WeChat Header */}
                <header className="p-3 border-b border-dark-700/50 flex items-center justify-between bg-[#2a2a2a] shrink-0 relative">
                    <div className="flex items-center gap-3">
                        <button onClick={() => selectedNPC ? setSelectedNPC(null) : setOpenApp('none')} className="p-1 hover:bg-dark-700 rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4 text-dark-400" />
                        </button>
                        <h3 className="font-bold text-xs text-green-400">{selectedNPC ? selectedNPC.name : '微信'}</h3>
                        {selectedNPC && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-dark-700 rounded text-dark-400">
                                {getRoleLabel(selectedNPC.role, selectedNPC.id)}
                            </span>
                        )}
                    </div>

                    {selectedNPC && selectedNPC.id !== 'game_assistant' && (
                        <div className="relative">
                            <button onClick={() => setShowWeChatMenu(!showWeChatMenu)} className="p-1 hover:bg-dark-700 rounded-lg">
                                <MoreVertical className="w-4 h-4 text-dark-400" />
                            </button>

                            {showWeChatMenu && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
                                    <button
                                        onClick={() => {
                                            toggleMomentsPermission(selectedNPC.id);
                                            setShowWeChatMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-[10px] hover:bg-dark-700 flex items-center gap-2 text-dark-200"
                                    >
                                        {currentNPC?.viewMomentsPermission !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                        {currentNPC?.viewMomentsPermission !== false ? '不看他朋友圈' : '允许看朋友圈'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            deleteFriend(selectedNPC.id);
                                            setSelectedNPC(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-[10px] hover:bg-dark-700 flex items-center gap-2 text-red-400"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        删除好友
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </header>

                {/* Contact List or Chat View */}
                {!selectedNPC ? (
                    // Contact List - fills remaining space
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {[...student.npcs]
                            .sort((a, b) => {
                                if (a.id === 'game_assistant') return -1;
                                if (b.id === 'game_assistant') return 1;
                                return 0;
                            })
                            .map(npc => (
                                <button
                                    key={npc.id}
                                    onClick={() => setSelectedNPC(npc)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800/50 transition-colors border border-transparent hover:border-dark-700/30"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${npc.id === 'game_assistant' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-700 text-dark-300'}`}>
                                        {npc.id === 'game_assistant' ? <Brain className="w-5 h-5" /> : npc.name[0]}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-white truncate">{npc.name}</p>
                                            <span className="text-[8px] px-1.5 py-0.5 bg-dark-800 rounded text-dark-500 shrink-0">
                                                {getRoleLabel(npc.role, npc.id)}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-dark-500 truncate">{npc.id === 'game_assistant' ? '有问题问我！' : npc.personality}</p>
                                    </div>
                                    {npc.role === 'parent' ? (
                                        <div className="flex items-center gap-1 shrink-0 text-amber-400">
                                            <Trophy className="w-3 h-3" />
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold">{npc.parentPride}</span>
                                                <span className="text-[7px] uppercase opacity-60">自豪感</span>
                                            </div>
                                        </div>
                                    ) : npc.id !== 'game_assistant' && (
                                        <div className={`flex items-center gap-1 shrink-0 ${npc.relationshipScore > 50 ? 'text-green-400' : npc.relationshipScore > 0 ? 'text-primary-400' : 'text-red-400'}`}>
                                            <Heart className="w-3 h-3 fill-current" />
                                            <span className="text-[10px] font-bold">{npc.relationshipScore}</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                    </div>
                ) : (
                    // Chat View - flex column with input at bottom
                    <>
                        {/* Chat Messages - scrollable area */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {chatHistory.length === 0 && (
                                <p className="text-center text-dark-600 text-xs py-8">开始聊天吧！</p>
                            )}
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${msg.role === 'user'
                                        ? 'bg-green-600 text-white rounded-br-sm'
                                        : 'bg-dark-700 text-dark-100 rounded-bl-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="bg-dark-700 text-dark-400 px-3 py-2 rounded-2xl rounded-bl-sm text-xs">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input - fixed at bottom */}
                        <div className="p-2 border-t border-dark-700/50 bg-[#2a2a2a] shrink-0">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="输入消息..."
                                    className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-green-500/50"
                                    disabled={isSending}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim() || isSending}
                                    className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-dark-700 disabled:text-dark-500 text-white rounded-lg transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const handleLikePost = (postId: string) => {
        setForumPosts(posts => posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    liked: !p.liked,
                    likes: p.liked ? p.likes - 1 : p.likes + 1
                };
            }
            return p;
        }));
    };

    const handleAddComment = (postId: string) => {
        if (!commentInput.trim()) return;

        setForumPosts(posts => posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    comments: [
                        ...p.comments,
                        {
                            id: `comment_${Date.now()}`,
                            author: student.name,
                            content: commentInput.trim(),
                            timestamp: Date.now()
                        }
                    ]
                };
            }
            return p;
        }));
        setCommentInput('');
    };

    const handleLoadMore = async () => {
        if (!student || forumLoading) return;
        setForumLoading(true);
        try {
            const newPosts = await generateForumPosts(config.llm, student);
            setForumPosts(prev => [...prev, ...newPosts]);
        } finally {
            setForumLoading(false);
        }
    };

    const renderForum = () => (
        <div className="flex flex-col h-full animate-fade-in bg-dark-900/30 rounded-xl overflow-hidden min-h-[400px]">
            <header className="p-3 border-b border-dark-700/50 flex items-center gap-3 bg-dark-800/50">
                <button onClick={() => setOpenApp('none')}>
                    <ChevronLeft className="w-4 h-4 text-dark-400" />
                </button>
                <h3 className="font-bold text-xs">校园论坛</h3>
                {forumLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-400" />}
            </header>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {forumPosts.map((post) => (
                    <div key={post.id} className="p-3 bg-dark-800/40 rounded-lg border border-dark-700/50 hover:border-dark-600 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] text-primary-400 font-bold">{post.author}</span>
                            <button
                                onClick={() => addFriendFromForum(post.author, post.content)}
                                className="text-[8px] px-2 py-0.5 bg-green-600/20 hover:bg-green-600/30 rounded text-green-400 flex items-center gap-1"
                            >
                                <UserPlus className="w-2.5 h-2.5" />
                                加好友
                            </button>
                        </div>
                        <p className="text-[11px] text-dark-200 leading-relaxed">{post.content}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-700/30">
                            <span className="text-[9px] text-dark-600">{post.time}</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleLikePost(post.id)}
                                    className={`flex items-center gap-1 transition-colors ${post.liked ? 'text-red-400' : 'text-dark-500 hover:text-red-400'}`}
                                >
                                    <ThumbsUp className={`w-3 h-3 ${post.liked ? 'fill-current' : ''}`} />
                                    <span className="text-[9px]">{post.likes}</span>
                                </button>
                                <button
                                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                                    className="flex items-center gap-1 text-dark-500 hover:text-primary-400 transition-colors"
                                >
                                    <MessageSquareText className="w-3 h-3" />
                                    <span className="text-[9px]">{post.comments.length}</span>
                                </button>
                            </div>
                        </div>

                        {expandedPost === post.id && (
                            <div className="mt-3 pt-3 border-t border-dark-700/30 space-y-2">
                                {post.comments.length > 0 && (
                                    <div className="space-y-1.5 mb-2">
                                        {post.comments.map(comment => (
                                            <div key={comment.id} className="p-2 bg-dark-900/50 rounded text-[10px]">
                                                <span className="text-primary-400 font-bold">{comment.author}: </span>
                                                <span className="text-dark-300">{comment.content}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                        placeholder="发表评论..."
                                        className="flex-1 px-2 py-1 bg-dark-900 border border-dark-700 rounded text-[10px] text-white placeholder-dark-600 focus:outline-none focus:border-primary-500"
                                    />
                                    <button
                                        onClick={() => handleAddComment(post.id)}
                                        className="px-2 py-1 bg-primary-600 hover:bg-primary-500 rounded text-[10px] text-white"
                                    >
                                        发送
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <button
                    onClick={handleLoadMore}
                    disabled={forumLoading}
                    className="w-full py-2 bg-dark-800/60 hover:bg-dark-700/60 disabled:bg-dark-800/30 rounded-lg text-[10px] text-dark-400 hover:text-dark-200 transition-colors border border-dark-700/50"
                >
                    {forumLoading ? '加载中...' : '加载更多帖子'}
                </button>
            </div>
        </div>
    );

    const renderBank = () => (
        <div className="flex flex-col h-full animate-fade-in bg-dark-900/30 rounded-xl overflow-hidden min-h-[400px]">
            <header className="p-3 border-b border-dark-700/50 flex items-center gap-3 bg-dark-800/50">
                <button onClick={() => setOpenApp('none')}>
                    <ChevronLeft className="w-4 h-4 text-dark-400" />
                </button>
                <h3 className="font-bold text-xs">手机银行</h3>
            </header>
            <div className="p-4 space-y-4">
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 p-4 rounded-xl border border-amber-500/20">
                    <p className="text-[10px] font-bold text-amber-500/80 uppercase">账户余额 (CNY)</p>
                    <p className="text-2xl font-mono font-bold text-white mt-1">¥{student.wallet.balance.toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-dark-500 uppercase px-1">交易流水</p>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {student.wallet.transactions.slice().reverse().map(ts => (
                            <div key={ts.id} className="flex justify-between items-center p-2.5 rounded-lg bg-dark-800/40 border border-dark-700/30">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-dark-200 truncate">{ts.description}</p>
                                    <p className="text-[8px] text-dark-500">第{ts.timestamp.year}年 第{ts.timestamp.week}周</p>
                                </div>
                                <span className={`text-[11px] font-bold font-mono shrink-0 ml-2 ${ts.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                    {ts.type === 'income' ? '+' : '-'}¥{ts.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderItems = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {student.inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-dark-600 gap-2">
                    <Backpack className="w-12 h-12 opacity-20" />
                    <p className="text-sm">背包是空的</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {student.inventory.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex items-center gap-3 p-3 bg-dark-800/40 rounded-xl border border-dark-700/50 hover:border-orange-500/30 transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0">
                                {item.category === 'food' ? <Zap className="w-5 h-5" /> : <Book className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                                <p className="text-[10px] text-dark-500 truncate">{item.description}</p>
                            </div>
                            <button
                                onClick={() => useItem(item.id)}
                                className="px-3 py-1.5 rounded-lg bg-orange-600/20 text-orange-400 text-[10px] font-bold border border-orange-500/20 hover:bg-orange-600/40 transition-all"
                            >
                                使用
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <aside className="sidebar animate-slide-in-right border-l border-dark-700/50 flex flex-col gap-4">
            {/* Tab Switcher */}
            <div className="flex p-1 bg-dark-900/50 rounded-xl border border-dark-700/50 mx-4 mt-2">
                <button
                    onClick={() => setActiveTab('apps')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'apps' ? 'bg-primary-600 text-white shadow-lg' : 'text-dark-400 hover:text-dark-200'}`}
                >
                    <PhoneIcon className="w-3.5 h-3.5" />
                    应用 (Apps)
                </button>
                <button
                    onClick={() => setActiveTab('items')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'items' ? 'bg-orange-600 text-white shadow-lg' : 'text-dark-400 hover:text-dark-200'}`}
                >
                    <Backpack className="w-3.5 h-3.5" />
                    背包 (Bag)
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'apps' ? renderApps() : renderItems()}
            </div>

            {/* Bottom Stats */}
            <div className="mt-auto border-t border-dark-700/50 p-4 bg-dark-900/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-dark-500 uppercase">进度概览</span>
                    <span className="text-[10px] font-bold text-primary-400">{(student.currentDate.year - 1) * 40 + (student.currentDate.semester - 1) * 20 + student.currentDate.week}/160</span>
                </div>
                <div className="w-full h-1 bg-dark-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-500 transition-all duration-1000"
                        style={{ width: `${((student.currentDate.year - 1) * 40 + (student.currentDate.semester - 1) * 20 + student.currentDate.week) / 1.6}%` }}
                    />
                </div>
            </div>
        </aside>
    );
}
