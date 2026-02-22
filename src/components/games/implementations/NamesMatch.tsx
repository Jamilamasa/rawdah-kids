'use client';
import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAMES_DATA = [
  { name: 'Ar-Rahman', meaning: 'The Most Gracious' },
  { name: 'Ar-Rahim', meaning: 'The Most Merciful' },
  { name: 'Al-Malik', meaning: 'The King' },
  { name: 'Al-Quddus', meaning: 'The Holy' },
  { name: 'As-Salam', meaning: 'The Source of Peace' },
  { name: 'Al-Aziz', meaning: 'The Almighty' },
  { name: 'Al-Ghaffar', meaning: 'The Forgiving' },
  { name: 'Al-Karim', meaning: 'The Generous' },
  { name: 'Al-Basir', meaning: 'The All-Seeing' },
  { name: 'Al-Hakeem', meaning: 'The Wise' },
  { name: 'Al-Wadud', meaning: 'The Loving' },
  { name: 'As-Sabur', meaning: 'The Patient' },
  { name: 'Al-Khaliq', meaning: 'The Creator' },
  { name: 'Al-Alim', meaning: 'The All-Knowing' },
  { name: 'Al-Qadir', meaning: 'The All-Powerful' },
  { name: 'Al-Mumin', meaning: 'The Guardian of Faith' },
  { name: 'Al-Hayy', meaning: 'The Ever-Living' },
  { name: 'An-Nur', meaning: 'The Light' },
  { name: 'Al-Hadi', meaning: 'The Guide' },
  { name: 'Ar-Razzaq', meaning: 'The Provider' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Question {
  name: string;
  correct: string;
  options: string[];
}

function generateQuestions(count = 10): Question[] {
  const shuffled = shuffle(NAMES_DATA).slice(0, count);
  return shuffled.map((item) => {
    const wrong = shuffle(NAMES_DATA.filter((n) => n.name !== item.name))
      .slice(0, 3)
      .map((n) => n.meaning);
    const options = shuffle([item.meaning, ...wrong]);
    return { name: item.name, correct: item.meaning, options };
  });
}

const TOTAL = 10;

const NamesMatch = memo(function NamesMatch({ onComplete }: { onComplete?: () => void }) {
  const [questions] = useState<Question[]>(() => generateQuestions(TOTAL));
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const question = questions[qIndex];

  const handleSelect = useCallback(
    (opt: string) => {
      if (selected) return;
      setSelected(opt);
      if (opt === question.correct) setScore((s) => s + 1);
      setTimeout(() => {
        if (qIndex + 1 >= TOTAL) {
          setGameOver(true);
          onComplete?.();
        } else {
          setQIndex((q) => q + 1);
          setSelected(null);
        }
      }, 900);
    },
    [selected, question, qIndex, onComplete]
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
        <h2 className="text-2xl font-bold text-gray-800">Great job!</h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-4xl font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>
            {score}/{TOTAL}
          </p>
          <p className="text-gray-500">Names of Allah matched!</p>
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="rounded-2xl p-6 text-center mb-4 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
            }}
          >
            <p className="text-white/70 text-sm mb-1">What does this name mean?</p>
            <p className="text-white font-bold text-2xl">{question.name}</p>
          </div>

          <div className="space-y-2.5">
            {question.options.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = opt === question.correct;
              const showResult = selected !== null;

              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={selected !== null}
                  className={`w-full py-3.5 px-4 rounded-xl text-sm font-medium text-left transition-all ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-100 border-2 border-green-500 text-green-800'
                        : isSelected
                        ? 'bg-red-100 border-2 border-red-400 text-red-700'
                        : 'bg-gray-50 text-gray-400'
                      : 'bg-white shadow-sm text-gray-700 active:scale-98 border-2 border-transparent'
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

export default NamesMatch;
