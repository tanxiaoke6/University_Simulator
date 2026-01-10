// Tutorial Overlay Component - First-time player guide
import { useState, useEffect } from 'react';
import { ChevronRight, X, BookOpen, Zap, Wallet, Calendar } from 'lucide-react';

const TUTORIAL_KEY = 'university-simulator-tutorial-completed';

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    highlight: 'left' | 'center' | 'right' | 'bottom';
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'stats',
        title: '属性面板',
        description: '左侧显示你的属性（智力、情商、体力、压力等）。保持平衡，压力过高会触发负面事件！',
        icon: <BookOpen className="w-6 h-6" />,
        highlight: 'left',
    },
    {
        id: 'actions',
        title: '行动选择',
        description: '中间区域选择每月的行动：学习提升GPA，社交提升情商，打工赚钱，休息恢复体力。',
        icon: <Zap className="w-6 h-6" />,
        highlight: 'center',
    },
    {
        id: 'resources',
        title: '资源管理',
        description: '注意你的金钱和时间！每月有固定开销，合理规划你的大学生活。',
        icon: <Wallet className="w-6 h-6" />,
        highlight: 'left',
    },
    {
        id: 'advance',
        title: '推进时间',
        description: '选择行动后点击按钮进入下一个月。可能会触发AI生成的随机事件！',
        icon: <Calendar className="w-6 h-6" />,
        highlight: 'bottom',
    },
];

interface TutorialOverlayProps {
    onComplete: () => void;
}

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Check if tutorial already completed
    useEffect(() => {
        const completed = localStorage.getItem(TUTORIAL_KEY);
        if (completed === 'true') {
            setIsVisible(false);
            onComplete();
        }
    }, [onComplete]);

    // Handle next step
    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    // Handle skip/complete
    const handleComplete = () => {
        localStorage.setItem(TUTORIAL_KEY, 'true');
        setIsVisible(false);
        onComplete();
    };

    if (!isVisible) return null;

    const step = TUTORIAL_STEPS[currentStep];

    // Calculate highlight position
    const getHighlightStyle = () => {
        switch (step.highlight) {
            case 'left':
                return 'left-4 top-1/4 w-72';
            case 'center':
                return 'left-1/2 -translate-x-1/2 bottom-32 w-96';
            case 'right':
                return 'right-4 top-1/4 w-72';
            case 'bottom':
                return 'left-1/2 -translate-x-1/2 bottom-8 w-96';
            default:
                return 'left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2';
        }
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" />

            {/* Highlight area based on step */}
            {step.highlight === 'left' && (
                <div className="absolute left-0 top-0 w-72 h-full border-r-2 border-primary-500/50 bg-primary-500/5 pointer-events-none" />
            )}
            {step.highlight === 'right' && (
                <div className="absolute right-0 top-0 w-72 h-full border-l-2 border-primary-500/50 bg-primary-500/5 pointer-events-none" />
            )}
            {step.highlight === 'bottom' && (
                <div className="absolute left-72 right-72 bottom-0 h-32 border-t-2 border-primary-500/50 bg-primary-500/5 pointer-events-none" />
            )}
            {step.highlight === 'center' && (
                <div className="absolute left-72 right-72 top-16 bottom-32 border-2 border-primary-500/50 bg-primary-500/5 pointer-events-none rounded-xl" />
            )}

            {/* Tutorial Card */}
            <div className={`absolute ${getHighlightStyle()} glass-card p-6 animate-scale-in`}>
                {/* Skip Button */}
                <button
                    onClick={handleComplete}
                    className="absolute top-3 right-3 p-1 hover:bg-dark-700 rounded-lg transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4 text-dark-500" />
                </button>

                {/* Content */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
                        {step.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                        <p className="text-dark-300 text-sm leading-relaxed">{step.description}</p>
                    </div>
                </div>

                {/* Progress & Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-700">
                    {/* Progress dots */}
                    <div className="flex gap-1.5">
                        {TUTORIAL_STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-primary-500' :
                                        idx < currentStep ? 'bg-primary-500/50' : 'bg-dark-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Next/Complete button */}
                    <button
                        onClick={handleNext}
                        className="action-btn-primary text-sm py-2"
                    >
                        {currentStep < TUTORIAL_STEPS.length - 1 ? (
                            <>
                                下一步
                                <ChevronRight className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                开始游戏！
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Step counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-dark-900/80 rounded-full text-sm text-dark-400">
                新手教程 {currentStep + 1} / {TUTORIAL_STEPS.length}
            </div>
        </div>
    );
}

// Hook to check if tutorial should be shown
export const useTutorial = () => {
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialCompleted, setTutorialCompleted] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(TUTORIAL_KEY) === 'true';
        setTutorialCompleted(completed);
        setShowTutorial(!completed);
    }, []);

    const completeTutorial = () => {
        localStorage.setItem(TUTORIAL_KEY, 'true');
        setTutorialCompleted(true);
        setShowTutorial(false);
    };

    const resetTutorial = () => {
        localStorage.removeItem(TUTORIAL_KEY);
        setTutorialCompleted(false);
        setShowTutorial(true);
    };

    return { showTutorial, tutorialCompleted, completeTutorial, resetTutorial };
};
