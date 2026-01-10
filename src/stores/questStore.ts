// Quest Store - Quest trigger, progress, and reward logic
import { useGameStore } from './gameStore';
import { createQuestFromTemplate } from '../data/quests';
import type { Quest, StudentState } from '../types';

// --- Quest Trigger Functions ---

/**
 * Checks if the Romance quest should trigger.
 * Condition: Charm > 80 and quest not already active/completed.
 */
export const checkRomanceQuestTrigger = (student: StudentState): boolean => {
    if (student.attributes.charm > 80) {
        const hasQuest = student.quests.some(q => q.id === 'campus_romance');
        return !hasQuest;
    }
    return false;
};

/**
 * Checks if the Academic (Paper Publication) quest should trigger.
 * Condition: Year >= 3 and quest not already active/completed.
 */
export const checkAcademicQuestTrigger = (student: StudentState): boolean => {
    if (student.currentDate.year >= 3) {
        const hasQuest = student.quests.some(q => q.id === 'paper_publication');
        return !hasQuest;
    }
    return false;
};

/**
 * Checks if the National Scholarship quest should trigger.
 * Condition: End of academic year (Week 20, Semester 2) and quest not already active this year.
 */
export const checkHonorQuestTrigger = (student: StudentState): boolean => {
    const { currentDate } = student;
    // Trigger at week 18-20 of semester 2 (end of year)
    if (currentDate.semester === 2 && currentDate.week >= 18 && currentDate.week <= 20) {
        // Check if we already have this year's scholarship quest
        const yearQuestId = `national_scholarship_y${currentDate.year}`;
        const hasQuest = student.quests.some(q => q.id === yearQuestId || q.id === 'national_scholarship');
        return !hasQuest;
    }
    return false;
};

/**
 * Main function to check all quest triggers and add new quests.
 * Called from gameStore's nextTurn.
 */
export const checkAllQuestTriggers = (): void => {
    const { student, addNotification } = useGameStore.getState();
    if (!student) return;

    const newQuests: Quest[] = [];

    // Check Romance Quest
    if (checkRomanceQuestTrigger(student)) {
        const quest = createQuestFromTemplate('campus_romance');
        newQuests.push(quest);
        addNotification('🌹 新任务：校园恋曲', 'info');
    }

    // Check Academic Quest
    if (checkAcademicQuestTrigger(student)) {
        const quest = createQuestFromTemplate('paper_publication');
        newQuests.push(quest);
        addNotification('📚 新任务：论文发表', 'info');
    }

    // Check National Scholarship Quest
    if (checkHonorQuestTrigger(student)) {
        const quest = createQuestFromTemplate('national_scholarship');
        newQuests.push(quest);
        addNotification('🏆 新任务：国家奖学金评选', 'info');
    }

    // Add new quests to state
    if (newQuests.length > 0) {
        useGameStore.setState(state => ({
            student: {
                ...state.student!,
                quests: [...state.student!.quests, ...newQuests],
            },
        }));
    }
};

// --- Quest Progress Functions ---

/**
 * Update the progress of a specific quest.
 */
export const updateQuestProgress = (questId: string, progressDelta: number): void => {
    useGameStore.setState(state => {
        if (!state.student) return state;
        const quests = state.student.quests.map(q => {
            if (q.id === questId && q.status === 'Active') {
                const newProgress = Math.min(100, q.progress + progressDelta);
                return { ...q, progress: newProgress, status: newProgress >= 100 ? 'Completed' as const : 'Active' as const };
            }
            return q;
        });
        return { student: { ...state.student, quests } };
    });
};

/**
 * Advance to the next stage of a quest.
 */
export const advanceQuestStage = (questId: string): void => {
    const { student, addNotification } = useGameStore.getState();
    if (!student) return;

    const quest = student.quests.find(q => q.id === questId);
    if (!quest || !quest.stages || quest.currentStage === undefined) return;

    const nextStage = quest.currentStage + 1;

    if (nextStage >= quest.stages.length) {
        // Quest complete
        completeQuest(questId);
        return;
    }

    useGameStore.setState(state => {
        if (!state.student) return state;
        const quests = state.student.quests.map(q => {
            if (q.id === questId && q.stages) {
                const updatedStages = q.stages.map((s, i) =>
                    i === q.currentStage ? { ...s, isComplete: true } : s
                );
                return { ...q, currentStage: nextStage, stages: updatedStages, progress: Math.round(((nextStage) / q.stages.length) * 100) };
            }
            return q;
        });
        return { student: { ...state.student, quests } };
    });

    const stageName = quest.stages[nextStage]?.name || '';
    addNotification(`任务进度：${quest.title} - ${stageName}`, 'info');
};

/**
 * Complete a quest and apply its rewards.
 */
export const completeQuest = (questId: string): void => {
    const { student, addNotification, updateStudent } = useGameStore.getState();
    if (!student) return;

    const quest = student.quests.find(q => q.id === questId);
    if (!quest) return;

    // Apply Rewards
    const updatedAttributes = { ...student.attributes };
    if (quest.rewards.attributes) {
        Object.entries(quest.rewards.attributes).forEach(([key, value]) => {
            if (value !== undefined && key in updatedAttributes) {
                (updatedAttributes as any)[key] = Math.min(100, (updatedAttributes as any)[key] + value);
            }
        });
    }

    const moneyReward = quest.rewards.money || 0;
    const newAchievements = quest.rewards.honor
        ? [...student.achievements, quest.rewards.honor]
        : student.achievements;

    // Mark quest as complete
    const updatedQuests = student.quests.map(q =>
        q.id === questId
            ? { ...q, status: 'Completed' as const, progress: 100, stages: q.stages?.map(s => ({ ...s, isComplete: true })) }
            : q
    );

    updateStudent({
        attributes: updatedAttributes,
        money: student.money + moneyReward,
        achievements: newAchievements,
        quests: updatedQuests,
    });

    addNotification(`🎉 任务完成：${quest.title}${moneyReward > 0 ? ` (+¥${moneyReward})` : ''}`, 'success');
    if (quest.rewards.honor) {
        addNotification(`🏅 获得荣誉：${quest.rewards.honor}`, 'success');
    }
};

/**
 * Fail a quest (e.g., due to conditions no longer being met).
 */
export const failQuest = (questId: string): void => {
    const { addNotification } = useGameStore.getState();
    useGameStore.setState(state => {
        if (!state.student) return state;
        const quests = state.student.quests.map(q =>
            q.id === questId ? { ...q, status: 'Failed' as const } : q
        );
        return { student: { ...state.student, quests } };
    });

    addNotification(`❌ 任务失败：${questId}`, 'error');
};
