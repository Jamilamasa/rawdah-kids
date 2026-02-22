'use client';
import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HelpCircle, PlusCircle } from 'lucide-react';
import { requestsApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatRelativeTime } from '@/lib/utils';

export default function RequestsPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsApi.list(),
    select: (result) => result.requests,
  });

  const createRequest = useMutation({
    mutationFn: (body: { title: string; description?: string }) => requestsApi.create(body),
    onSuccess: () => {
      setTitle('');
      setDescription('');
      showSuccessToast('Request sent!', 'Your family can review it from their dashboard.');
      void qc.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not send your request.');
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    createRequest.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="px-4 py-4">
      <PageHeader title="Requests" subtitle="Ask your family for help or permission." />

      <form onSubmit={onSubmit} className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <PlusCircle size={16} />
          New request
        </p>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="What would you like to request?"
          maxLength={120}
          required
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full min-h-20 rounded-xl border border-gray-200 px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Optional details"
          maxLength={400}
        />
        <button
          type="submit"
          disabled={createRequest.isPending || !title.trim()}
          className="w-full py-2.5 rounded-xl text-white font-semibold disabled:opacity-50"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          {createRequest.isPending ? 'Sending...' : 'Send Request'}
        </button>
      </form>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
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
          <p className="text-sm text-red-700 mb-3">Could not load requests.</p>
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
          icon={<HelpCircle className="w-12 h-12 text-brand-primary" />}
          title="No requests yet"
          description="Your sent requests will show up here."
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800">{request.title}</p>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
                  {request.status}
                </span>
              </div>
              {request.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{request.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(request.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
