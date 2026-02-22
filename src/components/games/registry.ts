'use client';
import type { ComponentType } from 'react';
import NamesMatch from './implementations/NamesMatch';
import WuduSteps from './implementations/WuduSteps';
import ProphetMatch from './implementations/ProphetMatch';
import ProphetsTimeline from './implementations/ProphetsTimeline';
import PrayerQuiz from './implementations/PrayerQuiz';
import ArabicLetters from './implementations/ArabicLetters';
import MemoryMatch from './implementations/MemoryMatch';
import MathsChallenge from './implementations/MathsChallenge';
import TypingSpeed from './implementations/TypingSpeed';
import ColourPattern from './implementations/ColourPattern';
import { GAME_META } from './meta';

export interface GameProps {
  onComplete?: () => void;
}

export interface GameMeta {
  slug: string;
  name: string;
  description: string;
  type: 'islamic' | 'general';
  icon: string;
  component: ComponentType<GameProps>;
}

const GAME_COMPONENTS: Record<string, ComponentType<GameProps>> = {
  'names-match': NamesMatch,
  'wudu-steps': WuduSteps,
  'prophet-match': ProphetMatch,
  'prophets-timeline': ProphetsTimeline,
  'prayer-quiz': PrayerQuiz,
  'arabic-letters': ArabicLetters,
  'memory-match': MemoryMatch,
  'maths-challenge': MathsChallenge,
  'typing-speed': TypingSpeed,
  'colour-pattern': ColourPattern,
};

export const GAMES: GameMeta[] = GAME_META.map((meta) => ({
  ...meta,
  component: GAME_COMPONENTS[meta.slug]!,
}));

export const GAME_BY_SLUG = GAMES.reduce<Record<string, GameMeta>>((acc, game) => {
  acc[game.slug] = game;
  return acc;
}, {});
