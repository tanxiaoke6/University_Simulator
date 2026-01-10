// Universities Data - Chinese University Rankings
import type { University } from '../types';

export const UNIVERSITIES: University[] = [
    // ===== Top Tier (985/C9) =====
    { name: '清华大学', tier: 'top', minScore: 690, prestige: 100, location: '北京' },
    { name: '北京大学', tier: 'top', minScore: 685, prestige: 99, location: '北京' },
    { name: '复旦大学', tier: 'top', minScore: 670, prestige: 95, location: '上海' },
    { name: '上海交通大学', tier: 'top', minScore: 668, prestige: 94, location: '上海' },
    { name: '浙江大学', tier: 'top', minScore: 665, prestige: 93, location: '杭州' },
    { name: '南京大学', tier: 'top', minScore: 660, prestige: 90, location: '南京' },
    { name: '中国科学技术大学', tier: 'top', minScore: 665, prestige: 92, location: '合肥' },
    { name: '哈尔滨工业大学', tier: 'top', minScore: 650, prestige: 89, location: '哈尔滨' },
    { name: '西安交通大学', tier: 'top', minScore: 648, prestige: 88, location: '西安' },
    { name: '武汉大学', tier: 'top', minScore: 645, prestige: 87, location: '武汉' },
    { name: '华中科技大学', tier: 'top', minScore: 642, prestige: 86, location: '武汉' },
    { name: '中山大学', tier: 'top', minScore: 638, prestige: 85, location: '广州' },

    // ===== Tier 2 (211 / Strong Provincial) =====
    { name: '厦门大学', tier: 'tier2', minScore: 625, prestige: 80, location: '厦门' },
    { name: '北京航空航天大学', tier: 'tier2', minScore: 635, prestige: 82, location: '北京' },
    { name: '同济大学', tier: 'tier2', minScore: 630, prestige: 81, location: '上海' },
    { name: '东南大学', tier: 'tier2', minScore: 620, prestige: 78, location: '南京' },
    { name: '四川大学', tier: 'tier2', minScore: 600, prestige: 75, location: '成都' },
    { name: '重庆大学', tier: 'tier2', minScore: 590, prestige: 72, location: '重庆' },
    { name: '湖南大学', tier: 'tier2', minScore: 585, prestige: 70, location: '长沙' },
    { name: '东北大学', tier: 'tier2', minScore: 570, prestige: 65, location: '沈阳' },
    { name: '大连理工大学', tier: 'tier2', minScore: 580, prestige: 68, location: '大连' },
    { name: '华南理工大学', tier: 'tier2', minScore: 595, prestige: 73, location: '广州' },
    { name: '电子科技大学', tier: 'tier2', minScore: 610, prestige: 76, location: '成都' },
    { name: '北京理工大学', tier: 'tier2', minScore: 615, prestige: 77, location: '北京' },

    // ===== Tier 3 (Regular Universities) =====
    { name: '杭州电子科技大学', tier: 'tier3', minScore: 540, prestige: 55, location: '杭州' },
    { name: '南京邮电大学', tier: 'tier3', minScore: 530, prestige: 52, location: '南京' },
    { name: '广东工业大学', tier: 'tier3', minScore: 510, prestige: 48, location: '广州' },
    { name: '浙江工业大学', tier: 'tier3', minScore: 520, prestige: 50, location: '杭州' },
    { name: '上海理工大学', tier: 'tier3', minScore: 505, prestige: 47, location: '上海' },
    { name: '成都理工大学', tier: 'tier3', minScore: 490, prestige: 45, location: '成都' },
    { name: '西安电子科技大学', tier: 'tier3', minScore: 550, prestige: 56, location: '西安' },
    { name: '北京邮电大学', tier: 'tier3', minScore: 560, prestige: 58, location: '北京' },
    { name: '南京理工大学', tier: 'tier3', minScore: 545, prestige: 54, location: '南京' },
    { name: '武汉理工大学', tier: 'tier3', minScore: 535, prestige: 53, location: '武汉' },

    // ===== Vocational / Specialist =====
    { name: '深圳职业技术学院', tier: 'vocational', minScore: 420, prestige: 42, location: '深圳' },
    { name: '广州番禺职业技术学院', tier: 'vocational', minScore: 400, prestige: 38, location: '广州' },
    { name: '北京电子科技职业学院', tier: 'vocational', minScore: 410, prestige: 40, location: '北京' },
    { name: '杭州职业技术学院', tier: 'vocational', minScore: 390, prestige: 36, location: '杭州' },
    { name: '成都航空职业技术学院', tier: 'vocational', minScore: 380, prestige: 35, location: '成都' },
];

// Helper functions
export const getUniversitiesByTier = (tier: string) =>
    UNIVERSITIES.filter(u => u.tier === tier);

export const getAvailableUniversities = (score: number) =>
    UNIVERSITIES.filter(u => score >= u.minScore).sort((a, b) => b.minScore - a.minScore);

export const getTierLabel = (tier: string): string => {
    const labels: Record<string, string> = {
        top: '985/双一流',
        tier2: '211工程',
        tier3: '普通本科',
        vocational: '高职专科',
    };
    return labels[tier] || tier;
};

export const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
        top: 'text-accent-400 bg-accent-500/20',
        tier2: 'text-primary-400 bg-primary-500/20',
        tier3: 'text-green-400 bg-green-500/20',
        vocational: 'text-dark-300 bg-dark-600/50',
    };
    return colors[tier] || 'text-dark-400 bg-dark-700';
};
