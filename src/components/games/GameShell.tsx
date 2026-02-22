'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { useStartGameSession, useEndGameSession } from '@/hooks/useGames';
import { APIError } from '@/lib/api';
import type { AvailableGame, GameSession } from '@/types';

interface GameShellProps {
  game: AvailableGame;
  GameComponent: React.ComponentType<{ onComplete?: () => void }>;
  onClose: () => void;
}

type ShellState = 'loading' | 'playing' | 'limit_reached' | 'error';

export function GameShell({ game, GameComponent, onClose }: GameShellProps) {
  const [state, setState] = useState<ShellState>('loading');
  const [session, setSession] = useState<GameSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const startSession = useStartGameSession();
  const endSession = useEndGameSession();

  const initSession = useCallback(async () => {
    try {
      const s = await startSession.mutateAsync({
        game_name: game.id,
        game_type: game.type,
      });
      setSession(s);
      setState('playing');
      startTime.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      }, 1000);
    } catch (err) {
      if (err instanceof APIError && err.status === 429) {
        setState('limit_reached');
      } else {
        setState('error');
      }
    }
  }, [game, startSession]);

  useEffect(() => {
    void initSession();
    return () => {
      clearInterval(timerRef.current);
    };
  }, [initSession]);

  const handleClose = useCallback(async () => {
    clearInterval(timerRef.current);
    if (session) {
      try {
        await endSession.mutateAsync({ id: session.id });
        setSession(null);
      } catch {
        // Best-effort end session
      }
    }
    onClose();
  }, [session, endSession, onClose]);

  const handleGameComplete = useCallback(async () => {
    clearInterval(timerRef.current);
    if (session) {
      try {
        await endSession.mutateAsync({ id: session.id });
        setSession(null);
      } catch {
        // Best-effort end session
      }
    }
  }, [session, endSession]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-white"
    >
      {/* Game Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white safe-area-top">
        <button
          onClick={handleClose}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close game"
        >
          <X size={22} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">{game.icon}</span>
          <span className="font-bold text-gray-800">{game.name}</span>
        </div>
        {state === 'playing' && (
          <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
            <Clock size={14} />
            <span>{formatTime(elapsed)}</span>
          </div>
        )}
        {state !== 'playing' && <div className="w-10" />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {state === 'loading' && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl animate-bounce">{game.icon}</div>
              <p className="text-gray-600 font-medium">Loading game...</p>
            </div>
          </div>
        )}

        {state === 'limit_reached' && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
            <div className="text-6xl">⏰</div>
            <h2 className="text-2xl font-bold text-gray-800">Time&apos;s Up!</h2>
            <p className="text-gray-500 max-w-xs">
              You&apos;ve used all your game time for today. Come back tomorrow for more fun!
            </p>
            <p className="text-amber-600 font-medium text-sm">
              Remember: learning comes first! 📚
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-white font-bold"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              Back to Portal
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
            <div className="text-5xl">😕</div>
            <h2 className="text-xl font-bold text-gray-800">Couldn&apos;t Start Game</h2>
            <p className="text-gray-500">Something went wrong. Please try again!</p>
            <button
              onClick={() => { setState('loading'); void initSession(); }}
              className="px-6 py-3 rounded-xl text-white font-bold"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              Try Again
            </button>
          </div>
        )}

        {state === 'playing' && (
          <GameComponent onComplete={handleGameComplete} />
        )}
      </div>
    </motion.div>
  );
}
