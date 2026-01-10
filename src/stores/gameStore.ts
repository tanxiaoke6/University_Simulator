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
} from '../types';
import {
    getDefaultConfig,
    getNextEvent,
} from './gameData';
import { generateDynamicEvent, generateMockEventSync } from '../services/aiService';

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
                set(initialState);
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

                // Deduct Action Points
                if (apCost > 0) {
                    set((state) => ({
                        student: state.student ? {
                            ...state.student,
                            actionPoints: Math.max(0, state.student.actionPoints - apCost)
                        } : null
                    }));
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
                    let { year, semester, week } = student.currentDate;
                    week++;
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

                    const nextDate = { year, semester, week };
                    const studentUpdate: Partial<StudentState> = {
                        currentDate: nextDate,
                        actionPoints: student.maxActionPoints, // Reset AP on next turn
                        attributes: {
                            ...student.attributes,
                            stamina: Math.min(100, student.attributes.stamina + 30),
                            stress: Math.max(0, student.attributes.stress - 5),
                        }
                    };

                    if (week % 4 === 1) {
                        studentUpdate.money = (student.money || 0) + student.family.monthlyAllowance;
                    }

                    // Handle Job Income
                    if (student.flags.hasJob) {
                        // Assuming income is handled by a fixed amount for now or we could store active job details
                        // For simplicity, let's say average part-time income is 300
                        studentUpdate.money = (studentUpdate.money || student.money || 0) + 300;
                    }

                    // Commit logical state change
                    set((state) => ({
                        student: state.student ? { ...state.student, ...studentUpdate } : null
                    }));

                    // 2. Event Generation
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
            }
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
