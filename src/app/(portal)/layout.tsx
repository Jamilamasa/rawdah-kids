'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const user = useAuthStore((s) => s.user);

  useWebSocket();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || (isAuthenticated && !user)) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-brand-light to-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-brand-light border-t-brand-primary animate-spin" />
          <p className="text-brand-dark text-sm font-semibold">Preparing your portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const themeClass = `theme-${user.theme}`;

  return (
    <div
      className={`${themeClass} min-h-dvh flex flex-col relative`}
      style={{
        background: 'linear-gradient(to bottom, var(--bg-from), var(--bg-to))',
      }}
    >
      <TopBar />
      <main className="flex-1 overflow-y-auto pt-16 pb-20 scrollbar-thin">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
