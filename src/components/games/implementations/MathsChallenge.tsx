'use client';
import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  text: string;
  answer: number;
  options: number[];
}

function generateQuestion(difficulty: number): Question {
  const ops = ['+', '-', '*'];
  const op = difficulty < 4 ? ops[Math.floor(Math.random() * 2)] : ops[Math.floor(Math.random() * 3)];
  const max = difficulty < 4 ? 10 : difficulty < 7 ? 20 : 50;
  let a = Math.floor(Math.random() * max) + 1;
  let b = Math.floor(Math.random() * max) + 1;
  if (op === '-' && b > a) [a, b] = [b, a];
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const text = `${a} ${op === '*' ? '×' : op} ${b} = ?`;

  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const w = answer + (Math.floor(Math.random() * 10) - 5);
    if (w !== answer && w >= 0) wrong.add(w);
  }
  const options = [answer, ...Array.from(wrong)].sort(() => Math.random() - 0.5);
  return { text, answer, options };
}

const TOTAL = 10;
const TIME_PER_Q = 15;

const MathsChallenge = memo(function MathsChallenge({ onComplete }: { onComplete?: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [question, setQuestion] = useState<Question>(() => generateQuestion(1));
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const nextQuestion = useCallback(() => {
    if (qIndex + 1 >= TOTAL) {
      setGameOver(true);
      onComplete?.();
    } else {
      setQIndex((q) => q + 1);
      setQuestion(generateQuestion(qIndex + 2));
      setSelected(null);
      setFeedback(null);
      setTimeLeft(TIME_PER_Q);
    }
  }, [qIndex, onComplete]);

  useEffect(() => {
    if (selected !== null || gameOver) return;
    if (timeLeft <= 0) {
      setFeedback('wrong');
      const t = setTimeout(nextQuestion, 1000);
      return () => clearTimeout(t);
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, selected, gameOver, nextQuestion]);

  const handleSelect = useCallback(
    (val: number) => {
      if (selected !== null) return;
      setSelected(val);
      const correct = val === question.answer;
      setFeedback(correct ? 'correct' : 'wrong');
      if (correct) setScore((s) => s + 1);
      setTimeout(nextQuestion, 1000);
    },
    [selected, question.answer, nextQuestion]
  );

  const restart = () => {
    setQIndex(0);
    setQuestion(generateQuestion(1));
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setTimeLeft(TIME_PER_Q);
    setGameOver(false);
  };

  if (gameOver) {
    const pct = Math.round((score / TOTAL) * 100);
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4 text-center min-h-[400px]">
        <div className="text-5xl">{pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-gray-800">Maths Complete!</h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm w-full max-w-xs">
          <p className="text-4xl font-bold text-primary mb-1" style={{ color: 'hsl(var(--primary))' }}>
            {score}/{TOTAL}
          </p>
          <p className="text-gray-500">questions correct</p>
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

  const timerPct = (timeLeft / TIME_PER_Q) * 100;

  return (
    <div className="p-4 flex flex-col gap-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Question {qIndex + 1}/{TOTAL}</span>
        <span className="font-bold text-green-600">Score: {score}</span>
        <span
          className={`font-bold ${timeLeft < 5 ? 'text-red-500' : 'text-gray-600'}`}
        >
          {timeLeft}s
        </span>
      </div>

      {/* Timer bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors ${
            timeLeft < 5 ? 'bg-red-400' : 'bg-green-500'
          }`}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center mb-4">
            <p className="text-3xl font-bold text-gray-800">{question.text}</p>
          </div>

          {feedback && (
            <div
              className={`text-center py-2 rounded-xl font-bold text-lg mb-3 ${
                feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}
            >
              {feedback === 'correct' ? '✅ Correct!' : `❌ It was ${question.answer}`}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {question.options.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = opt === question.answer;
              const showResult = selected !== null;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={selected !== null}
                  className={`py-4 rounded-2xl text-xl font-bold transition-all ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : isSelected
                        ? 'bg-red-400 text-white'
                        : 'bg-gray-100 text-gray-400'
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

export default MathsChallenge;
