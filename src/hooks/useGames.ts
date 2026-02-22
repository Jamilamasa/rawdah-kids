'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { APIError, gamesApi } from '@/lib/api';
import { showApiErrorToast } from '@/lib/toast';
import { toast } from 'sonner';

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: () => gamesApi.list(),
    select: (data) => data.games,
  });
}

export function useStartGameSession() {
  return useMutation({
    mutationFn: ({ game_name, game_type }: { game_name: string; game_type: string }) =>
      gamesApi.startSession(game_name, game_type),
    onError: (error: Error) => {
      if (error instanceof APIError && error.status === 429) {
        toast.warning("⏰ Time's up for today!", {
          description: "You've reached your daily game limit. Come back tomorrow!",
        });
        return;
      }
      showApiErrorToast(error, 'Could not start the game. Please try again.');
    },
  });
}

export function useEndGameSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => gamesApi.endSession(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['games'] });
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'We could not save your game session.');
    },
  });
}
