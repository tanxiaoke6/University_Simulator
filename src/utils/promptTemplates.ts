// Prompt Templates for LLM Event/Chat Generation
import type { StudentState } from '../types';

// Format student state into context for LLM
export const formatStudentContext = (student: StudentState): string => {
  const { attributes, academic, money, npcs, flags, currentDate, family } = student;
  const semesterStr = currentDate.semester === 1 ? '秋季' : '春季';

  return `
【学生档案】
姓名: ${student.name}, ${student.gender === 'male' ? '男' : '女'}
年级: 大${currentDate.year}, ${semesterStr}学期第${currentDate.week}周
学校: ${academic.universityName} (${academic.universityTier === 'top' ? '顶尖985' : academic.universityTier === 'tier2' ? '211' : '普通本科'})
专业: ${academic.major.name}

【属性状态】
- 智力(IQ): ${attributes.iq}/100
- 情商(EQ): ${attributes.eq}/100
- 体力: ${attributes.stamina}/100
- 压力: ${attributes.stress}/100
- 魅力: ${attributes.charm}/100
- 运气: ${attributes.luck}/100

【学业经济】
- GPA: ${academic.gpa.toFixed(2)}/4.0
- 余额: ¥${money}
- 家庭: ${family.wealth === 'wealthy' ? '富裕' : family.wealth === 'middle' ? '中产' : '贫困'}
- 月生活费: ¥${family.monthlyAllowance}

【社交关系】
${npcs.slice(0, 5).map(n => `- ${n.name}(${n.role}): 好感度${n.relationshipScore}, ${n.personality || '普通'}`).join('\n')}

【当前状态】
- 恋爱: ${flags.isDating ? '是' : '否'}
- 兼职: ${flags.hasJob ? '是' : '否'}
- 社团: ${flags.joinedClub ? '已加入' : '未加入'}
- 学业预警: ${flags.isOnProbation ? '是' : '否'}
`.trim();
};

// System prompt for random event generation
export const EVENT_GENERATION_PROMPT = `你是一款中国大学生活模拟游戏的AI叙述者。你的任务是根据学生当前状态生成有趣、真实、偶尔幽默的校园事件。

【规则】
1. 事件应反映真实的中国大学生活文化
2. 生成2-4个有明确利弊权衡的选择
3. 效果数值要合理：金钱±50-500，属性±5-15，GPA±0.05-0.2
4. 保持创意但现实——这是大学生活，不是奇幻小说
5. 可以包含幽默和戏剧性元素
6. 只返回JSON格式，不要任何其他文字

【返回格式】
{
  "title": "事件标题(中文，最多15字)",
  "description": "生动的叙述描述(中文，80-200字，使用第二人称'你')",
  "choices": [
    {
      "text": "选择描述(中文，简洁)",
      "effects": {
        "money": 数字(可正可负),
        "stress": 数字,
        "stamina": 数字,
        "gpa": 数字(小数如0.1),
        "eq": 数字,
        "charm": 数字
      }
    }
  ]
}`;

// Prompt for generating events based on trigger
export const getEventPrompt = (student: StudentState, trigger?: string): string => {
  const context = formatStudentContext(student);

  if (trigger) {
    return `${context}\n\n【触发事件】${trigger}\n\n请根据上述学生状态和触发条件，生成一个相关的校园事件。`;
  }

  return `${context}\n\n请根据上述学生状态，生成一个适合当前情境的随机校园事件。`;
};

// System prompt for NPC chat
export const getNPCChatPrompt = (student: StudentState, npcId: string): string => {
  const npc = student.npcs.find(n => n.id === npcId);
  if (!npc) return '';

  const context = formatStudentContext(student);

  return `你现在扮演一个名叫"${npc.name}"的角色，是玩家(${student.name})的${npc.role === 'roommate' ? '室友' : npc.role === 'classmate' ? '同学' : npc.role === 'professor' ? '教授' : npc.role === 'crush' ? '暗恋对象' : npc.role === 'partner' ? '恋人' : '朋友'}。

【NPC性格】${npc.personality || '普通大学生'}
【与玩家关系】好感度 ${npc.relationshipScore}/100 (${npc.relationshipScore > 50 ? '友好' : npc.relationshipScore > 0 ? '一般' : '冷淡'})

【玩家背景】
${context}

【对话规则】
1. 保持角色一致性，用符合大学生的语气说话
2. 回复简短自然，像真实的聊天
3. 根据好感度调整态度
4. 可以表达情绪、使用表情符号
5. 不要跳出角色`;
};

// System prompt for graduation ending
export const GRADUATION_PROMPT = `你是一位经验丰富的叙述者，负责为大学生活模拟游戏撰写毕业结局。

【任务】
根据学生四年的表现和最终数据，撰写一段精彩的"未来人生"传记。

【风格要求】
1. 用第三人称叙述
2. 根据成绩、社交、经济状况推测未来发展
3. 可以幽默，也可以感人
4. 300-500字
5. 包含职业发展和人生感悟

【返回格式】
{
  "endingType": "perfect|scholar|wealthy|social|average|struggle",
  "title": "结局标题",
  "biography": "传记正文",
  "careerPath": "职业发展路径",
  "lifeMotto": "人生格言"
}`;

// Get graduation prompt with student data
export const getGraduationPrompt = (student: StudentState, historySummary: string): string => {
  const context = formatStudentContext(student);

  return `${context}

【四年历程摘要】
${historySummary || '度过了平凡的四年大学时光。'}

【重要成就】
${student.flags.achievements.join('、') || '无特殊成就'}

请根据以上信息，撰写这位学生的毕业结局和未来人生传记。`;
};

// History summary update prompt
export const getHistorySummaryPrompt = (
  currentSummary: string,
  newEvent: string
): string => {
  return `当前历史摘要：
${currentSummary || '刚刚开始大学生活。'}

新发生的事件：
${newEvent}

请更新历史摘要，保留重要事件，去除琐碎细节,限制在200字以内。直接返回更新后的摘要文本。`;
};
