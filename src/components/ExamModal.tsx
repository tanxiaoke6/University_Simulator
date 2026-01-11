// Phase 2: ExamModal Component - Interactive Exam System
import React, { useState, useEffect } from 'react';
import { XCircle, BookOpen, Award } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { generateExamPaper, gradeExamPaper } from '../services/aiService';
import type { ExamQuestion, ExamResult } from '../types';

interface ExamModalProps {
    courseName: string;
    difficulty: number;
    onComplete: (result: ExamResult) => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({ courseName, difficulty, onComplete }) => {
    const { config } = useGameStore();

    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGrading, setIsGrading] = useState(false);
    const [result, setResult] = useState<ExamResult | null>(null);

    // Load exam questions on mount
    useEffect(() => {
        const loadExam = async () => {
            setIsLoading(true);
            try {
                const examQuestions = await generateExamPaper(config.llm, courseName, difficulty);
                setQuestions(examQuestions);
                setAnswers(new Array(examQuestions.length).fill(-1));
            } catch (error) {
                console.error('Failed to load exam:', error);
            }
            setIsLoading(false);
        };
        loadExam();
    }, [config.llm, courseName, difficulty]);

    const handleSelectOption = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmit = async () => {
        setIsGrading(true);
        try {
            const correctAnswers = questions.map(q => q.correctIndex);
            const examResult = await gradeExamPaper(config.llm, answers, correctAnswers, courseName);
            setResult(examResult);
        } catch (error) {
            console.error('Grading failed:', error);
            setResult({ score: 0, gpaModifier: 0, comment: '评分系统异常' });
        }
        setIsGrading(false);
    };

    const handleFinish = () => {
        if (result) {
            onComplete(result);
        }
    };

    const currentQuestion = questions[currentIndex];
    const allAnswered = answers.every(a => a !== -1);

    // Loading State
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full mx-4 text-center">
                    <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white mb-2">正在出卷...</h2>
                    <p className="text-gray-400">{courseName} 期末考试</p>
                </div>
            </div>
        );
    }

    // Result State
    if (result) {
        const isPassed = result.score >= 60;
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full mx-4">
                    <div className="text-center mb-6">
                        {isPassed ? (
                            <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                        ) : (
                            <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
                        )}
                        <h2 className={`text-3xl font-bold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                            {isPassed ? '考试通过！' : '考试未通过'}
                        </h2>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 mb-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                                <p className="text-gray-400 text-sm">分数</p>
                                <p className="text-3xl font-bold text-white">{result.score}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400 text-sm">GPA</p>
                                <p className="text-3xl font-bold text-blue-400">{result.gpaModifier.toFixed(1)}</p>
                            </div>
                        </div>
                        <div className="border-t border-gray-700 pt-4">
                            <p className="text-gray-400 text-sm mb-1">教授评语</p>
                            <p className="text-white italic">"{result.comment}"</p>
                        </div>
                    </div>

                    <button
                        onClick={handleFinish}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                    >
                        确认结果
                    </button>
                </div>
            </div>
        );
    }

    // Exam Questions State
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">{courseName}</h2>
                        <p className="text-gray-400 text-sm">期末考试 · 难度 {difficulty}/5</p>
                    </div>
                    <div className="flex gap-2">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-all ${i === currentIndex
                                    ? 'bg-blue-500 text-white'
                                    : answers[i] !== -1
                                        ? 'bg-green-500/20 text-green-400 border border-green-500'
                                        : 'bg-gray-700 text-gray-400'
                                    }`}
                                onClick={() => setCurrentIndex(i)}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question */}
                {currentQuestion && (
                    <div className="mb-6">
                        <p className="text-lg text-white mb-4 leading-relaxed">
                            <span className="text-blue-400 font-bold mr-2">Q{currentIndex + 1}.</span>
                            {currentQuestion.text}
                        </p>
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectOption(i)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${answers[currentIndex] === i
                                        ? 'bg-blue-500/20 border-blue-500 text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex-1 py-3 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        上一题
                    </button>
                    {currentIndex < questions.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all"
                        >
                            下一题
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!allAnswered || isGrading}
                            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isGrading ? '评分中...' : '提交试卷'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamModal;
