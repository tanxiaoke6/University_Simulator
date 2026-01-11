// AI Service Layer - Handles LLM API calls with Robust Mock/Offline Fallbacks
import type { LLMConfig, StudentState, GameEvent, EventChoice, GameDate, Course } from '../types';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

const withTimeout = (promise: Promise<any>, ms: number) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`LLM API Timeout (${ms / 1000}s)`)), ms))
    ]);
};

// Mock Events for Offline Mode
const MOCK_EVENTS = [
    {
        title: "图书馆的宁静",
        description: "周末你选择在学校的图书馆度过。阳光洒在书页上，周围只有翻书的沙沙声。你感觉自己沉浸在知识的海洋中。",
        choices: [
            { text: "专注复习专业课", effects: { iq: 2, stamina: -5, gpa: 0.1 } },
            { text: "阅读一些课外读物", effects: { eq: 1, stamina: 5 } }
        ]
    },
    {
        title: "食堂的新菜式",
        description: "食堂二楼今天推出了'特色创新料理'。虽然看起来颜色有点奇怪，但闻起来居然还不错。你的肚子饿得咕咕叫。",
        choices: [
            { text: "勇敢尝试新口味", effects: { stamina: 10, luck: 2 } },
            { text: "还是吃回老三样", effects: { stamina: 5, money: -15 } }
        ]
    },
    {
        title: "宿舍楼下的偶遇",
        description: "晚课回来，你在宿舍楼下偶遇了很久没见的同学。ta看起来似乎有些心事，正一个人坐在长椅上发呆。",
        choices: [
            { text: "主动上前打招呼叙旧", effects: { eq: 2, charm: 1 } },
            { text: "当作没看见，径直上楼", effects: { stress: -5 } }
        ]
    },
    {
        title: "突如其来的阵雨",
        description: "从教学楼出来，天空突然下起了一阵急促的大雨。你没有带伞，而此时正好看到一位拿着大伞的熟人经过。",
        choices: [
            { text: "厚着脸皮去蹭伞", effects: { eq: 1, charm: 1, stamina: -2 } },
            { text: "在屋檐下等雨停", effects: { stamina: -5, stress: 5 } },
            { text: "冒雨跑回宿舍", effects: { stamina: -15, luck: -1 } }
        ]
    },
    {
        title: "校园社团招新",
        description: "路过学生活动中心，那里正热闹非凡地进行着社团招星。五花八门的招牌让你目不暇接，各种学长学姐在热情拉客。",
        choices: [
            { text: "填表申请心仪的社团", effects: { eq: 2, money: -50 } },
            { text: "只看热闹，不为所动", effects: { stamina: 5 } }
        ]
    }
];

// Generate dynamic event based on student state (Synchronous version)
export const generateMockEventSync = (currentDate: GameDate): GameEvent => {
    const mock = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];

    const choices: EventChoice[] = mock.choices.map((c, idx) => ({
        id: `choice_${idx}`,
        text: c.text,
        effects: Object.entries(c.effects).map(([key, val]) => {
            if (key === 'gpa') return { type: 'gpa' as const, target: 'gpa', value: val as number };
            if (key === 'money') return { type: 'money' as const, target: 'money', value: val as number };
            return { type: 'attribute' as const, target: key, value: val as number };
        }),
    }));

    return {
        id: `mock_${generateId()}`,
        type: 'dynamic',
        title: mock.title,
        description: mock.description,
        choices,
        isLLMGenerated: true, // We mark as true to satisfy GameEvent type requirements for dynamic events
        timestamp: currentDate,
    };
};

// Generate dynamic event based on student state (Promise wrapper for legacy compatibility)
export const generateMockEvent = (currentDate: GameDate): GameEvent => {
    return generateMockEventSync(currentDate);
};

// Format game state for LLM context
const formatGameContext = (student: StudentState): string => {
    const { attributes, academic, money, npcs, flags, currentDate } = student;
    const semesterStr = currentDate.semester === 1 ? '秋季' : '春季';

    return `
Current Student Status:
- Name: ${student.name}, Year ${currentDate.year}, ${semesterStr} Semester, Week ${currentDate.week}
- University: ${academic.universityName} (${academic.universityTier})
- Major: ${academic.major.name}
- GPA: ${academic.gpa.toFixed(2)}
- Money: ¥${money}
- IQ: ${attributes.iq}, EQ: ${attributes.eq}
- Energy: ${attributes.stamina}%, Stress: ${attributes.stress}%
- Charm: ${attributes.charm}, Luck: ${attributes.luck}
- Dating: ${flags.isDating ? 'Yes' : 'No'}
- Has Job: ${flags.hasJob ? 'Yes' : 'No'}
- Relationships: ${npcs.slice(0, 3).map(n => `${n.name}(${n.role}:${n.relationshipScore})`).join(', ')}
`.trim();
};

// ============ Phase 1: AI Director System ============

/**
 * Token-optimized state summary for AI Director.
 * Only extracts key fields to reduce API costs.
 */
export const summarizeStateForAI = (student: StudentState): string => {
    const { attributes, academic, money, flags, currentDate, npcs, eventHistory } = student;

    // Extract high-intimacy NPCs only
    const topNPCs = npcs
        .filter(n => n.relationshipScore > 30)
        .slice(0, 3)
        .map(n => `${n.name}(${n.role}, 好感${n.relationshipScore})`);

    // Recent events (last 3)
    const recentEvents = eventHistory
        .slice(-3)
        .map(e => e.title)
        .join('; ');

    return JSON.stringify({
        time: { year: currentDate.year, semester: currentDate.semester, week: currentDate.week },
        stats: {
            iq: attributes.iq,
            eq: attributes.eq,
            stamina: attributes.stamina,
            stress: attributes.stress,
            charm: attributes.charm,
            luck: attributes.luck,
        },
        academic: { gpa: academic.gpa.toFixed(2), major: academic.major.name, university: academic.universityName },
        money,
        flags: { isDating: flags.isDating, hasJob: flags.hasJob, hasScholarship: flags.hasScholarship },
        topNPCs,
        recentEvents: recentEvents || '无',
        weeklyDiary: student.weeklyDiary || null,
    });
};

