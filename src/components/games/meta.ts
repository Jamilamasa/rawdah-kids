export interface GameMetaItem {
  slug: string;
  name: string;
  description: string;
  type: 'islamic' | 'general';
  icon: string;
}

export const GAME_META: GameMetaItem[] = [
  {
    slug: 'names-match',
    name: '99 Names',
    description: 'Match the beautiful names and meanings.',
    type: 'islamic',
    icon: '✨',
  },
  {
    slug: 'wudu-steps',
    name: 'Wudu Steps',
    description: 'Arrange wudu in the right order.',
    type: 'islamic',
    icon: '💧',
  },
  {
    slug: 'prophet-match',
    name: 'Prophet Match',
    description: 'Match each prophet with key clues.',
    type: 'islamic',
    icon: '🌟',
  },
  {
    slug: 'prophets-timeline',
    name: 'Prophets Timeline',
    description: 'Put prophets in historical order.',
    type: 'islamic',
    icon: '📅',
  },
  {
    slug: 'prayer-quiz',
    name: 'Prayer Quiz',
    description: 'Test your salah knowledge.',
    type: 'islamic',
    icon: '🕌',
  },
  {
    slug: 'arabic-letters',
    name: 'Arabic Letters',
    description: 'Identify Arabic letters quickly.',
    type: 'islamic',
    icon: '🔤',
  },
  {
    slug: 'memory-match',
    name: 'Memory Match',
    description: 'Find matching cards before time runs out.',
    type: 'general',
    icon: '🃏',
  },
  {
    slug: 'maths-challenge',
    name: 'Maths Challenge',
    description: 'Solve quick math rounds.',
    type: 'general',
    icon: '🔢',
  },
  {
    slug: 'typing-speed',
    name: 'Typing Speed',
    description: 'Build focus and typing speed.',
    type: 'general',
    icon: '⌨️',
  },
  {
    slug: 'colour-pattern',
    name: 'Colour Pattern',
    description: 'Remember and repeat color patterns.',
    type: 'general',
    icon: '🎨',
  },
];

export const GAME_META_BY_SLUG = GAME_META.reduce<Record<string, GameMetaItem>>((acc, game) => {
  acc[game.slug] = game;
  return acc;
}, {});
