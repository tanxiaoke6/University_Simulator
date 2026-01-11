import { useState, useEffect } from 'react';
import { useGameStore } from '../../../stores/gameStore';
import { usePhoneStore } from '../../../stores/phoneStore';
import { Globe, X, MessageSquare, ThumbsUp, Loader2, UserPlus, Search } from 'lucide-react';
import { generateForumPosts, ForumPost } from '../../../services/aiService';

export default function ForumApp() {
    const { student, config, addFriendFromForum } = useGameStore();
    const { closeApp } = usePhoneStore();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    if (!student) return null;

    useEffect(() => {
        const weekKey = `${student.currentDate.year}_${student.currentDate.semester}_${student.currentDate.week}`;

        // Check cache
        if (student.forumCache && student.forumCache[weekKey]) {
            setPosts(student.forumCache[weekKey]);
            return;
        }

        // Generate
        setIsLoading(true);
        generateForumPosts(config.llm, student)
            .then(newPosts => {
                setPosts(newPosts);
                // Cache it
                useGameStore.setState(state => {
                    if (!state.student) return state;
                    return {
                        student: {
                            ...state.student,
                            forumCache: {
                                ...(state.student.forumCache || {}),
                                [weekKey]: newPosts
                            }
                        }
                    };
                });
            })
            .finally(() => setIsLoading(false));
    }, [student.currentDate.week, config.llm]);

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa] text-slate-900 animate-fade-in no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-blue-600 text-white sticky top-0 z-10 shadow-md">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-tight">校园帖吧</span>
                </div>
                <button onClick={closeApp} className="p-1 rounded-full hover:bg-blue-700 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar pb-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <p className="text-xs">正在刷新社交网络...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                        目前还没有新帖子<br />休息一下再来吧
                    </div>
                ) : (
                    posts.map((post, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
                            <div className="p-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                        {post.author[0]}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-800">{post.author}</div>
                                        <div className="text-[8px] text-slate-400">Lv.14 校园红人</div>
                                    </div>
                                </div>
                                {student.npcs.some(n => n.name === post.author) ? (
                                    <button
                                        disabled
                                        className="p-1 px-2 rounded-full border border-slate-200 text-slate-400 text-[10px] font-bold bg-slate-50 flex items-center gap-1 cursor-default"
                                    >
                                        <UserPlus className="w-3 h-3" />
                                        已关注
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => addFriendFromForum(post.author, 'E')}
                                        className="p-1 px-2 rounded-full border border-blue-200 text-blue-600 text-[10px] font-bold hover:bg-blue-50 transition-colors flex items-center gap-1"
                                    >
                                        <UserPlus className="w-3 h-3" />
                                        关注
                                    </button>
                                )}
                            </div>

                            <div className="p-3">
                                <h3 className="text-xs font-bold text-slate-900 mb-1.5 leading-snug">{post.title}</h3>
                                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-4">
                                    {post.content}
                                </p>
                            </div>

                            <div className="px-3 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        <span>{post.likes}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>{post.comments.length}</span>
                                    </div>
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono">
                                    #{post.tag}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Tab */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 px-6 py-2 gap-8 z-20">
                <Globe className="w-5 h-5 text-blue-600" />
                <MessageSquare className="w-5 h-5 text-slate-400" />
                <Search className="w-5 h-5 text-slate-400" />
            </div>
        </div>
    );
}
