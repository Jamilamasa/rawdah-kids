'use client';
import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRAYER_QUESTIONS = [
  {
    q: 'How many rakats does Fajr prayer have?',
    a: '2',
    opts: ['2', '3', '4', '5'],
  },
  {
    q: 'How many rakats does Dhuhr prayer have?',
    a: '4',
    opts: ['2', '3', '4', '6'],
  },
  {
    q: 'How many rakats does Asr prayer have?',
    a: '4',
    opts: ['2', '4', '3', '6'],
  },
  {
    q: 'How many rakats does Maghrib prayer have?',
    a: '3',
    opts: ['2', '3', '4', '5'],
  },
  {
    q: 'How many rakats does Isha prayer have?',
    a: '4',
    opts: ['2', '3', '4', '6'],
  },
  {
    q: 'Which prayer is performed at dawn (before sunrise)?',
    a: 'Fajr',
    opts: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib'],
  },
  {
    q: 'Which prayer is performed just after sunset?',
    a: 'Maghrib',
    opts: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib'],
  },
  {
    q: 'How many obligatory prayers are there in Islam?',
    a: '5',
    opts: ['3', '4', '5', '6'],
  },
  {
    q: 'What is the name of the prayer performed on Friday?',
    a: 'Jumu\'ah',
    opts: ['Jumu\'ah', 'Tarawih', 'Tahajjud', 'Witr'],
  },
  {
    q: 'Which direction do Muslims face when praying?',
    a: 'Qibla (Makkah)',
    opts: ['Qibla (Makkah)', 'Jerusalem', 'Madinah', 'North'],
  },
];

const PrayerQuiz = memo(function PrayerQuiz({ onComplete }: { onComplete?: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const q = PRAYER_QUESTIONS[qIndex];

  const handleSelect = useCallback(
    (opt: string) => {
      if (selected) return;
      setSelected(opt);
      if (opt === q.a) setScore((s) => s + 1);
      setTimeout(() => {
        if (qIndex + 1 >= PRAYER_QUESTIONS.length) {
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
        <h2 className="text-2xl font-bold text-gray-800">Prayer Quiz Done!</h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-4xl font-bold mb-1" style={{ color: 'hsl(var(--primary))' }}>
            {score}/{PRAYER_QUESTIONS.length}
          </p>
          <p className="text-gray-500">correct answers!</p>
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
        <span>Question {qIndex + 1}/{PRAYER_QUESTIONS.length}</span>
        <span className="font-bold" style={{ color: 'hsl(var(--primary))' }}>Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm text-center">
            <div className="text-3xl mb-3">🕌</div>
            <p className="text-base font-semibold text-gray-800">{q.q}</p>
          </div>

          <div className="space-y-2.5">
            {q.opts.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = opt === q.a;
              const showResult = selected !== null;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={selected !== null}
                  className={`w-full py-3.5 px-4 rounded-xl text-sm font-medium transition-all text-left ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-100 border-2 border-green-500 text-green-800'
                        : isSelected
                        ? 'bg-red-100 border-2 border-red-400 text-red-700'
                        : 'bg-gray-50 text-gray-400'
                      : 'bg-white shadow-sm text-gray-700 active:scale-98'
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

export default PrayerQuiz;
