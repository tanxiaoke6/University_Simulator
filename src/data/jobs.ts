import type { Job } from '../types';

export const JOBS: Job[] = [
    {
        id: 'delivery',
        name: '校园外卖员',
        salary: 150,
        energyCost: 30,
        requirements: [
            { type: 'attribute' as const, target: 'stamina', value: 30 }
        ],
        isUnlocked: true
    },
    {
        id: 'library_assistant',
        name: '图书馆管理员',
        salary: 100,
        energyCost: 15,
        requirements: [
            { type: 'attribute' as const, target: 'iq', value: 50 }
        ],
        isUnlocked: true
    },
    {
        id: 'tutor_math',
        name: '数学竞赛家教',
        salary: 400,
        energyCost: 20,
        requirements: [
            { type: 'attribute' as const, target: 'iq', value: 80 }
        ],
        isUnlocked: false
    },
    {
        id: 'tech_intern',
        name: '大厂开发实习生',
        salary: 800,
        energyCost: 40,
        requirements: [
            { type: 'attribute' as const, target: 'iq', value: 85 },
            { type: 'attribute' as const, target: 'eq', value: 60 }
        ],
        isUnlocked: false
    }
].map(j => ({ ...j, id: j.id, title: j.name }));
