'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rantsApi } from '@/lib/api';
import { toast } from 'sonner';
import { showApiErrorToast } from '@/lib/toast';

export function useRants() {
  return useQuery({
    queryKey: ['rants'],
    queryFn: () => rantsApi.list(),
    select: (data) => data.rants,
  });
}

export function useRant(id: string, password?: string) {
  return useQuery({
    queryKey: ['rant', id, password],
    queryFn: () => rantsApi.get(id, password),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateRant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title?: string; content: string; password?: string }) =>
      rantsApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['rants'] });
      toast.success('✍️ Journal entry saved!');
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not save your journal entry.');
    },
  });
}

export function useUpdateRant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { title?: string; content: string; password?: string } }) =>
      rantsApi.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['rants'] });
      toast.success('✏️ Entry updated!');
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not update your journal entry.');
    },
  });
}

export function useDeleteRant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rantsApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['rants'] });
      toast.success('🗑️ Entry deleted.');
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not delete your journal entry.');
    },
  });
}
