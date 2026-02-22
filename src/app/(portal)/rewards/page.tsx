'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Gift, RefreshCw } from 'lucide-react';
import { useDueRewards, useDueRewardSummary } from '@/hooks/useDueRewards';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, formatDate, getTaskStatusColor, getTaskStatusLabel } from '@/lib/utils';

type RewardFilter = 'all' | 'reward_requested' | 'reward_approved';

const filters: { id: RewardFilter; label: string }[] = [
  { id: 'all', label: 'All Due' },
  { id: 'reward_requested', label: 'Waiting' },
  { id: 'reward_approved', label: 'Approved' },
];

function DueRewardsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="h-5 w-2/3 rounded-xl bg-gray-200" />
            <div className="h-5 w-20 rounded-full bg-gray-200" />
          </div>
          <div className="mb-2 h-4 w-1/2 rounded-xl bg-gray-100" />
          <div className="h-4 w-1/3 rounded-xl bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default function RewardsPage() {
  const [filter, setFilter] = useState<RewardFilter>('all');

  const statusFilter = filter === 'all' ? undefined : filter;
  const dueRewardsQuery = useDueRewards(statusFilter);
  const summary = useDueRewardSummary(dueRewardsQuery.data);

  const rewards = useMemo(() => {
    return [...(dueRewardsQuery.data ?? [])].sort((a, b) => {
      const left = a.task_completed_at ?? a.task_created_at;
      const right = b.task_completed_at ?? b.task_created_at;
      return new Date(right).getTime() - new Date(left).getTime();
    });
  }, [dueRewardsQuery.data]);

  const formatValue = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="px-4 py-4 space-y-4">
      <PageHeader
        title="My Rewards"
        subtitle="See rewards that are waiting and approved for you."
        action={
          <button
            onClick={() => dueRewardsQuery.refetch()}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors"
            aria-label="Refresh rewards"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/60 bg-white/90 p-3 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Due rewards</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/90 p-3 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Reward value</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{formatValue(summary.totalValue)}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {filters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              'flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all',
              filter === item.id ? 'text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
            style={filter === item.id ? { backgroundColor: 'hsl(var(--primary))' } : undefined}
          >
            {item.label}
          </button>
        ))}
      </div>

      {dueRewardsQuery.isLoading && <DueRewardsSkeleton />}

      {dueRewardsQuery.isError && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertTriangle size={32} className="text-red-400" />
          <p className="text-gray-600">Could not load your rewards right now.</p>
          <button
            onClick={() => dueRewardsQuery.refetch()}
            className="px-4 py-2 rounded-xl text-white font-medium text-sm"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            Retry
          </button>
        </div>
      )}

      {!dueRewardsQuery.isLoading && !dueRewardsQuery.isError && rewards.length === 0 && (
        <EmptyState
          icon="🎁"
          title="No due rewards yet"
          description="Finish tasks and request rewards to see them here."
        />
      )}

      {!dueRewardsQuery.isLoading && !dueRewardsQuery.isError && rewards.length > 0 && (
        <div className="space-y-3">
          {rewards.map((reward) => (
            <div key={reward.task_id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-xl bg-gray-100 text-lg">
                    {reward.reward_icon ?? '🎁'}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">{reward.reward_title}</h3>
                    <p className="text-xs text-gray-500">From task: {reward.task_title}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    getTaskStatusColor(reward.task_status)
                  )}
                >
                  {getTaskStatusLabel(reward.task_status)}
                </span>
              </div>

              {reward.reward_description ? (
                <p className="mb-2 text-sm text-gray-600">{reward.reward_description}</p>
              ) : null}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Gift size={12} /> Value: {formatValue(reward.reward_value)}
                </span>
                <span className="inline-flex items-center gap-1">
                  {reward.task_status === 'reward_requested' ? <Clock3 size={12} /> : <CheckCircle2 size={12} />}
                  {reward.task_completed_at
                    ? `Completed ${formatDate(reward.task_completed_at)}`
                    : `Assigned ${formatDate(reward.task_created_at)}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
