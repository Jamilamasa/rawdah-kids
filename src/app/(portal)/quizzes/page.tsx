'use client';
import { useState, useMemo } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useMyQuizzes } from '@/hooks/useQuizzes';
import { QuizCard } from '@/components/quizzes/QuizCard';
import { QuizListSkeleton } from '@/components/quizzes/QuizListSkeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

type QuizTab = 'hadith' | 'prophet' | 'quran';

const tabs: { id: QuizTab; label: string; icon: string }[] = [
  { id: 'hadith', label: 'Hadith', icon: '📜' },
  { id: 'prophet', label: 'Prophets', icon: '🌟' },
  { id: 'quran', label: 'Quran', icon: '📖' },
];

export default function QuizzesPage() {
  const [activeTab, setActiveTab] = useState<QuizTab>('hadith');
  const { data, isLoading, isError, refetch } = useMyQuizzes();

  const currentQuizzes = useMemo(() => {
    if (!data) return [];
    if (activeTab === 'hadith') return data.hadith_quizzes ?? [];
    if (activeTab === 'prophet') return data.prophet_quizzes ?? [];
    return data.quran_quizzes ?? [];
  }, [data, activeTab]);

  // Sort: incomplete first
  const sortedQuizzes = useMemo(() => {
    return [...currentQuizzes].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return 0;
    });
  }, [currentQuizzes]);

  const tabCounts = useMemo(() => {
    if (!data) return {};
    return {
      hadith: data.hadith_quizzes?.length ?? 0,
      prophet: data.prophet_quizzes?.length ?? 0,
      quran: data.quran_quizzes?.length ?? 0,
    };
  }, [data]);

  return (
    <div className="px-4 py-4">
      <PageHeader
        title="My Quizzes"
        subtitle="Test your Islamic knowledge!"
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
          title="No quizzes yet"
          description="Your parent will assign quizzes for you. Check back soon!"
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
