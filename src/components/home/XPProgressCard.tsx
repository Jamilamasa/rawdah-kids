'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getLevelInfo, getLevelEmoji } from '@/lib/utils';
import type { UserXP } from '@/types';

interface XPProgressCardProps {
  xp: UserXP;
}

export function XPProgressCard({ xp }: XPProgressCardProps) {
  const levelInfo = useMemo(() => getLevelInfo(xp.total_xp), [xp.total_xp]);

  return (
    <div
      className="rounded-2xl p-5 text-white shadow-lg mb-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
              Current Level
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-3xl">{getLevelEmoji(levelInfo.current.level)}</span>
              <div>
                <p className="font-bold text-xl leading-none">
                  Level {levelInfo.current.level}
                </p>
                <p className="text-white/90 text-sm">{levelInfo.current.title}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-xs">Total XP</p>
            <p className="font-bold text-2xl">{xp.total_xp.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-1">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-white/80">
          <span>{levelInfo.current.xp.toLocaleString()} XP</span>
          {levelInfo.next ? (
            <span>
              {(levelInfo.next.xp - xp.total_xp).toLocaleString()} XP to{' '}
              {levelInfo.next.title}
            </span>
          ) : (
            <span>Max Level! 🏆</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function XPProgressCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 bg-gray-200 animate-pulse h-32 mb-4" />
  );
}
