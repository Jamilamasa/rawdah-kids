'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/lib/api';
import { toast } from 'sonner';
import { showApiErrorToast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';
import type { Message } from '@/types';

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

export function useUnreadMessageCount() {
  const userId = useAuthStore((state) => state.user?.id);

  const query = useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: () => messagesApi.conversations(),
    enabled: Boolean(userId),
    select: (data) =>
      data.conversations.filter((message) => !message.read_at && message.recipient_id === userId).length,
    refetchInterval: 30000,
  });

  return { ...query, count: query.data ?? 0 };
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
    mutationFn: async (id: string) => {
      await messagesApi.markRead(id);
      return id;
    },
    onSuccess: (id) => {
      const readAt = new Date().toISOString();

      qc.setQueriesData<Message[]>({ queryKey: ['messages', 'thread'] }, (old) => {
        if (!old) return old;
        return old.map((message) =>
          message.id === id ? { ...message, read_at: message.read_at ?? readAt } : message
        );
      });

      qc.setQueriesData<Message[]>({ queryKey: ['messages', 'conversations'] }, (old) => {
        if (!old) return old;
        return old.map((message) =>
          message.id === id ? { ...message, read_at: message.read_at ?? readAt } : message
        );
      });
    },
  });
}
