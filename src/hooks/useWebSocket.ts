'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080/ws';

interface WSPayload {
  title?: string;
  [key: string]: unknown;
}

export function useWebSocket() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const isConnecting = useRef(false);

  const connect = useCallback(() => {
    if (!token || typeof window === 'undefined' || isConnecting.current) return;
    if (ws.current?.readyState === WebSocket.OPEN) return;

    isConnecting.current = true;
    ws.current = new WebSocket(`${WS_URL}?token=${token}`);

    ws.current.onopen = () => {
      isConnecting.current = false;
    };

    ws.current.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data as string) as { type: string; payload: WSPayload };
        switch (event.type) {
          case 'task.assigned':
            void qc.invalidateQueries({ queryKey: ['tasks'] });
            toast.info('📋 New task assigned!', { description: event.payload?.title });
            break;
          case 'task.status_updated':
            void qc.invalidateQueries({ queryKey: ['tasks'] });
            break;
          case 'quiz.assigned':
            void qc.invalidateQueries({ queryKey: ['quizzes'] });
            toast.info('🧠 New quiz ready!', {
              description: 'A quiz has been assigned to you.',
            });
            break;
          case 'quiz.completed':
            void qc.invalidateQueries({ queryKey: ['quizzes'] });
            break;
          case 'message.new':
            void qc.invalidateQueries({ queryKey: ['messages'] });
            toast.info('💬 New message!', { description: 'You have a new message.' });
            break;
          case 'request.new':
            void qc.invalidateQueries({ queryKey: ['requests'] });
            break;
          case 'game.limit_reached':
            toast.warning("⏰ Time's up!", {
              description:
                "You've reached your game limit for today. Come back tomorrow!",
            });
            break;
          case 'notification.new':
            void qc.invalidateQueries({ queryKey: ['notifications'] });
            break;
          default:
            break;
        }
      } catch {
        // Ignore malformed WS messages
      }
    };

    ws.current.onclose = () => {
      isConnecting.current = false;
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.current.onerror = () => {
      isConnecting.current = false;
      ws.current?.close();
    };
  }, [token, qc]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);
}
