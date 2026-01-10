// Game Store - Zustand State Management (Refactored for Persistence and Safety)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    GameState,
    GamePhase,
    StudentState,
    GameConfig,
    GameEvent,
    ActionType,
    ActionEffect,
    NPC,
    ClubNPC,
    GameDate,
} from '../types';
import { CERTIFICATES } from '../data/certificates';
import {
    getDefaultConfig,
    getNextEvent,
    generateWeeklySchedule,
} from './gameData';
import { LOCATIONS } from '../data/locations';
import { CLUBS } from '../data/clubs';
import { generateDynamicEvent, generateMockEventSync, generateNPCReply } from '../services/aiService';

interface GameActions {
    // Phase Management
    setPhase: (phase: GamePhase) => void;
    startNewGame: (student: StudentState) => void;
    resetGame: () => void;

    // Student Actions
    updateStudent: (update: Partial<StudentState>) => void;
    applyEffects: (effects: ActionEffect[]) => void;

    // Game Flow
    nextTurn: () => Promise<void>;
    processAction: (actionType: ActionType, apCost?: number) => void;

    // Club Actions
    joinClub: (clubId: string) => void;
    quitClub: () => void;
    performClubTask: (taskId: string) => void;

    // Emergency Recovery
    forceUnlock: () => void;

    // Config & Settings
    setConfig: (config: Partial<GameConfig>) => void;
    loadConfigFromFile: () => Promise<void>;
    importSave: (json: string) => boolean;
    exportSave: () => string;

    // Smartphone Actions
    useItem: (itemId: string) => void;
    chatWithNPC: (npcId: string) => void;

    // Planner Actions
    applyJob: (jobId: string) => void;
    quitJob: () => void;
    updateGoalProgress: (goalId: string, progress: number) => void;

    // Event Handling
    resolveEvent: (choiceId: string) => void;
    setError: (error: string | null) => void;

    // Async & Honors
    registerForExam: (certId: string) => void;

    // Chat
    sendChatMessage: (npcId: string, message: string) => Promise<void>;

    // Friend Management
    addFriendFromForum: (name: string, personality: string) => void;
    toggleMomentsPermission: (npcId: string) => void;
    deleteFriend: (npcId: string) => void;

    // Moments
    likeMoment: (npcId: string, momentId: string) => void;
    commentOnMoment: (npcId: string, momentId: string, content: string) => void;

    // Curriculum Actions
    toggleAttendance: (scheduleEntryId: string, cost: number) => void;

    // Deep Club & Council Actions
    interactWithClubMember: (memberId: string) => void;
    updateCouncilKPI: (amount: number) => void;

    // Notifications
    addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
    dismissNotification: (id: string) => void;
}

export type GameStore = GameState & GameActions;

