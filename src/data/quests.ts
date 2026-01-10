// Quest definitions for the Quest System
import type { Quest } from '../types';

// --- Quest Templates ---

export const QUEST_TEMPLATES: Record<string, Omit<Quest, 'status' | 'progress' | 'currentStage'>> = {
    // ============ National Scholarship (Yearly) ============
    national_scholarship: {
        id: 'national_scholarship',
        title: '国家奖学金',
        description: '角逐国家奖学金！需要保持顶尖的学业成绩并积极参与课外活动。奖学金评选在每学年末进行。',
        type: 'Life',
        rewards: {
            money: 8000,
            honor: '国家奖学金获得者',
        },
        triggerCondition: '每学年末自动触发 (Week 40)',
        stages: [
            { id: 'gpa_check', name: '成绩审核', description: 'GPA >= 3.8 (前5%)', isComplete: false },
            { id: 'activity_check', name: '活动审核', description: '参与至少2项社团活动', isComplete: false },
            { id: 'final_review', name: '综合评审', description: '等待最终名单公布', isComplete: false },
        ],
    },

    // ============ Campus Romance ============
    campus_romance: {
        id: 'campus_romance',
        title: '校园恋曲',
        description: '一段悄然萌芽的情愫...似乎有人对你产生了特别的好感。',
        type: 'Romance',
        rewards: {
            attributes: { charm: 10, eq: 5 },
        },
        triggerCondition: '魅力 > 80 时触发',
        stages: [
            { id: 'acquaintance', name: '初识', description: '收到一封神秘的情书', isComplete: false },
            { id: 'friend', name: '成为朋友', description: '找出写信人并与之成为朋友', isComplete: false },
            { id: 'date', name: '约会', description: '共度一个特别的约会', isComplete: false },
            { id: 'partner', name: '在一起', description: '确定恋爱关系', isComplete: false },
        ],
    },

    // ============ Paper Publication (Baoyan Requirement) ============
    paper_publication: {
        id: 'paper_publication',
        title: '论文发表',
        description: '尝试在学术期刊上发表你的研究成果，这对于保研来说至关重要！',
        type: 'Academic',
        rewards: {
            attributes: { iq: 5, employability: 10 },
            honor: '学术新星',
        },
        triggerCondition: '大三学年开始时自动触发',
        stages: [
            { id: 'topic', name: '选题', description: '与导师讨论并确定研究方向', isComplete: false },
            { id: 'experiment', name: '实验/调研', description: '收集数据并进行分析', isComplete: false },
            { id: 'writing', name: '撰写论文', description: '完成论文初稿', isComplete: false },
            { id: 'review', name: '投稿与审稿', description: '投递期刊并等待审稿结果', isComplete: false },
            { id: 'publish', name: '正式发表', description: '论文被接收并发表', isComplete: false },
        ],
    },
};

// Helper to create a new quest instance from a template
export const createQuestFromTemplate = (templateId: keyof typeof QUEST_TEMPLATES): Quest => {
    const template = QUEST_TEMPLATES[templateId];
    if (!template) {
        throw new Error(`Quest template not found: ${templateId}`);
    }
    return {
        ...template,
        status: 'Active',
        progress: 0,
        currentStage: 0,
        stages: template.stages?.map(s => ({ ...s, isComplete: false })),
    };
};
