
import { useGameStore } from '../stores/gameStore';
import { CLUBS } from '../data/clubs';
import { X, Users, Award, Star, TrendingUp, CheckCircle, Shield } from 'lucide-react';

interface ClubDashboardModalProps {
    onClose: () => void;
}

export default function ClubDashboardModal({ onClose }: ClubDashboardModalProps) {
    const { student, performClubTask, quitClub } = useGameStore();

    if (!student || !student.clubs.id) return null;

    const club = CLUBS.find(c => c.id === student.clubs.id);
    if (!club) return null;

    const { currentRank: rank, contribution: reputation } = student.clubs;

    // Filter tasks based on rank
    const availableTasks = club.tasks.filter(task => {
        if (task.minRank === 'Member') return true;
        if (task.minRank === 'Vice President' && (rank === 'Vice President' || rank === 'President')) return true;
        if (task.minRank === 'President' && rank === 'President') return true;
        return false;
    });

    const getRankColor = (r: string) => {
        if (r === 'President') return 'text-amber-400';
        if (r === 'Vice President') return 'text-primary-400';
        return 'text-dark-300';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">

                {/* Header with Background */}
                <div className="relative h-48 bg-gradient-to-r from-dark-800 to-dark-900 overflow-hidden shrink-0">
                    <div className={`absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3`} />

                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-white/10 transition-colors z-20 text-white">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="absolute inset-0 flex items-end p-8 z-10">
                        <div className="flex items-end justify-between w-full">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border border-white/20 uppercase tracking-wider ${getRankColor(rank)}`}>
                                        {rank}
                                    </span>
                                    <span className="text-dark-400 text-sm flex items-center gap-1">
                                        <Star className="w-3 h-3 text-amber-500" />
                                        声望: {reputation}
                                    </span>
                                </div>
                                <h2 className="text-4xl font-display font-bold text-white mb-2">{club.name}</h2>
                                <p className="text-dark-300 max-w-xl">{club.description}</p>
                            </div>

                            {/* Management Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={quitClub}
                                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-bold transition-colors"
                                >
                                    退出社团
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Tasks */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-5 h-5 text-primary-400" />
                            <h3 className="text-lg font-bold text-white">社团任务</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {availableTasks.map(task => (
                                <div key={task.id} className="glass-card p-5 group hover:border-primary-500/30 transition-all bg-dark-800/50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-base font-bold text-white group-hover:text-primary-400 transition-colors">{task.name}</h4>
                                            <p className="text-sm text-dark-400 mt-1">{task.description}</p>
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${task.difficulty >= 4 ? 'border-red-500/30 text-red-400' :
                                            task.difficulty >= 3 ? 'border-amber-500/30 text-amber-400' : 'border-green-500/30 text-green-400'
                                            }`}>
                                            LV.{task.difficulty}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-dark-700/50">
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                - {task.energyCost} 体力
                                            </span>
                                            <span className="text-dark-400 flex items-center gap-1">
                                                <Award className="w-3.5 h-3.5" />
                                                声望 +{task.rewards.reputation}
                                            </span>
                                            {task.rewards.attribute && (
                                                <span className="text-blue-400 flex items-center gap-1">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                    {task.rewards.attribute.target} +{task.rewards.attribute.value}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => performClubTask(task.id)}
                                            className="px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-all shadow-lg shadow-primary-900/20 active:scale-95"
                                        >
                                            执行
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {availableTasks.length === 0 && (
                                <div className="text-center py-10 text-dark-500 border border-dashed border-dark-700 rounded-xl">
                                    暂无可用任务
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Members & Info */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="glass-card p-5 bg-dark-800/50">
                            <h3 className="text-sm font-bold text-dark-300 uppercase tracking-widest mb-4">我的职位</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white shadow-lg shadow-primary-900/20">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-white">{rank === 'Member' ? '普通成员' : rank === 'Vice President' ? '副主席' : '主席'}</div>
                                    <div className="text-xs text-dark-400">下一级: {rank === 'Member' ? '100 声望' : rank === 'Vice President' ? '300 声望' : '已满级'}</div>
                                </div>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-dark-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 rounded-full"
                                    style={{ width: `${Math.min(100, (reputation / (rank === 'Member' ? 100 : 300)) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Members List */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-accent-400" />
                                <h3 className="text-lg font-bold text-white">社团成员</h3>
                            </div>
                            <div className="space-y-3">
                                {club.members.map(member => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800 transition-colors cursor-pointer group">
                                        <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-lg">
                                            {member.gender === 'female' ? '👩🏻' : '👨🏻'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-dark-200 group-hover:text-white transition-colors">{member.name}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${member.rank === 'President' ? 'bg-amber-500/10 text-amber-500' :
                                                    member.rank === 'Vice President' ? 'bg-primary-500/10 text-primary-400' : 'text-dark-500'
                                                    }`}>
                                                    {member.rank === 'President' ? '主席' : member.rank === 'Vice President' ? '副主席' : '成员'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-dark-500">{member.role} • {member.personality}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
