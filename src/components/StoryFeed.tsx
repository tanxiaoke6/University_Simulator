// Story Feed Component - Displays event history
import type { GameEvent } from '../types';
import { Sparkles, Bot, Calendar } from 'lucide-react';

interface StoryFeedProps {
    events: GameEvent[];
}

export default function StoryFeed({ events }: StoryFeedProps) {
    if (events.length === 0) {
        return (
            <div className="story-feed flex-1 flex items-center justify-center">
                <div className="text-center text-dark-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>新学期开始了！</p>
                    <p className="text-sm mt-2">选择下方的行动开始你的大学生活</p>
                </div>
            </div>
        );
    }

    return (
        <div className="story-feed flex-1 overflow-y-auto scrollbar-thin">
            {events.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
            ))}
        </div>
    );
}

// Event Card Component
function EventCard({ event, index }: { event: GameEvent; index: number }) {
    return (
        <div
            className="story-message"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${event.isLLMGenerated
                    ? 'bg-gradient-to-br from-primary-500 to-accent-500'
                    : 'bg-dark-700'
                    }`}>
                    {event.isLLMGenerated ? (
                        <Bot className="w-4 h-4 text-white" />
                    ) : (
                        <Sparkles className="w-4 h-4 text-dark-400" />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-xs text-dark-500">
                        第{event.timestamp.year}年 {event.timestamp.semester === 1 ? '秋季' : '春季'} 第{event.timestamp.week}周
                        {event.isLLMGenerated && (
                            <span className="ml-2 text-primary-400">• AI生成</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Description */}
            <p className="text-dark-300 leading-relaxed mb-4">{event.description}</p>

            {/* Choices Made (if any - for history display) */}
            {event.choices.length > 0 && (
                <div className="text-xs text-dark-500 pt-3 border-t border-dark-700">
                    可选: {event.choices.map(c => c.text).join(' | ')}
                </div>
            )}
        </div>
    );
}
