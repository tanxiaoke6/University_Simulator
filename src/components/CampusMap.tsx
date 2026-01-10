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
    Heart
} from 'lucide-react';
import type { ActionType, ActionRequirement } from '../types';
import ShoppingModal from './ShoppingModal';
import JobBoardModal from './JobBoardModal';
import ClubDashboardModal from './ClubDashboardModal';

export default function CampusMap() {
    const { student, processAction, updateStudent, isLoading, addNotification } = useGameStore();
    const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<'shop' | 'jobs' | 'club_dashboard' | null>(null);
    const [activeTab, setActiveTab] = useState<LocationCategory>('academic');

    if (!student) return null;

    const actionPoints = student.actionPoints || 0;
    const selectedLoc = LOCATIONS.find(l => l.id === selectedLocId);

    // Check for Club Presence
    const clubAtLocation = CLUBS.find(c => c.location === selectedLocId);
    const isClubMember = student.clubState?.clubId === clubAtLocation?.id;

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

                        <div className="grid grid-cols-1 gap-3 relative z-10">
                            {/* Club Dashboard Button if Member */}
                            {isClubMember && (
                                <button
                                    onClick={() => setActiveModal('club_dashboard')}
                                    className="flex items-center justify-between p-5 rounded-xl border border-primary-500/50 bg-primary-900/20 hover:bg-primary-900/40 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-white">进入社团面板</p>
                                            <p className="text-[11px] text-primary-300 mt-0.5">查看任务、成员与职级</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-primary-400" />
                                </button>
                            )}

                            {selectedLoc?.actions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAction(action.type, action.label, action.cost)}
                                    disabled={isLoading || (action.cost > 0 && actionPoints <= 0)}
                                    className="flex items-center justify-between p-5 rounded-xl border border-dark-700 bg-dark-800/40 hover:bg-dark-700/60 hover:border-primary-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
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
            )}

            {/* Modals */}
            {activeModal === 'shop' && <ShoppingModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'jobs' && <JobBoardModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'club_dashboard' && <ClubDashboardModal onClose={() => setActiveModal(null)} />}
        </div>
    );
}
