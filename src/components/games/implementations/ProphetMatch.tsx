'use client';
import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PROPHET_CLUES = [
  { prophet: 'Adam', clue: 'The first human and first prophet, created from clay.', emoji: '🌿' },
  { prophet: 'Nuh (Noah)', clue: 'Built a great ark and survived the great flood.', emoji: '🚢' },
  { prophet: 'Ibrahim (Abraham)', clue: 'Known as "Friend of Allah", survived fire unharmed.', emoji: '🔥' },
  { prophet: 'Ismail (Ishmael)', clue: 'Helped his father build the Kaaba in Makkah.', emoji: '🕋' },
  { prophet: 'Musa (Moses)', clue: 'Split the sea and received the Torah on Mount Sinai.', emoji: '📜' },
  { prophet: 'Dawud (David)', clue: 'Defeated Goliath and received the Psalms (Zabur).', emoji: '🎵' },
  { prophet: 'Sulayman (Solomon)', clue: 'Could speak to animals and commanded the wind.', emoji: '🦅' },
  { prophet: 'Yusuf (Joseph)', clue: 'Thrown in a well by his brothers, became a ruler in Egypt.', emoji: '👑' },
  { prophet: 'Isa (Jesus)', clue: 'Born miraculously to Maryam, raised the dead by Allah\'s will.', emoji: '✨' },
  { prophet: 'Muhammad ﷺ', clue: 'The last and final prophet, received the Quran.', emoji: '🌙' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const TOTAL = 10;

const ProphetMatch = memo(function ProphetMatch({ onComplete }: { onComplete?: () => void }) {
  const [questions] = useState(() => {
    const shuffled = shuffle(PROPHET_CLUES).slice(0, TOTAL);
    return shuffled.map((item) => {
      const others = shuffle(PROPHET_CLUES.filter((p) => p.prophet !== item.prophet))
        .slice(0, 3)
        .map((p) => p.prophet);
      const options = shuffle([item.prophet, ...others]);
      return { ...item, options };
    });
  });

  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const q = questions[qIndex];

  const handleSelect = useCallback(
    (opt: string) => {
      if (selected) return;
      setSelected(opt);
      if (opt === q.prophet) setScore((s) => s + 1);
      setTimeout(() => {
        if (qIndex + 1 >= TOTAL) {
          setGameOver(true);
          onComplete?.();
        } else {
          setQIndex((i) => i + 1);
          setSelected(null);
        }
      }, 900);
    },
    [selected, q, qIndex, onComplete]
  );

  const restart = () => {
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4 text-center min-h-[400px]">
        <div className="text-5xl">{score >= 8 ? '🌟' : score >= 6 ? '⭐' : '💪'}</div>
        <h2 className="text-2xl font-bold text-gray-800">Prophet Match Complete!</h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-4xl font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>
            {score}/{TOTAL}
          </p>
          <p className="text-gray-500">Prophets identified correctly!</p>
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
    <div className="p-4 max-w-sm mx-auto">
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>Question {qIndex + 1}/{TOTAL}</span>
        <span className="font-bold text-green-600">Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="rounded-2xl p-5 mb-4 shadow-sm text-center"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
            }}
          >
            <div className="text-4xl mb-2">{q.emoji}</div>
            <p className="text-white font-medium leading-relaxed text-sm">{q.clue}</p>
            <p className="text-white/70 text-xs mt-2">Which prophet is this?</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {q.options.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = opt === q.prophet;
              const showResult = selected !== null;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={selected !== null}
                  className={`py-3.5 px-2 rounded-xl text-sm font-semibold transition-all ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-100 border-2 border-green-500 text-green-800'
                        : isSelected
                        ? 'bg-red-100 border-2 border-red-400 text-red-700'
                        : 'bg-gray-50 text-gray-400'
                      : 'bg-white shadow-sm text-gray-800 active:scale-95'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default ProphetMatch;
