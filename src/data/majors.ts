// Majors Data - University Programs with Stat Bonuses
import type { Major, MajorCategory } from '../types';
import { COURSES_BY_MAJOR } from './courses';

export const MAJORS: Major[] = [
    // ===== Science =====
    {
        id: 'physics',
        name: '物理学',
        category: 'science',
        statBonus: { iq: 5, stress: 5 },
        difficulty: 8,
        employability: 60,
        description: '探索宇宙基本规律，适合热爱思考的人',
        courses: [] // Generic courses for now
    },
    {
        id: 'chemistry',
        name: '化学',
        category: 'science',
        statBonus: { iq: 4 },
        difficulty: 7,
        employability: 55,
        description: '研究物质结构与变化',
        courses: []
    },
    {
        id: 'math',
        name: '数学与应用数学',
        category: 'science',
        statBonus: { iq: 6, luck: -2 },
        difficulty: 9,
        employability: 70,
        description: '学科之王，挂科之母',
        courses: []
    },
    {
        id: 'biology',
        name: '生物科学',
        category: 'science',
        statBonus: { iq: 3 },
        difficulty: 6,
        employability: 45,
        description: '21世纪是生物的世纪(吗？)',
        courses: []
    },

    // ===== Engineering =====
    {
        id: 'cs',
        name: '计算机科学与技术',
        category: 'engineering',
        statBonus: { iq: 4, luck: 3 },
        difficulty: 7,
        employability: 95,
        description: '码农预备役，高薪代名词',
        courses: COURSES_BY_MAJOR['cs'] || []
    },
    {
        id: 'software',
        name: '软件工程',
        category: 'engineering',
        statBonus: { iq: 3, charm: 1 },
        difficulty: 6,
        employability: 92,
        description: '996的开始',
        courses: COURSES_BY_MAJOR['software'] || []
    },
    {
        id: 'ai',
        name: '人工智能',
        category: 'engineering',
        statBonus: { iq: 5, luck: 2 },
        difficulty: 8,
        employability: 90,
        description: '风口上的猪也能飞',
        courses: COURSES_BY_MAJOR['ai'] || []
    },
    {
        id: 'ee',
        name: '电子信息工程',
        category: 'engineering',
        statBonus: { iq: 4 },
        difficulty: 8,
        employability: 85,
        description: '强电弱电一把抓',
        courses: []
    },
    {
        id: 'me',
        name: '机械工程',
        category: 'engineering',
        statBonus: { stamina: 3, iq: 2 },
        difficulty: 7,
        employability: 75,
        description: '工科万金油',
        courses: []
    },
    {
        id: 'civil',
        name: '土木工程',
        category: 'engineering',
        statBonus: { stamina: 5 },
        difficulty: 6,
        employability: 65,
        description: '搬砖预备役(字面意思)',
        courses: []
    },
    {
        id: 'architecture',
        name: '建筑学',
        category: 'engineering',
        statBonus: { charm: 3, iq: 2 },
        difficulty: 7,
        employability: 70,
        description: '每天都在画图',
        courses: []
    },

    // ===== Business =====
    {
        id: 'finance',
        name: '金融学',
        category: 'business',
        statBonus: { eq: 3, charm: 2, luck: 2 },
        difficulty: 6,
        employability: 80,
        description: '离钱最近的专业',
        courses: COURSES_BY_MAJOR['finance'] || []
    },
    {
        id: 'accounting',
        name: '会计学',
        category: 'business',
        statBonus: { iq: 2, stress: 3 },
        difficulty: 5,
        employability: 75,
        description: '考证考到头秃',
        courses: COURSES_BY_MAJOR['accounting'] || []
    },
    {
        id: 'marketing',
        name: '市场营销',
        category: 'business',
        statBonus: { eq: 4, charm: 3 },
        difficulty: 4,
        employability: 65,
        description: '人人都是销售',
        courses: []
    },
    {
        id: 'management',
        name: '工商管理',
        category: 'business',
        statBonus: { eq: 3, charm: 2 },
        difficulty: 4,
        employability: 60,
        description: '什么都学什么都不精',
        courses: []
    },
    {
        id: 'economics',
        name: '经济学',
        category: 'business',
        statBonus: { iq: 3, eq: 2 },
        difficulty: 6,
        employability: 70,
        description: '理论与现实的差距',
        courses: COURSES_BY_MAJOR['economics'] || []
    },

    // ===== Liberal Arts =====
    {
        id: 'chinese',
        name: '汉语言文学',
        category: 'liberal_arts',
        statBonus: { eq: 4, charm: 2 },
        difficulty: 5,
        employability: 50,
        description: '文青聚集地',
        courses: []
    },
    {
        id: 'english',
        name: '英语',
        category: 'liberal_arts',
        statBonus: { eq: 3, charm: 2 },
        difficulty: 5,
        employability: 55,
        description: '卷不过翻译机',
        courses: []
    },
    {
        id: 'history',
        name: '历史学',
        category: 'liberal_arts',
        statBonus: { iq: 2, eq: 2 },
        difficulty: 5,
        employability: 40,
        description: '以史为鉴',
        courses: []
    },
    {
        id: 'philosophy',
        name: '哲学',
        category: 'liberal_arts',
        statBonus: { iq: 3, eq: 3 },
        difficulty: 6,
        employability: 35,
        description: '思考人生的终极问题',
        courses: []
    },
    {
        id: 'journalism',
        name: '新闻传播学',
        category: 'liberal_arts',
        statBonus: { eq: 4, charm: 3 },
        difficulty: 4,
        employability: 55,
        description: '铁肩担道义',
        courses: []
    },

    // ===== Arts =====
    {
        id: 'design',
        name: '视觉传达设计',
        category: 'arts',
        statBonus: { charm: 5, stress: 3 },
        difficulty: 5,
        employability: 60,
        description: '甲方说再改改',
        courses: COURSES_BY_MAJOR['design'] || []
    },
    {
        id: 'film',
        name: '影视编导',
        category: 'arts',
        statBonus: { eq: 3, charm: 4 },
        difficulty: 5,
        employability: 45,
        description: '距离导演最近的专业',
        courses: COURSES_BY_MAJOR['film'] || []
    },
    {
        id: 'music',
        name: '音乐表演',
        category: 'arts',
        statBonus: { charm: 6 },
        difficulty: 5,
        employability: 40,
        description: '艺术的代名词',
        courses: COURSES_BY_MAJOR['music'] || []
    },

    // ===== Medicine =====
    {
        id: 'clinical',
        name: '临床医学',
        category: 'medicine',
        statBonus: { iq: 4, stamina: -3, stress: 5 },
        difficulty: 10,
        employability: 90,
        description: '劝人学医，天打雷劈',
        courses: COURSES_BY_MAJOR['clinical'] || []
    },
    {
        id: 'dentistry',
        name: '口腔医学',
        category: 'medicine',
        statBonus: { iq: 3, charm: 2 },
        difficulty: 8,
        employability: 88,
        description: '牙科医生年入百万',
        courses: COURSES_BY_MAJOR['dentistry'] || []
    },

    // ===== Law =====
    {
        id: 'law',
        name: '法学',
        category: 'law',
        statBonus: { iq: 3, eq: 2, stress: 4 },
        difficulty: 7,
        employability: 70,
        description: '背书背到吐',
        courses: []
    },
];

