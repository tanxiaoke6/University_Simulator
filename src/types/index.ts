// Enhanced Game Types for University Life Simulator

// ============ Character & Stats ============

export type Gender = 'male' | 'female';

export type FamilyWealth = 'poor' | 'middle' | 'wealthy';

export interface FamilyBackground {
    wealth: FamilyWealth;
    parentsOccupation: string;
    monthlyAllowance: number;
}

export interface Attributes {
    iq: number;         // 0-100, affects study efficiency
    eq: number;         // 0-100, affects social interactions
    stamina: number;    // 0-100, current energy
    stress: number;     // 0-100, too high = negative events
    charm: number;      // 0-100, affects romance & job interviews
    luck: number;       // 0-100, affects random events
}

export interface AcademicInfo {
    gaokaoScore: number;
    universityTier: UniversityTier;
    universityName: string;
    major: Major;
    gpa: number;
    knowledgePoints: number;
    failedExams: number;
}

// ============ University & Major ============

export type UniversityTier = 'top' | 'tier2' | 'tier3' | 'vocational';

export interface University {
    name: string;
    tier: UniversityTier;
    minScore: number;
    prestige: number;
    location: string;
}

export interface Major {
    id: string;
    name: string;
    category: MajorCategory;
    statBonus: Partial<Attributes>;
    difficulty: number;
    employability: number;
    description?: string;
}

export type MajorCategory =
    | 'science'
    | 'engineering'
    | 'liberal_arts'
    | 'business'
    | 'medicine'
    | 'arts'
    | 'law';

// ============ Relationships ============

export type NPCRole =
    | 'roommate'
    | 'classmate'
    | 'professor'
    | 'crush'
    | 'partner'
    | 'friend'
    | 'rival'
    | 'employer';

export interface NPC {
    id: string;
    name: string;
    gender: Gender;
    role: NPCRole;
    relationshipScore: number; // -100 to 100
    personality: string;       // For LLM roleplay context
    avatar?: string;
    metDate: GameDate;
    chatHistory?: ChatMessage[]; // NPC chat history
}

export interface ChatMessage {
    role: 'user' | 'npc';
    content: string;
    timestamp: number;
}

// ============ Inventory ============

export type ItemCategory =
    | 'book'
    | 'electronics'
    | 'food'
    | 'clothing'
    | 'gift'
    | 'certificate'
    | 'misc';

export interface Item {
    id: string;
    name: string;
    category: ItemCategory;
    description: string;
    value: number;
    effect?: Partial<Attributes>;
}

// ============ Game Time ============

export interface GameDate {
    year: number;     // 1-4
    semester: number; // 1-2
    week: number;     // 1-20
}

export type Semester = 1 | 2;

// ============ Goals ============

export type GoalType = 'baoyan' | 'kaoyan' | 'employment' | 'abroad' | 'inheritance';

export interface LifeGoal {
    id: GoalType;
    name: string;
    description: string;
    progress: number; // 0-100
    requirements: ActionRequirement[];
}

// ============ Actions ============

export type ActionType =
    | 'study'
    | 'socialize'
    | 'work'
    | 'relax'
    | 'club'
    | 'date'
    | 'exercise';

export interface Action {
    type: ActionType;
    name: string;
    description: string;
    energyCost: number;
    moneyCost: number;
    effects: ActionEffect[];
    requirements?: ActionRequirement[];
}

export interface ActionEffect {
    type: 'attribute' | 'money' | 'gpa' | 'relationship';
    target: string;
    value: number;
    isRandom?: boolean;
    min?: number;
    max?: number;
}

export interface ActionRequirement {
    type: 'money' | 'attribute' | 'relationship' | 'item';
    target: string;
    value: number;
}

// ============ Events ============

export type EventType =
    | 'static'
    | 'dynamic'
    | 'story'
    | 'random'
    | 'academic'
    | 'social';

// Base event interface
export interface BaseEvent {
    id: string;
    title: string;
    description: string;
    choices: EventChoice[];
    timestamp: GameDate;
}

