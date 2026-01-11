import type { Item } from '../types';

export const ITEMS: Item[] = [
    {
        id: 'energy_drink',
        name: '红牛能量饮料',
        category: 'food',
        usageType: 'consumable',
        description: '瞬间恢复体力。你觉得你可以再学一会！',
        value: 25,
        rarity: 'common',
        effects: [{ type: 'attribute', target: 'stamina', value: 25 }]
    },
    {
        id: 'coffee_beans',
        name: '精品咖啡豆',
        category: 'food',
        usageType: 'consumable',
        description: '高端玩家必备，持续保持清醒。',
        value: 120,
        rarity: 'uncommon',
        effects: [{ type: 'attribute', target: 'stamina', value: 15 }, { type: 'attribute', target: 'stress', value: -1 }]
    },
    {
        id: 'textbook_pro',
        name: '考研名师讲义',
        category: 'book',
        usageType: 'equipment',
        description: '这本讲义字字珠玑，让你对专业课有了质的飞跃。',
        value: 300,
        rarity: 'rare',
        effects: [{ type: 'attribute', target: 'iq', value: 0.5 }, { type: 'gpa', target: 'gpa', value: 0.01 }]
    },
    {
        id: 'nice_gift',
        name: '精致的小礼物',
        category: 'gift',
        usageType: 'gift',
        description: '送给心仪的人，或许会有意想不到的收获。',
        value: 200,
        rarity: 'uncommon',
        effects: [{ type: 'relationship', target: 'any', value: 1 }]
    },
    {
        id: 'laptop_new',
        name: '新款游戏笔电',
        category: 'electronics',
        usageType: 'equipment',
        description: '顶级配置，无论是跑代码还是打游戏都是丝滑体验。',
        value: 8000,
        rarity: 'epic',
        effects: [{ type: 'attribute', target: 'iq', value: 0.2 }, { type: 'attribute', target: 'stress', value: -3 }]
    }
];
