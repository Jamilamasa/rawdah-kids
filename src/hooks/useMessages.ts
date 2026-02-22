'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/lib/api';
import { toast } from 'sonner';
import { showApiErrorToast } from '@/lib/toast';

export function useConversations() {
  return useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: () => messagesApi.conversations(),
    select: (data) => data.conversations,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMessageThread(userId: string) {
  return useQuery({
    queryKey: ['messages', 'thread', userId],
    queryFn: () => messagesApi.thread(userId),
    select: (data) => data.messages,
    enabled: Boolean(userId),
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      recipient_id,
      content,
    }: {
      recipient_id: string;
      content: string;
    }) => messagesApi.send(recipient_id, content),
    onSuccess: (_, { recipient_id }) => {
      void qc.invalidateQueries({ queryKey: ['messages', 'thread', recipient_id] });
      void qc.invalidateQueries({ queryKey: ['messages', 'conversations'] });
      toast.success('💬 Message sent!');
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not send your message. Please try again.');
    },
  });
}

export function useMarkMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messagesApi.markRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
