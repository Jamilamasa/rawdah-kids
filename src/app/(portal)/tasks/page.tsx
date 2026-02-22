'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useTasks, useFilteredTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskListSkeleton } from '@/components/tasks/TaskListSkeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'todo' | 'in_progress' | 'done';

const tabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

export default function TasksPage() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const { data: tasks, isLoading, isError, refetch } = useTasks();
  const filtered = useFilteredTasks(tasks, filter);

  const tabCounts = useMemo(() => {
    if (!tasks) return {};
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) =>
        ['completed', 'reward_requested', 'reward_approved', 'reward_declined'].includes(
          t.status
        )
      ).length,
    };
  }, [tasks]);

  return (
    <div className="px-4 py-4">
      <PageHeader
        title="My Tasks"
        subtitle="Complete tasks to earn rewards!"
        action={
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors"
            aria-label="Refresh tasks"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              filter === tab.id
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
            style={
              filter === tab.id
                ? { backgroundColor: 'hsl(var(--primary))' }
                : undefined
            }
          >
            {tab.label}
            {tabCounts[tab.id] !== undefined && (
              <span
                className={cn(
                  'ml-1.5 text-xs',
                  filter === tab.id ? 'text-white/80' : 'text-gray-400'
                )}
              >
                {tabCounts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && <TaskListSkeleton count={3} />}

      {isError && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertTriangle size={32} className="text-red-400" />
          <p className="text-gray-600">Could not load tasks. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl text-white font-medium text-sm"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon="✅"
          title={filter === 'done' ? 'No completed tasks yet' : 'No tasks here!'}
          description={
            filter === 'done'
              ? 'Complete some tasks to see them here.'
              : filter === 'todo'
              ? 'Great job! No pending tasks.'
              : 'No tasks in this category.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
