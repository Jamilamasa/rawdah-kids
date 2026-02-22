'use client';
import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Loader2, Gift, CheckCircle, Play } from 'lucide-react';
import { cn, getTaskStatusColor, getTaskStatusLabel, formatDate, isOverdue } from '@/lib/utils';
import { useStartTask, useCompleteTask, useRequestReward } from '@/hooks/useTasks';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  index?: number;
}

export const TaskCard = memo(function TaskCard({ task, index = 0 }: TaskCardProps) {
  const startTask = useStartTask();
  const completeTask = useCompleteTask();
  const requestReward = useRequestReward();

  const handleStart = useCallback(() => {
    startTask.mutate({ id: task.id, title: task.title });
  }, [startTask, task.id, task.title]);

  const handleComplete = useCallback(() => {
    completeTask.mutate({ id: task.id, title: task.title });
  }, [completeTask, task.id, task.title]);

  const handleRequestReward = useCallback(() => {
    requestReward.mutate({ id: task.id, title: task.title });
  }, [requestReward, task.id, task.title]);

  const overdue = task.due_date && isOverdue(task.due_date) && task.status === 'pending';

  const statusColors = getTaskStatusColor(task.status);
  const statusLabel = getTaskStatusLabel(task.status);

  const canStart = task.status === 'pending';
  const canComplete = task.status === 'in_progress';
  const canRequestReward =
    task.status === 'completed' && Boolean(task.reward_id);

  const isLoading =
    (canStart && startTask.isPending) ||
    (canComplete && completeTask.isPending) ||
    (canRequestReward && requestReward.isPending);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-800 flex-1 leading-snug">{task.title}</h3>
        <span
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0',
            statusColors
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* Due date */}
      {task.due_date && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs mb-3',
            overdue ? 'text-red-500' : 'text-gray-400'
          )}
        >
          <Calendar size={12} />
          <span>
            {overdue ? 'Overdue! ' : 'Due '}
            {formatDate(task.due_date)}
          </span>
        </div>
      )}

      {/* Action Button */}
      {canStart && (
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 min-h-[44px]"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} />
          )}
          Start Task
        </button>
      )}

      {canComplete && (
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 min-h-[44px]"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle size={16} />
          )}
          Mark Complete
        </button>
      )}

      {canRequestReward && (
        <button
          onClick={handleRequestReward}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 min-h-[44px]"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Gift size={16} />
          )}
          Request Reward
        </button>
      )}

      {task.status === 'reward_approved' && (
        <div className="bg-emerald-50 rounded-xl p-2.5 text-emerald-700 text-sm font-medium text-center">
          🎉 Reward Approved!
        </div>
      )}

      {task.status === 'reward_declined' && (
        <div className="bg-red-50 rounded-xl p-2.5 text-red-600 text-sm font-medium text-center">
          Reward was declined. Ask a parent for more info.
        </div>
      )}

      {task.status === 'reward_requested' && (
        <div className="bg-purple-50 rounded-xl p-2.5 text-purple-600 text-sm font-medium text-center">
          ⏳ Waiting for reward approval...
        </div>
      )}
    </motion.div>
  );
});
