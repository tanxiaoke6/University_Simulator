// Character Creation Component - Iteration 3
import { useState, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import {
    rollFamilyWealth,
    getAvailableUniversities,
    getAvailableMajors,
    createInitialStudent
} from '../stores/gameData';
import type { Gender, FamilyWealth, University, Major } from '../types';
import {
    User,
    ChevronLeft,
    Sparkles,
    Building2,
    BookOpen,
    Shuffle,
    Dice6,
    GraduationCap
} from 'lucide-react';

type Step = 'basic' | 'family' | 'gaokao' | 'university' | 'major';

// Chinese name generators
const SURNAME = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高'];
const MALE_NAMES = ['伟', '强', '磊', '洋', '勇', '杰', '涛', '明', '超', '浩', '鹏', '军', '帅', '轩', '宇'];
const FEMALE_NAMES = ['芳', '娜', '敏', '静', '丽', '雪', '婷', '秀', '英', '慧', '颖', '倩', '琳', '璐', '萱'];

const generateRandomName = (gender: Gender): string => {
    const surname = SURNAME[Math.floor(Math.random() * SURNAME.length)];
    const namePool = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;
    const given = namePool[Math.floor(Math.random() * namePool.length)];
    if (Math.random() > 0.5) {
        const second = namePool[Math.floor(Math.random() * namePool.length)];
        return surname + given + second;
    }
    return surname + given;
};

const generateBellCurveScore = (): number => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const mean = 520;
    const stdDev = 80;
    let score = Math.round(mean + z * stdDev);
    score = Math.max(300, Math.min(750, score));
    return score;
};

