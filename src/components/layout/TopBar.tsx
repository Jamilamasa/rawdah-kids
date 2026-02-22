'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const { count: unreadCount } = useUnreadNotificationCount();

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
      {/* Avatar + Name */}
      <Link href="/home" className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.name}
              width={36}
              height={36}
              sizes="36px"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <span className="font-semibold text-gray-800 text-sm truncate max-w-[100px]">
          {user.name}
        </span>
      </Link>

      {/* Logo / Wordmark */}
      <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
        <span className="text-xl">🌿</span>
        <span className="font-bold text-gray-800 text-base">Rawdah</span>
      </div>

      {/* Notification Bell */}
      <Link
        href="/notifications"
        className="relative p-2 rounded-xl hover:bg-black/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell
          size={22}
          className={unreadCount > 0 ? 'text-gray-800' : 'text-gray-500'}
          strokeWidth={unreadCount > 0 ? 2.5 : 1.5}
        />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </header>
  );
}
