'use client';
import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  CheckSquare,
  Brain,
  Gamepad2,
  MoreHorizontal,
  BookText,
  Gift,
  MessageCircle,
  FileText,
  HelpCircle,
  Bell,
  LogOut,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMyQuizzes } from '@/hooks/useQuizzes';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNav: NavItem[] = [
  { label: 'Home', href: '/home', icon: <Home size={22} /> },
  { label: 'Tasks', href: '/tasks', icon: <CheckSquare size={22} /> },
  { label: 'Quizzes', href: '/quizzes', icon: <Brain size={22} /> },
  { label: 'Games', href: '/games', icon: <Gamepad2 size={22} /> },
];

const moreNav = [
  { label: 'Rewards', href: '/rewards', icon: <Gift size={20} /> },
  { label: 'Instructions', href: '/instructions', icon: <BookText size={20} /> },
  { label: 'Messages', href: '/messages', icon: <MessageCircle size={20} /> },
  { label: 'Journal', href: '/rants', icon: <FileText size={20} /> },
  { label: 'Requests', href: '/requests', icon: <HelpCircle size={20} /> },
  { label: 'Notifications', href: '/notifications', icon: <Bell size={20} /> },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const { data: quizzes } = useMyQuizzes();
  const { count: notifCount } = useUnreadNotificationCount();

  const pendingQuizCount = useMemo(
    () =>
      (quizzes?.hadith_quizzes?.filter((q) => q.status !== 'completed').length ?? 0) +
      (quizzes?.prophet_quizzes?.filter((q) => q.status !== 'completed').length ?? 0) +
      (quizzes?.quran_quizzes?.filter((q) => q.status !== 'completed').length ?? 0) +
      (quizzes?.topic_quizzes?.filter((q) => q.status !== 'completed').length ?? 0),
    [quizzes]
  );

  const moreActive = [
    '/rewards',
    '/instructions',
    '/messages',
    '/rants',
    '/requests',
    '/notifications',
  ].some((p) => pathname.startsWith(p));

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await authApi.signout();
    } catch {
      // Ignore signout errors
    }
    clearSession();
    toast.success('Signed out. Ma\'a salama! 👋');
    router.push('/');
  }, [clearSession, router]);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl pb-safe-area-bottom"
          >
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-lg">More</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {moreNav.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all relative',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <span
                        className={cn(
                          'transition-colors',
                          isActive ? 'text-primary' : 'text-gray-500'
                        )}
                        style={isActive ? { color: 'hsl(var(--primary))' } : undefined}
                      >
                        {item.icon}
                      </span>
                      <span className="text-xs font-medium">{item.label}</span>
                      {item.href === '/notifications' && notifCount > 0 && (
                        <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                          {notifCount > 9 ? '9+' : notifCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut size={20} />
                <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 safe-area-bottom"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {mainNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const showBadge = item.href === '/quizzes' && pendingQuizCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] min-h-[44px] justify-center relative',
                  isActive ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                    transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10 text-[10px] font-medium">{item.label}</span>
                {showBadge && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold z-20">
                    {pendingQuizCount > 9 ? '9+' : pendingQuizCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] min-h-[44px] justify-center relative',
              moreActive ? 'text-white' : 'text-gray-500 hover:text-gray-700'
            )}
            aria-label="More options"
            aria-expanded={drawerOpen}
          >
            {moreActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">
              <MoreHorizontal size={22} />
            </span>
            <span className="relative z-10 text-[10px] font-medium">More</span>
            {notifCount > 0 && !moreActive && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold z-20">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
