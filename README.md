# 🎓 大学生活模拟器 (University Life Simulator)

这是一款由大语言模型 (LLM) 驱动的、深度沉浸式的文字模拟游戏。在这里，你将体验长达四年的中国大学生活——从踏入校门的第一天到穿上学位服的毕业典礼，通过成百上千个决策谱写属于你自己的青春篇章。

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal) ![Zustand](https://img.shields.io/badge/Zustand-State-orange) ![LLM](https://img.shields.io/badge/LLM-Powered-purple)

---

## ✨ 核心特色

### 🤖 AI 全面驱动
- **动态事件生成**：基于玩家当前的属性、位置、学业进度以及近期决策，AI 会实时生成贴合语境的随机校园事件（如实验室爆炸、突如其来的表白、或是校门口的兼职陷阱）。
- **智能 NPC 交互**：
    - **自由对话**：通过内置微信功能与 NPC 自由聊天，AI 赋予他们独特的性格、记忆和即时反馈。
    - **主动私信**：NPC 会根据时间节点（如开学、考前、节日）主动给你发消息。
    - **朋友圈生态**：NPC 会发布动态，你可以点赞和评论，体验真实社交。
    - **背景生成**：一键生成 NPC 的生平故事、隐藏特质和攻略建议。
- **校园论坛 (Forum)**：模拟真实的校园贴吧，AI 实时生成关于食堂涨价、教授吐槽、表白墙等热门贴子。
- **动态课程表**：AI 根据你的专业和学年，自动生成逻辑严密的课程列表及学分属性。
- **智能任务生成**：每周根据你的短板（如 GPA 过低、压力过大）动态派发日常和周常任务。
- **个性化结语**：毕业时，AI 将根据你四年的综合表现撰写一份详尽的长篇自传。

### 📊 深度养成体系
- **48 回合制**：每个学期包含 6 个动态回合，完整经历四年八学期。
- **多维度属性**：
    - **基础属性**：智力 (IQ)、情商 (EQ)、魅力 (Charm)、体力 (Stamina)、压力 (Stress)、运气 (Luck)。
    - **学业体系**：GPA、挂科预警、考证记录 (CET-4/6, 计算机二级等)、奖学金。
- **专业与学校**：支持 40+ 所不同档次的中国高校（985/211/普通本科/高职）及 27+ 种特色专业，每种选择都有独特的加成和职业发展。

### 🏛️ 双轨制社团与学生会
- **兴趣社团**：加入辩论队、算法协会或街舞社，通过贡献值晋升副主席、主席。与社团核心成员互动提升亲密度。
- **学生会**：涵盖秘书处、纪律部、宣传部。体验 KPI 考核、权力等级 (Authority Level) 提升，管理校园日常校务。

### 📜 任务与成就系统
- **主线任务**：国家奖学金挑战、校园恋爱长跑、科研论文发表。
- **成就勋章**：记录你在大学期间达成的每一个里程碑。

### 💰 经济与消费
- **财务管理**：管理月度生活费、兼职收入。
- **银行系统**：完整的流水账单记录，每一分钱的去向都有迹可循。

---

## 🚀 快速开始

### 环境依赖
- **Node.js**: 18.0 或更高版本
- **npm**: 9.0 或更高版本

### 安装与运行
```bash
# 1. 克隆仓库
git clone https://github.com/wsbz/University_Simulator.git
cd University_Simulator

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```
之后在浏览器中访问 `http://localhost:5173` 即可。

---

## 🔧 AI 配置指南
本游戏支持接入多种 LLM 协议，配置非常简单：
1. 在游戏主菜单或侧边栏点击 **“设置”**。
2. 开启 **“开发者模式”** 或直接进入 AI 配置项。
3. 选择你的 AI 供应商：
    - **OpenAI/自定义**: 支持所有兼容 OpenAI 格式的接口（如 DeepSeek, GPT-4）。
    - **Google Gemini**: 全球领先的模型，响应迅速。
    - **Anthropic Claude**: 文笔细腻，适合剧情生成。
4. 输入 API 密钥并点击 **“测试连接”**。

> [!IMPORTANT]
> 您的 API Key 仅保存在浏览器本地，不会传递给任何第三方（除您选择的 AI 服务商外）。

---

## 📁 项目结构 (精简版)

```text
src/
├── components/          # React UI 组件库（Settings, Club, ActionPanel 等）
├── data/               # 静态配置文件（学校、专业、静态事件、证书等）
├── services/           # 外部服务集成（AI 接口对接）
├── stores/             # 状态管理 (Zustand)
│   ├── gameStore.ts    # 核心游戏逻辑与状态切换
│   ├── gameData.ts     # 初始数据与静态工厂
│   └── questStore.ts   # 任务系统独立逻辑
├── types/              # TypeScript 全局接口定义
└── utils/              # 辅助函数（Prompt 选板、格式化工具）
```

---

## 🛠️ 技术选型
- **前端框架**: React 19 (最新特性)
- **工程化工具**: Vite (极速构建)
- **类型安全**: TypeScript 5
- **状态管理**: Zustand (轻量级且自带持久化中间件)
- **样式方案**: Tailwind CSS (高度自由的原子化 CSS)
- **图标库**: Lucide React

---

## 🤝 贡献指南
我们欢迎任何形式的贡献！无论是新事件的构思、Bug 修复还是 UI 建议：
1. Fork 本项目。
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)。
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)。
4. 推送到分支 (`git push origin feature/AmazingFeature`)。
5. 发起 Pull Request。

---

## 📄 许可协议
本项目基于 **MIT 协议** 授权。你可以自由地学习、修改和分发。

---
**祝你在虚拟世界的大学生活中一帆风顺，活出精彩！** 🎓🌟
