'use client';
import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { cn, getScoreColor, getScoreEmoji } from '@/lib/utils';
import type { HadithQuiz, ProphetQuiz, QuranQuiz, TopicQuiz } from '@/types';

type AnyQuiz = HadithQuiz | ProphetQuiz | QuranQuiz | TopicQuiz;

interface QuizCardProps {
  quiz: AnyQuiz;
  type: 'hadith' | 'prophet' | 'quran' | 'topic';
  index?: number;
}

const TYPE_LABELS = {
  hadith: { label: 'Hadith Quiz', icon: '📜', color: 'bg-amber-50 text-amber-700' },
  prophet: { label: 'Prophet Quiz', icon: '🌟', color: 'bg-blue-50 text-blue-700' },
  quran: { label: 'Quran Quiz', icon: '📖', color: 'bg-green-50 text-green-700' },
  topic: { label: 'Topic Quiz', icon: '🧠', color: 'bg-fuchsia-50 text-fuchsia-700' },
};

const STATUS_CONFIG = {
  pending: { label: 'Not Started', icon: <BookOpen size={14} />, color: 'text-gray-500 bg-gray-100' },
  memorizing: { label: 'Memorizing', icon: <Clock size={14} />, color: 'text-amber-600 bg-amber-50' },
  in_progress: { label: 'In Progress', icon: <Clock size={14} />, color: 'text-blue-600 bg-blue-50' },
  completed: { label: 'Completed', icon: <CheckCircle size={14} />, color: 'text-green-600 bg-green-50' },
};

export const QuizCard = memo(function QuizCard({ quiz, type, index = 0 }: QuizCardProps) {
  const typeConfig = TYPE_LABELS[type];
  const statusConfig = STATUS_CONFIG[quiz.status];
  const isCompleted = quiz.status === 'completed';
  const canStart = quiz.status === 'pending' || quiz.status === 'in_progress';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
              typeConfig.color
            )}
          >
            <span>{typeConfig.icon}</span>
            {typeConfig.label}
          </span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0',
            statusConfig.color
          )}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1 mb-3">
        <Star size={14} className="text-yellow-500" />
        <span className="text-sm font-medium text-gray-700">{quiz.xp_awarded} XP reward</span>
      </div>

      {/* Score if completed */}
      {isCompleted && quiz.score !== undefined && (
        <div className="mb-3 p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
          <span className="text-sm text-gray-600">Your score</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{getScoreEmoji(quiz.score)}</span>
            <span className={cn('font-bold text-lg', getScoreColor(quiz.score))}>
              {quiz.score}%
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      {canStart && (
        <Link
          href={`/quizzes/${type}/${quiz.id}`}
          className="block w-full py-2.5 rounded-xl text-white font-semibold text-sm text-center transition-all active:scale-98 min-h-[44px] flex items-center justify-center"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          {quiz.status === 'in_progress' ? 'Continue Quiz' : 'Start Quiz'}
        </Link>
      )}

      {isCompleted && (
        <Link
          href={`/quizzes/${type}/${quiz.id}`}
          className="block w-full py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm text-center transition-all hover:bg-gray-200 min-h-[44px] flex items-center justify-center"
        >
          View Results
        </Link>
      )}
    </motion.div>
  );
});
