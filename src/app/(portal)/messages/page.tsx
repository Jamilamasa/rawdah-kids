'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { familyApi } from '@/lib/api';
import {
  useConversations,
  useMarkMessageRead,
  useMessageThread,
  useSendMessage,
} from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatRelativeTime } from '@/lib/utils';

export default function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const [activeUserId, setActiveUserId] = useState('');
  const [content, setContent] = useState('');

  const membersQuery = useQuery({
    queryKey: ['family', 'members'],
    queryFn: familyApi.members,
    select: (data) => data.members,
  });
  const conversationsQuery = useConversations();
  const threadQuery = useMessageThread(activeUserId);

  const sendMessage = useSendMessage();
  const markRead = useMarkMessageRead();

  const recipients = useMemo(
    () =>
      (membersQuery.data ?? []).filter(
        (member) => member.id !== user?.id && member.is_active
      ),
    [membersQuery.data, user?.id]
  );

  const latestMessageByRecipientId = useMemo(() => {
    const map = new Map<
      string,
      {
        sender_id: string;
        recipient_id: string;
        content: string;
        read_at?: string;
        created_at: string;
      }
    >();

    (conversationsQuery.data ?? []).forEach((message) => {
      const otherId = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
      map.set(otherId, message);
    });

    return map;
  }, [conversationsQuery.data, user?.id]);

  const recipientOptions = useMemo(() => {
    return [...recipients].sort((a, b) => {
      const aMessage = latestMessageByRecipientId.get(a.id);
      const bMessage = latestMessageByRecipientId.get(b.id);

      if (aMessage && bMessage) {
        return bMessage.created_at.localeCompare(aMessage.created_at);
      }
      if (aMessage) return -1;
      if (bMessage) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [recipients, latestMessageByRecipientId]);

  useEffect(() => {
    if (!activeUserId && recipientOptions.length) {
      setActiveUserId(recipientOptions[0].id);
      return;
    }

    if (activeUserId && !recipientOptions.some((recipient) => recipient.id === activeUserId)) {
      setActiveUserId(recipientOptions[0]?.id ?? '');
    }
  }, [activeUserId, recipientOptions]);

  useEffect(() => {
    if (!threadQuery.data || !user?.id) return;

    threadQuery.data
      .filter((message) => !message.read_at && message.recipient_id === user.id)
      .forEach((message) => {
        markRead.mutate(message.id);
      });
  }, [threadQuery.data, user?.id, markRead]);

  const activeRecipientName =
    recipientOptions.find((recipient) => recipient.id === activeUserId)?.name ?? 'Conversation';

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeUserId || !content.trim()) return;

    sendMessage.mutate(
      { recipient_id: activeUserId, content: content.trim() },
      {
        onSuccess: () => {
          setContent('');
        },
      }
    );
  };

  const loading = membersQuery.isLoading || conversationsQuery.isLoading;

  return (
    <div className="px-4 py-4 space-y-4">
      <PageHeader title="Messages" subtitle="Chat with your family members." />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && recipientOptions.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="w-12 h-12 text-brand-primary" />}
          title="No recipients yet"
          description="Add family members first, then you can send messages."
        />
      ) : null}

      {!loading && recipientOptions.length > 0 ? (
        <>
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
              Send to
            </label>
            <select
              value={activeUserId}
              onChange={(event) => setActiveUserId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            >
              {recipientOptions.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.name}
                </option>
              ))}
            </select>

            <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
              <input
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={sendMessage.isPending || !activeUserId || !content.trim()}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-white disabled:opacity-70"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
              >
                {sendMessage.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-800">{activeRecipientName}</h2>

            <div className="mt-3 max-h-[48dvh] space-y-2 overflow-auto pr-1">
              {threadQuery.isLoading ? (
                <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Loading chat...
                </div>
              ) : threadQuery.data?.length ? (
                threadQuery.data.map((message) => {
                  const mine = message.sender_id === user?.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          mine ? 'text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                        style={mine ? { backgroundColor: 'hsl(var(--primary))' } : undefined}
                      >
                        <p>{message.content}</p>
                        <p className={`mt-1 text-[10px] ${mine ? 'text-white/75' : 'text-gray-500'}`}>
                          {formatRelativeTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">
                  No messages yet with this person. Send the first one.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
              Family conversations
            </p>
            {recipientOptions.map((recipient) => {
              const latestMessage = latestMessageByRecipientId.get(recipient.id);
              const isActive = recipient.id === activeUserId;
              const isUnread =
                latestMessage?.recipient_id === user?.id && !latestMessage?.read_at;

              return (
                <button
                  key={recipient.id}
                  type="button"
                  onClick={() => setActiveUserId(recipient.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-transparent text-white'
                      : 'border-gray-100 bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                  style={isActive ? { backgroundColor: 'hsl(var(--primary))' } : undefined}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-800'}`}>
                      {recipient.name}
                    </p>
                    {isUnread ? (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-1 line-clamp-2 text-sm ${isActive ? 'text-white/85' : 'text-gray-600'}`}>
                    {latestMessage?.content ?? 'No messages yet'}
                  </p>
                  <p className={`mt-1 text-xs ${isActive ? 'text-white/75' : 'text-gray-400'}`}>
                    {latestMessage
                      ? formatRelativeTime(latestMessage.created_at)
                      : 'Start a new conversation'}
                  </p>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