// Director System Prompt - Strict JSON output
const DIRECTOR_SYSTEM_PROMPT = `你是《大学生活模拟器》的 AI 导演 (Game Director)。
你的任务是根据玩家当前状态，决定这一周会发生什么故事。

## 规则
1. 根据玩家的压力、金钱、学业状态，生成合理的叙事。
2. 校园新闻应反映当前时间节点（开学、考试周、放假等）。
3. statChanges 是增量值（Delta），会叠加到玩家属性上。
4. 合理范围：stress ±20, stamina ±30, money ±500, gpa ±0.3

## 输出格式 (Strict JSON)
Output STRICT JSON only. No markdown. No conversational text. Start directly with '{'.
{
  "narrative": "本周发生的故事描述 (50-100字)",
  "worldNews": "校园/社会新闻头条 (一句话)",
  "statChanges": { "stress": 10, "money": -200, ... },
  "specialEventId": null
}`;

import type { DirectorResponse } from '../types';

const MOCK_DIRECTOR_RESPONSES: DirectorResponse[] = [
    {
        narrative: '这周过得平淡无奇，早出晚归地上课、自习。食堂的饭菜一如既往，室友的呼噜声依然响亮。',
        worldNews: '学校图书馆将延长开放时间至晚上11点',
        statChanges: { stamina: -10, stress: 5 },
    },
    {
        narrative: '周三晚上和室友一起在宿舍看了场电影，难得的放松时光让你感觉精神焕发。',
        worldNews: '双十一校园快递爆仓，取件需排队两小时',
        statChanges: { stress: -15, stamina: 10 },
    },
    {
        narrative: '这周你沉迷学习无法自拔，连续几天泡在图书馆，感觉脑子都要冒烟了。',
        worldNews: '学校食堂推出新菜品：神秘肉丸套餐',
        statChanges: { iq: 3, stamina: -20, stress: 15 },
    },
];

/**
 * Generates weekly AI Director plan with narrative and stat changes.
 * Uses "Base Rules + AI Modifiers" pattern - returns Delta values only.
 */
export const generateWeeklyDirectorPlan = async (
    config: LLMConfig,
    student: StudentState
): Promise<DirectorResponse> => {
    // Offline/No API Key fallback
    if (!config.apiKey || config.apiKey.trim() === '') {
        console.log('[AI Director] No API key, using mock response');
        return MOCK_DIRECTOR_RESPONSES[Math.floor(Math.random() * MOCK_DIRECTOR_RESPONSES.length)];
    }

    const stateContext = summarizeStateForAI(student);
    const userPrompt = `当前玩家状态：\n${stateContext}\n\n请生成本周的故事和属性变化。`;

    try {
        const response = await withTimeout(callLLM(config, DIRECTOR_SYSTEM_PROMPT, userPrompt), 20000);

        // Parse JSON response
        let jsonStr = response.trim();
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();

        // Remove potential leading/trailing content
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }

        const data = JSON.parse(jsonStr) as DirectorResponse;

        // Validate and sanitize statChanges
        const sanitized: DirectorResponse = {
            narrative: data.narrative || '这周平安无事。',
            worldNews: data.worldNews || '校园生活一切正常。',
            statChanges: {},
            specialEventId: data.specialEventId,
        };

        // Clamp stat changes to reasonable ranges
        if (data.statChanges) {
            const clamp = (val: number | undefined, min: number, max: number) =>
                val !== undefined ? Math.max(min, Math.min(max, val)) : undefined;

            sanitized.statChanges = {
                iq: clamp(data.statChanges.iq, -5, 5),
                eq: clamp(data.statChanges.eq, -5, 5),
                stamina: clamp(data.statChanges.stamina, -30, 30),
                stress: clamp(data.statChanges.stress, -20, 20),
                charm: clamp(data.statChanges.charm, -5, 5),
                luck: clamp(data.statChanges.luck, -5, 5),
                money: clamp(data.statChanges.money, -1000, 1000),
                gpa: clamp(data.statChanges.gpa, -0.3, 0.3),
            };
            // Remove undefined values
            Object.keys(sanitized.statChanges).forEach(key => {
                if ((sanitized.statChanges as any)[key] === undefined) {
                    delete (sanitized.statChanges as any)[key];
                }
            });
        }

        return sanitized;
    } catch (error) {
        console.error('[AI Director] Generation failed, using fallback:', error);
        return MOCK_DIRECTOR_RESPONSES[Math.floor(Math.random() * MOCK_DIRECTOR_RESPONSES.length)];
    }
};

const SYSTEM_PROMPT = `You are the narrator of a Chinese university life simulator game. 
Your role is to generate engaging, realistic, and sometimes humorous campus events.
Response format (JSON only): { "title": "...", "description": "...", "choices": [...] }`;

// Parse LLM response to GameEvent
const parseEventResponse = (
    response: string,
    currentDate: GameDate
): GameEvent | null => {
    try {
        let jsonStr = response;
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1];

        // Try to extract JSON from response
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }

        const data = JSON.parse(jsonStr.trim());

        // Handle choices - AI might return different formats
        const rawChoices = data.choices || data.options || [];

        const choices: EventChoice[] = rawChoices.map((c: any, idx: number) => {
            // Try multiple possible field names for choice text
            const choiceText = c.text || c.label || c.option || c.content || c.name || c.choice || '';

            // If choice is a string directly (e.g., ["选项1", "选项2"])
            const finalText = typeof c === 'string' ? c : choiceText;

            return {
                id: `choice_${idx}`,
                text: finalText || `选项 ${idx + 1}`,
                effects: Object.entries(c.effects || {}).map(([key, val]) => {
                    if (key === 'gpa') return { type: 'gpa' as const, target: 'gpa', value: val as number };
                    if (key === 'money') return { type: 'money' as const, target: 'money', value: val as number };
                    return { type: 'attribute' as const, target: key, value: val as number };
                }),
            };
        });

        // Filter out choices with empty text and ensure at least one valid choice
        const validChoices = choices.filter(c => c.text && c.text.trim() !== '');

        if (validChoices.length === 0) {
            console.warn('LLM generated event with no valid choices, falling back to mock.');
            return null;
        }

        return {
            id: generateId(),
            type: 'dynamic',
            title: data.title || '校园事件',
            description: data.description || '发生了一些事情...',
            choices: validChoices,
            isLLMGenerated: true,
            timestamp: currentDate,
        };
    } catch (error) {
        console.error('Failed to parse LLM response:', error);
        return null;
    }
};


