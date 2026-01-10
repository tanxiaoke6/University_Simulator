import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { CLUBS } from '../data/clubs';
import {
    Library,
    Coffee,
    Dumbbell,
    Home,
    Sparkles,
    ChevronRight,
    MapPin,
    ArrowLeft,
    TrendingUp,
    ShoppingBag,
    Users
} from 'lucide-react';
import type { ActionType, ActionRequirement } from '../types';
import ShoppingModal from './ShoppingModal';
import JobBoardModal from './JobBoardModal';

interface Location {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    actions: {
        type: ActionType;
        label: string;
        cost: number;
        stamina: number;
        desc: string;
        bonus?: string;
    }[];
}

const LOCATIONS: Location[] = [
    {
        id: 'library',
        name: '中央图书馆',
        description: '安静的自习室，最适合提升学习成绩。这里也有勤工助学的岗位发布。',
        icon: <Library className="w-6 h-6" />,
        color: 'primary',
        actions: [
            { type: 'study', label: '深度学习', cost: 1, stamina: -20, desc: '专注研究学术问题。', bonus: 'GPA/IQ +' },
            { type: 'work', label: '查找兼职', cost: 0, stamina: 0, desc: '查看告示板上的最新兼职。', bonus: '获得报酬' },
            { type: 'club', label: 'ACM协会招新', cost: 1, stamina: -15, desc: '加入算法竞赛协会。', bonus: '智力重大提升' },
        ]
    },
    {
        id: 'cafeteria',
        name: '学生生活区',
        description: '提供美食享受与日常购物，是休息 and 补给的绝佳选择。',
        icon: <Coffee className="w-6 h-6" />,
        color: 'orange',
        actions: [
            { type: 'relax', label: '悠闲午餐', cost: 0, stamina: 15, desc: '享用一顿美餐，恢复少量体力。', bonus: '不计步数' },
            { type: 'study', label: '前往超市', cost: 0, stamina: 0, desc: '购买能量饮料、礼物或其他道具。', bonus: '购买物品' },
            { type: 'club', label: '辩论队招新', cost: 1, stamina: -10, desc: '加入学校辩论队。', bonus: '情商提升' },
        ]
    },
    {
        id: 'gym',
        name: '体育馆',
        description: '充满汗水和激情的运动场馆。',
        icon: <Dumbbell className="w-6 h-6" />,
        color: 'green',
        actions: [
            { type: 'exercise', label: '器械训练', cost: 1, stamina: -15, desc: '锻炼身体，提升魅力。', bonus: '体力上限 +2' },
            { type: 'club', label: '街舞团招新', cost: 1, stamina: -20, desc: '加入校园最火的舞团。', bonus: '魅力大幅提升' },
        ]
    },
    {
        id: 'dorm',
        name: '学生宿舍',
        description: '你的温馨避风港，可以放松休息或社交。',
        icon: <Home className="w-6 h-6" />,
        color: 'purple',
        actions: [
            { type: 'relax', label: '深度睡眠', cost: 1, stamina: 40, desc: '彻底恢复精神。', bonus: '压力 -20' },
            { type: 'socialize', label: '宿舍夜谈', cost: 1, stamina: -10, desc: '与室友增进感情。', bonus: '人际关系 +' },
        ]
    }
];

export default function CampusMap() {
    const { student, processAction, updateStudent, isLoading } = useGameStore();
    const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<'shop' | 'jobs' | null>(null);

    if (!student) return null;

    const actionPoints = student.actionPoints || 0;
    const selectedLoc = LOCATIONS.find(l => l.id === selectedLocId);

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
        if (label === '查找兼职') {
            setActiveModal('jobs');
            return;
        }

        // Handle Club Joining
        if (type === 'club' && label.includes('招新')) {
            const clubId = label.includes('辩论') ? 'debate_club' : label.includes('街舞') ? 'dance_crew' : 'coding_club';
            const club = CLUBS.find(c => c.id === clubId);

            if (student.currentClub) {
                alert(`你已经是 ${student.currentClub} 的成员了，贪多嚼不烂哦。`);
                return;
            }

            if (club && checkRequirements(club.requirements)) {
                updateStudent({ currentClub: club.name });
                alert(`恭喜！你已正式加入 [${club.name}]！`);
                processAction('club', cost);
            } else if (club) {
                alert(`条件不足：加入该社团需要更强的能力！\n要求: ${club.requirements.map(req => {
                    const targetLabel = req.target === 'iq' ? '智商' : req.target === 'eq' ? '情商' : req.target === 'charm' ? '魅力' : req.target;
                    return `${targetLabel} >= ${req.value}`;
                }).join(', ')}`);
            }
            return;
        }

        processAction(type, cost);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {!selectedLocId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {LOCATIONS.map((loc) => (
                        <button
                            key={loc.id}
                            onClick={() => setSelectedLocId(loc.id)}
                            className="glass-card p-6 text-left group hover:border-primary-500/50 transition-all hover:bg-dark-800/40"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${loc.color}-500/10 text-${loc.color}-400 group-hover:bg-${loc.color}-500/20 transition-colors`}>
                                    {loc.icon}
                                </div>
                                <ChevronRight className="w-5 h-5 text-dark-600 group-hover:text-dark-300 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{loc.name}</h3>
                            <p className="text-sm text-dark-500 line-clamp-2">{loc.description}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    <button
                        onClick={() => setSelectedLocId(null)}
                        className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        返回地图
                    </button>

                    <div className="glass-card p-8 border-primary-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-primary-500/10 text-primary-400`}>
                                {selectedLoc?.icon}
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white">{selectedLoc?.name}</h2>
                                <p className="text-dark-400">{selectedLoc?.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
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
        </div>
    );
}
