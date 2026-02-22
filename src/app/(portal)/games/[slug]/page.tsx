import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GamePlayerClient } from '@/components/games/pages/GamePlayerClient';
import { GAME_META, GAME_META_BY_SLUG } from '@/components/games/meta';

interface GamePageProps {
  params: { slug: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return GAME_META.map((game) => ({ slug: game.slug }));
}

export function generateMetadata({ params }: GamePageProps): Metadata {
  const game = GAME_META_BY_SLUG[params.slug];
  if (!game) {
    return {
      title: 'Game',
    };
  }
  return {
    title: `${game.name} | Rawdah Kids`,
    description: game.description,
  };
}

export default function GamePage({ params }: GamePageProps) {
  if (!GAME_META_BY_SLUG[params.slug]) {
    notFound();
  }
  return <GamePlayerClient slug={params.slug} />;
}
