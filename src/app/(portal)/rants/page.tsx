'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Lock, ScrollText, Trash2, PenLine } from 'lucide-react';
import { useRants, useDeleteRant, useUpdateRant } from '@/hooks/useRants';
import { rantsApi, APIError } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatRelativeTime } from '@/lib/utils';
import { showApiErrorToast } from '@/lib/toast';
import type { Rant } from '@/types';

type CardView = 'unlocking' | 'viewing' | 'editing';

export default function RantsPage() {
  const { data, isLoading, isError, refetch } = useRants();
  const deleteRant = useDeleteRant();
  const updateRant = useUpdateRant();

  const [selected, setSelected] = useState<string | null>(null);
  const [cardView, setCardView] = useState<CardView>('viewing');

  // Unlock state
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedContent, setUnlockedContent] = useState<Record<string, string>>({});

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const openRant = (rant: Rant) => {
    if (selected === rant.id) {
      setSelected(null);
      return;
    }
    setSelected(rant.id);
    setUnlockPassword('');
    setUnlockError('');
    if (rant.is_locked && !unlockedContent[rant.id]) {
      setCardView('unlocking');
    } else {
      setCardView('viewing');
    }
  };

  const handleUnlock = async (e: FormEvent, rantId: string) => {
    e.preventDefault();
    setUnlocking(true);
    setUnlockError('');
    try {
      const result = await rantsApi.get(rantId, unlockPassword);
      setUnlockedContent((prev) => ({ ...prev, [rantId]: result.content }));
      setCardView('viewing');
    } catch (err) {
      if (err instanceof APIError && err.status === 403) {
        setUnlockError('Incorrect password. Try again.');
      } else {
        showApiErrorToast(err as Error, 'Could not unlock this entry.');
      }
    } finally {
      setUnlocking(false);
    }
  };

  const startEdit = (rant: Rant) => {
    setEditTitle(rant.title ?? '');
    setEditContent(unlockedContent[rant.id] ?? rant.content);
    setEditPassword('');
    setCardView('editing');
  };

  const handleUpdate = (e: FormEvent, rantId: string) => {
    e.preventDefault();
    updateRant.mutate(
      {
        id: rantId,
        body: {
          title: editTitle.trim() || undefined,
          content: editContent,
          password: editPassword || undefined,
        },
      },
      {
        onSuccess: () => {
          setSelected(null);
          setUnlockedContent({});
        },
      }
    );
  };

  const handleDelete = (rantId: string) => {
    deleteRant.mutate(rantId, {
      onSuccess: () => {
        if (selected === rantId) setSelected(null);
      },
    });
  };

  return (
    <div className="px-4 py-4">
      <PageHeader
        title="Rants"
        subtitle="Private thoughts and reflections."
        action={
          <Link
            href="/rants/new"
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            + New
          </Link>
        }
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
          description="Tap + New to write your first private entry."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((rant) => {
            const isOpen = selected === rant.id;
            const content = unlockedContent[rant.id] ?? rant.content;

            return (
              <div
                key={rant.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* Card header — always visible */}
                <div className="p-4 cursor-pointer" onClick={() => openRant(rant)}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {rant.is_locked && (
                        <Lock size={13} className="text-amber-500 flex-shrink-0" />
                      )}
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {rant.title || 'Untitled entry'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(rant.id);
                      }}
                      disabled={deleteRant.isPending}
                      aria-label="Delete entry"
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {!isOpen && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {rant.is_locked ? 'Password protected' : content}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">
                    {formatRelativeTime(rant.created_at)}
                  </p>
                </div>

                {/* Unlock form */}
                {isOpen && cardView === 'unlocking' && (
                  <div className="border-t border-gray-100 p-4">
                    <p className="text-sm text-gray-500 mb-3">
                      This entry is password protected.
                    </p>
                    <form onSubmit={(e) => handleUnlock(e, rant.id)} className="space-y-2">
                      <input
                        type="password"
                        value={unlockPassword}
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Entry password"
                        autoFocus
                      />
                      {unlockError && (
                        <p className="text-xs text-red-500">{unlockError}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={!unlockPassword || unlocking}
                          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
                          style={{ backgroundColor: 'hsl(var(--primary))' }}
                        >
                          {unlocking ? 'Unlocking...' : 'Unlock'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelected(null)}
                          className="px-4 py-2.5 rounded-xl text-sm text-gray-600 bg-gray-100 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* View content */}
                {isOpen && cardView === 'viewing' && (
                  <div className="border-t border-gray-100 p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {content}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => startEdit(rant)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <PenLine size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => setSelected(null)}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit form */}
                {isOpen && cardView === 'editing' && (
                  <div className="border-t border-gray-100 p-4">
                    <form onSubmit={(e) => handleUpdate(e, rant.id)} className="space-y-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Title (optional)"
                        maxLength={120}
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full min-h-28 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Your entry..."
                        required
                      />
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={
                          rant.is_locked
                            ? 'New password (blank = remove lock)'
                            : 'Add password lock (optional)'
                        }
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={updateRant.isPending || !editContent.trim()}
                          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
                          style={{ backgroundColor: 'hsl(var(--primary))' }}
                        >
                          {updateRant.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardView('viewing')}
                          className="px-4 py-2.5 rounded-xl text-sm text-gray-600 bg-gray-100 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
