// Family Backgrounds Data
import type { FamilyWealth, FamilyBackground } from '../types';

// Monthly allowance by wealth level
export const ALLOWANCE_BY_WEALTH: Record<FamilyWealth, number> = {
    poor: 800,
    middle: 1500,
    wealthy: 3500,
};

// Wealth level probabilities and labels
export const WEALTH_CONFIG: Record<FamilyWealth, {
    label: string;
    probability: number;
    color: string;
    description: string;
}> = {
    poor: {
        label: '贫困',
        probability: 0.25,
        color: 'text-red-400',
        description: '生活拮据，需要勤工俭学'
    },
    middle: {
        label: '中产',
        probability: 0.55,
        color: 'text-primary-400',
        description: '衣食无忧，偶尔精打细算'
    },
    wealthy: {
        label: '富裕',
        probability: 0.20,
        color: 'text-accent-400',
        description: '经济自由，不必为钱烦恼'
    },
};

// Parent occupations by wealth level
export const PARENT_OCCUPATIONS: Record<FamilyWealth, string[]> = {
    poor: [
        '农民',
        '工厂工人',
        '清洁工',
        '外卖骑手',
        '超市收银员',
        '建筑工人',
        '快递员',
        '保安',
        '服务员',
        '出租车司机',
    ],
    middle: [
        '中学教师',
        '公务员',
        '小企业主',
        '软件工程师',
        '医生',
        '会计',
        '银行职员',
        '销售经理',
        '大学讲师',
        '护士长',
        '设计师',
        '律师',
    ],
    wealthy: [
        '企业高管',
        '投资人',
        '律师事务所合伙人',
        '房地产开发商',
        '科技公司创始人',
        '私募基金经理',
        '上市公司董事',
        '知名医院主任医师',
        '著名大学教授',
        '连锁企业老板',
    ],
};

// Randomly roll wealth level based on probabilities
export const rollFamilyWealth = (): FamilyWealth => {
    const roll = Math.random();
    if (roll < WEALTH_CONFIG.poor.probability) return 'poor';
    if (roll < WEALTH_CONFIG.poor.probability + WEALTH_CONFIG.middle.probability) return 'middle';
    return 'wealthy';
};

// Get random occupation for wealth level
export const getRandomOccupation = (wealth: FamilyWealth): string => {
    const occupations = PARENT_OCCUPATIONS[wealth];
    return occupations[Math.floor(Math.random() * occupations.length)];
};

// Generate complete family background
export const generateFamilyBackground = (wealth?: FamilyWealth): FamilyBackground => {
    const finalWealth = wealth || rollFamilyWealth();
    return {
        wealth: finalWealth,
        parentsOccupation: getRandomOccupation(finalWealth),
        monthlyAllowance: ALLOWANCE_BY_WEALTH[finalWealth],
    };
};

// Monthly costs
export const MONTHLY_COSTS = {
    tuition: 5000,      // Per semester (September only)
    dorm: 100,          // Monthly
    food: 800,          // Monthly minimum
    entertainment: 200, // Optional
};

// Starting money by wealth
export const STARTING_MONEY: Record<FamilyWealth, number> = {
    poor: 3000,
    middle: 8000,
    wealthy: 20000,
};
