import { ActionRequirement } from '../types';

export type CertificateCategory = 'Skill' | 'Honor';

export interface Certificate {
    id: string;
    name: string;
    category: CertificateCategory;
    cost: number;
    duration: number; // in weeks
    reqStats: ActionRequirement[];
    majors?: string[]; // IDs of eligible majors
    description: string;
    bonus?: string;
}

export const CERTIFICATES: Certificate[] = [
    {
        id: 'cet4',
        name: '英语四级 (CET-4)',
        category: 'Skill',
        cost: 200,
        duration: 4,
        reqStats: [{ type: 'attribute', target: 'iq', value: 40 }],
        description: '大学英语四级证书，最基础的语言能力证明。',
        bonus: '稍微提升毕业竞争力'
    },
    {
        id: 'cet6',
        name: '英语六级 (CET-6)',
        category: 'Skill',
        cost: 300,
        duration: 8,
        reqStats: [{ type: 'attribute', target: 'iq', value: 60 }],
        description: '大学英语六级证书，进阶语言能力证明。',
        bonus: '提升名企求职概率'
    },
    {
        id: 'driver_license',
        name: '驾照 (Driver\'s License)',
        category: 'Skill',
        cost: 4500,
        duration: 12,
        reqStats: [{ type: 'attribute', target: 'luck', value: 30 }],
        description: 'C1机动车驾驶证，现代人的必备技能。',
        bonus: '解锁部分特殊兼职'
    },
    {
        id: 'cpa',
        name: '注册会计师 (CPA)',
        category: 'Skill',
        cost: 1500,
        duration: 20,
        reqStats: [{ type: 'attribute', target: 'iq', value: 85 }],
        majors: ['finance', 'accounting', 'economics'],
        description: '高难度的专业资格考试，金融财务领域的敲门砖。',
        bonus: '大幅提升金融类岗位成功率'
    },
    {
        id: 'national_scholarship',
        name: '国家奖项 (National Scholarship)',
        category: 'Honor',
        cost: 0,
        duration: 0,
        reqStats: [
            { type: 'attribute', target: 'gpa', value: 3.8 },
            { type: 'attribute', target: 'eq', value: 70 }
        ],
        description: '代表学生最高荣誉的国家奖学金。',
        bonus: '极大地提升学术保研或名企录用率'
    },
    {
        id: 'challenge_cup_gold',
        name: '挑战杯金奖 (Challenge Cup Gold)',
        category: 'Honor',
        cost: 0,
        duration: 0,
        reqStats: [
            { type: 'attribute', target: 'iq', value: 80 },
            { type: 'attribute', target: 'knowledgePoints', value: 300 }
        ],
        description: '全国大学生课外学术科技作品竞赛金奖。',
        bonus: '科研能力的终极证明'
    }
];
