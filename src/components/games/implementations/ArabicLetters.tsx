'use client';
import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ARABIC_LETTERS = [
  { letter: 'ا', name: 'Alif' },
  { letter: 'ب', name: 'Ba' },
  { letter: 'ت', name: 'Ta' },
  { letter: 'ث', name: 'Tha' },
  { letter: 'ج', name: 'Jim' },
  { letter: 'ح', name: 'Ha' },
  { letter: 'خ', name: 'Kha' },
  { letter: 'د', name: 'Dal' },
  { letter: 'ذ', name: 'Dhal' },
  { letter: 'ر', name: 'Ra' },
  { letter: 'ز', name: 'Zay' },
  { letter: 'س', name: 'Sin' },
  { letter: 'ش', name: 'Shin' },
  { letter: 'ص', name: 'Sad' },
  { letter: 'ض', name: 'Dad' },
  { letter: 'ط', name: 'Ta (emphatic)' },
  { letter: 'ظ', name: 'Dha' },
  { letter: 'ع', name: 'Ain' },
  { letter: 'غ', name: 'Ghayn' },
  { letter: 'ف', name: 'Fa' },
  { letter: 'ق', name: 'Qaf' },
  { letter: 'ك', name: 'Kaf' },
  { letter: 'ل', name: 'Lam' },
  { letter: 'م', name: 'Mim' },
  { letter: 'ن', name: 'Nun' },
  { letter: 'ه', name: 'Ha (final)' },
  { letter: 'و', name: 'Waw' },
  { letter: 'ي', name: 'Ya' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Question {
  letter: string;
  correct: string;
  options: string[];
}

const TOTAL = 10;

const ArabicLetters = memo(function ArabicLetters({ onComplete }: { onComplete?: () => void }) {
  const [questions] = useState<Question[]>(() => {
    const chosen = shuffle(ARABIC_LETTERS).slice(0, TOTAL);
    return chosen.map((item) => {
      const wrong = shuffle(ARABIC_LETTERS.filter((l) => l.name !== item.name))
        .slice(0, 3)
        .map((l) => l.name);
      const options = shuffle([item.name, ...wrong]);
      return { letter: item.letter, correct: item.name, options };
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
      if (opt === q.correct) setScore((s) => s + 1);
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
        <h2 className="text-2xl font-bold text-gray-800">Arabic Letters Done!</h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-4xl font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>
            {score}/{TOTAL}
          </p>
          <p className="text-gray-500">letters identified!</p>
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
        <span>Letter {qIndex + 1}/{TOTAL}</span>
        <span className="font-bold" style={{ color: 'hsl(var(--primary))' }}>Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="rounded-2xl p-8 mb-5 shadow-sm text-center"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
            }}
          >
            <p className="text-7xl font-bold text-white mb-2" dir="rtl">
              {q.letter}
            </p>
            <p className="text-white/70 text-sm">What is the name of this letter?</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {q.options.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = opt === q.correct;
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

export default ArabicLetters;
