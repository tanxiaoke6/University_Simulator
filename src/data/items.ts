import type { Item } from '../types';

export const ITEMS: Item[] = [
    {
        id: 'energy_drink',
        name: '红牛能量饮料',
        category: 'food',
        description: '瞬间恢复大量体力。你觉得你可以再学五小时！',
        value: 25,
        rarity: 'common',
        effects: [{ type: 'attribute', target: 'stamina', value: 25 }]
    },
    {
        id: 'coffee_beans',
        name: '精品咖啡豆',
        category: 'food',
        description: '高端玩家必备，持续保持清醒。',
        value: 120,
        rarity: 'uncommon',
        effects: [{ type: 'attribute', target: 'stamina', value: 15 }, { type: 'attribute', target: 'stress', value: -10 }]
    },
    {
        id: 'textbook_pro',
        name: '考研名师讲义',
        category: 'book',
        description: '这本讲义字字珠玑，让你对专业课有了质的飞跃。',
        value: 300,
        rarity: 'rare',
        effects: [{ type: 'attribute', target: 'iq', value: 5 }, { type: 'gpa', target: 'gpa', value: 0.1 }]
    },
    {
        id: 'nice_gift',
        name: '精致的小礼物',
        category: 'gift',
        description: '送给心仪的人，或许会有意想不到的收获。',
        value: 200,
        rarity: 'uncommon',
        effects: [{ type: 'relationship', target: 'any', value: 10 }]
    },
    {
        id: 'laptop_new',
        name: '新款游戏笔电',
        category: 'electronics',
        description: '顶级配置，无论是跑代码还是打游戏都是丝滑体验。',
        value: 8000,
        rarity: 'epic',
        effects: [{ type: 'attribute', target: 'iq', value: 2 }, { type: 'attribute', target: 'stress', value: -30 }]
    }
];
