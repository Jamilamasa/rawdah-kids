'use client';
import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowUp, ArrowDown } from 'lucide-react';

const CORRECT_STEPS = [
  { id: 1, text: '1. Intention (Niyyah)', emoji: '🤲' },
  { id: 2, text: '2. Wash hands 3 times', emoji: '🙌' },
  { id: 3, text: '3. Rinse mouth 3 times', emoji: '💧' },
  { id: 4, text: '4. Clean nose 3 times', emoji: '👃' },
  { id: 5, text: '5. Wash face 3 times', emoji: '😊' },
  { id: 6, text: '6. Wash arms to elbows 3 times', emoji: '💪' },
  { id: 7, text: '7. Wipe head once', emoji: '🙂' },
  { id: 8, text: '8. Wipe ears once', emoji: '👂' },
  { id: 9, text: '9. Wash feet to ankles 3 times', emoji: '🦶' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const WuduSteps = memo(function WuduSteps({ onComplete }: { onComplete?: () => void }) {
  const [steps, setSteps] = useState(() => shuffle(CORRECT_STEPS));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setSteps((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx: number) => {
    if (idx === steps.length - 1) return;
    setSteps((prev) => {
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    steps.forEach((step, idx) => {
      if (step.id === CORRECT_STEPS[idx].id) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    onComplete?.();
  };

  const restart = () => {
    setSteps(shuffle(CORRECT_STEPS));
    setSubmitted(false);
    setScore(0);
  };

  if (submitted) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{score >= 7 ? '🌟' : score >= 5 ? '👍' : '💪'}</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {score}/{CORRECT_STEPS.length} Steps Correct!
          </h2>
        </div>
        <div className="space-y-2 mb-4">
          {steps.map((step, idx) => {
            const isCorrect = step.id === CORRECT_STEPS[idx].id;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-400 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-gray-700">{step.emoji} {step.text}</span>
              </div>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 text-center mb-4">
          The correct order is shown in the Quran and Sunnah. Keep practicing!
        </p>
        <button
          onClick={restart}
          className="w-full py-3 rounded-xl text-white font-bold"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-blue-50 rounded-xl p-3 mb-4 text-center">
        <p className="text-sm text-blue-700 font-medium">
          Arrange the Wudu steps in the correct order!
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            layout
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm"
          >
            <span className="text-gray-400 font-bold text-sm w-6 text-center">{idx + 1}.</span>
            <span className="text-lg">{step.emoji}</span>
            <span className="flex-1 text-sm text-gray-700 font-medium">
              {step.text.replace(/^\d+\.\s/, '')}
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                aria-label="Move up"
              >
                <ArrowUp size={14} className="text-gray-500" />
              </button>
              <button
                onClick={() => moveDown(idx)}
                disabled={idx === steps.length - 1}
                className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                aria-label="Move down"
              >
                <ArrowDown size={14} className="text-gray-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-xl text-white font-bold"
        style={{ backgroundColor: 'hsl(var(--primary))' }}
      >
        Check My Order!
      </button>
    </div>
  );
});

export default WuduSteps;
