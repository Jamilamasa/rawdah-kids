'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useGames } from '@/hooks/useGames';
import { GameCard } from '@/components/games/GameCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import type { AvailableGame } from '@/types';
import { GAME_META } from '@/components/games/meta';

type GameFilter = 'all' | 'islamic' | 'general';

const FILTERS: Array<{ id: GameFilter; label: string }> = [
  { id: 'all', label: 'All Games' },
  { id: 'islamic', label: 'Islamic' },
  { id: 'general', label: 'General' },
];

function toFallbackGames(): AvailableGame[] {
  return GAME_META.map((game) => ({
    id: game.slug,
    name: game.name,
    description: game.description,
    type: game.type,
    icon: game.icon,
  }));
}

function GamesGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl p-4 animate-pulse h-40">
          <div className="h-8 w-8 rounded-lg bg-gray-200 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-full mb-1" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function GamesHub() {
  const router = useRouter();
  const [filter, setFilter] = useState<GameFilter>('all');
  const { data, isLoading, isError, refetch } = useGames();

  const games = useMemo<AvailableGame[]>(() => {
    if (!data || data.length === 0) return toFallbackGames();
    return data.map((game) => {
      const fallback = GAME_META.find((item) => item.slug === game.id);
      return {
        ...game,
        icon: game.icon || fallback?.icon || '🎮',
        description: game.description || fallback?.description || 'Fun game',
      };
    });
  }, [data]);

  const filteredGames = useMemo(() => {
    if (filter === 'all') return games;
    return games.filter((game) => game.type === filter);
  }, [filter, games]);

  return (
    <div className="px-4 py-4">
      <PageHeader
        title="Games"
        subtitle="Learn, play, and grow your skills."
        action={
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors"
            aria-label="Refresh games"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        }
      />

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
        {FILTERS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              filter === tab.id ? 'text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
            style={filter === tab.id ? { backgroundColor: 'hsl(var(--primary))' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <GamesGridSkeleton />}

      {isError && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 mb-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-amber-800 text-sm font-semibold">Could not refresh live games</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Showing available games from local fallback.
            </p>
          </div>
        </div>
      )}

      {!isLoading && filteredGames.length === 0 && (
        <EmptyState
          icon={<Sparkles className="w-12 h-12 text-brand-primary" />}
          title="No games here yet"
          description="Try another category to find your next challenge."
        />
      )}

      {!isLoading && filteredGames.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {filteredGames.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              onPlay={(selected) => router.push(`/games/${selected.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
