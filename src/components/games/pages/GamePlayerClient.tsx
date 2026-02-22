'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useGames } from '@/hooks/useGames';
import { GameShell } from '@/components/games/GameShell';
import { GAME_BY_SLUG } from '@/components/games/registry';
import { GAME_META_BY_SLUG } from '@/components/games/meta';
import type { AvailableGame } from '@/types';

export function GamePlayerClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { data, isLoading } = useGames();

  const game = useMemo<AvailableGame | null>(() => {
    const fromApi = data?.find((item) => item.id === slug);
    const fromMeta = GAME_META_BY_SLUG[slug];

    if (!fromApi && !fromMeta) return null;

    return {
      id: slug,
      name: fromApi?.name ?? fromMeta?.name ?? 'Game',
      description: fromApi?.description ?? fromMeta?.description ?? 'Game',
      icon: fromApi?.icon ?? fromMeta?.icon ?? '🎮',
      type: fromApi?.type ?? fromMeta?.type ?? 'general',
    };
  }, [data, slug]);

  const gameMeta = GAME_BY_SLUG[slug];

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-brand-light border-t-brand-primary animate-spin" />
          <p className="text-sm text-brand-dark font-semibold">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game || !gameMeta) {
    return (
      <div className="px-4 py-8 flex flex-col items-center gap-3 text-center">
        <AlertTriangle size={40} className="text-red-400" />
        <p className="text-gray-800 font-semibold">Game not found</p>
        <p className="text-gray-500 text-sm">This game is not available right now.</p>
        <Link
          href="/games"
          className="inline-flex items-center gap-1 text-sm font-semibold mt-2"
          style={{ color: 'hsl(var(--primary))' }}
        >
          <ArrowLeft size={16} /> Back to games
        </Link>
      </div>
    );
  }

  return (
    <GameShell
      game={game}
      GameComponent={gameMeta.component}
      onClose={() => router.push('/games')}
    />
  );
}