// Main API call function
export const callLLM = async (
    config: LLMConfig,
    systemPrompt: string,
    userPrompt: string
): Promise<string> => {
    const { provider, apiKey, baseUrl, model, maxTokens, temperature } = config;
    if (!apiKey) throw new Error('API Key is missing');

    let endpoint: string;
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: Record<string, unknown>;

    switch (provider) {
        case 'openai':
        case 'custom': // Custom provider uses OpenAI-compatible format
            // Robust base URL handling: trim trailing slashes and ensure /chat/completions is present
            {
                const base = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
                endpoint = `${base}/chat/completions`;
                headers['Authorization'] = `Bearer ${apiKey}`;
                body = { model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: maxTokens, temperature };
            }
            break;
        case 'gemini':
            endpoint = baseUrl || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            body = { contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }], generationConfig: { maxOutputTokens: maxTokens, temperature } };
            break;
        default:
            // Fallback to OpenAI-compatible format for unknown providers
            {
                const fallbackBase = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
                endpoint = `${fallbackBase}/chat/completions`;
                headers['Authorization'] = `Bearer ${apiKey}`;
                body = { model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: maxTokens, temperature };
            }
    }

    const response = await withTimeout(fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    }), 15000) as Response;

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (provider === 'openai' || provider === 'custom') return data.choices?.[0]?.message?.content || '';
    if (provider === 'gemini') return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return data.choices?.[0]?.message?.content || '';
};

// Generate dynamic event with fallback
export const generateDynamicEvent = async (
    config: LLMConfig,
    student: StudentState,
    trigger?: string,
    locationContext?: { name: string; type: string }
): Promise<GameEvent | null> => {
    // 1. HARD SYNC CHECK: If no key, return IMMEDIATELY using Promise.resolve()
    if (!config.apiKey || config.apiKey.trim() === '') {
        console.log("Creating Mock Event (Synchronous Path)");
        return Promise.resolve(generateMockEventSync(student.currentDate));
    }

    const context = formatGameContext(student);

    // NPC Injection
    const randomNpc = student.npcs[Math.floor(Math.random() * student.npcs.length)];
    const npcInjection = randomNpc ? `Involve this NPC if possible: ${randomNpc.name} (${randomNpc.role})` : '';

    let promptTrigger = trigger || '';
    if (locationContext) {
        promptTrigger += `\nCurrent Location: ${locationContext.name} (${locationContext.type}). Generate an event specific to this location.`;
        if (locationContext.type === 'off_campus') promptTrigger += ' (Example: Shopping, Part-time job, City exploration)';
        if (locationContext.type === 'academic') promptTrigger += ' (Example: Study, Research, Competition)';
        if (locationContext.type === 'living') promptTrigger += ' (Example: Relaxing, Socializing, Dorm life)';
    }

    const userPrompt = `${context}\n\n${npcInjection}\n${promptTrigger ? `Trigger/Context: ${promptTrigger}` : 'Generate a random campus event.'}`;

    try {
        const response = await callLLM(config, SYSTEM_PROMPT, userPrompt);
        const event = parseEventResponse(response, student.currentDate);
        return event || generateMockEventSync(student.currentDate);
    } catch (error) {
        console.error('AI Generation Failed, switching to Mock Mode:', error);
        return generateMockEventSync(student.currentDate);
    }
};

// Test LLM connection
export const testLLMConnection = async (config: LLMConfig): Promise<{ success: boolean; error?: string }> => {
    if (!config.apiKey) return { success: false, error: '请输入 API Key' };

    try {
        const response = await withTimeout(callLLM(
            config,
            'You are a helpful assistant.',
            'Reply with just the word "connected" if you can read this.'
        ), 30000); // 30 second timeout for test
        const success = response.toLowerCase().includes('connected');
        return { success, error: success ? undefined : 'API 响应不匹配' };
    } catch (error: any) {
        return { success: false, error: error.message || '连接失败' };
    }
};

// ============ Forum LLM Integration ============

const FORUM_SYSTEM_PROMPT = `你是一个中国大学论坛的模拟器。根据学生当前的状态和游戏时间，生成3-5条贴近现实的论坛帖子。
帖子应该反映校园生活、考试、社交等话题。如果有即将到来的考试或事件，要生成相关的帖子。
返回JSON格式: { "posts": ["帖子1", "帖子2", ...] }`;

const MOCK_FORUM_POSTS = [
    "听说二食堂的红烧肉涨价了，真实度 80%...",
    "这周的数学建模比赛题目太变态了吧！",
    "求问：哪位教授的期末考比较容易过？",
    "图书馆占座大战，今天又失败了...",
    "有没有人一起组队考研？",
];

export interface ForumComment {
    id: string;
    author: string;
    content: string;
    timestamp: number;
}

export interface ForumPost {
    id: string;
    title: string;
    content: string;
    author: string;
    likes: number;
    liked: boolean;
    time: string;
    tag: string;
    comments: ForumComment[];
}

