'use client';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { toast } from 'sonner';
import { showApiErrorToast } from '@/lib/toast';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    select: (data) => data.notifications,
    refetchInterval: 60000,
  });
}

export function useUnreadNotificationCount() {
  const query = useNotifications();
  const count = useMemo(() => query.data?.filter((n) => !n.is_read).length ?? 0, [query.data]);
  return { ...query, count };
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.readAll(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('✅ All notifications marked as read!');
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not mark notifications as read.');
    },
  });
}

export function useMarkOneRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.readOne(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
