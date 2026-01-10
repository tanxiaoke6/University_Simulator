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
    employability: number; // 0-100, job prospects
    logic?: number;       // Optional major-specific
    creativity?: number;  // Optional major-specific
}

// ============ Curriculum System ============

export type TimeSlot = 'morning_1' | 'morning_2' | 'afternoon_1' | 'afternoon_2' | 'evening';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface Course {
    id: string;
    name: string;
    type: 'Required' | 'Elective';
    credits: number;
    statBonus: Partial<Attributes>;
    energyCost: number;
    description?: string;
    semester?: number;        // Recommended semester (1-8)
    requiredAttendance?: number; // Minimum attendance to pass (0.0-1.0), default 0.4
}

export interface CourseRecord {
    courseId: string;
    courseName: string;
    attendedCount: number;
    totalClasses: number;
    grade: number; // 0.0 - 4.0
    status: 'active' | 'passed' | 'failed';
    semester: number;
}

export interface ScheduleEntry {
    day: DayOfWeek;
    slot: TimeSlot;
    course: Course | null;
}

export interface AcademicInfo {
    gaokaoScore: number;
    universityTier: UniversityTier;
    universityName: string;
    major: Major;
    gpa: number;
    knowledgePoints: number;
    failedExams: number;
    cet6Score: number;
    honors: string[]; // Competition names
    researchPoints: number;
    kaoyanScore?: number;
    interviewScore?: number;
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
    courses: Course[]; // Major-specific curriculum
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
    | 'employer'
    | 'forum_friend'
    | 'parent'
    | 'game_assistant';

export interface MomentComment {
    id: string;
    author: string;
    content: string;
    timestamp: number;
}

export interface Moment {
    id: string;
    content: string;
    images?: string[];
    likes: string[];  // array of friend names who liked
    comments: MomentComment[];
    timestamp: GameDate;
}

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
    moments?: Moment[];  // WeChat Moments (朋友圈)
    viewMomentsPermission?: boolean;  // Whether player can view moments
    parentPride?: number; // Pride score for parent NPCs
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

export interface Transaction {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    timestamp: GameDate;
}

export interface Wallet {
    balance: number;
    transactions: Transaction[];
}

export interface PendingExam {
    certId: string;
    name: string;
    startWeek: number;
    finishWeek: number;
    passChance: number;
}

export interface GameNotification {
    id: string;
    message: string;
    type: 'success' | 'info' | 'error';
    read: boolean;
    timestamp: number;
}

// ============ Game Time ============

export interface GameDate {
    year: number;     // 1-4
    semester: number; // 1-2
    week: number;     // 1-20
    day: number;      // 1-7 (Mon-Sun)
}

export type Semester = 1 | 2;

// ============ Goals ============

export type GoalType = 'baoyan' | 'kaoyan' | 'employment' | 'abroad' | 'inheritance' | 'startup';

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
    type: 'money' | 'attribute' | 'relationship' | 'item' | 'cet6' | 'honors' | 'research' | 'wealth';
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
    gaokaoYear: number;  // Year of Gaokao (2021-2031)

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
    actionPoints: number;           // General actions (7 per week)
    maxActionPoints: number;
    courseActionPoints: number;     // Course attendance (10 per week)
    maxCourseActionPoints: number;

    // Expanded Modules
    clubState: ClubStateData | null; // Renamed from currentClub for deep integration
    currentClub?: string; // KEEPING FOR COMPATIBILITY (will be deprecated/synced)
    currentJobId: string | null; // ID of active job
    wallet: Wallet;             // Digital Bank
    weeklySchedule: ScheduleEntry[]; // Class schedule (15 slots: 5 days × 3 time slots)
    courseRecords: Record<string, CourseRecord>; // Academic history
    plannedAttendance: string[]; // IDs of schedule entries marked for attendance this week
    certificates: string[];      // IDs of active certificates/buffs
    pendingExams: PendingExam[]; // Exams in progress
    notifications: GameNotification[]; // System messages
    goals: LifeGoal[];          // Progress towards long-term objectives
    achievements: string[];     // Collected achievements
    currentLocation?: string;   // Current location ID
    quests: Quest[];             // Active and completed quests
    forumCache?: { [weekKey: string]: any[] };  // Weekly forum cache

    // Dual-Track Club & Council System
    clubs: InterestClubState;    // Interest Club membership (one club)
    council: CouncilState;       // Student Council membership

    // LLM Context - Rolling summary for AI
    historySummary: string;
}

// ============ Quest System ============

export type QuestType = 'Romance' | 'Academic' | 'Life';
export type QuestStatus = 'Active' | 'Completed' | 'Failed';

export interface QuestStage {
    id: string;
    name: string;
    description: string;
    isComplete: boolean;
}

export interface QuestReward {
    money?: number;
    attributes?: Partial<Attributes>;
    honor?: string; // e.g., "国家奖学金获得者"
    item?: string; // Item ID
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: QuestType;
    progress: number; // 0-100
    status: QuestStatus;
    stages?: QuestStage[];
    currentStage?: number;
    rewards: QuestReward;
    triggerCondition?: string; // For display purposes
}

// ============ Clubs & Items ============

// --- Deep Gameplay for Clubs & Council ---
export type ClubRank = 'Member' | 'Vice President' | 'President';
export type CouncilRank = 'Staff' | 'Minister' | 'Chairman';


export interface ClubTask {
    id: string;
    name: string;
    description: string;
    difficulty: number; // 1-5
    minRank: ClubRank;
    energyCost: number;
    rewards: {
        reputation: number;
        money?: number;
        attribute?: { target: keyof Attributes; value: number };
    };
    requirements?: ActionRequirement[];
}

export interface ClubMember extends NPC {
    rank: ClubRank;
}

export interface Club {
    id: string;
    name: string;
    description: string;
    requirements: ActionRequirement[];
    benefits: ActionEffect[];
    location: string;

    // Expanded Fields
    members: ClubMember[];
    tasks: ClubTask[];
}

export interface ClubStateData {
    clubId: string;
    rank: ClubRank;
    reputation: number;
    joinedDate: GameDate;
}

// Student Council Departments
export type CouncilDepartment = 'secretariat' | 'discipline' | 'publicity';

// NPC Model for Clubs
export interface ClubNPC {
    id: string;
    name: string;
    role: string;       // e.g. "Senior", "Newbie", "Treasurer"
    intimacy: number;   // 0-100
    avatar: string;     // Emoji or Icon ID
}

// Interest Club State (ONE club allowed)
export interface InterestClubState {
    id: string | null;                // Active Club ID
    currentRank: ClubRank;
    contribution: number;             // XP for promotion
    members: ClubNPC[];               // Generated on join
    unlockBudget: boolean;            // For President
    pendingClubId: string | null;     // Club currently assessing (waiting for next week)
    joinWeek: number;                 // Track seniority
}

// Student Council State (separate from clubs)
export interface CouncilState {
    joined: boolean;
    department: CouncilDepartment | null;  // Which department
    rank: CouncilRank;
    reputation: number;               // XP for promotion
    departmentKPI: number;            // 0-100%
    authorityLevel: number;           // 1-3
    contribution: number;             // Council specific contribution points
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
