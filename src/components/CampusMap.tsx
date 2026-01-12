import { useState, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { CLUBS } from '../data/clubs';
import { LOCATIONS, LocationCategory } from '../data/locations';
import {
    ChevronRight,
    MapPin,
    ArrowLeft,
    TrendingUp,
    ShoppingBag,
    Users,
    Sparkles,
    Heart,
    Zap,
    Target
} from 'lucide-react';
import type { ActionType, ActionRequirement, ActiveProject, CertificateCategory } from '../types';
import ShoppingModal from './ShoppingModal';
import JobBoardModal from './JobBoardModal';
import ClubDashboardModal from './ClubDashboardModal';

export default function CampusMap() {
    const { student, processAction, updateStudent, isLoading, addNotification, workOnProject } = useGameStore();
    const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<'shop' | 'jobs' | 'club_dashboard' | null>(null);
    const [activeTab, setActiveTab] = useState<LocationCategory>('academic');

    if (!student) return null;

    const actionPoints = student.actionPoints || 0;
    const selectedLoc = LOCATIONS.find(l => l.id === selectedLocId);



    // Group locations by category
    const categorizedLocations = useMemo(() => {
        return {
            academic: LOCATIONS.filter(l => l.category === 'academic'),
            living: LOCATIONS.filter(l => l.category === 'living'),
            off_campus: LOCATIONS.filter(l => l.category === 'off_campus'),
        };
    }, []);

    const handleLocationSelect = (locId: string) => {
        setSelectedLocId(locId);
        updateStudent({ currentLocation: locId });
    };

    // === Project-Location Mapping System ===
    // Maps certificate categories to their SINGLE designated study location
    const PROJECT_LOCATION_MAP: Record<CertificateCategory, string> = {
        research: 'innovation_lab',    // 科研项目 → 创新实验室
        competition: 'classroom',      // 学科竞赛 → 公共教学楼
        language: 'language_center',   // 语言考证 → 国际语言中心
        professional: 'tech_park',     // 职业资格 → 高新科技园
        skill: 'library',              // 通用技能 → 中央图书馆
    };

    // Get projects that can be worked on at the current location
    const getRelevantProjects = (locationId: string | null): ActiveProject[] => {
        if (!locationId || !student.activeProjects) return [];

        return student.activeProjects.filter(project => {
            const designatedLocation = PROJECT_LOCATION_MAP[project.category];
            // Only show project at its designated location
            return designatedLocation === locationId;
        });
    };

    // Handle project work action
    const handleProjectWork = (project: ActiveProject) => {
        const BASE_PROGRESS = 15;
        const currentWeek = student.currentDate?.week ?? 1;

        // Calculate progress: base + IQ bonus (always at designated location now)
        const iqBonus = Math.floor((student.attributes?.iq ?? 50) * 0.1);
        const totalProgress = BASE_PROGRESS + iqBonus + 5; // +5 bonus for designated location

        // Use atomic store action
        workOnProject(project.id, totalProgress);

        // Notification is handled by the store but we add a local one for progress feedback
        addNotification(`专注于 [${project.name}]，进度 +${totalProgress} (本周完成)`, 'success');

        console.log('[handleProjectWork] Requesting workOnProject for:', project.id, 'at week:', currentWeek);
    };



    // Get relevant projects for current location
    const relevantProjects = getRelevantProjects(selectedLocId);


    const checkRequirements = (reqs: ActionRequirement[]) => {
        return reqs.every(req => {
            if (req.type === 'attribute') {
                return (student.attributes as any)[req.target] >= req.value;
            }
            return true;
        });
    };

    const handleAction = (type: ActionType, label: string, cost: number) => {
        if (label === '前往超市') {
            setActiveModal('shop');
            return;
        }
        if (label === '查找兼职' || label === '家教中心' || label === '申请家教') {
            setActiveModal('jobs');
            return;
        }

        // Handle Club Joining
        if (type === 'club' && label.includes('招新')) {
            const clubId = label.includes('辩论') ? 'debate_club' : label.includes('街舞') ? 'dance_crew' : 'coding_club';
            const club = CLUBS.find(c => c.id === clubId);

            if (student.currentClub) {
                addNotification(`你已经是 ${student.currentClub} 的成员了，贪多嚼不烂哦。`, 'info');
                return;
            }

            if (club && checkRequirements(club.requirements)) {
                updateStudent({ currentClub: club.name });
                // processAction will create the notification via applyEffects
                processAction('club', cost);
            } else if (club) {
                const reqsMsg = club.requirements.map(req => {
                    const targetLabel = req.target === 'iq' ? '智商' : req.target === 'eq' ? '情商' : req.target === 'charm' ? '魅力' : req.target;
                    return `${targetLabel} >= ${req.value}`;
                }).join(', ');
                addNotification(`条件不足：加入该社团需要更强的能力！(要求: ${reqsMsg})`, 'error');
            }
            return;
        }

        processAction(type, cost);
    };

    const tabs: { id: LocationCategory; label: string }[] = [
        { id: 'academic', label: '教学区' },
        { id: 'living', label: '生活区' },
        { id: 'off_campus', label: '校外' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {!selectedLocId ? (
                <>
                    {/* Category Tabs */}
                    <div className="flex p-1 bg-dark-800/50 rounded-xl backdrop-blur-sm border border-dark-700/50">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {categorizedLocations[activeTab].map((loc) => (
                            <button
                                key={loc.id}
                                onClick={() => handleLocationSelect(loc.id)}
                                className="glass-card p-6 text-left group hover:border-primary-500/50 transition-all hover:bg-dark-800/40 relative overflow-hidden"
                            >
                                {/* Background decoration */}
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${loc.color}-500/5 rounded-full blur-2xl group-hover:bg-${loc.color}-500/10 transition-colors`} />

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${loc.color}-500/10 text-${loc.color}-400 group-hover:bg-${loc.color}-500/20 transition-colors`}>
                                        <loc.icon className="w-6 h-6" />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-dark-600 group-hover:text-dark-300 transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 relative z-10">{loc.name}</h3>
                                <p className="text-sm text-dark-500 line-clamp-2 relative z-10">{loc.description}</p>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    <button
                        onClick={() => setSelectedLocId(null)}
                        className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        返回地图
                    </button>

                    <div className="glass-card p-8 border-primary-500/20 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-${selectedLoc?.color}-500/5 rounded-full blur-3xl`} />

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-${selectedLoc?.color}-500/10 text-${selectedLoc?.color}-400`}>
                                {selectedLoc && <selectedLoc.icon className="w-8 h-8" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white">{selectedLoc?.name}</h2>
                                <p className="text-dark-400">{selectedLoc?.description}</p>
                            </div>
                        </div>

                        {/* Main content area with 3:7 split layout */}
                        <div className="flex flex-col relative z-10" style={{ height: 'calc(100vh - 350px)', minHeight: '400px' }}>

                            {/* === Project Cards Section (30%) === */}
                            {relevantProjects.length > 0 && (
                                <div className="flex-[3] min-h-0 mb-4">
                                    <div className="flex items-center gap-2 mb-3 sticky top-0 bg-dark-900/80 backdrop-blur-sm py-2 -mx-2 px-2">
                                        <Target className="w-4 h-4 text-accent-400" />
                                        <span className="text-xs font-bold text-accent-400 uppercase tracking-wider">当前可推进项目</span>
                                        <span className="text-[10px] text-dark-500">({relevantProjects.length})</span>
                                    </div>
                                    <div className="overflow-y-auto space-y-3 pr-2" style={{ maxHeight: 'calc(100% - 40px)' }}>
                                        {relevantProjects.map((project) => {
                                            const progressPercent = Math.min(100, (project.currentProgress / project.maxProgress) * 100);
                                            const alreadyWorkedThisWeek = project.lastWorkedWeek === student.currentDate?.week;
                                            const categoryLabels: Record<CertificateCategory, string> = {
                                                language: '语言考证',
                                                professional: '职业资格',
                                                competition: '学科竞赛',
                                                research: '学术科研',
                                                skill: '通用技能',
                                            };

                                            return (
                                                <div
                                                    key={project.id}
                                                    className={`p-4 rounded-xl border-2 ${alreadyWorkedThisWeek ? 'border-dark-600/50 bg-dark-800/30 opacity-60' : 'border-primary-500/50 bg-primary-500/5'} relative overflow-hidden`}
                                                >
                                                    {/* Weekly status indicator */}
                                                    {alreadyWorkedThisWeek && (
                                                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-dark-700 rounded text-[9px] font-bold text-dark-400">
                                                            本周已完成
                                                        </div>
                                                    )}

                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            {/* Project name and category */}
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h4 className="text-sm font-bold text-white truncate">{project.name}</h4>
                                                                <span className="px-1.5 py-0.5 bg-dark-700 rounded text-[9px] font-bold text-dark-400 shrink-0">
                                                                    {categoryLabels[project.category] || project.category}
                                                                </span>
                                                            </div>

                                                            {/* Progress bar */}
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${alreadyWorkedThisWeek ? 'bg-gradient-to-r from-dark-500 to-dark-400' : 'bg-gradient-to-r from-primary-500 to-accent-400'}`}
                                                                        style={{ width: `${progressPercent}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] font-mono text-dark-400 shrink-0">
                                                                    {project.currentProgress}/{project.maxProgress}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Action button */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleProjectWork(project);
                                                            }}
                                                            disabled={isLoading || alreadyWorkedThisWeek || actionPoints < 1 || student.attributes.stamina < 15}
                                                            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 ${alreadyWorkedThisWeek
                                                                ? 'bg-dark-600 text-dark-400'
                                                                : 'bg-primary-500 hover:bg-primary-400 text-white'
                                                                }`}
                                                        >
                                                            <Zap className="w-3.5 h-3.5" />
                                                            {alreadyWorkedThisWeek ? '下周可用' : '投入精力'}
                                                        </button>
                                                    </div>

                                                    {/* Cost indicator */}
                                                    <div className="mt-2 flex items-center gap-3 text-[9px] text-dark-500">
                                                        <span>消耗: 1 AP</span>
                                                        <span>-15 体力</span>
                                                        <span className="text-accent-400">每周限1次</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* === Actions Section (70% or 100% if no projects) === */}
                            <div className={`${relevantProjects.length > 0 ? 'flex-[7]' : 'flex-1'} min-h-0`}>
                                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-dark-900/80 backdrop-blur-sm py-2 -mx-2 px-2">
                                    <MapPin className="w-4 h-4 text-primary-400" />
                                    <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">可用行动</span>
                                    <span className="text-[10px] text-dark-500">({selectedLoc?.actions.length || 0})</span>
                                </div>
                                <div className="overflow-y-auto space-y-3 pr-2" style={{ maxHeight: 'calc(100% - 40px)' }}>
                                    {selectedLoc?.actions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAction(action.type, action.label, action.cost)}
                                            disabled={isLoading || (action.cost > 0 && actionPoints < action.cost)}
                                            className="w-full flex items-center justify-between p-5 rounded-xl border border-dark-700 bg-dark-800/40 hover:bg-dark-700/60 hover:border-primary-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center group-hover:bg-primary-600/20 transition-colors">
                                                    {action.type === 'club' ? <Users className="w-5 h-5 text-dark-400 group-hover:text-primary-400" /> : <MapPin className="w-5 h-5 text-dark-400 group-hover:text-primary-400" />}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-white group-hover:text-primary-400 transition-colors">{action.label}</p>
                                                        {action.label.includes('超市') && <ShoppingBag className="w-3.5 h-3.5 text-accent-400" />}
                                                        {action.label.includes('兼职') && <TrendingUp className="w-3.5 h-3.5 text-green-400" />}
                                                        {action.label.includes('招新') && <Users className="w-3.5 h-3.5 text-blue-400" />}
                                                        {action.label.includes('约会') && <Heart className="w-3.5 h-3.5 text-pink-400" />}
                                                    </div>
                                                    <p className="text-[11px] text-dark-500 mt-0.5">{action.desc}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 justify-end">
                                                        <Sparkles className={`w-3 h-3 ${action.cost > 0 ? 'text-amber-500' : 'text-blue-400'}`} />
                                                        <span className={`text-[11px] font-bold ${action.cost > 0 ? 'text-amber-500' : 'text-blue-400'}`}>
                                                            {action.cost > 0 ? `${action.cost} AP` : '免费'}
                                                        </span>
                                                    </div>
                                                    <span className={`text-[9px] font-mono font-bold ${action.stamina >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        体力 {action.stamina >= 0 ? `+${action.stamina}` : action.stamina}
                                                    </span>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-colors ${action.cost > 0
                                                    ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                                                    : 'bg-accent-500/10 border-accent-500/30 text-accent-400 outline-none'
                                                    }`}>
                                                    {action.bonus}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {activeModal === 'shop' && <ShoppingModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'jobs' && <JobBoardModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'club_dashboard' && <ClubDashboardModal onClose={() => setActiveModal(null)} />}
        </div>
    );
}