export const generateForumPosts = async (
    config: LLMConfig,
    student: StudentState
): Promise<ForumPost[]> => {
    // Generate contextual hints
    const pendingExamNames = student.pendingExams?.map(e => e.name).join(', ') || '';
    const weekInfo = `第${student.currentDate.year}学年 第${student.currentDate.week}周`;

    const contextHints = [];
    if (student.currentDate.week >= 16) contextHints.push('期末考试周临近');
    if (pendingExamNames) contextHints.push(`有人正在备考: ${pendingExamNames}`);
    if (student.currentDate.week === 1) contextHints.push('新学期开始');

    // Randomized author names for forum posts
    const AUTHORS = ['李明', '王芳', '张伟', '刘洋', '陈静', '赵强', '孙丽', '周杰', '吴娜', '郑云'];

    // Offline mode fallback
    if (!config.apiKey || config.apiKey.trim() === '') {
        return MOCK_FORUM_POSTS.map((content, i) => ({
            id: `forum_${i}`,
            title: content.substring(0, 20) + '...',
            content,
            author: AUTHORS[Math.floor(Math.random() * AUTHORS.length)],
            likes: Math.floor(Math.random() * 50),
            liked: false,
            time: `${Math.floor(Math.random() * 12) + 1}小时前`,
            tag: '校园',
            comments: []
        }));
    }

    try {
        const userPrompt = `当前时间: ${weekInfo}\n背景提示: ${contextHints.join('; ') || '普通校园生活'}\n\n请生成5条论坛帖子。`;
        const response = await callLLM(config, FORUM_SYSTEM_PROMPT, userPrompt);

        let posts: string[] = [];
        try {
            const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
            const data = JSON.parse(jsonMatch[1]?.trim() || response.trim());
            posts = data.posts || [];
        } catch {
            posts = MOCK_FORUM_POSTS;
        }

        return posts.map((content, i) => {
            const contentStr = typeof content === 'string' ? content : String(content);
            return {
                id: `forum_${Date.now()}_${i}`,
                title: contentStr.substring(0, 20) + '...',
                content: contentStr,
                author: AUTHORS[Math.floor(Math.random() * AUTHORS.length)],
                likes: Math.floor(Math.random() * 50),
                liked: false,
                time: `${Math.floor(Math.random() * 12) + 1}小时前`,
                tag: '校园',
                comments: []
            };
        });
    } catch (error) {
        console.error('Forum LLM failed:', error);
        const AUTHORS = ['李明', '王芳', '张伟', '刘洋', '陈静', '赵强', '孙丽', '周杰', '吴娜', '郑云'];
        return MOCK_FORUM_POSTS.map((content, i) => ({
            id: `forum_fallback_${i}`,
            title: content.substring(0, 20) + '...',
            content,
            author: AUTHORS[Math.floor(Math.random() * AUTHORS.length)],
            likes: Math.floor(Math.random() * 20),
            liked: false,
            time: `${Math.floor(Math.random() * 12) + 1}小时前`,
            tag: '校园',
            comments: []
        }));
    }
};

// ============ Confession Detection System ============

const CONFESSION_DETECTION_PROMPT = `你是一个对话分析助手。判断用户的消息是否是向对方表白/告白/示爱。
表白的特征包括：表达喜欢、爱意、想在一起、想做男/女朋友等。
只需回复 "是" 或 "否"，不要解释。`;

// Offline fallback keywords for confession detection
const CONFESSION_KEYWORDS = [
    '喜欢你', '爱你', '我喜欢', '我爱', '做我女朋友', '做我男朋友',
    '在一起', '交往', '告白', '表白', '牵手', '约会吧',
    '我的心', '暗恋', '心动', '一辈子', '嫁给我', '娶我'
];

/**
 * Detects if a message is a love confession.
 * Uses LLM when available, falls back to keyword matching offline.
 */
export const detectConfession = async (
    config: LLMConfig,
    message: string
): Promise<boolean> => {
    // Offline fallback: keyword matching
    if (!config.apiKey || config.apiKey.trim() === '') {
        return CONFESSION_KEYWORDS.some(keyword => message.includes(keyword));
    }

    try {
        const response = await withTimeout(
            callLLM(config, CONFESSION_DETECTION_PROMPT, `用户消息: "${message}"\n\n这是表白吗？只回复"是"或"否"。`),
            10000
        );
        const result = response.trim().toLowerCase();
        return result.includes('是') || result.includes('yes') || result.includes('true');
    } catch (error) {
        console.error('[Confession Detection] LLM failed, using keyword fallback:', error);
        return CONFESSION_KEYWORDS.some(keyword => message.includes(keyword));
    }
};

// ============ Sentiment Analysis System ============

const SENTIMENT_ANALYSIS_PROMPT = `你是一个对话情感分析助手。分析用户发给朋友的消息，判断这条消息对接收者的感受是：
- positive: 友善、关心、赞美、鼓励、有趣、温暖的消息
- negative: 冒犯、伤人、侮辱、冷漠、讽刺、让人难过的消息
- neutral: 普通问候、日常对话、信息询问

只回复一个词: positive / negative / neutral`;

// Offline fallback keywords
const POSITIVE_KEYWORDS = [
    '谢谢', '感谢', '开心', '高兴', '太棒了', '厉害', '加油', '支持你', '相信你',
    '好可爱', '真好', '不错', '优秀', '真厉害', '你最棒', '辛苦了', '很开心',
    '想你', '挂念', '担心你', '关心', '保重', '照顾好自己', '很高兴', '真开心'
];

const NEGATIVE_KEYWORDS = [
    '讨厌', '烦死', '滚', '白痴', '蠢', '傻逼', '去死', '恶心', '丑',
    '无聊', '烦人', '讨厌你', '别烦我', '不想理你', '不想说话', '闭嘴',
    '你真差', '没用', '废物', '垃圾', '不配', '活该', '可怜', '真惨'
];

export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface SentimentResult {
    sentiment: SentimentType;
    scoreChange: number; // Suggested relationship score change
}

/**
 * Analyzes the sentiment of a chat message.
 * Returns positive/negative/neutral and suggested score change.
 */
