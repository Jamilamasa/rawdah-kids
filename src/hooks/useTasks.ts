'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { toast } from 'sonner';
import { showApiErrorToast } from '@/lib/toast';
import type { Task } from '@/types';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list(),
    select: (data) => data.tasks,
  });
}

export function useStartTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      tasksApi.start(id).then(() => ({ title })),
    onSuccess: ({ title }) => {
      void qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`🏃 You started "${title}"! You've got this!`);
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not start the task. Please try again.');
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      tasksApi.complete(id).then(() => ({ title })),
    onSuccess: ({ title }) => {
      void qc.invalidateQueries({ queryKey: ['tasks'] });
      void qc.invalidateQueries({ queryKey: ['xp'] });
      toast.success(`✅ Amazing! You completed "${title}"! 🌟`);
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not complete the task. Please try again.');
    },
  });
}

export function useRequestReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      tasksApi.requestReward(id).then(() => ({ title })),
    onSuccess: ({ title }) => {
      void qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`🎁 Reward requested for "${title}"! Ask a parent to approve it!`);
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not request reward. Please try again.');
    },
  });
}

export function useFilteredTasks(tasks: Task[] | undefined, filter: string) {
  if (!tasks) return [];
  if (filter === 'all') return tasks;
  if (filter === 'todo') return tasks.filter((t) => t.status === 'pending');
  if (filter === 'in_progress') return tasks.filter((t) => t.status === 'in_progress');
  if (filter === 'done')
    return tasks.filter((t) =>
      ['completed', 'reward_requested', 'reward_approved', 'reward_declined'].includes(
        t.status
      )
    );
  return tasks;
}
