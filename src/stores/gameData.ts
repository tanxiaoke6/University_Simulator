// Game Data - Static Events and Game Constants (uses data/ folder)
import type {
    StudentState,
    GameEvent,
    StaticEvent,
    Gender,
    GameDate,
    Attributes,
    FamilyBackground,
    AcademicInfo,
    GameFlags,
    GameConfig,
    University,
    Major,
    FamilyWealth,
    LifeGoal,
    NPC,
} from '../types';
import {
    getAvailableUniversities as getUnis
} from '../data/universities';
import {
    getMajorsForTier
} from '../data/majors';
import {
    ALLOWANCE_BY_WEALTH,
    STARTING_MONEY,
    rollFamilyWealth as rollWealth,
    getRandomOccupation,
} from '../data/backgrounds';

// Re-export for convenience
export { ALLOWANCE_BY_WEALTH } from '../data/backgrounds';

// ============ Helper Functions ============

export const rollFamilyWealth = rollWealth;

export const getAvailableUniversities = getUnis;

export const getAvailableMajors = getMajorsForTier;

export const calculateGaokaoScore = (iq: number, luck: number): number => {
    const baseScore = 350 + (iq / 100) * 280;
    const luckFactor = (luck - 50) * 1.2;
    const variance = (Math.random() - 0.5) * 60;
    return Math.round(Math.max(300, Math.min(750, baseScore + luckFactor + variance)));
};

// ============ Fixed Events Registry ============

const FIXED_EVENTS: StaticEvent[] = [
    {
        id: 'military_training',
        type: 'static',
        isLLMGenerated: false,
        title: '新生军训',
        description: '迷彩服、哨声、烈日...大学生活的第一堂课。教官的嗓门在大操场回荡，汗水顺着脸颊流下。虽然辛苦，但你也结识了最初的一批朋友。',
        choices: [
            { id: 'try_hard', text: '认真训练，争取标兵', effects: [{ type: 'attribute', target: 'stamina', value: -20 }, { type: 'attribute', target: 'charm', value: 5 }, { type: 'attribute', target: 'stress', value: 5 }] },
            { id: 'water', text: '偷偷在休息时间多喝水', effects: [{ type: 'attribute', target: 'stamina', value: -10 }] },
            { id: 'sick', text: '装病去阴凉处休息', effects: [{ type: 'attribute', target: 'eq', value: -2 }, { type: 'attribute', target: 'stress', value: -10 }] },
        ],
        timestamp: { year: 1, semester: 1, week: 1, day: 1 },
    },
    {
        id: 'final_exam_y1_s1',
        type: 'static',
        isLLMGenerated: false,
        title: '期末考周',
        description: '图书馆座无虚席，咖啡机的由于过度劳累发出了声响。这是你大学的第一个期末考周，生死攸关。',
        choices: [
            { id: 'library', text: '图书馆通宵复习', effects: [{ type: 'attribute', target: 'stamina', value: -30 }, { type: 'gpa', target: 'gpa', value: 0.3 }] },
            { id: 'cheat_sheet', text: '准备绝密小抄', effects: [{ type: 'attribute', target: 'stress', value: 20 }, { type: 'gpa', target: 'gpa', value: 0.4 }] },
            { id: 'resign', text: '听天由命', effects: [{ type: 'attribute', target: 'stress', value: -10 }, { type: 'gpa', target: 'gpa', value: -0.2 }] },
        ],
        timestamp: { year: 1, semester: 1, week: 18, day: 1 },
    },
];

// ============ Static Random Events ============

