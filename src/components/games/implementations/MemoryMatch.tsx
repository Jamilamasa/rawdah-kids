'use client';
import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CARD_EMOJIS = ['🌙', '⭐', '🕌', '📖', '🌿', '🌺', '🦋', '🌊'];

interface CardItem {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initCards(): CardItem[] {
  const pairs = [...CARD_EMOJIS, ...CARD_EMOJIS];
  return shuffle(pairs).map((emoji, idx) => ({
    id: idx,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));
}

interface MemoryMatchProps {
  onComplete?: () => void;
}

const MemoryMatch = memo(function MemoryMatch({ onComplete }: MemoryMatchProps) {
  const [cards, setCards] = useState<CardItem[]>(initCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, startTime]);

  const handleCardClick = useCallback(
    (id: number) => {
      if (selected.length === 2) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.isFlipped || card.isMatched) return;

      const newSelected = [...selected, id];
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
      );
      setSelected(newSelected);

      if (newSelected.length === 2) {
        setMoves((m) => m + 1);
        const [a, b] = newSelected;
        const cardA = cards.find((c) => c.id === a)!;
        const cardB = cards.find((c) => c.id === b)!;

        if (cardA.emoji === cardB.emoji) {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) => (c.id === a || c.id === b ? { ...c, isMatched: true } : c))
            );
            setSelected([]);
            setCards((prev) => {
              if (prev.every((c) => c.isMatched || c.id === a || c.id === b)) {
                // Check will happen after state update
              }
              return prev;
            });
          }, 400);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) => (c.id === a || c.id === b ? { ...c, isFlipped: false } : c))
            );
            setSelected([]);
          }, 800);
        }
      }
    },
    [cards, selected]
  );

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.isMatched)) {
      setGameOver(true);
      onComplete?.();
    }
  }, [cards, onComplete]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const restart = () => {
    setCards(initCards());
    setSelected([]);
    setMoves(0);
    setGameOver(false);
    setElapsed(0);
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4 text-center min-h-[400px]">
        <div className="text-5xl animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800">You matched them all!</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="bg-green-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{moves}</p>
            <p className="text-xs text-green-700">Moves</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{formatTime(elapsed)}</p>
            <p className="text-xs text-blue-700">Time</p>
          </div>
        </div>
        <button
          onClick={restart}
          className="px-6 py-3 rounded-xl text-white font-bold"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600 font-medium">Moves: {moves}</span>
        <span className="text-sm text-gray-600 font-medium">{formatTime(elapsed)}</span>
        <span className="text-sm text-gray-600 font-medium">
          {cards.filter((c) => c.isMatched).length / 2}/{CARD_EMOJIS.length} pairs
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-2xl text-2xl flex items-center justify-center shadow-sm transition-all ${
              card.isMatched
                ? 'bg-green-100 border-2 border-green-300'
                : card.isFlipped
                ? 'bg-white border-2 border-primary'
                : 'bg-gradient-to-br from-green-500 to-green-700 text-white border-2 border-transparent'
            }`}
            style={
              card.isFlipped && !card.isMatched
                ? { borderColor: 'hsl(var(--primary))' }
                : undefined
            }
            whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.9 } : {}}
            disabled={card.isFlipped || card.isMatched}
          >
            <AnimatePresence mode="wait">
              {card.isFlipped || card.isMatched ? (
                <motion.span
                  key="front"
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {card.emoji}
                </motion.span>
              ) : (
                <motion.span key="back" className="text-white/80 text-lg">
                  ?
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
});

export default MemoryMatch;
