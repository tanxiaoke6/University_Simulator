// ClubManagement - Dual-Track Club & Student Council System
import { useGameStore } from '../stores/gameStore';
import { CLUBS } from '../data/clubs';
import {
    Users,
    Building2,
    Clock,
    Crown,
    Shield,
    Megaphone,
    FileText,
    Check,
    Lock,
    AlertCircle,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import type { Club, ClubRank, CouncilRank, CouncilDepartment } from '../types';

export default function ClubManagement() {
    const { student, updateStudent, addNotification, interactWithClubMember, updateCouncilKPI } = useGameStore();

    if (!student) return null;

    // Filter out Student Council from interest clubs list
    const interestClubs = CLUBS.filter(c => c.id !== 'student_council');

    const getRankLabel = (rank: ClubRank) => {
        const map = { Member: '成员', 'Vice President': '副社长', President: '社长' };
        return (map as any)[rank] || '成员';
    };

    const getCouncilRankLabel = (rank: CouncilRank) => {
        const map = { Staff: '干事', Minister: '部长', Chairman: '主席' };
        return (map as any)[rank] || '干事';
    };

    const getDepartmentLabel = (dept: CouncilDepartment | null) => {
        if (!dept) return '未分配';
        const map = { secretariat: '秘书处', discipline: '纪检部', publicity: '宣传部' };
        return map[dept] || '未分配';
    };

    const getDepartmentIcon = (dept: CouncilDepartment | null) => {
        if (dept === 'secretariat') return <FileText className="w-4 h-4" />;
        if (dept === 'discipline') return <Shield className="w-4 h-4" />;
        if (dept === 'publicity') return <Megaphone className="w-4 h-4" />;
        return <Building2 className="w-4 h-4" />;
    };

    const canJoinClub = (club: Club) => {
        // Check if already in a club
        if (student.clubs.id) return { can: false, reason: '你已加入一个社团' };
        if (student.clubs.pendingClubId) return { can: false, reason: '你正在等待审核' };

        // Check requirements
        for (const req of club.requirements) {
            if (req.type === 'attribute') {
                const attrValue = (student.attributes as any)[req.target];
                if (attrValue !== undefined && attrValue < req.value) {
                    return { can: false, reason: `${req.target} 不足 (需要 ${req.value})` };
                }
            }
        }
        return { can: true, reason: '' };
    };

    const canJoinCouncil = () => {
        if (student.council.joined) return { can: false, reason: '你已加入学生会' };

        // Hard requirements for Student Council
        if (student.academic.gpa < 3.5) return { can: false, reason: 'GPA 需要 ≥ 3.5' };
        if (student.attributes.charm < 50) return { can: false, reason: '魅力值需要 ≥ 50' };
        if (student.attributes.employability < 40) return { can: false, reason: '就业力需要 ≥ 40' };

        return { can: true, reason: '' };
    };

    const handleApplyClub = (club: Club) => {
        // Set to pending (assessment period - next week)
        updateStudent({
            clubs: {
                ...student.clubs,
                pendingClubId: club.id,
            }
        });
        addNotification(`已申请加入 ${club.name}，将于下周公布结果`, 'info');
    };

    const handleJoinCouncil = (department: CouncilDepartment) => {
        updateStudent({
            council: {
                ...student.council,
                joined: true,
                department,
                rank: 'Staff',
                contribution: 0,
                reputation: 0,
                departmentKPI: 0,
                authorityLevel: 1,
            }
        });
        addNotification(`已加入学生会 ${getDepartmentLabel(department)}！`, 'success');
    };

    const handleQuitClub = () => {
        updateStudent({
            clubs: {
                id: null,
                currentRank: 'Member',
                contribution: 0,
                members: [],
                unlockBudget: false,
                pendingClubId: null,
                joinWeek: 0,
            }
        });
        addNotification('已退出社团', 'info');
    };

    const handleQuitCouncil = () => {
        updateStudent({
            council: {
                joined: false,
                department: null,
                rank: 'Staff',
                contribution: 0,
                reputation: 0,
                departmentKPI: 0,
                authorityLevel: 1,
            }
        });
        addNotification('已退出学生会', 'info');
    };

    const currentClub = student.clubs.id ? CLUBS.find(c => c.id === student.clubs.id) : null;
    const councilCheck = canJoinCouncil();

    return (
        <div className="h-full overflow-y-auto animate-fade-in">
            <header className="mb-6">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <Users className="w-7 h-7 text-primary-500" />
                    社团与学生会
                </h2>
                <p className="text-sm text-dark-500 mt-1">你可以同时加入一个兴趣社团和学生会</p>
            </header>

            {/* Dual Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ============ LEFT PANEL: Interest Clubs ============ */}
                <div className="bg-dark-800/30 rounded-2xl border border-dark-700/50 p-5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        兴趣社团
                    </h3>
                    <p className="text-[11px] text-dark-500 mb-4">选择你感兴趣的社团，申请后需等待一周审核期</p>

                    {/* Current Club Status Dashboard */}
                    {currentClub ? (
                        <div className="space-y-4 mb-4">
                            <div className="p-4 bg-gradient-to-br from-amber-900/40 to-orange-900/30 rounded-2xl border border-amber-500/30 shadow-lg shadow-amber-900/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                                            <Crown className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-base">{currentClub.name}</h4>
                                            <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">{getRankLabel(student.clubs.currentRank)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-dark-500 uppercase">贡献等级</p>
                                        <p className="text-sm font-mono font-bold text-amber-400">{student.clubs.contribution}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-dark-400">
                                    <span>入社时间: 第 {student.clubs.joinWeek} 周</span>
                                    <button onClick={handleQuitClub} className="text-red-400 hover:text-red-300 font-bold transition-colors">退出社团</button>
                                </div>
                            </div>

                            {/* Club Members / NPC Interactions */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="w-3 h-3" /> 核心成员互动
                                </h4>
                                {student.clubs.members.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {student.clubs.members.map(npc => (
                                            <div key={npc.id} className="p-3 bg-dark-800/80 rounded-xl border border-dark-700/50 flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{npc.avatar}</span>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-white">{npc.name}</span>
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-dark-700 text-dark-400 rounded-full uppercase">{npc.role}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <div className="h-1 w-12 bg-dark-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-pink-500" style={{ width: `${npc.intimacy}%` }} />
                                                            </div>
                                                            <span className="text-[9px] text-dark-500">亲密度: {npc.intimacy}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => interactWithClubMember && interactWithClubMember(npc.id)}
                                                    className="p-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-[10px] text-dark-600 border border-dashed border-dark-700 rounded-xl">
                                        暂无核心成员信息
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : student.clubs.pendingClubId ? (

                        <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-700/30 mb-4 flex items-center gap-3">
                            <Clock className="w-6 h-6 text-blue-400 animate-pulse" />
                            <div>
                                <p className="text-sm font-bold text-blue-300">审核中</p>
                                <p className="text-[10px] text-dark-500">
                                    已申请: {CLUBS.find(c => c.id === student.clubs.pendingClubId)?.name}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {/* Club List - Only show if not in a club and no pending application */}
                    {!student.clubs.id && !student.clubs.pendingClubId && (
                        <div className="space-y-3">
                            {interestClubs.map(club => {
                                const check = canJoinClub(club);
                                const isCurrentClub = student.clubs.id === club.id;

                                return (
                                    <div
                                        key={club.id}
                                        className={`p-4 rounded-xl border transition-all ${isCurrentClub
                                            ? 'bg-amber-900/20 border-amber-700/50'
                                            : 'bg-dark-800/50 border-dark-700/30 hover:border-amber-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{club.name}</h4>
                                                <p className="text-[10px] text-dark-500">{club.description}</p>
                                            </div>
                                            {isCurrentClub && <Check className="w-5 h-5 text-green-400" />}
                                        </div>

                                        {/* Requirements */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {club.requirements.map((req, i) => (
                                                <span
                                                    key={i}
                                                    className="text-[9px] px-1.5 py-0.5 bg-dark-700/50 text-dark-400 rounded"
                                                >
                                                    {req.target}: {req.value}+
                                                </span>
                                            ))}
                                        </div>

                                        {/* Join Button */}
                                        {!isCurrentClub && !student.clubs.id && !student.clubs.pendingClubId && (
                                            <button
                                                onClick={() => handleApplyClub(club)}
                                                disabled={!check.can}
                                                className={`w-full py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${check.can
                                                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                                                    : 'bg-dark-700/30 text-dark-500 border border-dark-700/30 cursor-not-allowed'
                                                    }`}
                                            >
                                                {check.can ? (
                                                    <>申请加入 <ChevronRight className="w-4 h-4" /></>
                                                ) : (
                                                    <><Lock className="w-3 h-3" /> {check.reason}</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

                {/* ============ RIGHT PANEL: Student Council ============ */}
                <div className="bg-dark-800/30 rounded-2xl border border-dark-700/50 p-5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        学生会
                    </h3>
                    <p className="text-[11px] text-dark-500 mb-4">管理与权力的中心，满足条件可立即加入</p>

                    {/* Current Council Status Dashboard */}
                    {student.council.joined ? (
                        <div className="space-y-5 mb-4">
                            <div className="p-5 bg-gradient-to-br from-blue-900/40 to-indigo-900/30 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-900/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            {getDepartmentIcon(student.council.department)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{getDepartmentLabel(student.council.department)}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-bold uppercase tracking-widest">
                                                    {getCouncilRankLabel(student.council.rank)}
                                                </span>
                                                <span className="text-[10px] text-dark-400">权威等级: LV.{student.council.authorityLevel}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-dark-500 uppercase">年度声望</p>
                                        <p className="text-base font-mono font-bold text-blue-400">{student.council.reputation}</p>
                                    </div>
                                </div>

                                {/* KPI Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-tighter">
                                        <span className="text-dark-400">部门 KPI 达成率</span>
                                        <span className={student.council.departmentKPI > 80 ? 'text-green-400' : 'text-amber-400'}>
                                            {student.council.departmentKPI}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-dark-950 rounded-full border border-dark-700/50 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${student.council.departmentKPI > 80 ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${student.council.departmentKPI}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={() => updateCouncilKPI && updateCouncilKPI(10)}
                                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold rounded-xl transition-all border border-blue-500/20"
                                    >
                                        执行日常校务 (+10% KPI)
                                    </button>
                                    <button onClick={handleQuitCouncil} className="text-red-400 hover:text-red-300 text-[11px] font-bold">退出学生会</button>
                                </div>
                            </div>

                            {/* Council Actions / Opportunities */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2">
                                    <Building2 className="w-3 h-3" /> 部门职权
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="p-3 bg-dark-800/80 rounded-xl border border-dark-700/50 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-dark-400">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white">审批校园悬赏任务</p>
                                            <p className="text-[10px] text-dark-500">向全校发布学术或社交委托</p>
                                        </div>
                                        <Lock className="w-3.5 h-3.5 text-dark-600" />
                                    </div>
                                    <div className="p-3 bg-dark-800/80 rounded-xl border border-dark-700/50 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-dark-400">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white">校园纠纷调解</p>
                                            <p className="text-[10px] text-dark-500">消耗威望直接降低学生压力值</p>
                                        </div>
                                        <Lock className="w-3.5 h-3.5 text-dark-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (

                        <>
                            {/* Requirements Display */}
                            <div className="p-3 bg-dark-800/50 rounded-lg border border-dark-700/30 mb-4">
                                <p className="text-[10px] font-bold text-dark-400 uppercase mb-2">加入条件</p>
                                <div className="space-y-1.5">
                                    <div className={`flex items-center gap-2 text-[11px] ${student.academic.gpa >= 3.5 ? 'text-green-400' : 'text-red-400'}`}>
                                        {student.academic.gpa >= 3.5 ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        GPA ≥ 3.5 (当前: {student.academic.gpa.toFixed(2)})
                                    </div>
                                    <div className={`flex items-center gap-2 text-[11px] ${student.attributes.charm >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                        {student.attributes.charm >= 50 ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        魅力 ≥ 50 (当前: {student.attributes.charm})
                                    </div>
                                    <div className={`flex items-center gap-2 text-[11px] ${student.attributes.employability >= 40 ? 'text-green-400' : 'text-red-400'}`}>
                                        {student.attributes.employability >= 40 ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        就业力 ≥ 40 (当前: {student.attributes.employability})
                                    </div>
                                </div>
                            </div>

                            {/* Department Selection */}
                            {councilCheck.can ? (
                                <div className="space-y-3">
                                    <p className="text-[11px] font-bold text-dark-400 uppercase">选择部门加入</p>
                                    {(['secretariat', 'discipline', 'publicity'] as CouncilDepartment[]).map(dept => (
                                        <button
                                            key={dept}
                                            onClick={() => handleJoinCouncil(dept)}
                                            className="w-full p-3 bg-dark-800/50 hover:bg-blue-900/20 rounded-lg border border-dark-700/30 hover:border-blue-500/30 transition-all flex items-center gap-3"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                {getDepartmentIcon(dept)}
                                            </div>
                                            <div className="text-left flex-1">
                                                <h4 className="text-sm font-bold text-white">{getDepartmentLabel(dept)}</h4>
                                                <p className="text-[10px] text-dark-500">
                                                    {dept === 'secretariat' && '文书工作、会议纪要、信息整理'}
                                                    {dept === 'discipline' && '校园秩序、检查巡逻、纪律监督'}
                                                    {dept === 'publicity' && '活动宣传、海报设计、新媒体运营'}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-dark-500" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700/30 text-center">
                                    <Lock className="w-8 h-8 text-dark-600 mx-auto mb-2" />
                                    <p className="text-sm text-dark-500">暂不满足加入条件</p>
                                    <p className="text-[10px] text-dark-600 mt-1">{councilCheck.reason}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