const RANDOM_STATIC_EVENTS: StaticEvent[] = [
    {
        id: 'class_boring',
        type: 'static',
        isLLMGenerated: false,
        title: '无聊的课堂',
        description: '今天的专业课老师讲得格外无聊，PPT上的字密密麻麻，你发现自己的眼皮越来越重...周围已经有同学开始打瞌睡了。',
        choices: [
            { id: 'sleep', text: '趴下小睡一会', effects: [{ type: 'attribute', target: 'stamina', value: 10 }, { type: 'gpa', target: 'gpa', value: -0.05 }] },
            { id: 'focus', text: '强撑精神继续听', effects: [{ type: 'attribute', target: 'stamina', value: -10 }, { type: 'gpa', target: 'gpa', value: 0.05 }] },
            { id: 'phone', text: '偷偷刷手机', effects: [{ type: 'attribute', target: 'stress', value: -5 }] },
        ],
        timestamp: { year: 1, semester: 1, week: 0, day: 0 }, // Placeholder
    },
    {
        id: 'roommate_snore',
        type: 'static',
        isLLMGenerated: false,
        title: '室友打呼噜',
        description: '深夜十二点，你的室友开始打呼噜，声音如雷贯耳，整个宿舍都在震动。你翻来覆去根本睡不着，明天还有早八的课...',
        choices: [
            { id: 'earplugs', text: '戴上耳塞默默忍耐', effects: [{ type: 'attribute', target: 'stress', value: 5 }] },
            { id: 'wake', text: '叫醒室友让他换个姿势', effects: [{ type: 'relationship', target: 'roommate_1', value: -10 }] },
            { id: 'leave', text: '去图书馆通宵自习', effects: [{ type: 'attribute', target: 'stamina', value: -20 }, { type: 'gpa', target: 'gpa', value: 0.1 }] },
        ],
        timestamp: { year: 1, semester: 1, week: 0, day: 0 },
    },
    {
        id: 'canteen_mystery',
        type: 'static',
        isLLMGenerated: false,
        title: '食堂惊魂',
        description: '你正在食堂吃午饭，筷子夹起一块肉，仔细一看...这是什么?! 一根不明物体赫然出现在你的饭菜里。周围同学都在看着你。',
        choices: [
            { id: 'complain', text: '拍照发朋友圈并向食堂投诉', effects: [{ type: 'money', target: 'money', value: 50 }, { type: 'attribute', target: 'eq', value: 1 }] },
            { id: 'ignore', text: '挑出来继续吃', effects: [{ type: 'attribute', target: 'stress', value: 10 }] },
            { id: 'leave', text: '扔掉，出去点外卖', effects: [{ type: 'money', target: 'money', value: -35 }] },
        ],
        timestamp: { year: 1, semester: 1, week: 0, day: 0 },
    },
];

// ============ Event Selection Logic ============

export const getNextEvent = (student: StudentState, date: GameDate): GameEvent => {
    // 1. Check for fixed events
    const fixed = FIXED_EVENTS.find(e =>
        e.timestamp.year === date.year &&
        e.timestamp.semester === date.semester &&
        e.timestamp.week === date.week
    );

    if (fixed) {
        return { ...fixed, id: `${fixed.id}_${Date.now()}`, timestamp: date };
    }

    // 2. Secret Romance Event (based on Charm > 70)
    if (student.attributes.charm > 70 && Math.random() < 0.15) {
        return {
            id: `romance_${Date.now()}`,
            type: 'static',
            isLLMGenerated: false,
            title: '突如其来的告白',
            description: '当你走出图书馆时，一个陌生的同学突然拦住了你，手里拿着一个包装精美的信封。ta的脸涨得通红，声音微微颤抖。',
            choices: [
                { id: 'accept', text: '礼貌地接受并尝试交往', effects: [{ type: 'attribute', target: 'eq', value: 5 }, { type: 'attribute', target: 'charm', value: 5 }] },
                { id: 'decline', text: '委婉地拒绝', effects: [{ type: 'attribute', target: 'eq', value: 2 }] },
                { id: 'run', text: '害羞得直接逃跑', effects: [{ type: 'attribute', target: 'stress', value: 5 }] },
            ],
            timestamp: date,
        };
    }

    // 3. Random static event
    const random = RANDOM_STATIC_EVENTS[Math.floor(Math.random() * RANDOM_STATIC_EVENTS.length)];
    return { ...random, id: `${random.id}_${Date.now()}`, timestamp: date };
};

// ============ Default Config ============

export const getDefaultConfig = (): GameConfig => ({
    llm: {
        provider: 'openai',
        apiKey: '',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.8,
    },
    autoSave: true,
    language: 'zh',
    soundEnabled: true,
    animationsEnabled: true,
});

// ============ Life Goals Initializer ============

