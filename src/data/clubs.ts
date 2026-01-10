
import type { Club, ClubMember, ClubTask, ClubRank } from '../types';

// Helper to create generic members
const createMember = (id: string, name: string, role: any, rank: ClubRank = 'Member', personality: string = 'Friendly'): ClubMember => ({
    id, name, gender: 'female', role, relationshipScore: 10, personality, metDate: { year: 1, semester: 1, week: 1, day: 1 }, rank
});

// ============ TASKS ============

const DEBATE_TASKS: ClubTask[] = [
    {
        id: 'debate_research',
        name: '整理辩题资料',
        description: '为下周的辩论赛搜集数据和论据。',
        difficulty: 1,
        minRank: 'Member',
        energyCost: 10,
        rewards: { reputation: 10, attribute: { target: 'iq', value: 2 } }
    },
    {
        id: 'debate_practice',
        name: '模拟攻辩',
        description: '与队友进行高强度的攻防演练。',
        difficulty: 2,
        minRank: 'Member',
        energyCost: 15,
        rewards: { reputation: 15, attribute: { target: 'eq', value: 3 } }
    },
    {
        id: 'debate_recruit',
        name: '招新面试',
        description: '面试申请加入的新人（需要副主席权限）。',
        difficulty: 3,
        minRank: 'Vice President',
        energyCost: 20,
        rewards: { reputation: 25, attribute: { target: 'employability', value: 2 } }
    },
    {
        id: 'debate_organize',
        name: '筹办校际辩论赛',
        description: '统筹全校范围的大型赛事。',
        difficulty: 5,
        minRank: 'President',
        energyCost: 40,
        rewards: { reputation: 50, attribute: { target: 'employability', value: 5 } }
    }
];

const STUDENT_COUNCIL_TASKS: ClubTask[] = [
    {
        id: 'sc_patrol',
        name: '校园巡查',
        description: '检查教学楼和食堂的卫生与秩序。',
        difficulty: 2,
        minRank: 'Member',
        energyCost: 20,
        rewards: { reputation: 15, attribute: { target: 'employability', value: 1 } }
    },
    {
        id: 'sc_proposal',
        name: '撰写提案',
        description: '起草关于改善学生福利的提案。',
        difficulty: 3,
        minRank: 'Member',
        energyCost: 25,
        rewards: { reputation: 20, attribute: { target: 'iq', value: 2 } }
    },
    {
        id: 'sc_budget',
        name: '审核社团预算',
        description: '审批各个社团的活动经费申请。',
        difficulty: 4,
        minRank: 'Vice President',
        energyCost: 30,
        rewards: { reputation: 30, attribute: { target: 'logic', value: 3 } }
    },
    {
        id: 'sc_speech',
        name: '开学典礼演讲',
        description: '代表全体学生在新生开学典礼上发言。',
        difficulty: 5,
        minRank: 'President',
        energyCost: 30,
        rewards: { reputation: 60, attribute: { target: 'charm', value: 5 } }
    }
];

// ============ CLUBS ============

export const CLUBS: Club[] = [
    {
        id: 'debate_club',
        name: '校辩论队',
        description: '磨练口才与逻辑，是全校最受瞩目的社团之一。',
        location: 'library',
        requirements: [
            { type: 'attribute', target: 'eq', value: 60 },
            { type: 'attribute', target: 'iq', value: 65 }
        ],
        benefits: [
            { type: 'attribute', target: 'eq', value: 3 },
            { type: 'attribute', target: 'charm', value: 2 },
            { type: 'attribute', target: 'stress', value: 10 }
        ],
        members: [
            createMember('debate_pres', '林语堂', 'classmate', 'President', 'Rational'),
            createMember('debate_vp', '苏筱筱', 'classmate', 'Vice President', 'Aggressive'),
            createMember('debate_m1', '王杠杠', 'classmate', 'Member', 'Stubborn')
        ],
        tasks: DEBATE_TASKS
    },
    {
        id: 'student_council',
        name: '学生会',
        description: '校园权力的中心，聚集了全校最优秀的精英。',
        location: 'admin_building',
        requirements: [
            { type: 'attribute', target: 'gpa', value: 3.5 },
            { type: 'attribute', target: 'employability', value: 40 },
            { type: 'attribute', target: 'charm', value: 50 },
            { type: 'honors', target: 'count', value: 1 } // Requires at least 1 honor/certificate conceptually, implemented as generic check later
        ],
        benefits: [
            { type: 'attribute', target: 'employability', value: 5 },
            { type: 'attribute', target: 'charm', value: 2 },
            { type: 'attribute', target: 'stress', value: 15 }
        ],
        members: [
            createMember('sc_pres', '顾长歌', 'classmate', 'President', 'Charismatic'),
            createMember('sc_vp', '叶冰凌', 'classmate', 'Vice President', 'Cold'),
            createMember('sc_sec', '张勤恳', 'classmate', 'Member', 'Diligent')
        ],
        tasks: STUDENT_COUNCIL_TASKS
    },
    {
        id: 'coding_club',
        name: '算法协会 (ACM)',
        description: '如果你热爱编程与算法，这里是你的天堂（或地狱）。',
        location: 'innovation_lab',
        requirements: [
            { type: 'attribute', target: 'iq', value: 75 }
        ],
        benefits: [
            { type: 'attribute', target: 'iq', value: 5 },
            { type: 'attribute', target: 'stamina', value: -10 }
        ],
        members: [
            createMember('acm_god', '陈图灵', 'classmate', 'President', 'Introverted'),
        ],
        tasks: [
            {
                id: 'code_leetcode',
                name: '刷题训练',
                description: '完成一组高难度算法题。',
                difficulty: 2,
                minRank: 'Member',
                energyCost: 15,
                rewards: { reputation: 10, attribute: { target: 'iq', value: 2 } }
            },
            {
                id: 'code_hackathon',
                name: '组织黑客马拉松',
                description: '筹备全校范围的编程竞赛。',
                difficulty: 4,
                minRank: 'Vice President',
                energyCost: 30,
                rewards: { reputation: 40, attribute: { target: 'employability', value: 4 } }
            }
        ]
    },
    {
        id: 'dance_crew',
        name: '街舞社',
        description: '在舞台上尽情释放你的活力，吸引全场的目光。',
        location: 'gym',
        requirements: [
            { type: 'attribute', target: 'charm', value: 60 },
            { type: 'attribute', target: 'stamina', value: 50 }
        ],
        benefits: [
            { type: 'attribute', target: 'charm', value: 5 },
            { type: 'attribute', target: 'stamina', value: 5 }
        ],
        members: [],
        tasks: []
    }
];
