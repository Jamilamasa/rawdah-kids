import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LEVEL_THRESHOLDS, type LevelInfo } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLevelInfo(totalXP: number): {
  current: LevelInfo;
  next: LevelInfo | null;
  progress: number;
} {
  let current = LEVEL_THRESHOLDS[0];
  let next: LevelInfo | null = null;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] ?? null;
      break;
    }
  }

  const progress = next
    ? Math.min(100, ((totalXP - current.xp) / (next.xp - current.xp)) * 100)
    : 100;

  return { current, next, progress };
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function getTaskStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50',
    in_progress: 'text-blue-600 bg-blue-50',
    completed: 'text-green-600 bg-green-50',
    reward_requested: 'text-purple-600 bg-purple-50',
    reward_approved: 'text-emerald-600 bg-emerald-50',
    reward_declined: 'text-red-600 bg-red-50',
  };
  return map[status] ?? 'text-gray-600 bg-gray-50';
}

export function getTaskStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'To Do',
    in_progress: 'In Progress',
    completed: 'Done',
    reward_requested: 'Reward Requested',
    reward_approved: 'Reward Approved!',
    reward_declined: 'Reward Declined',
  };
  return map[status] ?? status;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

export function getScoreEmoji(score: number): string {
  if (score === 100) return '🌟';
  if (score >= 80) return '⭐';
  if (score >= 60) return '👍';
  return '💪';
}

export function getLevelEmoji(level: number): string {
  const emojis: Record<number, string> = {
    1: '🌱',
    2: '🌿',
    3: '📚',
    4: '🔭',
    5: '🎓',
    6: '📜',
    7: '📖',
    8: '🌟',
    9: '💎',
    10: '🏆',
  };
  return emojis[level] ?? '⭐';
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}!`;
  if (hour < 17) return `Good afternoon, ${name}!`;
  return `Good evening, ${name}!`;
}

export function getIslamicGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Assalamu Alaikum, ${name}! 🌟`;
  if (hour < 17) return `Assalamu Alaikum, ${name}! ☀️`;
  return `Assalamu Alaikum, ${name}! 🌙`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isOverdue(dueDateStr: string): boolean {
  return new Date(dueDateStr) < new Date();
}
