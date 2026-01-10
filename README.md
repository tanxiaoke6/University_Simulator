# 🎓 University Life Simulator (大学生活模拟器)

An LLM-powered text-based simulation game where you experience 4 years of Chinese university life. From the Gaokao to graduation, every playthrough is unique!

![University Life Simulator](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal) ![LLM](https://img.shields.io/badge/LLM-Powered-purple)

## ✨ Features

### 🎮 Core Gameplay
- **48-Turn System**: Experience 4 years of university life (September Year 1 → June Year 4)
- **Character Creation**: Detailed wizard with Gaokao simulation, family background roll, and university/major selection
- **Resource Management**: Balance Money, Energy, Stress, and GPA
- **Multiple Actions**: Study, Socialize, Work Part-time, Relax, Exercise, Join Clubs

### 🤖 AI Integration
- **Dynamic Events**: LLM-generated campus events based on your current status
- **Multiple Providers**: Support for OpenAI, Google Gemini, Anthropic Claude, and custom endpoints
- **NPC Conversations**: Chat with classmates, roommates, and professors
- **Graduation Ending**: AI-written biography of your future career

### 📊 Rich Data
- **40+ Universities**: From Tsinghua/PKU to vocational schools
- **27 Majors**: Across 7 categories with unique stat bonuses
- **10+ Static Events**: Handcrafted campus scenarios
- **Dynamic NPCs**: Roommates with personalities and relationship tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/university-simulator.git
cd university-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Open in Browser
Navigate to `http://localhost:5173`

## 🔧 Configuration

### LLM API Setup
1. Click **设置** (Settings) from the main menu
2. Select your AI provider:
   - **OpenAI**: Use `gpt-3.5-turbo` or `gpt-4`
   - **Gemini**: Use `gemini-1.5-flash` or `gemini-pro`
   - **Claude**: Use `claude-3-haiku` or `claude-3-sonnet`
   - **Custom**: Any OpenAI-compatible endpoint
3. Enter your API key
4. Click **测试连接** to verify
5. Save settings

> ⚠️ Your API key is stored locally in browser storage and never sent anywhere except to your chosen LLM provider.

## 📁 Project Structure

```
src/
├── components/          # React UI components
│   ├── MainMenu.tsx         # Title screen
│   ├── CharacterCreation.tsx # 5-step creation wizard
│   ├── GameScreen.tsx       # Main game layout
│   ├── LeftSidebar.tsx      # Character stats
│   ├── RightSidebar.tsx     # NPCs & inventory
│   ├── StoryFeed.tsx        # Event history
│   ├── ActionPanel.tsx      # Player actions
│   ├── EventModal.tsx       # Interactive events
│   ├── SettingsModal.tsx    # API configuration
│   └── EndingScreen.tsx     # Graduation summary
├── data/               # Static game data
│   ├── universities.ts      # 40+ Chinese universities
│   ├── majors.ts            # 27 majors with stats
│   └── backgrounds.ts       # Family wealth & occupations
├── services/           # External integrations
│   └── aiService.ts         # Multi-provider LLM client
├── stores/             # State management
│   ├── gameStore.ts         # Zustand store with persistence
│   └── gameData.ts          # Game constants & helpers
├── types/              # TypeScript definitions
│   └── index.ts             # All game types
├── utils/              # Utilities
│   └── promptTemplates.ts   # LLM prompt engineering
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Tailwind styles
```

## 🎯 Game Mechanics

### Attributes
| Stat | Effect |
|------|--------|
| IQ (智力) | Study efficiency, exam performance |
| EQ (情商) | Social interactions, relationship building |
| Stamina (体力) | Available energy for actions |
| Stress (压力) | High stress triggers negative events |
| Charm (魅力) | Romance success, job interviews |
| Luck (运气) | Random event outcomes |

### Actions
| Action | Energy Cost | Effects |
|--------|-------------|---------|
| Study | -15 | GPA+, Stress+ |
| Socialize | -10 | EQ+, Stress- |
| Work | -20 | Money+, Stress+ |
| Relax | +25 | Stress- |
| Exercise | -10 | Charm+, Stress- |
| Club | -10 | EQ+, Stress- |

### University Tiers
| Tier | Examples | Min Score |
|------|----------|-----------|
| 985/C9 | 清华, 北大, 复旦 | 640-690 |
| 211 | 厦门大学, 同济大学 | 570-640 |
| 普通本科 | 杭州电子科技大学 | 490-570 |
| 高职专科 | 深圳职业技术学院 | 380-490 |

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **State**: Zustand with persist middleware
- **Icons**: Lucide React
- **AI**: Fetch-based LLM API client

## 📝 Development

### Available Scripts
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Events
Edit `src/stores/gameData.ts` to add static events:
```typescript
{
  id: 'your_event_id',
  type: 'static',
  isLLMGenerated: false,
  title: '事件标题',
  description: '事件描述...',
  choices: [
    { 
      id: 'choice_1', 
      text: '选择文本', 
      effects: [{ type: 'money', target: 'money', value: 100 }] 
    }
  ],
  timestamp: { year: 1, month: 9 },
}
```

### Adding Universities/Majors
Edit files in `src/data/`:
- `universities.ts`: Add university objects
- `majors.ts`: Add major objects with stat bonuses

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning or building your own games!

## 🙏 Acknowledgments

- Inspired by BitLife and Chinese life simulation games
- UI design inspired by modern dark-mode game interfaces
- Built with ❤️ for Chinese university students

---

**Happy Simulating! 祝你大学生活愉快！** 🎓
