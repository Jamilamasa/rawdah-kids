'use client';
import { MessageCircle } from 'lucide-react';
import { useConversations } from '@/hooks/useMessages';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatRelativeTime } from '@/lib/utils';

export default function MessagesPage() {
  const { data, isLoading, isError, refetch } = useConversations();

  return (
    <div className="px-4 py-4">
      <PageHeader title="Messages" subtitle="Chat with your family members." />

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
          <p className="text-sm text-red-700 mb-3">Could not load messages.</p>
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
          icon={<MessageCircle className="w-12 h-12 text-brand-primary" />}
          title="No conversations yet"
          description="When your family sends messages, they will appear here."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((conversation) => (
            <div key={conversation.user.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-gray-800">{conversation.user.name}</p>
                {conversation.unread_count > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand-dark">
                    {conversation.unread_count} new
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {conversation.last_message?.content ?? 'No message preview'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {conversation.last_message?.created_at
                  ? formatRelativeTime(conversation.last_message.created_at)
                  : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
