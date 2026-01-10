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
    GameDate,
} from '../types';
import { CERTIFICATES } from '../data/certificates';
import {
    getDefaultConfig,
    getNextEvent,
} from './gameData';
import { generateDynamicEvent, generateMockEventSync, generateNPCReply, generateProactiveMessage, generateMoment } from '../services/aiService';

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
    dismissNotification: (id: string) => void;

    // Chat
    sendChatMessage: (npcId: string, message: string) => Promise<void>;

    // Friend Management
    addFriendFromForum: (name: string, personality: string) => void;
    toggleMomentsPermission: (npcId: string) => void;
    deleteFriend: (npcId: string) => void;

    // Moments
    likeMoment: (npcId: string, momentId: string) => void;
    commentOnMoment: (npcId: string, momentId: string, content: string) => void;
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

            applyEffects: (effects) => set((state) => {
                if (!state.student) return state;
                const student = { ...state.student };

                try {
                    effects.forEach(effect => {
                        // SANITY CHECK: Ignore effects with NaN values
                        if (typeof effect.value !== 'number' || isNaN(effect.value)) {
                            console.error('Ignored corrupted effect value:', effect);
                            return;
                        }

                        if (effect.type === 'money') {
                            student.money = Math.max(0, student.money + effect.value);
                        } else if (effect.type === 'attribute') {
                            const attr = effect.target as keyof typeof student.attributes;
                            if (student.attributes[attr] !== undefined) {
                                student.attributes[attr] = Math.min(100, Math.max(0, student.attributes[attr] + effect.value));
                            }
                        } else if (effect.type === 'gpa') {
                            student.academic.gpa = Math.min(4.0, Math.max(0, student.academic.gpa + effect.value));
                            if (isNaN(student.academic.gpa)) student.academic.gpa = 2.0; // Panic recovery
                        } else if (effect.type === 'relationship') {
                            const npc = student.npcs.find(n => n.id === effect.target);
                            if (npc) {
                                npc.relationshipScore = Math.min(100, Math.max(-100, npc.relationshipScore + effect.value));
                            }
                        }
                    });

                    // Final validation before commit
                    if (isNaN(student.money)) student.money = 0;
                } catch (e) {
                    console.error('Failed to apply effects safely:', e);
                }

                return { student };
            }),

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

                        // Advance day
                        day += apCost;
                        if (day > 7) {
                            // If day overflows, we stay within the week for now or advance week?
                            // User said: "每消耗一点本周行动力，校历的日期便要往后一天"
                            // "如果本周没有全部消耗完，直接结束本周后，则直接跳到下一周"
                            // This implies we don't overflow week inside processAction if we want to follow "next week" logic in nextTurn.
                            // But if they consume 5 AP, and they start at day 1, it becomes day 6.
                            // If they start at day 5 and consume 3 AP, it should probably cap at 7 or push to next week.
                            // Let's keep it simple: day increment, week advancement in nextTurn if skipped.
                        }

                        return {
                            student: {
                                ...state.student,
                                actionPoints: Math.max(0, state.student.actionPoints - apCost),
                                currentDate: { ...state.student.currentDate, day: Math.min(7, day) }
                            }
                        };
                    });
                }

                applyEffects(effects);
            },

            nextTurn: async () => {
                const { student, config, isLoading } = get();
                console.log("[1] nextTurn triggered");

                if (!student || isLoading) {
                    console.warn("[!] nextTurn aborted: student null or already loading");
                    return;
                }

                console.log("[2] Locking UI (isLoading = true)");
                set({ isLoading: true, error: null });

                try {
                    // 1. Advance logical time
                    console.log("[3] Calculating next date and resources...");
                    let { year, semester, week, day } = student.currentDate;
                    week++;
                    day = 1; // Reset day to Monday when advancing week
                    if (week > 20) {
                        week = 1;
                        semester++;
                        if (semester > 2) {
                            semester = 1;
                            year++;
                        }
                    }

                    if (year > 4) {
                        console.log("[3.1] Player graduated. Transitioning to ending.");
                        set({ phase: 'ending' });
                        return;
                    }

                    const nextDate: GameDate = { year, semester, week, day };
                    const studentUpdate: Partial<StudentState> = {
                        currentDate: nextDate,
                        actionPoints: student.maxActionPoints, // Reset AP on next turn
                        attributes: {
                            ...student.attributes,
                            stamina: Math.min(100, student.attributes.stamina + 20),
                            stress: Math.max(0, student.attributes.stress - 5)
                        },
                        wallet: {
                            ...student.wallet,
                            transactions: [
                                ...student.wallet.transactions,
                                {
                                    id: `allowance_${Date.now()}`,
                                    amount: student.family.monthlyAllowance,
                                    type: 'income',
                                    description: `第 ${week} 周生活费`,
                                    timestamp: nextDate
                                }
                            ],
                            balance: student.wallet.balance + student.family.monthlyAllowance
                        },
                        money: student.money + student.family.monthlyAllowance
                    };

                    // Helper: Add money transaction
                    const addTransaction = (amount: number, description: string, type: 'income' | 'expense') => {
                        if (!studentUpdate.wallet) {
                            studentUpdate.wallet = { ...student.wallet };
                        }
                        studentUpdate.wallet = {
                            balance: (studentUpdate.wallet.balance || student.wallet.balance || 0) + amount,
                            transactions: [
                                ...(studentUpdate.wallet.transactions || student.wallet.transactions || []),
                                {
                                    id: `trans_${Date.now()}_${Math.random()}`,
                                    amount: Math.abs(amount),
                                    type,
                                    description,
                                    timestamp: nextDate
                                }
                            ]
                        };
                    };

                    // Add monthly allowance
                    if (week % 4 === 1) {
                        addTransaction(student.family.monthlyAllowance, '生活费', 'income');
                    }

                    // Handle Job Income
                    if (student.flags.hasJob) {
                        addTransaction(300, '兼职工资', 'income');
                    }

                    // Commit logical state change
                    set((state) => {
                        const s = state.student;
                        if (!s) return state;

                        const updatedS = { ...s, ...studentUpdate };

                        // --- Async Exam Check ---
                        const currentWeekIndex = (nextDate.year - 1) * 40 + (nextDate.semester - 1) * 20 + nextDate.week;
                        const finishedExams = updatedS.pendingExams.filter(e => currentWeekIndex >= e.finishWeek);
                        const remainingExams = updatedS.pendingExams.filter(e => currentWeekIndex < e.finishWeek);

                        finishedExams.forEach(exam => {
                            const roll = Math.random() * 100;
                            const passed = roll < exam.passChance;

                            if (passed) {
                                updatedS.certificates = [...updatedS.certificates, exam.certId];
                                updatedS.notifications.push({
                                    id: `exam_pass_${Date.now()}_${exam.certId}`,
                                    message: `🎉 考试通过！你已获得 [${exam.name}] 证书。`,
                                    type: 'success',
                                    read: false,
                                    timestamp: Date.now()
                                });
                            } else {
                                updatedS.notifications.push({
                                    id: `exam_fail_${Date.now()}_${exam.certId}`,
                                    message: `❌ 考试未通过：[${exam.name}]。别灰心，下次再试！`,
                                    type: 'error',
                                    read: false,
                                    timestamp: Date.now()
                                });
                            }
                        });
                        updatedS.pendingExams = remainingExams;

                        // --- Year-End Honor Check ---
                        if (nextDate.week === 20 && nextDate.semester === 2) {
                            const hasScholarship = updatedS.academic.gpa >= 3.8 && updatedS.attributes.eq >= 70;
                            if (hasScholarship && !updatedS.certificates.includes('national_scholarship')) {
                                updatedS.wallet.balance += 8000;
                                updatedS.certificates.push('national_scholarship');
                                updatedS.wallet.transactions.push({
                                    id: `sch_${Date.now()}`,
                                    amount: 8000,
                                    type: 'income',
                                    description: '年度国家奖学金',
                                    timestamp: nextDate
                                });
                                updatedS.notifications.push({
                                    id: `honor_${Date.now()}`,
                                    message: `🌟 荣誉时刻！由于表现优异，你被授予 [国家奖学金]！`,
                                    type: 'success',
                                    read: false,
                                    timestamp: Date.now()
                                });
                            }
                        }

                        return { student: updatedS };
                    });

                    // 2. Proactive Messaging & Moments (20% chance per week)
                    const eligibleNPCs = student.npcs.filter(n => n.id !== 'game_assistant');

                    // A: Proactive Message (Single lucky NPC)
                    if (Math.random() < 0.2) {
                        const messagingNPCs = eligibleNPCs.filter(n => n.relationshipScore > 10);
                        if (messagingNPCs.length > 0) {
                            const luckyNPC = messagingNPCs[Math.floor(Math.random() * messagingNPCs.length)];
                            const npcIndex = student.npcs.findIndex(n => n.id === luckyNPC.id);

                            try {
                                const proactiveText = await generateProactiveMessage(config.llm, luckyNPC, student);
                                const npcMsg = { role: 'npc' as const, content: proactiveText, timestamp: Date.now() };

                                set((state) => {
                                    if (!state.student) return state;
                                    const newNpcs = [...state.student.npcs];
                                    const currentNpc = { ...newNpcs[npcIndex] };
                                    currentNpc.chatHistory = [...(currentNpc.chatHistory || []), npcMsg];
                                    newNpcs[npcIndex] = currentNpc;

                                    const newNotifications = [
                                        ...state.student.notifications,
                                        {
                                            id: `chat_notify_${Date.now()}`,
                                            message: `💬 ${luckyNPC.name} 给你发了一条新消息`,
                                            type: 'info' as const,
                                            read: false,
                                            timestamp: Date.now()
                                        }
                                    ];
                                    return { student: { ...state.student, npcs: newNpcs, notifications: newNotifications } };
                                });
                            } catch (e) { console.error("Proactive msg error", e); }
                        }
                    }

                    // B: Generate Moments (Check for each NPC)
                    const momentsPromises = eligibleNPCs.map(async (npc) => {
                        if (Math.random() < 0.2) { // 20% chance per NPC to post a moment
                            try {
                                const content = await generateMoment(config.llm, npc, nextDate);
                                return {
                                    npcId: npc.id,
                                    moment: {
                                        id: `moment_${npc.id}_${Date.now()}`,
                                        content,
                                        images: [], // Placeholder for images if needed
                                        likes: [],
                                        comments: [],
                                        timestamp: nextDate
                                    }
                                };
                            } catch (e) { return null; }
                        }
                        return null;
                    });

                    // Resolve moments and update state
                    Promise.all(momentsPromises).then((results) => {
                        const newMoments = results.filter(r => r !== null) as { npcId: string, moment: any }[];
                        if (newMoments.length > 0) {
                            set((state) => {
                                if (!state.student) return state;
                                const newNpcs = [...state.student.npcs];
                                newMoments.forEach(({ npcId, moment }) => {
                                    const idx = newNpcs.findIndex(n => n.id === npcId);
                                    if (idx !== -1) {
                                        newNpcs[idx] = {
                                            ...newNpcs[idx],
                                            moments: [moment, ...(newNpcs[idx].moments || [])]
                                        };
                                    }
                                });
                                return { student: { ...state.student, npcs: newNpcs } };
                            });
                        }
                    });

                    // 3. Event Generation
                    console.log("[4] Attempting to generate event...");
                    let event: GameEvent | null = null;

                    try {
                        // This call is now "Safer" due to generateDynamicEvent's own fallback
                        console.log("[5] Calling AI Service generateDynamicEvent...");
                        event = await generateDynamicEvent(config.llm, student);
                        console.log("[6] AI Service call complete. Event received:", event?.title);
                    } catch (llmError) {
                        console.error("[!] AI Service stage crashed:", llmError);
                        // Hard synchronous fallback
                        event = generateMockEventSync(nextDate);
                    }

                    if (!event) {
                        console.warn("[!] No event generated, falling back to static registry");
                        event = getNextEvent(student, nextDate);
                    }

                    console.log("[7] Setting event and transitioning phase...");
                    set({
                        currentEvent: event,
                        phase: 'event',
                        error: config.llm.apiKey ? null : '离线模式运行中 (未配置 API Key)'
                    });
                    console.log("[7.1] Transition complete");

                } catch (err: any) {
                    console.error("[!!!] FATAL CRASH in nextTurn loop:", err);
                    set({ error: `致命流程错误: ${err.message || '未知错误'}` });
                } finally {
                    console.log("[8] Unlocking UI (isLoading = false)");
                    set({ isLoading: false });
                }
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