export const INITIAL_GOALS: LifeGoal[] = [
    {
        id: 'baoyan',
        name: '学术保研',
        description: '通过优异的GPA、六级成绩和学术科研成果获得推免名额',
        progress: 0,
        requirements: [
            { type: 'attribute', target: 'gpa', value: 3.8 },
            { type: 'cet6', target: 'cet6Score', value: 550 },
            { type: 'research', target: 'researchPoints', value: 50 },
            { type: 'honors', target: 'honorsCount', value: 2 },
            { type: 'attribute', target: 'iq', value: 85 },
        ],
    },
    {
        id: 'kaoyan',
        name: '考研上岸',
        description: '通过全国统一考试与复试竞争，进入理想的研究所',
        progress: 0,
        requirements: [
            { type: 'attribute', target: 'knowledge', value: 600 },
            { type: 'attribute', target: 'iq', value: 75 },
            { type: 'attribute', target: 'luck', value: 60 }, // Luck factor
        ],
    },
    {
        id: 'employment',
        name: '名企就业',
        description: '在毕业前拿到大厂的校招Offer',
        progress: 0,
        requirements: [
            { type: 'attribute', target: 'eq', value: 70 },
            { type: 'attribute', target: 'employability', value: 80 },
        ],
    },
    {
        id: 'abroad',
        name: '出国深造',
        description: '拿到国外顶尖名校的录取通知书',
        progress: 0,
        requirements: [
            { type: 'attribute', target: 'money', value: 500000 },
            { type: 'attribute', target: 'iq', value: 75 },
        ],
    },
    {
        id: 'inheritance',
        name: '回家继承',
        description: '继承家业',
        progress: 0,
        requirements: [
            { type: 'wealth', target: 'wealth', value: 3 }, // Wealthy
            { type: 'attribute', target: 'iq', value: 60 }, // Normal IQ default is much higher usually, but request said 60
            { type: 'attribute', target: 'eq', value: 80 }, // High EQ
        ],
    },
    {
        id: 'startup',
        name: '自主创业',
        description: '毕业后不走寻常路，利用所学知识和积累的商才开启自己的事业',
        progress: 0,
        requirements: [
            { type: 'attribute', target: 'money', value: 200000 },
            { type: 'attribute', target: 'iq', value: 80 },
            { type: 'attribute', target: 'eq', value: 80 },
            { type: 'attribute', target: 'employability', value: 70 },
        ],
    },
];

// ============ Create Initial Student ============

const MALE_NAMES = ['张伟', '李强', '王磊', '刘洋', '陈杰', '杨帆', '赵鹏', '黄军'];
const FEMALE_NAMES = ['李娜', '王芳', '刘婷', '陈静', '杨雪', '赵敏', '黄丽', '周颖'];
const PERSONALITIES = ['开朗乐观', '内向安静', '幽默搞笑', '认真严谨', '热心助人', '我行我素', '学霸型', '社牛型'];

