'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import type { Task } from '@/types';

interface TaskSummaryCardProps {
  tasks: Task[];
}

export function TaskSummaryCard({ tasks }: TaskSummaryCardProps) {
  const stats = useMemo(() => {
    return {
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) =>
        ['completed', 'reward_requested', 'reward_approved'].includes(t.status)
      ).length,
    };
  }, [tasks]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800">My Tasks</h2>
        <Link
          href="/tasks"
          className="text-xs font-medium"
          style={{ color: 'hsl(var(--primary))' }}
        >
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-2 bg-amber-50 rounded-xl">
          <Circle size={20} className="text-amber-500 mb-1" />
          <span className="font-bold text-xl text-amber-600">{stats.pending}</span>
          <span className="text-xs text-amber-600/80">To Do</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-blue-50 rounded-xl">
          <Clock size={20} className="text-blue-500 mb-1" />
          <span className="font-bold text-xl text-blue-600">{stats.inProgress}</span>
          <span className="text-xs text-blue-600/80">In Progress</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-green-50 rounded-xl">
          <CheckCircle size={20} className="text-green-500 mb-1" />
          <span className="font-bold text-xl text-green-600">{stats.done}</span>
          <span className="text-xs text-green-600/80">Done</span>
        </div>
      </div>
    </div>
  );
}
