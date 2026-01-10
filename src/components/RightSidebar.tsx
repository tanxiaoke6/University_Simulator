// Right Sidebar - Inventory & NPC List
import { useState } from 'react';
import type { StudentState, NPC } from '../types';
import {
    Users,
    Heart,
    HeartCrack,
    User,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

interface RightSidebarProps {
    student: StudentState;
}

export default function RightSidebar({ student }: RightSidebarProps) {
    const [showNPCs, setShowNPCs] = useState(true);

    return (
        <aside className="sidebar animate-slide-in-right border-l border-dark-700/50 border-r-0">
            {/* NPCs Section */}
            <div className="glass-card-light overflow-hidden">
                <button
                    onClick={() => setShowNPCs(!showNPCs)}
                    className="w-full p-4 flex items-center justify-between hover:bg-dark-800/30 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-400" />
                        <span className="font-medium">人际关系</span>
                        <span className="text-dark-500 text-sm">({student.npcs.length})</span>
                    </div>
                    {showNPCs ? (
                        <ChevronUp className="w-4 h-4 text-dark-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-dark-500" />
                    )}
                </button>

                {showNPCs && (
                    <div className="p-2 pt-0 space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
                        {student.npcs.length === 0 ? (
                            <p className="text-dark-500 text-sm text-center py-4">暂无人际关系</p>
                        ) : (
                            student.npcs.map((npc) => (
                                <NPCCard key={npc.id} npc={npc} />
                            ))
                        )}
                    </div>
                )}
            </div>



            {/* Quick Stats */}
            <div className="glass-card-light p-4">
                <h3 className="text-dark-400 text-sm mb-3">游戏进度</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-dark-500">已过周数</span>
                        <span className="text-dark-300">
                            {(student.currentDate.year - 1) * 40 + (student.currentDate.semester - 1) * 20 + student.currentDate.week} / 160
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-dark-500">事件数</span>
                        <span className="text-dark-300">{student.eventHistory.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-dark-500">成就数</span>
                        <span className="text-dark-300">{student.flags.achievements.length}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// NPC Card Component
function NPCCard({ npc }: { npc: NPC }) {
    const relationshipColor =
        npc.relationshipScore > 50 ? 'text-green-400' :
            npc.relationshipScore > 0 ? 'text-primary-400' :
                npc.relationshipScore > -50 ? 'text-yellow-400' : 'text-red-400';

    const roleLabels: Record<string, string> = {
        roommate: '室友',
        classmate: '同学',
        professor: '教授',
        crush: '暗恋对象',
        partner: '恋人',
        friend: '朋友',
        rival: '对手',
        employer: '雇主',
    };

    return (
        <div className="npc-card">
            <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-dark-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{npc.name}</p>
                <p className="text-xs text-dark-500">{roleLabels[npc.role] || npc.role}</p>
            </div>
            <div className={`flex items-center gap-1 ${relationshipColor}`}>
                {npc.relationshipScore >= 0 ? (
                    <Heart className="w-3 h-3" />
                ) : (
                    <HeartCrack className="w-3 h-3" />
                )}
                <span className="text-xs">{npc.relationshipScore}</span>
            </div>
        </div>
    );
}


