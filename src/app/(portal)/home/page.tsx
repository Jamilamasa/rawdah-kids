'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTasks } from '@/hooks/useTasks';
import { useMyQuizzes } from '@/hooks/useQuizzes';
import { useQuery } from '@tanstack/react-query';
import { APIError, xpApi } from '@/lib/api';
import { getIslamicGreeting } from '@/lib/utils';
import { XPProgressCard, XPProgressCardSkeleton } from '@/components/home/XPProgressCard';
import { TaskSummaryCard } from '@/components/home/TaskSummaryCard';
import { RecentBadges } from '@/components/home/RecentBadges';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const MOTIVATIONAL_MESSAGES = [
  'Every step of learning brings you closer to Allah. Keep going! 🌟',
  '"Seek knowledge from the cradle to the grave." - Prophet Muhammad (SAW)',
  'You are doing amazing! Keep learning and growing! 🌱',
  '"The best of people are those who are most beneficial to others."',
  'Every quiz you complete makes you smarter and stronger! 💪',
  'Learning about Islam is a treasure that no one can take away. 📖',
];

function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`rounded-2xl bg-white/60 animate-pulse ${className}`} />;
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useTasks();

  const {
    data: xpData,
    isLoading: xpLoading,
    isError: xpError,
    error: xpQueryError,
    refetch: refetchXp,
  } = useQuery({
    queryKey: ['xp'],
    queryFn: () => xpApi.get(),
    retry: (count, error) => !(error instanceof APIError && error.status === 404) && count < 2,
  });

  const { data: quizzes } = useMyQuizzes();

  const greeting = useMemo(
    () => (user ? getIslamicGreeting(user.name) : 'Assalamu Alaikum!'),
    [user]
  );

  const pendingTasks = useMemo(
    () => tasks?.filter((t) => ['pending', 'in_progress'].includes(t.status)).slice(0, 3) ?? [],
    [tasks]
  );

  const pendingQuizCount = useMemo(
    () =>
      (quizzes?.hadith_quizzes?.filter((q) => q.status !== 'completed').length ?? 0) +
      (quizzes?.prophet_quizzes?.filter((q) => q.status !== 'completed').length ?? 0) +
      (quizzes?.quran_quizzes?.filter((q) => q.status !== 'completed').length ?? 0),
    [quizzes]
  );

  const motivationalMessage = useMemo(
    () => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)],
    []
  );

  const fallbackXP = useMemo(
    () =>
      user
        ? {
            id: `fallback-${user.id}`,
            user_id: user.id,
            family_id: user.family_id,
            total_xp: 0,
            level: 1,
            updated_at: new Date().toISOString(),
          }
        : null,
    [user]
  );

  const isXPNotConfigured = xpQueryError instanceof APIError && xpQueryError.status === 404;

  return (
    <div className="px-4 py-4 space-y-1">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4"
      >
        <h1 className="text-2xl font-bold text-gray-800">{greeting}</h1>
        <p className="text-gray-600 text-sm mt-0.5">
          Ready for another day of learning?
        </p>
      </motion.div>

      {/* XP Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {xpLoading && <XPProgressCardSkeleton />}
        {xpError && !isXPNotConfigured && (
          <div className="rounded-2xl bg-red-50 p-4 flex items-center gap-3 mb-4">
            <AlertTriangle size={20} className="text-red-500" />
            <span className="text-red-700 text-sm flex-1">Could not load XP data</span>
            <button onClick={() => refetchXp()} className="text-red-600">
              <RefreshCw size={16} />
            </button>
          </div>
        )}
        {xpData && <XPProgressCard xp={xpData} />}
        {!xpLoading && isXPNotConfigured && fallbackXP && <XPProgressCard xp={fallbackXP} />}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
            {tasks?.filter((t) => t.status === 'pending').length ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Tasks to do</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-purple-600">{pendingQuizCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Quizzes pending</p>
        </div>
      </motion.div>

      {/* Task Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {tasksLoading && <SkeletonCard className="h-28 mb-4" />}
        {tasksError && (
          <div className="bg-red-50 rounded-2xl p-4 flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-red-700 text-sm flex-1">Could not load tasks</span>
            <button onClick={() => refetchTasks()}>
              <RefreshCw size={16} className="text-red-500" />
            </button>
          </div>
        )}
        {tasks && <TaskSummaryCard tasks={tasks} />}
      </motion.div>

      {/* Quick Task Actions */}
      {pendingTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">Up Next</h2>
            <Link
              href="/tasks"
              className="text-xs font-medium"
              style={{ color: 'hsl(var(--primary))' }}
            >
              See all →
            </Link>
          </div>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <Link
                key={task.id}
                href="/tasks"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      task.status === 'in_progress'
                        ? '#3b82f6'
                        : 'hsl(var(--primary))',
                  }}
                />
                <span className="text-sm text-gray-700 font-medium flex-1 truncate">
                  {task.title}
                </span>
                <span className="text-xs text-gray-400">
                  {task.status === 'in_progress' ? 'In progress' : 'To do'}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Badges */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <RecentBadges />
      </motion.div>

      {/* Motivational Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl p-4 shadow-sm mb-4"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05))',
          border: '1px solid hsl(var(--primary) / 0.2)',
        }}
      >
        <p className="text-sm text-gray-700 italic leading-relaxed">
          {motivationalMessage}
        </p>
      </motion.div>
    </div>
  );
}