export default function CharacterCreation() {
    const { startNewGame, setPhase } = useGameStore();

    const [step, setStep] = useState<Step>('basic');
    const [name, setName] = useState('');
    const [gender, setGender] = useState<Gender>('male');
    const [age, setAge] = useState(18);
    const [wealth, setWealth] = useState<FamilyWealth>('middle');
    const [isWealthRolled, setIsWealthRolled] = useState(false);
    const [gaokaoScore, setGaokaoScore] = useState(0);
    const [gaokaoMode, setGaokaoMode] = useState<'manual' | 'random'>('random');
    const [manualScore, setManualScore] = useState('550');
    const [gaokaoYear, setGaokaoYear] = useState(2026);  // Default to current year
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
    const [isRandomizing, setIsRandomizing] = useState(false);

    const handleRollWealth = () => {
        const rolled = rollFamilyWealth();
        setWealth(rolled);
        setIsWealthRolled(true);
    };

    const handleCalculateGaokao = () => {
        if (gaokaoMode === 'manual') {
            setGaokaoScore(parseInt(manualScore) || 500);
        } else {
            setGaokaoScore(generateBellCurveScore());
        }
    };

    const handleRandomizeAll = useCallback(() => {
        setIsRandomizing(true);
        const randomGender: Gender = Math.random() > 0.5 ? 'male' : 'female';
        setGender(randomGender);
        setName(generateRandomName(randomGender));
        setAge(17 + Math.floor(Math.random() * 3));
        const randomWealth = rollFamilyWealth();
        setWealth(randomWealth);
        setIsWealthRolled(true);
        const randomScore = generateBellCurveScore();
        setGaokaoScore(randomScore);
        setGaokaoMode('random');
        const availableUnis = getAvailableUniversities(randomScore);
        if (availableUnis.length > 0) {
            const randomUni = availableUnis[Math.floor(Math.random() * Math.min(3, availableUnis.length))];
            setSelectedUniversity(randomUni);
            const availableMajors = getAvailableMajors(randomUni.tier);
            if (availableMajors.length > 0) {
                const randomMajor = availableMajors[Math.floor(Math.random() * availableMajors.length)];
                setSelectedMajor(randomMajor);
            }
        }
        setTimeout(() => setIsRandomizing(false), 500);
    }, []);

    // Generate year options (±5 years from 2026)
    const yearOptions = Array.from({ length: 11 }, (_, i) => 2021 + i);

    const nextStep = () => {
        const steps: Step[] = ['basic', 'family', 'gaokao', 'university', 'major'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
    };

    const prevStep = () => {
        const steps: Step[] = ['basic', 'family', 'gaokao', 'university', 'major'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) setStep(steps[currentIndex - 1]);
        else setPhase('main_menu');
    };

    const [isStarting, setIsStarting] = useState(false);

    const handleStart = async () => {
        if (!selectedUniversity || !selectedMajor) {
            console.warn("Cannot start: University or Major not selected.");
            return;
        }

        setIsStarting(true);
        try {
            console.log("Creating initial student with:", { name, gender, age, wealth, gaokaoScore });
            const config = useGameStore.getState().config;
            const student = await createInitialStudent(
                name || '无名氏',
                gender,
                age,
                wealth,
                gaokaoScore,
                selectedUniversity,
                selectedMajor,
                gaokaoYear,
                config
            );

            console.log("Starting new game with student:", student);
            startNewGame(student);
        } catch (error) {
            console.error("Failed to start game:", error);
            // Optionally set an error state to show to user
        } finally {
            setIsStarting(false);
        }
    };

    const universities = gaokaoScore > 0 ? getAvailableUniversities(gaokaoScore) : [];
    const majors = selectedUniversity ? getAvailableMajors(selectedUniversity.tier) : [];
    const isFullyRandomized = name && isWealthRolled && gaokaoScore > 0 && selectedUniversity && selectedMajor;

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-dark-950">
            <div className="glass-card p-8 max-w-2xl w-full animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-display font-bold text-gradient">创建角色</h1>
                    <button onClick={handleRandomizeAll} disabled={isRandomizing} className="action-btn-accent text-sm">
                        <Shuffle className={`w-4 h-4 ${isRandomizing ? 'animate-spin' : ''}`} />
                        随机生成
                    </button>
                </div>

                {isFullyRandomized && step === 'basic' && (
                    <div className="mb-6 p-4 bg-accent-500/10 border border-accent-500/30 rounded-xl animate-fade-in flex items-center justify-between">
                        <div className="text-sm">
                            <span className="font-medium text-accent-400">{name}</span> | {gender === 'male' ? '男' : '女'} | {age}岁 | {gaokaoScore}分
                            <p className="text-dark-500 mt-1">{selectedUniversity?.name} • {selectedMajor?.name}</p>
                        </div>
                        <button onClick={handleStart} disabled={isStarting} className="action-btn-primary py-2 flex items-center gap-2">
                            {isStarting ? <Sparkles className="w-4 h-4 animate-spin" /> : null}
                            {isStarting ? '正在初始化...' : '立即开始'}
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-center gap-2 mb-8">
                    {['basic', 'family', 'gaokao', 'university', 'major'].map((s) => (
                        <div key={s} className={`w-3 h-3 rounded-full transition-colors ${step === s ? 'bg-primary-500' : 'bg-dark-700'}`} />
                    ))}
                </div>

                {step === 'basic' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <User className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-display font-bold">基本信息</h2>
                        </div>
                        <div>
                            <label className="input-label">姓名</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="输入你的名字" className="input-field" />
                        </div>
                        <div>
                            <label className="input-label">性别</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['male', 'female'].map((g) => (
                                    <button key={g} onClick={() => setGender(g as Gender)} className={`p-4 rounded-xl border text-center ${gender === g ? 'bg-primary-600 border-primary-500' : 'bg-dark-800 border-dark-600'}`}>
                                        <span className="text-2xl">{g === 'male' ? '👨' : '👩'}</span>
                                        <p className="mt-1 font-medium">{g === 'male' ? '男' : '女'}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="input-label">年龄 ({age}岁)</label>
                            <input type="range" min={17} max={19} value={age} onChange={(e) => setAge(parseInt(e.target.value))} className="w-full accent-primary-500" />
                        </div>
                    </div>
                )}

                {step === 'family' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Sparkles className="w-12 h-12 text-accent-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-display font-bold">家庭背景</h2>
                        </div>
                        <div className="text-center">
                            <button onClick={handleRollWealth} className="action-btn-accent text-lg"><Dice6 className="w-5 h-5" />抽签</button>
                        </div>
                        {isWealthRolled && <div className="glass-card-light p-6 text-center animate-fade-in"><p className="text-3xl font-bold text-accent-400">{wealth === 'wealthy' ? '富裕' : wealth === 'middle' ? '中产' : '贫困'}</p></div>}
                    </div>
                )}

                {step === 'gaokao' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8"><GraduationCap className="w-12 h-12 text-primary-400 mx-auto mb-4" /><h2 className="text-2xl font-display font-bold">高考信息</h2></div>

                        <div>
                            <label className="input-label">高考年份</label>
                            <select
                                value={gaokaoYear}
                                onChange={(e) => setGaokaoYear(parseInt(e.target.value))}
                                className="input-field"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}年</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setGaokaoMode('random')} className={`p-4 rounded-xl border ${gaokaoMode === 'random' ? 'bg-primary-600' : 'bg-dark-800'}`}>随机发挥</button>
                            <button onClick={() => setGaokaoMode('manual')} className={`p-4 rounded-xl border ${gaokaoMode === 'manual' ? 'bg-primary-600' : 'bg-dark-800'}`}>自定义</button>
                        </div>
                        {gaokaoMode === 'manual' && <input type="number" value={manualScore} onChange={(e) => setManualScore(e.target.value)} className="input-field" />}
                        <button onClick={handleCalculateGaokao} className="action-btn-primary w-full">确认</button>
                        {gaokaoScore > 0 && <div className="glass-card-light p-6 text-center animate-fade-in"><p className="text-5xl font-bold text-gradient">{gaokaoScore}</p></div>}
                    </div>
                )}

                {step === 'university' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8"><Building2 className="w-12 h-12 text-primary-400 mx-auto mb-4" /><h2 className="text-2xl font-display font-bold">选择院校</h2></div>
                        <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
                            {universities.map(uni => (
                                <button key={uni.name} onClick={() => setSelectedUniversity(uni)} className={`w-full p-4 rounded-xl border text-left ${selectedUniversity?.name === uni.name ? 'border-primary-500 bg-primary-500/10' : 'border-dark-700'}`}>
                                    {uni.name} <span className="text-xs text-dark-500 ml-2">{uni.location} ({uni.tier})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'major' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8"><BookOpen className="w-12 h-12 text-accent-400 mx-auto mb-4" /><h2 className="text-2xl font-display font-bold">选择专业</h2></div>
                        <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
                            {majors.map(major => (
                                <button key={major.id} onClick={() => setSelectedMajor(major)} className={`w-full p-4 rounded-xl border text-left ${selectedMajor?.id === major.id ? 'border-accent-500 bg-accent-500/10' : 'border-dark-700'}`}>
                                    {major.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-dark-700">
                    <button onClick={prevStep} className="action-btn-secondary"><ChevronLeft className="w-5 h-5" />返回</button>
                    {step === 'major' ? (
                        <button onClick={handleStart} disabled={!selectedMajor || isStarting} className="action-btn-primary disabled:opacity-50 flex items-center gap-2">
                            {isStarting ? <Sparkles className="w-4 h-4 animate-spin" /> : null}
                            {isStarting ? '正在初始化...' : '开始生活'}
                        </button>
                    ) : (
                        <button onClick={nextStep} className="action-btn-primary">下一步</button>
                    )}
                </div>
            </div>
        </div>
    );
}