export const createInitialStudent = (
    name: string,
    gender: Gender,
    age: number,
    wealth: FamilyWealth,
    gaokaoScore: number,
    university: University,
    major: Major,
    gaokaoYear: number
): StudentState => {
    const occupation = getRandomOccupation(wealth);

    const baseAttrs: Attributes = {
        iq: 50 + Math.floor(Math.random() * 30),
        eq: 50 + Math.floor(Math.random() * 30),
        stamina: 80,
        stress: 20,
        charm: 40 + Math.floor(Math.random() * 30),
        luck: 40 + Math.floor(Math.random() * 30),
        employability: 50 + Math.floor(Math.random() * 20),
    };

    Object.entries(major.statBonus).forEach(([key, value]) => {
        if (value && key in baseAttrs) {
            const attrKey = key as keyof Attributes;
            const currentValue = baseAttrs[attrKey] || 0;
            baseAttrs[attrKey] = Math.min(100, Math.max(0, currentValue + value));
        }
    });

    const family: FamilyBackground = {
        wealth,
        parentsOccupation: occupation,
        monthlyAllowance: ALLOWANCE_BY_WEALTH[wealth],
    };

    const academic: AcademicInfo = {
        gaokaoScore,
        universityTier: university.tier,
        universityName: university.name,
        major,
        gpa: 0,
        knowledgePoints: 0,
        failedExams: 0,
        cet6Score: 0,
        honors: [],
        researchPoints: 0
    };

    const flags: GameFlags = {
        hasFailedExam: false,
        isDating: false,
        hasJob: false,
        joinedClub: false,
        isOnProbation: false,
        hasScholarship: false,
        graduationStatus: 'pending',
        achievements: [],
    };

    const namePool = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;
    const shuffledNames = [...namePool].sort(() => Math.random() - 0.5);
    const otherGenderPool = gender === 'male' ? FEMALE_NAMES : MALE_NAMES;
    const shuffledOtherNames = [...otherGenderPool].sort(() => Math.random() - 0.5);

    const npcs: NPC[] = [];

    // 1. Roommates (2-3)
    const roommatesCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < roommatesCount; i++) {
        npcs.push({
            id: `roommate_${i + 1}`,
            name: shuffledNames[i],
            gender,
            role: 'roommate',
            relationshipScore: 30 + Math.floor(Math.random() * 20),
            personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
            metDate: { year: 1, semester: 1, week: 1, day: 1 },
            chatHistory: [],
        });
    }

    // 2. Classmates (2-3)
    const classmatesCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < classmatesCount; i++) {
        const isSameGender = Math.random() > 0.5;
        npcs.push({
            id: `classmate_${i + 1}`,
            name: isSameGender ? shuffledNames[roommatesCount + i] : shuffledOtherNames[i],
            gender: isSameGender ? gender : (gender === 'male' ? 'female' : 'male'),
            role: 'classmate',
            relationshipScore: 10 + Math.floor(Math.random() * 20),
            personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
            metDate: { year: 1, semester: 1, week: 1, day: 1 },
            chatHistory: [],
        });
    }

    // 3. One Professor
    npcs.push({
        id: 'professor_1',
        name: Math.random() > 0.5 ? '王教授' : '张老师',
        gender: Math.random() > 0.5 ? 'male' : 'female',
        role: 'professor',
        relationshipScore: 5,
        personality: '严谨、博学、对学生要求很高',
        metDate: { year: 1, semester: 1, week: 1, day: 1 },
        chatHistory: [],
    });

    // 4. One Friend/Rival
    npcs.push({
        id: 'friend_1',
        name: shuffledOtherNames[classmatesCount + 1],
        gender: gender === 'male' ? 'female' : 'male',
        role: 'friend',
        relationshipScore: 15,
        personality: '活泼、爱美、喜欢参加社团活动',
        metDate: { year: 1, semester: 1, week: 1, day: 1 },
        chatHistory: [],
    });

    const initialDate: GameDate = { year: 1, semester: 1, week: 1, day: 1 };

    // Initial NPCs (Mom and Dad)
    const parents: NPC[] = [
        {
            id: 'mom',
            name: '妈妈',
            gender: 'female',
            role: 'parent',
            relationshipScore: 100, // Not used but kept for type safety
            parentPride: 50,
            personality: '关怀体贴，总是担心你在学校吃不饱，经常叮嘱你多锻炼。',
            metDate: initialDate,
            chatHistory: [],
            moments: [],
            viewMomentsPermission: true
        },
        {
            id: 'dad',
            name: '爸爸',
            gender: 'male',
            role: 'parent',
            relationshipScore: 100,
            parentPride: 50,
            personality: '沉稳内敛，平时话不多，但会在关键时刻给予你人生的指引。',
            metDate: initialDate,
            chatHistory: [],
            moments: [],
            viewMomentsPermission: true
        },
        {
            id: 'game_assistant',
            name: '游戏助手',
            gender: 'female',
            role: 'game_assistant',
            relationshipScore: 100,
            personality: '友好、乐于助人、熟悉一切游戏机制',
            metDate: initialDate,
            chatHistory: [],
            moments: [],
            viewMomentsPermission: true
        }
    ];

    return {
        id: `student_${Date.now()}`,
        name,
        gender,
        age,
        family,
        attributes: { ...baseAttrs, employability: 50 },
        academic,
        gaokaoYear,
        money: STARTING_MONEY[wealth],
        inventory: [],
        npcs: [...parents, ...npcs],
        flags,
        currentDate: initialDate,
        eventHistory: [],
        actionPoints: 5,
        maxActionPoints: 5,
        currentClub: null,
        currentJobId: null,
        wallet: {
            balance: STARTING_MONEY[wealth],
            transactions: [
                {
                    id: `trans_${Date.now()}`,
                    amount: STARTING_MONEY[wealth],
                    type: 'income',
                    description: '初始资金',
                    timestamp: initialDate
                }
            ]
        },
        certificates: [],
        pendingExams: [],
        notifications: [],
        goals: INITIAL_GOALS,
        achievements: [],
        historySummary: `${name}以${academic.gaokaoScore}分的成绩考入${university.name}${major.name}专业，开始了大学生活。`,
    };
};
