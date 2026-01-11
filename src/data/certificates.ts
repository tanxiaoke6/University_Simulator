import { Certificate } from '../types';

export const CERTIFICATES: Certificate[] = [
    // ============ 语言考级 (Language) ============
    {
        id: 'cet4',
        name: '英语四级 (CET-4)',
        category: 'language',
        difficulty: 2,
        cost: 30,
        rewards: [{ type: 'attribute', target: 'employability', value: 5 }],
        description: '大学生的入门门槛，没过四级连毕业都困难。'
    },
    {
        id: 'cet6',
        name: '英语六级 (CET-6)',
        category: 'language',
        difficulty: 3,
        cost: 30,
        prereq: 'cet4',
        rewards: [{ type: 'attribute', target: 'employability', value: 15 }],
        description: '含金量比四级高不少，保研和找工作的加分项。'
    },
    {
        id: 'ielts',
        name: '雅思 (IELTS)',
        category: 'language',
        difficulty: 4,
        cost: 2200,
        rewards: [
            { type: 'attribute', target: 'employability', value: 25 },
            { type: 'attribute', target: 'charm', value: 5 }
        ],
        description: '出国留学的硬通货，也是外企求职的敲门砖。'
    },
    {
        id: 'putonghua',
        name: '普通话水平测试',
        category: 'language',
        difficulty: 1,
        cost: 50,
        rewards: [{ type: 'attribute', target: 'charm', value: 5 }],
        description: '二级乙等是及格线，想当老师至少要二级甲等。'
    },

    // ============ 职业资格 (Professional/Skill) ============
    {
        id: 'driver_license',
        name: '机动车驾驶证',
        category: 'skill',
        difficulty: 3,
        cost: 4000,
        rewards: [{ type: 'attribute', target: 'charm', value: 5 }],
        description: '趁大学有时间赶紧考了，工作后根本没空去驾校。'
    },
    {
        id: 'ncre_2',
        name: '计算机二级 (Office)',
        category: 'skill',
        difficulty: 2,
        cost: 80,
        rewards: [{ type: 'attribute', target: 'employability', value: 5 }],
        description: '虽然被吐槽含金量低，但很多国企只要这个证。'
    },
    {
        id: 'cpa_primary',
        name: '初级会计职称',
        category: 'professional',
        difficulty: 3,
        cost: 100,
        majorReq: 'business',
        rewards: [
            { type: 'attribute', target: 'employability', value: 20 },
            { type: 'attribute', target: 'iq', value: 2 }
        ],
        description: '会计入行的最低门槛，不考这个别说自己是学会计的。'
    },
    {
        id: 'teacher_cert',
        name: '教师资格证',
        category: 'professional',
        difficulty: 3,
        cost: 300,
        rewards: [
            { type: 'attribute', target: 'employability', value: 10 },
            { type: 'attribute', target: 'eq', value: 5 }
        ],
        description: '多一条后路总是没错的，教书育人也很光荣。'
    },
    {
        id: 'soft_designer',
        name: '软件设计师 (中级)',
        category: 'professional',
        difficulty: 4,
        cost: 160,
        majorReq: 'engineering',
        rewards: [
            { type: 'attribute', target: 'employability', value: 30 },
            { type: 'attribute', target: 'iq', value: 5 }
        ],
        description: '软考中级，很多互联网大厂认可的技术能力证明。'
    },

    // ============ 学科竞赛 (Competition) ============
    {
        id: 'comp_math_model',
        name: '全国大学生数学建模竞赛',
        category: 'competition',
        difficulty: 5,
        cost: 200,
        rewards: [
            { type: 'attribute', target: 'iq', value: 10 },
            { type: 'attribute', target: 'employability', value: 35 } // Modified to value logic
        ],
        description: '三天三夜不睡觉的极限挑战，国家级奖项是保研的硬通货。'
    },
    {
        id: 'comp_challenge_cup',
        name: '“挑战杯”创业大赛',
        category: 'competition',
        difficulty: 5,
        cost: 500,
        rewards: [
            { type: 'money', target: 'money', value: 2000 },
            { type: 'attribute', target: 'employability', value: 20 }
        ],
        description: '中国大学生的“奥林匹克”，既看创新也看PPT做原本。'
    },
    {
        id: 'comp_acm',
        name: 'ACM 程序设计竞赛',
        category: 'competition',
        difficulty: 5,
        cost: 0,
        majorReq: 'engineering',
        rewards: [
            { type: 'attribute', target: 'employability', value: 50 },
            { type: 'attribute', target: 'iq', value: 10 }
        ],
        description: '天才的战场，拿个牌子大厂Offer随便挑。'
    },
    {
        id: 'comp_english_speech',
        name: '英语演讲比赛',
        category: 'competition',
        difficulty: 3,
        cost: 0,
        rewards: [{ type: 'attribute', target: 'charm', value: 15 }],
        description: '站在聚光灯下展示你的自信和口语，非常锻炼人。'
    },

    // ============ 学术科研 (Research) ============
    {
        id: 'res_paper_cn',
        name: '发表中文核心期刊论文',
        category: 'research',
        difficulty: 4,
        cost: 2000,
        rewards: [
            { type: 'attribute', target: 'researchPoints', value: 20 },
            { type: 'attribute', target: 'gpa', value: 0.1 }
        ],
        description: '虽然不是顶刊，但本科生能发核心已经超越了90%的同学。'
    },
    {
        id: 'res_paper_sci',
        name: '发表 SCI 一区论文',
        category: 'research',
        difficulty: 5,
        cost: 0,
        rewards: [
            { type: 'attribute', target: 'researchPoints', value: 100 },
            { type: 'attribute', target: 'gpa', value: 0.3 }
        ],
        description: '本科生科研的天花板，直博名校的入场券。头发掉多少，IF就有多高。'
    },
    {
        id: 'res_patent',
        name: '实用新型专利',
        category: 'research',
        difficulty: 3,
        cost: 800,
        rewards: [
            { type: 'attribute', target: 'researchPoints', value: 10 },
            { type: 'attribute', target: 'iq', value: 5 }
        ],
        description: '把你的小发明保护起来，虽然含金量不如发明专利，但加分好用。'
    }
];
