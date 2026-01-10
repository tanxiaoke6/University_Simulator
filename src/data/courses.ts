// Course Data for Major-Specific Curricula
import type { Course } from '../types';

// ===== Computer Science Courses =====
export const CS_COURSES: Course[] = [
    {
        id: 'cs_data_structures',
        name: '数据结构',
        type: 'Required',
        credits: 4,
        statBonus: { iq: 3, logic: 2 },
        energyCost: 15,
        description: '学习链表、树、图等核心数据结构'
    },
    {
        id: 'cs_algorithms',
        name: '算法设计与分析',
        type: 'Required',
        credits: 4,
        statBonus: { iq: 4, logic: 3 },
        energyCost: 20,
        description: '掌握排序、查找、动态规划等算法'
    },
    {
        id: 'cs_os',
        name: '操作系统',
        type: 'Required',
        credits: 3,
        statBonus: { iq: 3 },
        energyCost: 15,
        description: '理解进程、内存管理、文件系统'
    },
    {
        id: 'cs_database',
        name: '数据库系统',
        type: 'Required',
        credits: 3,
        statBonus: { iq: 2, employability: 3 },
        energyCost: 12,
        description: 'SQL、事务处理、数据库设计'
    },
    {
        id: 'cs_networks',
        name: '计算机网络',
        type: 'Required',
        credits: 3,
        statBonus: { iq: 2 },
        energyCost: 12,
        description: 'TCP/IP协议栈、网络安全基础'
    },
    {
        id: 'cs_ml',
        name: '机器学习',
        type: 'Elective',
        credits: 3,
        statBonus: { iq: 4, employability: 4 },
        energyCost: 18,
        description: '神经网络、深度学习入门'
    }
];

// ===== Finance Courses =====
export const FINANCE_COURSES: Course[] = [
    {
        id: 'fin_micro',
        name: '微观经济学',
        type: 'Required',
        credits: 4,
        statBonus: { iq: 3, eq: 2 },
        energyCost: 14,
        description: '供需理论、市场均衡、博弈论'
    },
    {
        id: 'fin_accounting',
        name: '会计学原理',
        type: 'Required',
        credits: 4,
        statBonus: { iq: 2, employability: 3 },
        energyCost: 12,
        description: '资产负债表、利润表、现金流'
    },
    {
        id: 'fin_corporate',
        name: '公司金融',
        type: 'Required',
        credits: 3,
        statBonus: { iq: 3, employability: 3 },
        energyCost: 15,
        description: '资本结构、股利政策、并购重组'
    },
    {
        id: 'fin_investment',
        name: '投资学',
        type: 'Required',
        credits: 3,
        statBonus: { iq: 3, luck: 1 },
        energyCost: 14,
        description: '股票债券、资产组合、风险管理'
    },
    {
        id: 'fin_derivatives',
        name: '金融衍生品',
        type: 'Elective',
        credits: 3,
        statBonus: { iq: 4, employability: 3 },
        energyCost: 16,
        description: '期货期权、Black-Scholes模型'
    }
];

// ===== Arts Courses =====
export const ARTS_COURSES: Course[] = [
    {
        id: 'art_history',
        name: '艺术史',
        type: 'Required',
        credits: 3,
        statBonus: { creativity: 3, charm: 2 },
        energyCost: 10,
        description: '从文艺复兴到现代主义'
    },
    {
        id: 'art_sketching',
        name: '素描基础',
        type: 'Required',
        credits: 4,
        statBonus: { creativity: 4 },
        energyCost: 18,
        description: '透视、明暗、构图训练'
    },
    {
        id: 'art_color',
        name: '色彩理论',
        type: 'Required',
        credits: 3,
        statBonus: { creativity: 3 },
        energyCost: 15,
        description: '色彩心理学、配色原则'
    },
    {
        id: 'art_digital',
        name: '数字艺术设计',
        type: 'Required',
        credits: 4,
        statBonus: { creativity: 3, employability: 3 },
        energyCost: 16,
        description: 'Photoshop、Illustrator应用'
    },
    {
        id: 'art_animation',
        name: '动画制作',
        type: 'Elective',
        credits: 3,
        statBonus: { creativity: 4, employability: 2 },
        energyCost: 20,
        description: '二维/三维动画基础'
    }
];

// ===== Medicine Courses =====
export const MEDICINE_COURSES: Course[] = [
    {
        id: 'med_anatomy',
        name: '人体解剖学',
        type: 'Required',
        credits: 5,
        statBonus: { iq: 4, stamina: -2 },
        energyCost: 22,
        description: '系统解剖、局部解剖'
    },
    {
        id: 'med_physiology',
        name: '生理学',
        type: 'Required',
        credits: 4,
        statBonus: { iq: 3 },
        energyCost: 18,
        description: '器官系统功能、稳态调节'
    },
    {
        id: 'med_pharmacology',
        name: '药理学',
        type: 'Required',
        credits: 4,
        statBonus: { iq: 3, employability: 2 },
        energyCost: 16,
        description: '药物作用机制、临床用药'
    },
    {
        id: 'med_pathology',
        name: '病理学',
        type: 'Required',
        credits: 4,
        statBonus: { iq: 3 },
        energyCost: 17,
        description: '疾病发生发展规律'
    },
    {
        id: 'med_clinical',
        name: '临床实习',
        type: 'Required',
        credits: 6,
        statBonus: { employability: 5, eq: 2 },
        energyCost: 25,
        description: '医院实践、病例分析'
    }
];

// Course lookup by major ID
export const COURSES_BY_MAJOR: Record<string, Course[]> = {
    'cs': CS_COURSES,
    'software': CS_COURSES,
    'ai': CS_COURSES,
    'finance': FINANCE_COURSES,
    'accounting': FINANCE_COURSES,
    'economics': FINANCE_COURSES,
    'design': ARTS_COURSES,
    'film': ARTS_COURSES,
    'music': ARTS_COURSES,
    'clinical': MEDICINE_COURSES,
    'dentistry': MEDICINE_COURSES,
};
