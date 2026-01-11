import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { CERTIFICATES } from '../data/certificates';
import {
    Scroll,
    Trophy,
    Microscope,
    Brain,
    Lock,
    CheckCircle2,
    PlayCircle,
    Star,
    X,
    User
} from 'lucide-react';
import { CertificateCategory, NPC } from '../types';

export default function StudentAffairs() {
    const { student, registerForProject } = useGameStore();

    const [uiTab, setUiTab] = useState<'cert' | 'comp' | 'res'>('cert');

    // Mentor selection modal state
    const [mentorModalOpen, setMentorModalOpen] = useState(false);
    const [selectedResearchId, setSelectedResearchId] = useState<string | null>(null);

    if (!student) return null;

    const activeProjects = student.activeProjects || [];
    const ownedCerts = student.certificates || [];

    const getCategoriesForTab = (tab: string) => {
        switch (tab) {
            case 'cert': return ['language', 'professional', 'skill'];
            case 'comp': return ['competition'];
            case 'res': return ['research'];
            default: return [];
        }
    };

    const filteredCerts = CERTIFICATES.filter(c =>
        getCategoriesForTab(uiTab).includes(c.category)
    );

    const getIcon = (category: CertificateCategory) => {
        switch (category) {
            case 'competition': return <Trophy className="w-5 h-5 text-amber-400" />;
            case 'research': return <Microscope className="w-5 h-5 text-purple-400" />;
            case 'skill': return <Brain className="w-5 h-5 text-blue-400" />;
            default: return <Scroll className="w-5 h-5 text-emerald-400" />;
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4 animate-fade-in p-2 relative">

            {/* Mentor Selection Modal */}
            {mentorModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-dark-700 flex justify-between items-center bg-dark-800/50">
                            <div>
                                <h3 className="font-bold text-lg text-white">选择导师</h3>
                                <p className="text-[10px] text-dark-400 mt-0.5">请选择一位教授指导你的研究项目</p>
                            </div>
                            <button
                                onClick={() => { setMentorModalOpen(false); setSelectedResearchId(null); }}
                                className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto space-y-2 custom-scrollbar">
                            {(() => {
                                const professors = (student.npcs || []).filter((c: NPC) => c.role === 'professor');
                                if (professors.length === 0) {
                                    return (
                                        <div className="text-center py-12 text-dark-500">
                                            <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <User className="w-8 h-8 opacity-20" />
                                            </div>
                                            <p className="text-sm font-bold text-dark-300">暂无可选导师</p>
                                            <p className="text-xs mt-2 max-w-[200px] mx-auto leading-relaxed">你需要先在社交网络或校园活动中结识一位教授。</p>
                                        </div>
                                    );
                                }
                                return professors.map((prof: NPC) => (
                                    <button
                                        key={prof.id}
                                        onClick={() => {
                                            if (selectedResearchId) {
                                                registerForProject(selectedResearchId, prof.id);
                                                setMentorModalOpen(false);
                                                setSelectedResearchId(null);
                                            }
                                        }}
                                        className="w-full p-4 bg-dark-800/40 hover:bg-primary-500/10 border border-dark-700 hover:border-primary-500/50 rounded-xl flex items-center gap-3 transition-all group"
                                    >
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                            {prof.name[0]}
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm group-hover:text-primary-400 transition-colors">{prof.name}</p>
                                            <p className="text-[10px] text-dark-400 truncate mt-0.5">{prof.personality || '深资教授'}</p>
                                        </div>
                                        <div className="text-[10px] px-2 py-1 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded font-bold uppercase tracking-wider">选择</div>
                                    </button>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Active Projects */}
            {activeProjects.length > 0 && (
                <div className="glass-card p-4 bg-primary-900/10 border-primary-500/20 max-h-48 overflow-y-auto no-scrollbar scroll-smooth">
                    <h3 className="text-xs font-bold text-primary-300 uppercase tracking-widest mb-3 flex items-center gap-2 sticky top-0 bg-transparent backdrop-blur-sm pb-2">
                        <PlayCircle className="w-4 h-4 text-primary-400" />
                        进行中的项目
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {activeProjects.map(proj => (
                            <div key={proj.id} className="p-3 bg-dark-800/60 rounded-xl border border-primary-500/30">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        {getIcon(proj.category)}
                                        <span className="font-bold text-sm text-white">{proj.name}</span>
                                    </div>
                                    <span className="text-[10px] text-primary-300 font-mono">
                                        {(proj.currentProgress / proj.maxProgress * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-dark-900 rounded-full overflow-hidden mb-1">
                                    <div
                                        className="h-full bg-primary-500 transition-all duration-500"
                                        style={{ width: `${Math.min(100, proj.currentProgress / proj.maxProgress * 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-dark-400 text-right">需前往图书馆/实验室等地继续推进</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 glass-card bg-dark-900/40 border-dark-800 flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-dark-800">
                    <button
                        onClick={() => setUiTab('cert')}
                        className={`flex-1 py-3 text-sm font-bold transition-all ${uiTab === 'cert' ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/5' : 'text-dark-400 hover:text-dark-200'}`}
                    >
                        考证考级
                    </button>
                    <button
                        onClick={() => setUiTab('comp')}
                        className={`flex-1 py-3 text-sm font-bold transition-all ${uiTab === 'comp' ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5' : 'text-dark-400 hover:text-dark-200'}`}
                    >
                        学科竞赛
                    </button>
                    <button
                        onClick={() => setUiTab('res')}
                        className={`flex-1 py-3 text-sm font-bold transition-all ${uiTab === 'res' ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5' : 'text-dark-400 hover:text-dark-200'}`}
                    >
                        学术科研
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {filteredCerts.map(cert => {
                        const isOwned = ownedCerts.includes(cert.id);
                        const isActive = activeProjects.some(p => p.id === cert.id);
                        const isMajorRestricted = cert.majorReq && cert.majorReq !== student.academic.major.category;
                        const canAfford = student.wallet.balance >= cert.cost;
                        const hasPrereq = cert.prereq ? ownedCerts.includes(cert.prereq) : true;

                        return (
                            <div key={cert.id} className={`relative p-4 rounded-xl border transition-all group ${isOwned ? 'bg-green-500/5 border-green-500/20' :
                                isActive ? 'bg-primary-500/5 border-primary-500/20' :
                                    'bg-dark-800/40 border-dark-700 hover:border-dark-600'
                                }`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${uiTab === 'comp' ? 'bg-amber-500/10 text-amber-500' :
                                            uiTab === 'res' ? 'bg-purple-500/10 text-purple-500' :
                                                'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                            {getIcon(cert.category)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-dark-100 flex items-center gap-2">
                                                {cert.name}
                                                {/* Tags */}
                                                {cert.majorReq && (
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${isMajorRestricted ? 'text-red-400 border-red-500/30' : 'text-blue-400 border-blue-500/30'}`}>
                                                        {isMajorRestricted ? '专业受限' : '专业限定'}
                                                    </span>
                                                )}
                                                {cert.difficulty >= 5 && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded border text-red-400 border-red-500/30 bg-red-500/5">
                                                        高难度
                                                    </span>
                                                )}
                                            </h4>

                                            {/* Stars for Difficulty */}
                                            <div className="flex items-center gap-0.5 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${i < cert.difficulty ? 'text-amber-500 fill-amber-500' : 'text-dark-700'}`}
                                                    />
                                                ))}
                                                <span className="text-[10px] text-dark-500 ml-2">难度系数</span>
                                            </div>

                                            <p className="text-[11px] text-dark-400 mt-2 leading-relaxed max-w-md">
                                                {cert.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex flex-col items-end gap-2">
                                        {isOwned ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-500 px-3 py-1.5 bg-green-500/10 rounded-lg">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                已获得
                                            </span>
                                        ) : isActive ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-primary-400 px-3 py-1.5 bg-primary-500/10 rounded-lg">
                                                <PlayCircle className="w-3.5 h-3.5" />
                                                进行中
                                            </span>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (cert.category === 'research') {
                                                        setSelectedResearchId(cert.id);
                                                        setMentorModalOpen(true);
                                                    } else {
                                                        registerForProject(cert.id);
                                                    }
                                                }}
                                                disabled={isMajorRestricted || !hasPrereq || (cert.category !== 'research' && !canAfford)}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isMajorRestricted || !hasPrereq ? 'bg-dark-800 text-dark-500 cursor-not-allowed' :
                                                    (cert.category !== 'research' && !canAfford) ? 'bg-dark-800 text-red-400 cursor-not-allowed' :
                                                        'bg-dark-200 text-dark-950 hover:bg-white active:scale-95 shadow-lg shadow-black/20'
                                                    }`}
                                            >
                                                {!hasPrereq ? <Lock className="w-3 h-3" /> : isMajorRestricted ? <Lock className="w-3 h-3" /> : null}
                                                {!hasPrereq ? '需前置证书' : cert.category === 'research' ? '选择导师' : (cert.cost > 0 ? `¥${cert.cost} 报名` : '免费报名')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Rewards Preview */}
                                <div className="mt-3 pt-3 border-t border-dark-800/50 flex flex-wrap gap-2">
                                    {cert.rewards.map((reward, i) => (
                                        <span key={i} className="text-[10px] text-dark-500 bg-dark-900/50 px-2 py-1 rounded">
                                            {reward.type === 'attribute' ? `${reward.target} +${reward.value}` :
                                                reward.type === 'money' ? `奖金 ¥${reward.value}` : '特殊奖励'}
                                        </span>
                                    ))}
                                </div>

                                {isMajorRestricted && !isOwned && !isActive && (
                                    <div className="absolute inset-0 bg-dark-950/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <span className="text-xs font-bold text-red-400 bg-dark-900/90 px-3 py-1.5 rounded-lg border border-red-500/30">
                                            仅限 {cert.majorReq} 类专业
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
