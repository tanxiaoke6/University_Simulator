import { Major, Course, Attributes, LLMConfig } from '../types';

// Procedural templates for course name generation
const COURSE_TEMPLATES: Record<string, string[]> = {
    'cs': [
        'Advanced Algorithms {I|II}', 'Machine Learning {Fundamentals|Applications}', 'Cloud Computing {Architecture|Systems}',
        'Quantum Computing {Basics|Theory}', 'Cybersecurity {Principles|Defense}', 'Big Data {Analytics|Processing}',
        'Blockchain {Technology|Development}', 'Artificial Intelligence {Ethics|Systems}', 'Software Architecture {Patterns|Design}',
        'Mobile Development {iOS|Android}', 'Full Stack {Web|App} Development', 'Database {Optimization|Management}'
    ],
    'finance': [
        'Corporate Finance {Strategies|Analysis}', 'Investment {Banking|Management}', 'Derivatives {Markets|Pricing}',
        'Financial {Modeling|Forecasting}', 'International {Trade|Economics}', 'Risk {Assessment|Management}',
        'Behavioral {Finance|Economics}', 'Mergers and {Acquisitions|Restructuring}', 'Fintech {Innovations|Applications}',
        'Portfolio {Theory|Construction}', 'Quantitative {Analysis|Methods}', 'Accounting {Principles|Standards}'
    ],
    'arts': [
        '{Modern|Contemporary} Art History', 'Digital {Painting|Sculpting}', 'Visual {Storytelling|Communication}',
        'Color {Theory|Psychology}', 'Typography {Design|Layout}', 'Motion {Graphics|Design}',
        '{3D|2D} Animation Techniques', 'Character {Design|Development}', 'Environmental {Concept|Art}',
        'Brand {Identity|Strategy}', 'User Experience {Research|Design}', 'Interaction {Design|Prototyping}'
    ],
    'medicine': [
        'Advanced {Anatomy|Physiology}', 'Clinical {Pathology|Diagnosis}', 'Medical {Ethics|Law}',
        'Pharmacology {Principles|Therapeutics}', 'Surgical {Techniques|Procedures}', 'Public {Health|Policy}',
        'Immunology {Basics|Advanced}', 'Neuroscience {Fundamentals|Cognition}', 'Genetics and {Genomics|Heredity}',
        'Pediatrics {Care|Development}', 'Cardiology {Systems|Diseases}', 'Emergency {Medicine|Response}'
    ]
};

const GENERAL_TEMPLATES = [
    '{Advanced|Applied} Mathematics', 'English {Composition|Literature}', 'Physical {Education|Training}',
    'Critical {Thinking|Reasoning}', 'Public {Speaking|Communication}', 'Information {Literacy|Technology}',
    'Global {Perspectives|Studies}', 'Environmental {Science|Sustainability}', 'Psychology {101|Basics}'
];

// Helper to generate a random course name
const generateCourseName = (majorId: string, _year: number): string => {
    let templates = COURSE_TEMPLATES[majorId] || COURSE_TEMPLATES['cs']; // Fallback to CS if major not found
    if (Math.random() > 0.7) templates = GENERAL_TEMPLATES; // 30% chance of general course

    const template = templates[Math.floor(Math.random() * templates.length)];

    return template.replace(/\{([^}]+)\}/g, (_match: string, content: string) => {
        const options = content.split('|');
        return options[Math.floor(Math.random() * options.length)];
    });
};

const generateStatBonus = (majorId: string): Partial<Attributes> => {
    const mainStats: Record<string, string[]> = {
        'cs': ['iq', 'logic'],
        'finance': ['iq', 'eq', 'employability'],
        'arts': ['creativity', 'charm'],
        'medicine': ['iq', 'stamina']
    };

    const stats = mainStats[majorId] || ['iq'];
    const bonus: Partial<Attributes> = {};

    // Pick 1-2 stats
    const count = Math.random() > 0.6 ? 2 : 1;
    for (let i = 0; i < count; i++) {
        const stat = stats[Math.floor(Math.random() * stats.length)];
        bonus[stat as keyof Attributes] = Math.floor(Math.random() * 3) + 1; // +1 to +3
    }

    return bonus;
};

import { generateLLMCourses } from '../services/aiService';

export const generateSemesterSchedule = async (
    config: LLMConfig | null,
    major: Major,
    year: number,
    semester: number
): Promise<Course[]> => {
    // Density logic: Y1: 20%, Y2/3: 40%, Y4: 10%
    // Total slots = 25 (5 slots * 5 days)
    // 20% of 25 = 5 courses
    // 40% of 25 = 10 courses
    // 10% of 25 = 2.5 (round to 3) courses
    const count = year === 1 ? 5 : (year <= 3 ? 10 : 3);

    let courseData: Partial<Course>[] = [];

    // Attempt LLM generation if config is available
    if (config?.apiKey) {
        courseData = await generateLLMCourses(config, major, year, semester, count);
    }

    // Fallback to procedural generation if LLM failed or not available
    if (courseData.length === 0) {
        for (let i = 0; i < count; i++) {
            const name = generateCourseName(major.id, year);
            courseData.push({
                name,
                type: Math.random() > 0.3 ? 'Required' : 'Elective',
                credits: Math.floor(Math.random() * 3) + 2,
                statBonus: generateStatBonus(major.id)
            });
        }
    }

    return courseData.map((data, i) => ({
        id: `course_${year}_${semester}_${i}_${Math.random().toString(36).substr(2, 5)}`,
        name: data.name || '未知课程',
        type: data.type || 'Required',
        credits: data.credits || 2,
        statBonus: data.statBonus || {},
        energyCost: Math.floor(Math.random() * 10) + 10, // 10-20 energy
        semester: semester,
        requiredAttendance: 0.4
    }));
};

