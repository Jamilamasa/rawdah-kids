'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';
import type { AvailableGame } from '@/types';

interface GameCardProps {
  game: AvailableGame;
  onPlay: (game: AvailableGame) => void;
  index?: number;
}

export const GameCard = memo(function GameCard({ game, onPlay, index = 0 }: GameCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onPlay(game)}
      className="bg-white rounded-2xl p-4 shadow-sm text-left w-full hover:shadow-md transition-all active:scale-95 border border-gray-100"
    >
      <div className="text-3xl mb-2">{game.icon}</div>
      <h3 className="font-bold text-gray-800 text-sm mb-1 leading-tight">{game.name}</h3>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{game.description}</p>
      <div className="mt-3 inline-flex items-center gap-1">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            game.type === 'islamic'
              ? 'bg-green-100 text-green-700'
              : 'bg-purple-100 text-purple-700'
          }`}
        >
          {game.type === 'islamic' ? '🕌 Islamic' : '🎯 Fun'}
        </span>
      </div>
    </motion.button>
  );
});