const initialState: GameState = {
    phase: 'main_menu',
    student: null,
    config: getDefaultConfig(),
    currentEvent: null,
    currentChatNPC: null,
    isLoading: false,
    error: null,
};

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setPhase: (phase) => set({ phase }),

            startNewGame: (student) => set({
                student,
                phase: 'playing',
                currentEvent: null,
                error: null
            }),

            resetGame: () => {
                const { config } = get(); // Capture current config before reset
                set({
                    ...initialState,
                    config, // Preserve LLM settings (apiKey, baseUrl, model)
                });
                localStorage.removeItem('university-simulator-save');
            },

            forceUnlock: () => {
                console.warn("!! Emergency Force Unlock Triggered !!");
                set({ isLoading: false });
            },

            updateStudent: (update) => set((state) => ({
                student: state.student ? { ...state.student, ...update } : null
            })),

            applyEffects: (effects) => {
                const s = get().student;
                if (!s) return;

                const student = { ...s };
                const messages: string[] = [];

                try {
                    effects.forEach(effect => {
                        if (typeof effect.value !== 'number' || isNaN(effect.value)) return;

                        if (effect.type === 'money') {
                            const diff = effect.value;
                            student.money = Math.max(0, student.money + diff);
                            student.wallet.balance = student.money;
                            messages.push(`${diff >= 0 ? '获得' : '支付'} ¥${Math.abs(diff)}`);
                        } else if (effect.type === 'attribute') {
                            const attr = effect.target as keyof typeof student.attributes;
                            const diff = effect.value;
                            if (student.attributes[attr] !== undefined) {
                                student.attributes[attr] = Math.min(100, Math.max(0, student.attributes[attr] + diff));
                                const attrLabels: Record<string, string> = {
                                    stamina: '体力', iq: '智力', eq: '情商', charm: '魅力', luck: '运气', stress: '压力', employability: '就业力'
                                };
                                const label = attrLabels[attr] || attr;
                                messages.push(`${label}${diff >= 0 ? '+' : ''}${diff}`);
                            }
                        } else if (effect.type === 'gpa') {
                            const diff = effect.value;
                            student.academic.gpa = Math.min(4.0, Math.max(0, student.academic.gpa + diff));
                            messages.push(`GPA${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`);
                        } else if (effect.type === 'relationship') {
                            const npc = student.npcs.find(n => n.id === effect.target);
                            if (npc) {
                                const diff = effect.value;
                                npc.relationshipScore = Math.min(100, Math.max(-100, npc.relationshipScore + diff));
                                messages.push(`${npc.name}好感${diff >= 0 ? '+' : ''}${diff}`);
                            }
                        }
                    });

                    if (messages.length > 0) {
                        student.notifications = [
                            ...student.notifications,
                            {
                                id: `agg_notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                                message: messages.join(', '),
                                type: effects.some(e => e.value > 0) ? 'success' : 'info',
                                read: false,
                                timestamp: Date.now()
                            }
                        ];
                    }
                } catch (e) {
                    console.error('Failed to apply effects:', e);
                }

                set({ student });
            },

            processAction: (actionType, apCost = 1) => {
                const { student, applyEffects } = get();
                if (!student) return;

                if (apCost > 0 && student.actionPoints < apCost) {
                    console.warn("[!] Out of Action Points");
                    return;
                }

                const effects: ActionEffect[] = [];

                switch (actionType) {
                    case 'study':
                        effects.push({ type: 'attribute', target: 'iq', value: 2 });
                        effects.push({ type: 'attribute', target: 'stamina', value: -15 });
                        effects.push({ type: 'attribute', target: 'stress', value: 5 });
                        effects.push({ type: 'gpa', target: 'gpa', value: 0.05 });
                        break;
                    case 'socialize':
                        effects.push({ type: 'attribute', target: 'eq', value: 3 });
                        effects.push({ type: 'attribute', target: 'stamina', value: -10 });
                        effects.push({ type: 'attribute', target: 'money', value: -100 });
                        break;
                    case 'work':
                        effects.push({ type: 'money', target: 'money', value: 500 });
                        effects.push({ type: 'attribute', target: 'stamina', value: -20 });
                        effects.push({ type: 'attribute', target: 'stress', value: 10 });
                        break;
                    case 'relax':
                        effects.push({ type: 'attribute', target: 'stamina', value: 25 });
                        effects.push({ type: 'attribute', target: 'stress', value: -15 });
                        break;
                    case 'exercise':
                        effects.push({ type: 'attribute', target: 'stamina', value: 10 });
                        effects.push({ type: 'attribute', target: 'charm', value: 2 });
                        effects.push({ type: 'attribute', target: 'stress', value: -5 });
                        break;
                    case 'club':
                        effects.push({ type: 'attribute', target: 'eq', value: 2 });
                        effects.push({ type: 'attribute', target: 'charm', value: 1 });
                        effects.push({ type: 'attribute', target: 'stamina', value: -10 });
                        break;
                }

                // Deduct Action Points and Advance Day
                if (apCost > 0) {
                    set((state) => {
                        if (!state.student) return state;
                        let { day } = state.student.currentDate;

                        // Advance day: Every 1 AP = 1 Day
                        day += apCost;

                        // Capping day at 7 for this week. Week advancement happens in nextTurn.
                        const newDay = Math.min(7, day);

                        return {
                            student: {
                                ...state.student,
                                actionPoints: Math.max(0, state.student.actionPoints - apCost),
                                currentDate: { ...state.student.currentDate, day: newDay }
                            }
                        };
                    });
                }

                applyEffects(effects);
            },

            // --- Club Logic ---
            joinClub: (clubId: string) => {
                const { student, addNotification } = get();
                if (!student) return;
                const club = CLUBS.find(c => c.id === clubId);
                if (!club) return;

                set(state => ({
                    student: {
                        ...state.student!,
                        currentClub: clubId, // Legacy compatibility
                        clubState: {
                            clubId: clubId,
                            rank: 'Member',
                            reputation: 0,
                            joinedDate: state.student!.currentDate
                        }
                    }
                }));
                addNotification(`恭喜加入 ${club.name}！`, 'success');
            },

            quitClub: () => {
                const { student } = get();
                if (!student) return;
                set(state => ({
                    student: {
                        ...state.student!,
                        currentClub: undefined,
                        clubState: null
                    }
                }));
                get().addNotification('你已退出该社团。', 'info');
            },

            performClubTask: (taskId: string) => {
                const { student, updateStudent, addNotification } = get();
                if (!student || !student.clubState) return;

                const club = CLUBS.find(c => c.id === student.clubState!.clubId);
                const task = club?.tasks.find(t => t.id === taskId);

                if (!club || !task) return;

                // Check Cost
                if ((student.actionPoints || 0) < 1) {
                    addNotification('行动点不足 (AP)', 'error');
                    return;
                }
                if ((student.attributes.stamina || 0) < task.energyCost) {
                    addNotification('体力不足', 'error');
                    return;
                }

                // Apply Deductions
                const newAp = (student.actionPoints || 0) - 1;
                const newStamina = (student.attributes.stamina || 0) - task.energyCost;

                // Apply Rewards
                const reputationGain = task.rewards.reputation;
                // Use new dual-track clubs state
                const currentRep = student.clubs.contribution + reputationGain;
                let newRank = student.clubs.currentRank;

                // Promotion Logic
                let promotionMsg = '';
                if (currentRep >= 300 && newRank !== 'President') {
                    newRank = 'President';
                    promotionMsg = '你被提拔为社团主席！解锁更多管理权限！';
                } else if (currentRep >= 100 && newRank === 'Member') {
                    newRank = 'Vice President';
                    promotionMsg = '你晋升为副主席！';
                }

                // Attribute Rewards
                const newAttributes = { ...student.attributes, stamina: newStamina };
                if (task.rewards.attribute) {
                    const attrKey = task.rewards.attribute.target as keyof typeof newAttributes;
                    if (typeof newAttributes[attrKey] === 'number') {
                        (newAttributes[attrKey] as number) += task.rewards.attribute.value;
                    }
                }

                updateStudent({
                    actionPoints: newAp,
                    attributes: newAttributes,
                    clubs: {
                        ...student.clubs,
                        contribution: currentRep,
                        currentRank: newRank
                    }
                });

                addNotification(`完成任务：${task.name} (声望 +${reputationGain})`, 'success');
                if (promotionMsg) addNotification(promotionMsg, 'success');
            },

            nextTurn: async () => {
                const { student, config, isLoading } = get();
                if (!student || isLoading) return;

                set({ isLoading: true, error: null });

                try {
                    // --- 1. Advance Date ---
                    let { year, semester, week, day } = student.currentDate;
                    week++;
                    day = 1; // Reset to Monday

                    let newWeeklySchedule = student.weeklySchedule;
                    let newNotifications = student.notifications || [];
                    let newGPA = student.academic.gpa;

                    if (week > 20) {
                        week = 1;
                        semester++;

                        // --- Semester End Logic ---
                        // 1. Finalize Grades for Active Courses
                        const courseRecords = { ...student.courseRecords };
                        let totalGradePoints = 0;
                        let totalAttemptedCredits = 0;

                        Object.values(courseRecords).forEach(record => {
                            if (record.status === 'active') {
                                // Calculate Final Grade based on Attendance
                                // Base calculation: 4.0 * Attendance Rate
                                // Optionally adds exam score influence? For now, purely attendance driven + 0.5 random variance
                                const attendanceRate = record.totalClasses > 0 ? (record.attendedCount / record.totalClasses) : 1;
                                let finalScore = 4.0 * attendanceRate;

                                // Random fluctuation for "Exam Performance" (+/- 0.5)
                                finalScore += (Math.random() - 0.2);
                                finalScore = Math.max(0, Math.min(4.0, finalScore));

                                record.grade = Number(finalScore.toFixed(2));
                                record.status = finalScore >= 1.0 ? 'passed' : 'failed';
                            }

                            // Accumulate for Cumulative GPA
                            totalGradePoints += record.grade;
                            totalAttemptedCredits += 1;
                        });

                        // 2. Update GPA
                        newGPA = totalAttemptedCredits > 0 ? (totalGradePoints / totalAttemptedCredits) : 4.0;
                        // @ts-ignore - fixing GPA access
                        if (student.academic) newGPA = Number(newGPA.toFixed(2));

                        // 3. Generate New Schedule
                        if (semester > 2) {
                            semester = 1;
                            year++;
                        }

                        newWeeklySchedule = await generateWeeklySchedule(config, student.academic.major, year, semester);
                        // studentUpdate.weeklySchedule = newSchedule; // Handled by newWeeklySchedule
                        // studentUpdate.courseRecords = courseRecords; // Handled by courseRecords variable

                        // Notify User
                        newNotifications = [
                            ...(student.notifications || []),
                            {
                                id: `sem_end_${Date.now()}`,
                                message: `第 ${year} 学年 第 ${semester === 1 ? 2 : 1} 学期结束。你的 GPA 更新为: ${newGPA.toFixed(2)}`,
                                type: 'info',
                                read: false,
                                timestamp: Date.now()
                            }
                        ];

                        // End Semester Logic
                    }

                    if (year > 4) {
                        set({ phase: 'ending' });
                        return;
                    }

                    const nextDate: GameDate = { year, semester, week, day };

                    // --- 2. Calculate Weekly Updates (Allowance, Stamina, Stress) ---
                    const transaction = {
                        id: `allowance_${Date.now()}`,
                        amount: student.family.monthlyAllowance,
                        type: 'income' as const,
                        description: `第 ${week} 周生活费`,
                        timestamp: nextDate
                    };

                    const newAttributes = {
                        ...student.attributes,
                        stamina: Math.min(100, student.attributes.stamina + 20),
                        stress: Math.max(0, student.attributes.stress - 5)
                    };

                    // --- 2.5. Process Pending Club Applications ---
                    let updatedClubs = student.clubs;
                    if (student.clubs.pendingClubId) {
                        const pendingClub = CLUBS.find(c => c.id === student.clubs.pendingClubId);
                        // Generate 3 random club NPCs
                        const clubNPCs: ClubNPC[] = [
                            { id: `club_npc_${Date.now()}_1`, name: '陈同学', role: '资深社员', intimacy: 10, avatar: '👤' },
                            { id: `club_npc_${Date.now()}_2`, name: '李社长', role: '财务总监', intimacy: 5, avatar: '💼' },
                            { id: `club_npc_${Date.now()}_3`, name: '王萌新', role: '新加入者', intimacy: 15, avatar: '🌱' },
                        ];

                        updatedClubs = {
                            id: student.clubs.pendingClubId,
                            currentRank: 'Member',
                            members: clubNPCs,
                            unlockBudget: false,
                            contribution: 0,
                            pendingClubId: null,
                            joinWeek: week,
                        };
                        if (pendingClub) {
                            newNotifications.push({
                                id: `club_join_${Date.now()}`,
                                type: 'success',
                                message: `🎉 恭喜！你已正式加入「${pendingClub.name}」!`,
                                timestamp: Date.now(),
                                read: false,
                            });
                        }
                    }

                    // --- 2.6. Weekly Council KPI Decay & Promotion ---
                    let updatedCouncil = student.council;
                    if (student.council.joined) {
                        // KPI decays slightly each week (-2%)
                        let newKPI = Math.max(0, updatedCouncil.departmentKPI - 2);
                        let newRank = updatedCouncil.rank;
                        let newRep = updatedCouncil.reputation + 5; // Passive reputation gain
                        let newAuth = updatedCouncil.authorityLevel;

                        // Promotion thresholds
                        if (newRep >= 500 && newRank === 'Minister') {
                            newRank = 'Chairman';
                            newAuth = 3;
                            newNotifications.push({ id: `sc_prom_${Date.now()}`, type: 'success', message: '你晋升为学生会主席！', timestamp: Date.now(), read: false });
                        } else if (newRep >= 200 && newRank === 'Staff') {
                            newRank = 'Minister';
                            newAuth = 2;
                            newNotifications.push({ id: `sc_prom_${Date.now()}`, type: 'success', message: '你晋升为学生会部长！', timestamp: Date.now(), read: false });
                        }

                        updatedCouncil = {
                            ...updatedCouncil,
                            departmentKPI: newKPI,
                            reputation: newRep,
                            rank: newRank,
                            authorityLevel: newAuth
                        };
                    }


                    // --- 3. Process Attendance & Academic ---
                    // Logic: Iterate schedule. If planned, mark attended. Else skipped.
                    const weeklySchedule = student.weeklySchedule || [];
                    const plannedAttendance = student.plannedAttendance || [];
                    let courseRecords = { ...student.courseRecords };

                    weeklySchedule.forEach(entry => {
                        if (!entry.course) return;

                        const recordId = entry.course.id;
                        if (!courseRecords[recordId]) {
                            courseRecords[recordId] = {
                                courseId: entry.course.id,
                                courseName: entry.course.name,
                                attendedCount: 0,
                                totalClasses: 0,
                                grade: 4.0,
                                status: 'active',
                                semester: student.currentDate.semester
                            };
                        }

                        courseRecords[recordId].totalClasses++;

                        const slotId = `${entry.day}_${entry.slot}`;
                        if (plannedAttendance.includes(slotId)) {
                            courseRecords[recordId].attendedCount++;
                            // Apply Course Stat Bonuses
                            Object.entries(entry.course.statBonus).forEach(([key, val]) => {
                                // @ts-ignore
                                if (newAttributes[key] !== undefined) {
                                    // @ts-ignore
                                    newAttributes[key] = Math.min(100, newAttributes[key] + (val || 0));
                                }
                            });
                        }
                    });

                    // --- 4. Generate Event (Async) ---
                    let event: GameEvent | null = null;
                    const currentLocationId = student.currentLocation;
                    const locationObj = LOCATIONS.find(l => l.id === currentLocationId);
                    const locationContext = locationObj ? { name: locationObj.name, type: locationObj.category } : undefined;

                    try {
                        event = await generateDynamicEvent(config.llm, { ...student, currentDate: nextDate }, undefined, locationContext);
                    } catch (e) {
                        event = generateMockEventSync(nextDate);
                    }
                    if (!event) event = getNextEvent(student, nextDate);

                    // --- 5. Apply All Changes ---
                    set(state => {
                        if (!state.student) return state;
                        return {
                            student: {
                                ...state.student,
                                currentDate: nextDate,
                                attributes: newAttributes,
                                academic: {
                                    ...state.student.academic,
                                    gpa: newGPA
                                },
                                wallet: {
                                    ...state.student.wallet,
                                    balance: state.student.wallet.balance + student.family.monthlyAllowance,
                                    transactions: [...state.student.wallet.transactions, transaction]
                                },
                                courseRecords: courseRecords, // This contains updated grades/status
                                weeklySchedule: newWeeklySchedule, // This might be new semester schedule
                                notifications: newNotifications,
                                plannedAttendance: [], // Reset plan for the new week
                                // Dynamic AP based on remaining days (e.g. if week starts late)
                                actionPoints: Math.max(0, 7 - nextDate.day + 1),
                                courseActionPoints: state.student.maxCourseActionPoints, // Refresh Course AP
                                clubs: updatedClubs, // Updated club membership
                                council: updatedCouncil, // Updated council membership
                            },
                            currentEvent: event,
                            phase: 'event',
                            isLoading: false,
                            error: null
                        };
                    });

                    // --- 6. Check Quest Triggers ---
                    // Import dynamically to avoid circular dependency
                    import('../stores/questStore').then(({ checkAllQuestTriggers }) => {
                        checkAllQuestTriggers();
                    });

                } catch (err: any) {
                    console.error("NextTurn Error", err);
                    set({ error: err.message, isLoading: false });
                }
            },

            toggleAttendance: (scheduleEntryId: string, cost: number) => {
                set(state => {
                    if (!state.student) return state;
                    const plan = state.student.plannedAttendance || [];
                    const cap = state.student.courseActionPoints;

                    if (plan.includes(scheduleEntryId)) {
                        // Refund
                        return {
                            student: {
                                ...state.student,
                                plannedAttendance: plan.filter(id => id !== scheduleEntryId),
                                courseActionPoints: Math.min(state.student.maxCourseActionPoints, cap + cost)
                            }
                        };
                    } else {
                        // Charge
                        if (cap < cost) return state;
                        return {
                            student: {
                                ...state.student,
                                plannedAttendance: [...plan, scheduleEntryId],
                                courseActionPoints: cap - cost
                            }
                        };
                    }
                });
            },

            resolveEvent: (choiceId) => {
                const { student, currentEvent, applyEffects } = get();
                if (!student || !currentEvent) return;

                console.log(`[Resolving Event] Choice: ${choiceId}`);

                try {
                    const choice = currentEvent.choices.find(c => c.id === choiceId);
                    if (choice) {
                        applyEffects(choice.effects);

                        const newHistory = [...student.eventHistory, currentEvent];
                        set((state) => ({
                            student: state.student ? {
                                ...state.student,
                                eventHistory: newHistory.slice(-50)
                            } : null,
                            currentEvent: null,
                            phase: 'playing'
                        }));
                    }
                } catch (e) {
                    console.error('Fatal error during event resolution:', e);
                    set({ error: '事件结算异常，已跳过。' });
                    set({ currentEvent: null, phase: 'playing' });
                }
            },

            addNotification: (message, type = 'info') => set(state => {
                if (!state.student) return state;
                return {
                    student: {
                        ...state.student,
                        notifications: [
                            ...state.student.notifications,
                            {
                                id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                                message,
                                type,
                                read: false,
                                timestamp: Date.now()
                            }
                        ]
                    }
                };
            }),

            setConfig: (configUpdate: Partial<GameConfig>) => set((state) => ({
                config: { ...state.config, ...configUpdate }
            })),

            loadConfigFromFile: async () => {
                try {
                    const response = await fetch('/llm_api_config.json');
                    if (response.ok) {
                        const data = await response.json();
                        set((state) => ({
                            config: {
                                ...state.config,
                                llm: { ...state.config.llm, ...data.llm }
                            }
                        }));
                        console.log('Loaded LLM config from file:', data.llm);
                    }
                } catch (e) {
                    console.error('Failed to load config from file:', e);
                }
            },

            setError: (error: string | null) => set({ error }),

            exportSave: () => {
                const state = get();
                return JSON.stringify({
                    student: state.student,
                    config: state.config,
                    phase: state.phase,
                });
            },

            useItem: (itemId: string) => set((state) => {
                const student = state.student;
                if (!student) return state;

                const itemIdx = student.inventory.findIndex(i => i.id === itemId);
                if (itemIdx === -1) return state;

                const item = student.inventory[itemIdx];
                const newInventory = [...student.inventory];
                newInventory.splice(itemIdx, 1);

                // Apply effects immediately
                get().applyEffects(item.effects);

                return {
                    student: {
                        ...student,
                        inventory: newInventory
                    }
                };
            }),

            chatWithNPC: (npcId: string) => set((state) => {
                const student = state.student;
                if (!student || student.attributes.stamina < 5) return state;

                const npc = student.npcs.find(n => n.id === npcId);
                if (!npc) return state;

                // Deduct energy, increase relationship
                get().applyEffects([
                    { type: 'attribute', target: 'stamina', value: -5 },
                    { type: 'relationship', target: npcId, value: 5 }
                ]);

                return state;
            }),

            applyJob: (jobId: string) => set((state) => {
                const student = state.student;
                if (!student) return state;

                console.log(`Accepted job: ${jobId}`);
                return {
                    student: {
                        ...student,
                        flags: { ...student.flags, hasJob: true }
                    }
                };
            }),

            quitJob: () => set((state) => {
                const student = state.student;
                if (!student) return state;

                return {
                    student: {
                        ...student,
                        flags: { ...student.flags, hasJob: false }
                    }
                };
            }),

            updateGoalProgress: (goalId: string, progress: number) => set((state) => {
                const student = state.student;
                if (!student) return state;

                const newGoals = student.goals.map(g =>
                    g.id === goalId ? { ...g, progress: Math.min(100, g.progress + progress) } : g
                );

                return {
                    student: { ...student, goals: newGoals }
                };
            }),

            importSave: (json: string) => {
                try {
                    const data = JSON.parse(json);
                    if (data.student && data.config) {
                        set({
                            student: data.student,
                            config: data.config,
                            phase: data.phase || 'playing',
                        });
                        return true;
                    }
                } catch (e) {
                    console.error('Import failed:', e);
                }
                return false;
            },

            registerForExam: (certId: string) => set((state) => {
                const student = state.student;
                if (!student) return state;

                const cert = CERTIFICATES.find(c => c.id === certId);
                if (!cert) return state;

                if (student.certificates.includes(certId)) return state;
                if (student.pendingExams.some(e => e.certId === certId)) return state;

                // Check money
                if (student.wallet.balance < cert.cost) return state;

                // Check reqStats
                const meetsRequirements = cert.reqStats.every(req => {
                    if (req.type === 'attribute') {
                        const val = (student.attributes as any)[req.target] || (student.academic as any)[req.target] || 0;
                        return val >= req.value;
                    }
                    return true;
                });

                if (!meetsRequirements) return state;

                // Deduct money
                const newBalance = student.wallet.balance - cert.cost;
                const newTransaction = {
                    id: `exam_reg_${Date.now()}`,
                    amount: cert.cost,
                    type: 'expense' as const,
                    description: `考证报名: ${cert.name}`,
                    timestamp: student.currentDate
                };

                // Calculate pass chance (IQ influence)
                // Base chance is 50%, IQ adds up to 40%, capped at 90%?
                // Or just use the cert requirements as a baseline.
                const iqReq = cert.reqStats.find(r => r.target === 'iq')?.value || 0;
                const iqBonus = (student.attributes.iq - iqReq) * 0.5;
                const passChance = Math.min(95, Math.max(10, 60 + iqBonus));

                const currentWeekIndex = (student.currentDate.year - 1) * 40 + (student.currentDate.semester - 1) * 20 + student.currentDate.week;

                const newPending = {
                    certId,
                    name: cert.name,
                    startWeek: currentWeekIndex,
                    finishWeek: currentWeekIndex + cert.duration,
                    passChance
                };

                return {
                    student: {
                        ...student,
                        wallet: {
                            ...student.wallet,
                            balance: newBalance,
                            transactions: [...student.wallet.transactions, newTransaction]
                        },
                        pendingExams: [...student.pendingExams, newPending],
                        notifications: [
                            ...student.notifications,
                            {
                                id: `reg_${Date.now()}`,
                                message: `已报名 [${cert.name}]。成绩将在 ${cert.duration} 周后公布。`,
                                type: 'info',
                                read: false,
                                timestamp: Date.now()
                            }
                        ]
                    }
                };
            }),

            dismissNotification: (id: string) => set((state) => {
                if (!state.student) return state;
                return {
                    student: {
                        ...state.student,
                        notifications: state.student.notifications.filter(n => n.id !== id)
                    }
                };
            }),

            sendChatMessage: async (npcId: string, message: string) => {
                const { student, config } = get();
                if (!student || !message.trim()) return;

                const npcIndex = student.npcs.findIndex(n => n.id === npcId);
                if (npcIndex === -1) return;

                const npc = student.npcs[npcIndex];
                const chatHistory = npc.chatHistory || [];
                const isGameAssistant = npcId === 'game_assistant';

                // Add user message immediately
                const userMsg = { role: 'user' as const, content: message.trim(), timestamp: Date.now() };
                const updatedHistory = [...chatHistory, userMsg];

                // Update state with user message
                set((state) => {
                    if (!state.student) return state;
                    const newNpcs = [...state.student.npcs];
                    const targetNpcIndex = newNpcs.findIndex(n => n.id === npcId);
                    if (targetNpcIndex !== -1) {
                        newNpcs[targetNpcIndex] = { ...newNpcs[targetNpcIndex], chatHistory: updatedHistory };
                    }
                    return { student: { ...state.student, npcs: newNpcs } };
                });

                // Generate NPC reply
                try {
                    const reply = await generateNPCReply(
                        config.llm,
                        { name: npc.name, personality: npc.personality, role: npc.role },
                        message,
                        updatedHistory,
                        isGameAssistant
                    );

                    const npcMsg = { role: 'npc' as const, content: reply, timestamp: Date.now() };

                    // Update state with NPC reply and relationship gain
                    set((state) => {
                        if (!state.student) return state;
                        const newNpcs = [...state.student.npcs];
                        const targetNpcIndex = newNpcs.findIndex(n => n.id === npcId);
                        if (targetNpcIndex === -1) return state;

                        const currentNpc = { ...newNpcs[targetNpcIndex] };
                        const currentHistory = currentNpc.chatHistory || [];

                        // Increase relationship score (if not assistant, max 100)
                        let newScore = currentNpc.relationshipScore;
                        if (!isGameAssistant) {
                            newScore = Math.min(100, newScore + 2);
                        }

                        // Keyword Rewards (Study or Work)
                        let rewardMsg = "";
                        const studentUpdate: Partial<StudentState> = {};

                        // Parent Interactions
                        const isParent = currentNpc.role === 'parent';
                        if (isParent) {
                            if (message.includes('钱') || message.includes('生活费') || message.includes('money')) {
                                const { wealth } = state.student.family;
                                let amount = 0;
                                let successMsg = "";

                                if (wealth === 'wealthy') {
                                    amount = 1000 + Math.floor(Math.random() * 2000);
                                    successMsg = "爸爸妈妈转给你一些零花钱，让你别太节省。";
                                } else if (wealth === 'middle') {
                                    amount = 500 + Math.floor(Math.random() * 500);
                                    successMsg = "父母叮嘱你好好学习，并转来了这周的生活费。";
                                } else if (wealth === 'poor') {
                                    if (Math.random() > 0.7) {
                                        amount = 100 + Math.floor(Math.random() * 100);
                                        successMsg = "家里并不宽裕，但为了你，父母还是挤出了一些钱。";
                                    } else {
                                        rewardMsg = "家里最近开销大，可能没法多给你钱了。";
                                        // Potential event: Parent asks for money
                                        if (Math.random() > 0.5) {
                                            rewardMsg = "家里急需用钱，父母想问问你手头宽裕吗？";
                                        }
                                    }
                                }

                                if (amount > 0) {
                                    studentUpdate.money = state.student.money + amount;
                                    studentUpdate.wallet = {
                                        ...state.student.wallet,
                                        balance: state.student.wallet.balance + amount,
                                        transactions: [
                                            ...state.student.wallet.transactions,
                                            {
                                                id: `parent_pay_${Date.now()}`,
                                                amount,
                                                type: 'income',
                                                description: `${currentNpc.name}转账`,
                                                timestamp: state.student.currentDate
                                            }
                                        ]
                                    };
                                    rewardMsg = `${successMsg} 金钱+${amount}`;
                                }
                            } else if (message.includes('给') && (message.includes('元') || message.includes('块'))) {
                                // Player giving money to parents
                                // Simple parser for amount (e.g., "给你100元")
                                const match = message.match(/(\d+)/);
                                if (match) {
                                    const giveAmt = parseInt(match[0]);
                                    if (state.student.money >= giveAmt) {
                                        studentUpdate.money = state.student.money - giveAmt;
                                        studentUpdate.wallet = {
                                            ...state.student.wallet,
                                            balance: state.student.wallet.balance - giveAmt,
                                            transactions: [
                                                ...state.student.wallet.transactions,
                                                {
                                                    id: `parent_give_${Date.now()}`,
                                                    amount: -giveAmt,
                                                    type: 'expense',
                                                    description: `给${currentNpc.name}转账`,
                                                    timestamp: state.student.currentDate
                                                }
                                            ]
                                        };
                                        // Increase Pride
                                        newNpcs[targetNpcIndex] = {
                                            ...currentNpc,
                                            parentPride: Math.min(100, (currentNpc.parentPride || 0) + Math.floor(giveAmt / 100))
                                        };
                                        rewardMsg = `你给父母转了钱，他们感到非常自豪！自豪感+${Math.floor(giveAmt / 100)}`;
                                    }
                                }
                            }
                        }

                        if (!isParent && (message.includes('学习') || message.includes('study'))) {
                            studentUpdate.attributes = {
                                ...state.student.attributes,
                                iq: Math.min(100, state.student.attributes.iq + 1)
                            };
                            rewardMsg = "一起学习，智力+1！";
                        } else if (!isParent && (message.includes('打工') || message.includes('工作') || message.includes('work'))) {
                            studentUpdate.money = state.student.money + 50;
                            // Add bank transaction
                            studentUpdate.wallet = {
                                ...state.student.wallet,
                                balance: state.student.wallet.balance + 50,
                                transactions: [
                                    ...state.student.wallet.transactions,
                                    {
                                        id: `chat_work_${Date.now()}`,
                                        amount: 50,
                                        type: 'income',
                                        description: `与 ${currentNpc.name} 共同打工奖励`,
                                        timestamp: state.student.currentDate
                                    }
                                ]
                            };
                            rewardMsg = "勤工俭学，金钱+50！";
                        }

                        // Add notification if reward granted
                        const notifications = [...state.student.notifications];
                        if (rewardMsg) {
                            notifications.push({
                                id: `reward_${Date.now()}`,
                                message: rewardMsg,
                                type: 'success',
                                read: false,
                                timestamp: Date.now()
                            });
                        }

                        newNpcs[targetNpcIndex] = {
                            ...newNpcs[targetNpcIndex], // Preserve pride increase if any
                            chatHistory: [...currentHistory, npcMsg],
                            relationshipScore: newScore
                        };

                        return {
                            student: {
                                ...state.student,
                                ...studentUpdate,
                                npcs: newNpcs,
                                notifications
                            }
                        };
                    });
                } catch (error) {
                    console.error('Failed to generate NPC reply:', error);
                }
            },

            // Friend Management Actions
            addFriendFromForum: (name: string, personality: string) => set((state) => {
                if (!state.student) return state;

                const newFriend: NPC = {
                    id: `forum_friend_${Date.now()}`,
                    name,
                    gender: Math.random() > 0.5 ? 'male' : 'female',
                    role: 'forum_friend',
                    relationshipScore: 10,
                    personality,
                    metDate: state.student.currentDate,
                    chatHistory: [],
                    moments: [],
                    viewMomentsPermission: true
                };

                return {
                    student: {
                        ...state.student,
                        npcs: [newFriend, ...state.student.npcs],
                        notifications: [
                            ...state.student.notifications,
                            {
                                id: `forum_add_${Date.now()}`,
                                message: `已成功添加论坛好友: ${name}`,
                                type: 'success',
                                read: false,
                                timestamp: Date.now()
                            }
                        ]
                    }
                };
            }),

            toggleMomentsPermission: (npcId: string) => set((state) => {
                if (!state.student) return state;

                const npcIndex = state.student.npcs.findIndex(n => n.id === npcId);
                if (npcIndex === -1) return state;

                const newNpcs = [...state.student.npcs];
                newNpcs[npcIndex] = {
                    ...newNpcs[npcIndex],
                    viewMomentsPermission: !newNpcs[npcIndex].viewMomentsPermission
                };

                return { student: { ...state.student, npcs: newNpcs } };
            }),

            // Deep Club & Council Actions
            interactWithClubMember: (memberId: string) => set((state) => {
                if (!state.student || !state.student.clubs.id) return state;
                const memberIndex = state.student.clubs.members.findIndex(m => m.id === memberId);
                if (memberIndex === -1) return state;

                const newMembers = [...state.student.clubs.members];
                const member = newMembers[memberIndex];

                // Simple interaction: +5 intimacy, +2 contribution
                newMembers[memberIndex] = {
                    ...member,
                    intimacy: Math.min(100, member.intimacy + 5)
                };

                return {
                    student: {
                        ...state.student,
                        clubs: {
                            ...state.student.clubs,
                            members: newMembers,
                            contribution: state.student.clubs.contribution + 2
                        }
                    }
                };
            }),

            updateCouncilKPI: (amount: number) => set((state) => {
                if (!state.student || !state.student.council.joined) return state;
                return {
                    student: {
                        ...state.student,
                        council: {
                            ...state.student.council,
                            departmentKPI: Math.max(0, Math.min(100, state.student.council.departmentKPI + amount))
                        }
                    }
                };
            }),


            deleteFriend: (npcId: string) => set((state) => {
                if (!state.student) return state;

                return {
                    student: {
                        ...state.student,
                        npcs: state.student.npcs.filter(n => n.id !== npcId)
                    }
                };
            }),

            // Moments Actions
            likeMoment: (npcId: string, momentId: string) => set((state) => {
                if (!state.student) return state;

                const npcIndex = state.student.npcs.findIndex(n => n.id === npcId);
                if (npcIndex === -1) return state;

                const npc = state.student.npcs[npcIndex];
                const momentIndex = (npc.moments || []).findIndex(m => m.id === momentId);
                if (momentIndex === -1) return state;

                const newNpcs = [...state.student.npcs];
                const newMoments = [...(npc.moments || [])];
                const moment = newMoments[momentIndex];
                const playerName = state.student.name;

                // Toggle like
                const hasLiked = moment.likes.includes(playerName);
                newMoments[momentIndex] = {
                    ...moment,
                    likes: hasLiked
                        ? moment.likes.filter(n => n !== playerName)
                        : [...moment.likes, playerName]
                };

                newNpcs[npcIndex] = { ...npc, moments: newMoments };
                return { student: { ...state.student, npcs: newNpcs } };
            }),

            commentOnMoment: (npcId: string, momentId: string, content: string) => set((state) => {
                if (!state.student) return state;

                const npcIndex = state.student.npcs.findIndex(n => n.id === npcId);
                if (npcIndex === -1) return state;

                const npc = state.student.npcs[npcIndex];
                const momentIndex = (npc.moments || []).findIndex(m => m.id === momentId);
                if (momentIndex === -1) return state;

                const newNpcs = [...state.student.npcs];
                const newMoments = [...(npc.moments || [])];
                const moment = newMoments[momentIndex];

                newMoments[momentIndex] = {
                    ...moment,
                    comments: [
                        ...moment.comments,
                        {
                            id: `comment_${Date.now()}`,
                            author: state.student.name,
                            content,
                            timestamp: Date.now()
                        }
                    ]
                };

                newNpcs[npcIndex] = { ...npc, moments: newMoments };
                return { student: { ...state.student, npcs: newNpcs } };
            }),
        }),
        {
            name: 'university-simulator-save',
            partialize: (state) => ({
                student: state.student,
                config: state.config,
                phase: state.phase,
            }),
            // Validation Merge to discard corrupted saves (NaN loop prevention)
            merge: (persistedState: any, currentState: GameStore) => {
                if (!persistedState || typeof persistedState !== 'object') return currentState;
                const ps = persistedState as Partial<GameStore>;

                // Deep Sanity Check
                const isCorrupted = (
                    (ps.student?.attributes && Object.values(ps.student.attributes).some(v => isNaN(v as number))) ||
                    (ps.student?.money !== undefined && isNaN(ps.student.money)) ||
                    (ps.student?.academic?.gpa !== undefined && isNaN(ps.student.academic.gpa))
                );

                if (isCorrupted) {
                    console.error("Toxic Save Detected (NaN values). Wiping to initial state.");
                    return currentState; // Reject persisted state entirely
                }

                // Manual merge for safety
                return {
                    ...currentState,
                    ...ps,
                    student: ps.student ? { ...currentState.student, ...ps.student } : currentState.student,
                    config: ps.config ? { ...currentState.config, ...ps.config } : currentState.config,
                } as GameStore;
            }
        }
    )
);
