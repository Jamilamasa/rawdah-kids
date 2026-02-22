'use client';
import { useState, useMemo } from 'react';
import { RefreshCw, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { useMyQuizzes, useSelfAssignHadithQuiz } from '@/hooks/useQuizzes';
import { QuizCard } from '@/components/quizzes/QuizCard';
import { QuizListSkeleton } from '@/components/quizzes/QuizListSkeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

type QuizTab = 'hadith' | 'prophet' | 'quran' | 'topic';

const tabs: { id: QuizTab; label: string; icon: string }[] = [
  { id: 'hadith', label: 'Hadith', icon: '📜' },
  { id: 'prophet', label: 'Prophets', icon: '🌟' },
  { id: 'quran', label: 'Quran', icon: '📖' },
  { id: 'topic', label: 'Topics', icon: '🧠' },
];

const difficulties = [
  { value: 'easy', label: 'Easy', emoji: '🌱' },
  { value: 'medium', label: 'Medium', emoji: '⭐' },
  { value: 'hard', label: 'Hard', emoji: '🔥' },
] as const;

type Difficulty = (typeof difficulties)[number]['value'];

export default function QuizzesPage() {
  const [activeTab, setActiveTab] = useState<QuizTab>('hadith');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { data, isLoading, isError, refetch } = useMyQuizzes();
  const selfAssign = useSelfAssignHadithQuiz();

  const currentQuizzes = useMemo(() => {
    if (!data) return [];
    if (activeTab === 'hadith') return data.hadith_quizzes ?? [];
    if (activeTab === 'prophet') return data.prophet_quizzes ?? [];
    if (activeTab === 'quran') return data.quran_quizzes ?? [];
    return data.topic_quizzes ?? [];
  }, [data, activeTab]);

  // Sort: incomplete first
  const sortedQuizzes = useMemo(() => {
    return [...currentQuizzes].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return 0;
    });
  }, [currentQuizzes]);

  const tabCounts = useMemo<Record<QuizTab, number>>(() => {
    if (!data) {
      return {
        hadith: 0,
        prophet: 0,
        quran: 0,
        topic: 0,
      };
    }
    return {
      hadith: data.hadith_quizzes?.length ?? 0,
      prophet: data.prophet_quizzes?.length ?? 0,
      quran: data.quran_quizzes?.length ?? 0,
      topic: data.topic_quizzes?.length ?? 0,
    };
  }, [data]);

  return (
    <div className="px-4 py-4">
      <PageHeader
        title="My Quizzes"
        subtitle="Learn first with lessons and flashcards, then complete your quizzes."
        action={
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors"
            aria-label="Refresh quizzes"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 flex-1 py-2.5 rounded-xl text-sm font-medium transition-all justify-center',
              activeTab === tab.id
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
            style={
              activeTab === tab.id
                ? { backgroundColor: 'hsl(var(--primary))' }
                : undefined
            }
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tabCounts[tab.id] !== undefined && (
              <span
                className={cn(
                  'text-xs',
                  activeTab === tab.id ? 'text-white/80' : 'text-gray-400'
                )}
              >
                ({tabCounts[tab.id]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Self-assign panel — hadith tab only */}
      {activeTab === 'hadith' && (
        <div className="mb-4 rounded-2xl border border-dashed border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Start a new hadith quiz yourself</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {difficulties.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                  difficulty === d.value
                    ? 'text-white border-transparent'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                )}
                style={
                  difficulty === d.value
                    ? { backgroundColor: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' }
                    : undefined
                }
              >
                <span>{d.emoji}</span>
                {d.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={selfAssign.isPending}
            onClick={() => selfAssign.mutate(difficulty)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            {selfAssign.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {selfAssign.isPending ? 'Generating quiz...' : 'Generate Hadith Quiz'}
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading && <QuizListSkeleton count={3} />}

      {isError && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertTriangle size={32} className="text-red-400" />
          <p className="text-gray-600">Could not load quizzes. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl text-white font-medium text-sm"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && sortedQuizzes.length === 0 && (
        <EmptyState
          icon={tabs.find((t) => t.id === activeTab)?.icon}
          title={
            activeTab === 'hadith'
              ? 'No hadith quizzes yet'
              : activeTab === 'topic'
                ? 'No topic quizzes yet'
                : 'No quizzes yet'
          }
          description={
            activeTab === 'hadith'
              ? 'Generate one above or wait for your parent to assign one.'
              : activeTab === 'topic'
                ? 'Parents can now assign AI learning packs with lessons, flashcards, and long quizzes.'
                : 'Your parent will assign quizzes for you. Check back soon!'
          }
        />
      )}

      {!isLoading && !isError && sortedQuizzes.length > 0 && (
        <div className="space-y-3">
          {sortedQuizzes.map((quiz, i) => (
            <QuizCard key={quiz.id} quiz={quiz} type={activeTab} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
