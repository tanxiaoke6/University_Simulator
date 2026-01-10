// AI Service Layer - Handles LLM API calls with Robust Mock/Offline Fallbacks
import type { LLMConfig, StudentState, GameEvent, EventChoice, GameDate } from '../types';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Timeout helper
const withTimeout = (promise: Promise<any>, ms: number) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('LLM API Timeout (5s)')), ms))
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

        const data = JSON.parse(jsonStr.trim());
        const choices: EventChoice[] = data.choices.map((c: any, idx: number) => ({
            id: `choice_${idx}`,
            text: c.text,
            effects: Object.entries(c.effects || {}).map(([key, val]) => {
                if (key === 'gpa') return { type: 'gpa' as const, target: 'gpa', value: val as number };
                if (key === 'money') return { type: 'money' as const, target: 'money', value: val as number };
                return { type: 'attribute' as const, target: key, value: val as number };
            }),
        }));

        return {
            id: generateId(),
            type: 'dynamic',
            title: data.title || '校园事件',
            description: data.description || '发生了一些事情...',
            choices,
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
            // Robust base URL handling: trim trailing slashes and ensure /chat/completions is present
            const base = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
            endpoint = `${base}/chat/completions`;
            headers['Authorization'] = `Bearer ${apiKey}`;
            body = { model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: maxTokens, temperature };
            break;
        case 'gemini':
            endpoint = baseUrl || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            body = { contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }], generationConfig: { maxOutputTokens: maxTokens, temperature } };
            break;
        default:
            throw new Error(`Support for ${provider} in robust mode pending.`);
    }

    const response = await withTimeout(fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    }), 5000) as Response;

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    if (provider === 'openai') return data.choices?.[0]?.message?.content || '';
    if (provider === 'gemini') return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return '';
};

// Generate dynamic event with fallback
export const generateDynamicEvent = async (
    config: LLMConfig,
    student: StudentState,
    trigger?: string
): Promise<GameEvent | null> => {
    // 1. HARD SYNC CHECK: If no key, return IMMEDIATELY using Promise.resolve()
    if (!config.apiKey || config.apiKey.trim() === '') {
        console.log("Creating Mock Event (Synchronous Path)");
        return Promise.resolve(generateMockEventSync(student.currentDate));
    }

    const context = formatGameContext(student);
    const userPrompt = trigger
        ? `${context}\n\nTrigger: ${trigger}\nGenerate an event related to this trigger.`
        : `${context}\n\nGenerate a random campus event appropriate for this student's situation.`;

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
        ), 5000);
        const success = response.toLowerCase().includes('connected');
        return { success, error: success ? undefined : 'API 响应不匹配' };
    } catch (error: any) {
        return { success: false, error: error.message || '连接失败' };
    }
};
