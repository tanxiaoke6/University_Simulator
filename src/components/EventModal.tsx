// Event Modal Component - Displays current event with choices
import { useGameStore } from '../stores/gameStore';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';

export default function EventModal() {
    const { currentEvent, resolveEvent } = useGameStore();

    if (!currentEvent) {
        return null;
    }

    const handleChoice = (choiceId: string) => {
        resolveEvent(choiceId);
    };

    return (
        <div className="modal-overlay">
            <div className="event-card max-w-xl w-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentEvent.isLLMGenerated
                        ? 'bg-gradient-to-br from-primary-500 to-accent-500 glow-primary'
                        : 'bg-dark-700'
                        }`}>
                        {currentEvent.isLLMGenerated ? (
                            <Bot className="w-6 h-6 text-white" />
                        ) : (
                            <Sparkles className="w-6 h-6 text-dark-400" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold">{currentEvent.title}</h2>
                        <p className="text-dark-500 text-sm">
                            {currentEvent.isLLMGenerated ? 'AI生成事件' : '随机事件'}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="glass-card-light p-4 mb-6">
                    <p className="text-dark-200 leading-relaxed">{currentEvent.description}</p>
                </div>

                {/* Choices */}
                <div className="space-y-3">
                    <p className="text-dark-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        做出你的选择
                    </p>

                    {currentEvent.choices.map((choice, index) => (
                        <button
                            key={choice.id}
                            onClick={() => handleChoice(choice.id)}
                            className="choice-btn group"
                        >
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-sm text-dark-400 group-hover:bg-primary-600 group-hover:text-white transition-colors flex-shrink-0">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="font-medium">{choice.text}</p>
                                    {choice.effects.length > 0 && (
                                        <p className="text-xs text-dark-500 mt-1">
                                            {choice.effects.map((e, i) => {
                                                const sign = e.value >= 0 ? '+' : '';
                                                const label =
                                                    e.type === 'money' ? '金钱' :
                                                        e.type === 'gpa' ? 'GPA' :
                                                            e.target === 'stamina' ? '体力' :
                                                                e.target === 'stress' ? '压力' :
                                                                    e.target === 'eq' ? '情商' :
                                                                        e.target === 'iq' ? '智力' :
                                                                            e.target === 'charm' ? '魅力' :
                                                                                e.target;
                                                return (
                                                    <span key={i} className={`${e.value >= 0 ? 'text-green-400' : 'text-red-400'} mr-2`}>
                                                        {label}{sign}{e.value}
                                                    </span>
                                                );
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