// Helper functions
export const getMajorsByCategory = (category: MajorCategory) =>
    MAJORS.filter(m => m.category === category);

export const getMajorsForTier = (tier: string) => {
    switch (tier) {
        case 'top': return MAJORS;
        case 'tier2': return MAJORS.filter(m => m.difficulty <= 9);
        case 'tier3': return MAJORS.filter(m => m.difficulty <= 7);
        case 'vocational': return MAJORS.filter(m =>
            m.category === 'engineering' || m.category === 'business' || m.category === 'arts'
        ).filter(m => m.difficulty <= 6);
        default: return MAJORS;
    }
};

export const getCategoryLabel = (category: MajorCategory): string => {
    const labels: Record<MajorCategory, string> = {
        science: '理学',
        engineering: '工学',
        business: '经管',
        liberal_arts: '文学',
        arts: '艺术',
        medicine: '医学',
        law: '法学',
    };
    return labels[category] || category;
};

export const getCategoryColor = (category: MajorCategory): string => {
    const colors: Record<MajorCategory, string> = {
        science: 'text-blue-400',
        engineering: 'text-green-400',
        business: 'text-yellow-400',
        liberal_arts: 'text-purple-400',
        arts: 'text-pink-400',
        medicine: 'text-red-400',
        law: 'text-orange-400',
    };
    return colors[category] || 'text-dark-400';
};
