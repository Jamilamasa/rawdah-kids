'use client';
import { Bell, CheckCheck } from 'lucide-react';
import { useMarkAllRead, useMarkOneRead, useNotifications } from '@/hooks/useNotifications';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markOneRead = useMarkOneRead();

  return (
    <div className="px-4 py-4">
      <PageHeader
        title="Notifications"
        subtitle="Updates from your family and tasks."
        action={
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || !data?.some((item) => !item.is_read)}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors disabled:opacity-50"
            aria-label="Mark all notifications as read"
          >
            <CheckCheck size={18} className="text-gray-500" />
          </button>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-700 mb-3">Could not load notifications.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <EmptyState
          icon={<Bell className="w-12 h-12 text-brand-primary" />}
          title="No notifications yet"
          description="You will see updates here when new activity happens."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((notification) => (
            <button
              key={notification.id}
              onClick={() => {
                if (!notification.is_read) {
                  markOneRead.mutate(notification.id);
                }
              }}
              className={cn(
                'w-full text-left rounded-2xl p-4 border transition-colors',
                notification.is_read ? 'bg-white border-gray-100' : 'border-transparent'
              )}
              style={
                notification.is_read
                  ? undefined
                  : {
                      backgroundColor: 'var(--brand-light)',
                      borderColor: 'var(--brand-light)',
                    }
              }
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
                {!notification.is_read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary flex-shrink-0 mt-1" />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
              <p className="text-xs text-gray-400 mt-2">
                {formatRelativeTime(notification.created_at)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
