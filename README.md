# 🎓 University Life Simulator

An LLM-powered, deeply immersive text-based simulation game where you experience 4 years of Chinese university life. From your first day on campus to the graduation ceremony in a cap and gown, write your own youth story through hundreds of meaningful decisions.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal) ![Zustand](https://img.shields.io/badge/Zustand-State-orange) ![LLM](https://img.shields.io/badge/LLM-Powered-purple)

---

## ✨ Core Features

### 🤖 Full AI Integration
- **Dynamic Event Generation**: Utilizing LLMs to generate real-time campus events based on your current attributes, location, and choices. (e.g., unexpected confessions, lab accidents, or part-time job scams).
- **Intelligent NPC Interaction**:
    - **Free Conversation**: Chat freely with NPCs via the built-in messenger. AI provides unique personalities, memories, and instant feedback.
    - **Proactive Messaging**: NPCs will text you first based on game context (e.g., start of term, before exams, or festivals).
    - **Social Media Ecosystem**: NPCs post on their "Moments" feed; you can interact by liking and commenting.
    - **Profile Generation**: Instantly generate detailed NPC backstories, hidden traits, and relationship advice.
- **Campus Forum**: A simulated university bulletin board where AI generates trending posts about cafeteria prices, professor gossip, and anonymous confessions.
- **Dynamic Curriculum**: AI generates logically structured course lists and credit values tailored to your major and year.
- **Smart Task Generation**: Weekly tasks are dynamically assigned based on your current progress (e.g., focus on GPA if it's lagging).
- **Personalized Epilogue**: An AI-written biography at graduation summarizes your four-year journey and future career.

### 📊 Deep Growth System
- **48-Turn Gameplay**: Experience 4 years (8 semesters) with 6 dynamic turns per semester.
- **Multi-Dimensional Attributes**:
    - **Core Stats**: IQ, EQ, Charm, Stamina, Stress, and Luck.
    - **Academic System**: GPA tracking, failure warnings, certificates (CET-4/6, etc.), and scholarships.
- **Universities & Majors**: Supports 40+ Chinese universities (from top-tier 985/211 to vocational colleges) and 27+ majors, each with unique buffs.

### 🏛️ Dual-Track Club & Student Council
- **Interest Clubs**: Join the Debate Team, ACM Club, or Street Dance Club. Rise through the ranks (Member -> Vice President -> President) and interact with core NPCs.
- **Student Council**: Work in the Secretariat, Discipline, or Publicity departments. Manage KPIs, Authority Levels, and campus-wide governance.

### 📜 Quest & Achievement System
- **Main Quests**: Long-term goals like winning a National Scholarship, finding campus romance, or publishing a research paper.
- **Achievements**: Unlock milestones that document your legendary university career.

### 💰 Economy & Finance
- **Financial Management**: Track monthly allowances and part-time income.
- **Banking System**: Detailed transaction logs ensure every coin's movement is recorded.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/wsbz/University_Simulator.git
cd University_Simulator

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔧 AI Configuration
The game supports various LLM protocols with a simple setup:
1. Click **"Settings"** in the main menu or sidebar.
2. Enable **"Developer Mode"** or navigate to AI settings.
3. Select your provider:
    - **OpenAI/Custom**: Compatible with any OpenAI-style API (e.g., DeepSeek, GPT-4).
    - **Google Gemini**: High-speed, state-of-the-art responses.
    - **Anthropic Claude**: Excellent for narrative and storytelling.
4. Enter your API Key and click **"Test Connection"**.

> [!IMPORTANT]
> Your API Key is stored locally in your browser and is never shared with third parties (except your chosen AI provider).

---

## 📁 Project Structure

```text
src/
├── components/          # React UI components (Settings, Club, ActionPanel, etc.)
├── data/               # Static config (Universities, Majors, Events, Certificates)
├── services/           # External service integration (AI API client)
├── stores/             # State Management (Zustand)
│   ├── gameStore.ts    # Core game logic and state transitions
│   ├── gameData.ts     # Initial states and static factories
│   └── questStore.ts   # Independent logic for the quest system
├── types/              # TypeScript global definitions
└── utils/              # Helper functions (Prompt templates, formatters)
```

---

## 🛠️ Tech Stack
- **Frontend**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript 5
- **State**: Zustand (with Persist middleware)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

---

## 🤝 Contributing
Contributions are welcome! Whether it's a new event idea, a bug fix, or a UI suggestion:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License
This project is licensed under the **MIT License**. Feel free to use it for learning or building your own games.

---
**Enjoy your virtual university life!** 🎓🌟
