'use client';
import { Lock, ScrollText } from 'lucide-react';
import { useRants } from '@/hooks/useRants';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatRelativeTime } from '@/lib/utils';

export default function RantsPage() {
  const { data, isLoading, isError, refetch } = useRants();

  return (
    <div className="px-4 py-4">
      <PageHeader
        title="Journal"
        subtitle="Private thoughts and reflections."
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-700 mb-3">Could not load journal entries.</p>
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
          icon={<ScrollText className="w-12 h-12 text-brand-primary" />}
          title="No journal entries yet"
          description="Your private entries will show here."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((rant) => (
            <div key={rant.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800">
                  {rant.title || 'Untitled entry'}
                </p>
                {rant.is_locked && <Lock size={14} className="text-amber-600 flex-shrink-0 mt-1" />}
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {rant.is_locked ? 'This entry is password protected.' : rant.content}
              </p>
              <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(rant.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
