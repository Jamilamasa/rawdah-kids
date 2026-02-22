'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import type { DueReward } from '@/types';

export function useDueRewards(status?: 'reward_requested' | 'reward_approved') {
  return useQuery({
    queryKey: ['due-rewards', status ?? 'all'],
    queryFn: () => tasksApi.dueRewards({ status }),
    select: (data) => data.due_rewards,
  });
}

export function useDueRewardSummary(items?: DueReward[]) {
  return useMemo(() => {
    const rewards = items ?? [];
    return rewards.reduce(
      (acc, reward) => {
        acc.total += 1;
        acc.totalValue += reward.reward_value;
        if (reward.task_status === 'reward_requested') {
          acc.awaitingApproval += 1;
        } else {
          acc.approved += 1;
        }
        return acc;
      },
      { total: 0, awaitingApproval: 0, approved: 0, totalValue: 0 }
    );
  }, [items]);
}