export const analyzeSentiment = async (
    config: LLMConfig,
    message: string
): Promise<SentimentResult> => {
    // Offline fallback: keyword matching
    if (!config.apiKey || config.apiKey.trim() === '') {
        if (POSITIVE_KEYWORDS.some(kw => message.includes(kw))) {
            return { sentiment: 'positive', scoreChange: 3 };
        }
        if (NEGATIVE_KEYWORDS.some(kw => message.includes(kw))) {
            return { sentiment: 'negative', scoreChange: -5 };
        }
        return { sentiment: 'neutral', scoreChange: 1 };
    }

    try {
        const response = await withTimeout(
            callLLM(config, SENTIMENT_ANALYSIS_PROMPT, `用户消息: "${message}"\n\n情感分类是？只回复 positive/negative/neutral 其中之一。`),
            8000
        );
        const result = response.trim().toLowerCase();

        if (result.includes('positive') || result.includes('正面') || result.includes('友善')) {
            return { sentiment: 'positive', scoreChange: 3 };
        }
        if (result.includes('negative') || result.includes('负面') || result.includes('伤人')) {
            return { sentiment: 'negative', scoreChange: -5 };
        }
        return { sentiment: 'neutral', scoreChange: 1 };
    } catch (error) {
        console.error('[Sentiment Analysis] LLM failed, using keyword fallback:', error);
        if (POSITIVE_KEYWORDS.some(kw => message.includes(kw))) {
            return { sentiment: 'positive', scoreChange: 3 };
        }
        if (NEGATIVE_KEYWORDS.some(kw => message.includes(kw))) {
            return { sentiment: 'negative', scoreChange: -5 };
        }
        return { sentiment: 'neutral', scoreChange: 1 };
    }
};

// ============ WeChat NPC Chat Integration ============

const NPC_CHAT_SYSTEM_PROMPT = `你正在扮演一个中国大学生活模拟游戏中的NPC角色。
你的任务是根据NPC的性格和背景，用自然、口语化的中文回复用户的消息。
回复应该简短（1-3句话），符合角色设定，可以带有表情符号。
直接返回回复内容，不要包含任何JSON或额外格式。`;

const GAME_ASSISTANT_PROMPT = `你是"大学生活模拟器"游戏中的AI助手。
你的任务是帮助玩家了解游戏机制、给出建议、解答问题。
你了解游戏的所有系统：行动力(每周7点)、属性(IQ/EQ/体力/压力/魅力/运气)、证书考试、兼职工作等。
用友好、简洁的中文回复，可以带表情符号。直接返回回复内容。`;

// ============ Phase 3: NPC Memory System ============

const MEMORY_CONSOLIDATION_PROMPT = `你是一个记忆分析助手。分析以下对话记录，提取1-2个关键事实供NPC长期记住。
关键事实应该是：
1. 玩家透露的个人信息（喜好、习惯、目标）
2. 重要的共同经历或承诺
3. 情感上有意义的互动

输出格式 (Strict JSON only, no markdown):
{ "memories": ["记忆1", "记忆2"] }

如果没有值得记住的内容，返回空数组：{ "memories": [] }`;

/**
 * Phase 3: Consolidates chat history into long-term memories.
 * Triggered when chatHistory.length > 10 (Lazy Consolidation).
 */
export const consolidateMemory = async (
    config: LLMConfig,
    chatHistory: { role: 'user' | 'npc'; content: string }[],
    npcName: string
): Promise<string[]> => {
    // Offline fallback
    if (!config.apiKey || config.apiKey.trim() === '') {
        return [];
    }

    const historyText = chatHistory
        .map(msg => `${msg.role === 'user' ? '玩家' : npcName}: ${msg.content}`)
        .join('\n');

    const userPrompt = `对话记录:\n${historyText}\n\n请提取关键记忆。`;

    try {
        const response = await withTimeout(callLLM(config, MEMORY_CONSOLIDATION_PROMPT, userPrompt), 15000);

        let jsonStr = response.trim();
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();

        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }

        const data = JSON.parse(jsonStr);
        return Array.isArray(data.memories) ? data.memories.slice(0, 3) : [];
    } catch (error) {
        console.error('[Memory Consolidation] Failed:', error);
        return [];
    }
};

/**
 * Generates NPC reply with optional long-term memory injection.
 */
