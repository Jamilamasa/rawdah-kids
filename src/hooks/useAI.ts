'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import type { DuaGenerateInput } from '@/types';
import { showApiErrorToast } from '@/lib/toast';
import { toast } from 'sonner';

export function useAskAI() {
  return useMutation({
    mutationFn: (question: string) => aiApi.ask({ question }),
    onError: (error) => {
      showApiErrorToast(error, 'I could not answer that just now. Try again in a moment.');
    },
  });
}

export function useGenerateDua() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: DuaGenerateInput) => aiApi.generateDua(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dua-history'] });
      toast.success('Dua generated and saved.');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not generate your dua right now.');
    },
  });
}

export function useDuaHistory(limit = 20) {
  return useQuery({
    queryKey: ['dua-history', limit],
    queryFn: () => aiApi.listDuaHistory({ limit }),
    select: (data) => data.history,
  });
}

export function useDuaHistoryItem(id?: string | null) {
  return useQuery({
    queryKey: ['dua-history', 'item', id],
    queryFn: () => aiApi.getDuaHistory(id as string),
    enabled: Boolean(id),
  });
}