// Static event (hardcoded)
export interface StaticEvent extends BaseEvent {
    type: 'static';
    isLLMGenerated: false;
    triggerCondition?: (student: StudentState) => boolean;
}

// Dynamic event (LLM-generated)
export interface DynamicEvent extends BaseEvent {
    type: 'dynamic';
    isLLMGenerated: true;
    rawResponse?: string;
}

// Combined event type
export type GameEvent = StaticEvent | DynamicEvent;

export interface EventChoice {
    id: string;
    text: string;
    effects: ActionEffect[];
    requirements?: ActionRequirement[];
    nextEventId?: string;
}

export interface EventResult {
    choiceId: string;
    outcome: string;
    effects: ActionEffect[];
}

// ============ Flags & Story ============

export interface GameFlags {
    hasFailedExam: boolean;
    isDating: boolean;
    hasJob: boolean;
    joinedClub: boolean;
    isOnProbation: boolean;
    hasScholarship: boolean;
    graduationStatus: 'pending' | 'graduated' | 'dropped';
    achievements: string[];
}

// ============ Main Student State ============

export interface StudentState {
    // Basic Info
    id: string;
    name: string;
    gender: Gender;
    age: number;
    avatar?: string;

    // Family
    family: FamilyBackground;

    // Attributes
    attributes: Attributes;

    // Academic
    academic: AcademicInfo;

    // Resources
    money: number;
    inventory: Item[];

    // Relationships
    npcs: NPC[];

    // Story Flags
    flags: GameFlags;

    // Timeline
    currentDate: GameDate;
    eventHistory: GameEvent[];

    // Action Points System
    actionPoints: number;      // Current available actions this week
    maxActionPoints: number;   // Usually 3

    // Expanded Modules
    currentClub: string | null; // ID of joined club
    activeBuffs: string[];      // IDs of active certificates/buffs
    goals: LifeGoal[];          // Progress towards long-term objectives
    achievements: string[];     // Collected achievements

    // LLM Context - Rolling summary for AI
    historySummary: string;
}

// ============ Clubs & Items ============

export interface Club {
    id: string;
    name: string;
    description: string;
    requirements: ActionRequirement[];
    benefits: ActionEffect[];
    location: string;
}

export interface Item {
    id: string;
    name: string;
    category: ItemCategory;
    description: string;
    value: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
    effects: ActionEffect[];
}

export interface Job {
    id: string;
    title: string;
    salary: number;
    energyCost: number;
    requirements: ActionRequirement[];
    isUnlocked: boolean;
}

// ============ Game Config ============

export type LLMProvider = 'openai' | 'gemini' | 'claude' | 'custom';

export interface LLMConfig {
    provider: LLMProvider;
    apiKey: string;
    baseUrl?: string;
    model: string;
    maxTokens: number;
    temperature: number;
}

export interface GameConfig {
    llm: LLMConfig;
    autoSave: boolean;
    language: 'en' | 'zh';
    soundEnabled: boolean;
    animationsEnabled: boolean;
}

// ============ Game State ============

export type GamePhase =
    | 'main_menu'
    | 'character_creation'
    | 'gaokao'
    | 'university_selection'
    | 'playing'
    | 'event'
    | 'chat'
    | 'ending';

export interface GameState {
    phase: GamePhase;
    student: StudentState | null;
    config: GameConfig;
    currentEvent: GameEvent | null;
    currentChatNPC: string | null;
    isLoading: boolean;
    error: string | null;
}

// ============ Graduation Ending ============

export interface GraduationEnding {
    endingType: 'perfect' | 'scholar' | 'wealthy' | 'social' | 'average' | 'struggle';
    title: string;
    biography: string;
    careerPath: string;
    lifeMotto: string;
}

// ============ Save/Load ============

export interface SaveData {
    version: string;
    timestamp: number;
    student: StudentState;
    config: GameConfig;
}