export const generateNPCReply = async (
    config: LLMConfig,
    npc: { name: string; personality: string; role: string; longTermMemories?: string[] },
    userMessage: string,
    chatHistory: { role: 'user' | 'npc'; content: string }[],
    isGameAssistant: boolean = false
): Promise<string> => {
    // Build memory-aware system prompt
    let systemPrompt = isGameAssistant ? GAME_ASSISTANT_PROMPT : NPC_CHAT_SYSTEM_PROMPT;

    // Phase 3: Inject long-term memories into NPC's system prompt
    if (!isGameAssistant && npc.longTermMemories && npc.longTermMemories.length > 0) {
        const memoriesText = npc.longTermMemories.join('；');
        systemPrompt += `\n\n【你对玩家的印象】：${memoriesText}\n请在对话中自然地表现出这些记忆，但不要刻意提及。`;
    }

    // Build conversation context
    const historyContext = chatHistory.slice(-6).map(msg =>
        `${msg.role === 'user' ? '玩家' : npc.name}: ${msg.content}`
    ).join('\n');

    const userPrompt = isGameAssistant
        ? `${historyContext}\n玩家: ${userMessage}\n\n请回复玩家的问题。`
        : `NPC信息:\n- 名字: ${npc.name}\n- 角色: ${npc.role}\n- 性格: ${npc.personality}\n\n对话记录:\n${historyContext}\n玩家: ${userMessage}\n\n请以${npc.name}的身份回复。`;

    // Offline fallback
    if (!config.apiKey || config.apiKey.trim() === '') {
        const fallbacks = isGameAssistant
            ? ['这个问题我暂时回答不了，建议你探索一下游戏！🎮', '试试看不同的选择，可能会有惊喜哦！✨', '记得管理好你的行动力和体力！💪']
            : ['哈哈，你说得对！', '最近怎么样啊？', '有空一起去食堂吃饭吧！', '考试复习得怎么样了？'];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    try {
        const response = await withTimeout(callLLM(config, systemPrompt, userPrompt), 30000); // 30s timeout
        return response.trim() || '...(沉默)';
    } catch (error) {
        console.error('NPC Chat LLM failed:', error);
        return isGameAssistant ? '抱歉，我现在有点忙，稍后再聊！' : '...(对方似乎在忙)';
    }
};

/**
 * Generates a proactive message from an NPC to the player.
 * Used when an NPC "decides" to text the player first.
 */
export const generateProactiveMessage = async (
    config: LLMConfig,
    npc: { name: string; personality: string; role: string },
    student: StudentState
): Promise<string> => {
    const { year, semester, week } = student.currentDate;
    const timeInfo = `第${year}学年, ${semester === 1 ? '上学期' : '下学期'}, 第${week}周`;

    const systemPrompt = `你正在扮演一个中国大学生活模拟游戏中的NPC角色：${npc.name}。
你的角色是玩家的${npc.role}，性格是${npc.personality}。
你的任务是主动给玩家发一条微信消息。消息应该自然、口语化，反映当前的校园生活背景。
背景时间：${timeInfo}。
如果是学期初，可以问候开学；如果是学期末，可以提考试或放假；平时可以聊八卦、约饭或分享趣事。
回复应该简短（1-2句），直接返回消息内容。`;

    const userPrompt = `由于现在是${timeInfo}，请以${npc.name}的身份给玩家发一条开场白。`;

    if (!config.apiKey || config.apiKey.trim() === '') {
        const fallbacks = [
            '嘿，最近在忙什么呢？',
            '今天食堂的饭菜不错，要不要一起去？',
            '感觉这周的课好累啊，你呢？',
            '刚才在图书馆看到你了，感觉你学得好认真！',
            '周末有空吗？想约你出去玩。'
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    try {
        const response = await withTimeout(callLLM(config, systemPrompt, userPrompt), 15000);
        return response.trim() || '最近怎么样？';
    } catch (error) {
        console.error('Proactive message LLM failed:', error);
        return '最近怎么样？';
    }
};

/**
 * Generates a WeChat moment content for an NPC.
 */
export const generateMoment = async (
    config: LLMConfig,
    npc: { name: string; personality: string; role: string },
    gameDate: { year: number; semester: number; week: number }
): Promise<string> => {
    const timeInfo = `第${gameDate.year}学年, ${gameDate.semester === 1 ? '上学期' : '下学期'}, 第${gameDate.week}周`;

    const systemPrompt = `你正在扮演一个中国大学生NPC：${npc.name}。
角色：玩家的${npc.role}，性格：${npc.personality}。
任务：发一条微信朋友圈。
要求：
1. 内容简短（1-3句），口语化。
2. 结合当前时间（${timeInfo}）和校园生活。
3. 可以带点情绪或吐槽，或者分享日常生活。
4. 不需要带话题标签。
直接返回朋友圈正文内容。`;

    const userPrompt = `请生成一条朋友圈内容。`;

    if (!config.apiKey || config.apiKey.trim() === '') {
        const fallbacks = [
            '今天天气真不错，适合去图书馆刷题！',
            '食堂的麻辣香锅越来越好吃了，推荐！',
            '又要交作业了，赶死线中...',
            '周末有没有人一起去看电影？',
            '刚跑完步，感觉整个人都精神了。',
            '这周的课好多啊，求安慰。'
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    try {
        const response = await withTimeout(callLLM(config, systemPrompt, userPrompt), 15000);
        return response.trim() || '今天心情不错！';
    } catch (error) {
        console.error('Moment generation LLM failed:', error);
        return '今天心情不错！';
    }
};
/**
 * Generates a list of courses using LLM based on major and grade.
 */
export const generateLLMCourses = async (
    config: LLMConfig,
    major: { name: string; id: string },
    year: number,
    semester: number,
    count: number
): Promise<Partial<Course>[]> => {
    const semName = semester === 1 ? '上学期' : '下学期';
    const yearName = year === 1 ? '大一' : year === 2 ? '大二' : year === 3 ? '大三' : '大四';

    const systemPrompt = `你是一个大学教务系统模拟器。根据给定的专业和年级，生成一组符合逻辑的硬核课程。
返回JSON格式: { "courses": [ { "name": "...", "credits": 2-4, "type": "Required/Elective", "statBonus": { "iq": 1-3, ... } } ] }
生成的数量应为: ${count}。
专业: ${major.name}
年级: ${yearName}${semName}`;

    if (!config.apiKey || config.apiKey.trim() === '') {
        return []; // Caller handles fallback
    }

    try {
        const response = await withTimeout(callLLM(config, systemPrompt, `请生成 ${count} 门课程。`), 20000);
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
        const data = JSON.parse(jsonMatch[1]?.trim() || response.trim());
        return data.courses || [];
    } catch (error) {
        console.error('LLM Course generation failed:', error);
        return [];
    }
};

// ============ Game Tasks LLM Generation ============

export interface GameTask {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'story';
    priority: 'high' | 'medium' | 'low';
    reward?: string;
}

const MOCK_TASKS: GameTask[] = [
    { id: 'task_1', title: '完成本周课程', description: '参加至少3节专业课', type: 'weekly', priority: 'high', reward: '+知识点' },
    { id: 'task_2', title: '图书馆自习', description: '去一次图书馆复习功课', type: 'daily', priority: 'medium', reward: '+IQ' },
    { id: 'task_3', title: '社交活动', description: '与同学或室友互动一次', type: 'daily', priority: 'low', reward: '+EQ' },
];

export const generateGameTasks = async (
    config: LLMConfig,
    student: StudentState
): Promise<GameTask[]> => {
    if (!config.apiKey || config.apiKey.trim() === '') {
        return MOCK_TASKS;
    }

    const systemPrompt = `你是一个大学生活模拟游戏的任务系统。根据学生当前状态生成3-5个游戏任务。
返回JSON格式: { "tasks": [ { "title": "...", "description": "...", "type": "daily/weekly/story", "priority": "high/medium/low", "reward": "+属性或奖励描述" } ] }
任务类型: daily(日常), weekly(本周), story(剧情)
任务应结合学生当前状态、学年、专业来生成。`;

    const userPrompt = `学生: ${student.name}, 第${student.currentDate.year}年第${student.currentDate.week}周
专业: ${student.academic.major.name}
GPA: ${student.academic.gpa.toFixed(2)}
属性: IQ ${student.attributes.iq}, EQ ${student.attributes.eq}, 体力 ${student.attributes.stamina}
请生成任务。`;

    try {
        const response = await withTimeout(callLLM(config, systemPrompt, userPrompt), 15000);
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
        const data = JSON.parse(jsonMatch[1]?.trim() || response.trim());
        return (data.tasks || []).map((t: any) => ({
            id: `task_${generateId()}`,
            title: t.title,
            description: t.description,
            type: t.type || 'daily',
            priority: t.priority || 'medium',
            reward: t.reward
        }));
    } catch (error) {
        console.error('LLM Task generation failed:', error);
        return MOCK_TASKS;
    }
};

// ============ NPC Profile LLM Generation ============

export interface NPCProfile {
    backstory: string;
    hobby: string;
    dream: string;
    secretTrait: string;
    relationshipAdvice: string;
}

const MOCK_PROFILE: NPCProfile = {
    backstory: '来自一个普通家庭，高考后来到这所大学，梦想着能够改变自己的命运。',
    hobby: '喜欢在闲暇时间看动漫、打游戏，偶尔也会去操场跑步。',
    dream: '希望毕业后能找到一份稳定的工作，买房买车，让父母过上好日子。',
    secretTrait: '表面上看起来很开朗，但其实内心有些自卑，害怕被别人看不起。',
    relationshipAdvice: '多关心ta的情绪变化，适当送些小礼物可以快速提升好感度。'
};

export const generateNPCProfile = async (
    config: LLMConfig,
    npc: { name: string; personality: string; role: string; gender: string },
    student: StudentState
): Promise<NPCProfile> => {
    if (!config.apiKey || config.apiKey.trim() === '') {
        return MOCK_PROFILE;
    }

    const systemPrompt = `你是一个大学生活模拟游戏的角色描述生成器。为给定的NPC生成详细的个人资料。
返回JSON格式: { 
    "backstory": "角色背景故事(50-100字)", 
    "hobby": "兴趣爱好", 
    "dream": "人生梦想", 
    "secretTrait": "隐藏特质或秘密",
    "relationshipAdvice": "攻略该角色的建议"
}
生成的内容应符合中国大学生活场景，语言生动有趣。`;

    const userPrompt = `角色: ${npc.name}
性别: ${npc.gender === 'male' ? '男' : '女'}
身份: ${npc.role === 'roommate' ? '室友' : npc.role === 'classmate' ? '同学' : npc.role === 'professor' ? '教授' : npc.role === 'friend' ? '朋友' : '其他'}
性格: ${npc.personality}
玩家: ${student.name} (${student.academic.major.name}专业)
请生成该角色的详细资料。`;

    try {
        const response = await withTimeout(callLLM(config, systemPrompt, userPrompt), 15000);
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
        const data = JSON.parse(jsonMatch[1]?.trim() || response.trim());
        return {
            backstory: data.backstory || MOCK_PROFILE.backstory,
            hobby: data.hobby || MOCK_PROFILE.hobby,
            dream: data.dream || MOCK_PROFILE.dream,
            secretTrait: data.secretTrait || MOCK_PROFILE.secretTrait,
            relationshipAdvice: data.relationshipAdvice || MOCK_PROFILE.relationshipAdvice
        };
    } catch (error) {
        console.error('LLM NPC Profile generation failed:', error);
        return MOCK_PROFILE;
    }
};

// ============ Phase 2: Exam System ============

import type { ExamQuestion, ExamResult } from '../types';

const EXAM_SYSTEM_PROMPT = `你是一位中国大学的教授，需要为学生出一套考试题。
根据课程名称和难度，生成3道单选题。
难度1-5：1=入门，3=中等，5=挑战性高

输出格式 (Strict JSON only, no markdown):
{
  "questions": [
    { "text": "题目", "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"], "correctIndex": 0 }
  ]
}`;

const MOCK_EXAM_QUESTIONS: ExamQuestion[] = [
    { text: "下列哪个不是面向对象编程的特征？", options: ["A. 封装", "B. 继承", "C. 多态", "D. 递归"], correctIndex: 3 },
    { text: "HTTP协议默认使用的端口号是？", options: ["A. 21", "B. 22", "C. 80", "D. 443"], correctIndex: 2 },
    { text: "在数据库中，ACID原则不包括？", options: ["A. 原子性", "B. 一致性", "C. 隔离性", "D. 可扩展性"], correctIndex: 3 },
];

/**
 * Phase 2: Generates exam paper with 3 questions based on course and difficulty.
 */
export const generateExamPaper = async (
    config: LLMConfig,
    courseName: string,
    difficulty: number
): Promise<ExamQuestion[]> => {
    // Offline fallback
    if (!config.apiKey || config.apiKey.trim() === '') {
        console.log('[Exam] No API key, using mock questions');
        return MOCK_EXAM_QUESTIONS;
    }

    const userPrompt = `课程: ${courseName}\n难度: ${difficulty}/5\n\n请生成3道单选题。`;

    try {
        const response = await withTimeout(callLLM(config, EXAM_SYSTEM_PROMPT, userPrompt), 20000);

        let jsonStr = response.trim();
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();

        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }

        const data = JSON.parse(jsonStr);
        if (!Array.isArray(data.questions) || data.questions.length === 0) {
            return MOCK_EXAM_QUESTIONS;
        }

        return data.questions.map((q: any) => ({
            text: q.text || '未知题目',
            options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0
        }));
    } catch (error) {
        console.error('[Exam] Question generation failed:', error);
        return MOCK_EXAM_QUESTIONS;
    }
};

const GRADING_SYSTEM_PROMPT = `你是一位批卷的教授。根据学生的答题情况给出评价。

输入: 课程名，学生答案，正确答案
输出格式 (Strict JSON only, no markdown):
{
  "score": 0-100,
  "gpaModifier": 0.0-4.0,
  "comment": "教授的一句话评语，带点个性"
}`;

/**
 * Phase 2: Grades exam with AI-generated comment.
 */
export const gradeExamPaper = async (
    config: LLMConfig,
    playerAnswers: number[],
    correctAnswers: number[],
    courseName: string
): Promise<ExamResult> => {
    // Calculate base score
    let correct = 0;
    for (let i = 0; i < playerAnswers.length; i++) {
        if (playerAnswers[i] === correctAnswers[i]) correct++;
    }
    const baseScore = Math.round((correct / correctAnswers.length) * 100);
    const baseGPA = (correct / correctAnswers.length) * 4.0;

    // Offline fallback
    if (!config.apiKey || config.apiKey.trim() === '') {
        const comments = [
            baseScore >= 80 ? '不错，继续保持！' : baseScore >= 60 ? '及格了，但还需努力。' : '这成绩...下次加油吧。',
        ];
        return {
            score: baseScore,
            gpaModifier: Number(baseGPA.toFixed(2)),
            comment: comments[0]
        };
    }

    const userPrompt = `课程: ${courseName}
学生答案: ${JSON.stringify(playerAnswers)}
正确答案: ${JSON.stringify(correctAnswers)}
正确题数: ${correct}/${correctAnswers.length}

请给出评分。`;

    try {
        const response = await withTimeout(callLLM(config, GRADING_SYSTEM_PROMPT, userPrompt), 15000);

        let jsonStr = response.trim();
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();

        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }

        const data = JSON.parse(jsonStr);
        return {
            score: typeof data.score === 'number' ? data.score : baseScore,
            gpaModifier: typeof data.gpaModifier === 'number' ? Math.min(4.0, Math.max(0, data.gpaModifier)) : baseGPA,
            comment: data.comment || '考试结束。'
        };
    } catch (error) {
        console.error('[Exam] Grading failed:', error);
        return {
            score: baseScore,
            gpaModifier: Number(baseGPA.toFixed(2)),
            comment: baseScore >= 60 ? '考试通过了。' : '挂科了，需要补考。'
        };
    }
};

// ============ Phase 4: Autobiography Generation ============

/**
 * Phase 4: Generates personalized autobiography based on 4 years of university life.
 * Style adjusts based on IQ (rational) and EQ (emotional).
 */
export const generateAutobiography = async (
    config: LLMConfig,
    student: StudentState
): Promise<string> => {
    const { attributes, academic, npcs, certificates, achievements, eventHistory, flags, money } = student;

    // Determine writing style based on attributes
    let styleInstruction = '';
    if (attributes.iq >= 80 && attributes.eq < 60) {
        styleInstruction = '文风理性、逻辑清晰，像一篇学术论文摘要。';
    } else if (attributes.eq >= 80 && attributes.iq < 60) {
        styleInstruction = '文风感性、情感丰富，充满细腻的情感描写。';
    } else if (attributes.iq >= 70 && attributes.eq >= 70) {
        styleInstruction = '文风平衡，既有理性思考也有情感表达，娓娓道来。';
    } else {
        styleInstruction = '文风朴实、真诚，像和朋友聊天一样自然。';
    }

    // Gather important NPCs
    const topFriends = npcs
        .filter(n => n.relationshipScore > 50)
        .slice(0, 3)
        .map(n => `${n.name}(${n.role})`);

    // Gather long-term memories
    const allMemories = npcs
        .flatMap(n => n.longTermMemories || [])
        .slice(0, 5);

    // Recent significant events
    const significantEvents = eventHistory
        .slice(-10)
        .map(e => e.title)
        .filter(Boolean)
        .join('、');

    const systemPrompt = `你是一位传记作家，需要为一位刚毕业的大学生撰写一篇回忆录。
要求：
1. 第一人称视角
2. 800字左右
3. ${styleInstruction}
4. 融入提供的记忆片段和好友信息
5. 结尾寄语未来

输出纯文本，不要包含任何格式标记。`;

    const userPrompt = `我的大学档案：
- 姓名：${student.name}
- 学校：${academic.universityName}
- 专业：${academic.major.name}
- 最终GPA：${academic.gpa.toFixed(2)}
- 属性：智力${attributes.iq}、情商${attributes.eq}、魅力${attributes.charm}
- 毕业时存款：¥${money}
- 证书：${certificates.length > 0 ? certificates.join('、') : '无'}
- 成就：${achievements.length > 0 ? achievements.join('、') : '无'}
- 重要好友：${topFriends.length > 0 ? topFriends.join('、') : '独来独往'}
- 恋爱状态：${flags.isDating ? '有对象' : '单身'}
- 印象深刻的事：${significantEvents || '平淡的日子'}
- 关于我的记忆碎片：${allMemories.length > 0 ? allMemories.join('；') : '普通的大学生活'}

请撰写我的大学回忆录。`;

    const mockBio = `四年前，我怀着忐忑的心情踏入${academic.universityName}的校门。那时的我，对未来充满憧憬，却也不知道前方的道路会如何展开。

${academic.major.name}专业的学习，让我体会到了知识的力量。每一次考试前的焦虑，每一次论文截止日期的通宵，都成了现在看来珍贵的记忆。最终，${academic.gpa.toFixed(2)}的GPA虽然${academic.gpa >= 3.0 ? '算不上惊艳，但也让我问心无愧' : '有些遗憾，但我知道我已经尽力了'}。

${topFriends.length > 0 ? `在这里，我遇到了${topFriends.join('、')}。他们是我大学生活中最重要的人，陪我走过了无数个日日夜夜。` : '虽然朋友不算多，但独处的时光让我学会了与自己对话。'}

${flags.isDating ? '更重要的是，我在这里遇到了生命中重要的人，ta让我的大学生活变得完整。' : ''}

站在毕业典礼的舞台上，我知道，这不是结束，而是新的开始。无论未来如何，这四年都将是我人生中最美好的时光之一。

再见了，我的大学。你好，新的人生。`;

    // Offline fallback
    if (!config.apiKey || config.apiKey.trim() === '') {
        return mockBio;
    }

    try {
        const response = await withTimeout(callLLM(config, systemPrompt, userPrompt), 45000);
        return response.trim() || mockBio;
    } catch (error) {
        console.error('[Autobiography] Generation failed:', error);
        return mockBio;
    }
};
