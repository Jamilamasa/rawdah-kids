'use client';
import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, CheckCircle, XCircle } from 'lucide-react';

const ALL_PROPHETS = [
  { id: 1, name: 'Adam', emoji: '🌿', era: 'Beginning of time' },
  { id: 2, name: 'Nuh (Noah)', emoji: '🚢', era: 'Great Flood era' },
  { id: 3, name: 'Ibrahim (Abraham)', emoji: '🏛️', era: '~2000 BCE' },
  { id: 4, name: 'Musa (Moses)', emoji: '📜', era: '~1300 BCE' },
  { id: 5, name: 'Dawud (David)', emoji: '🎵', era: '~1000 BCE' },
  { id: 6, name: 'Sulayman (Solomon)', emoji: '💎', era: '~970 BCE' },
  { id: 7, name: 'Isa (Jesus)', emoji: '✨', era: '~0 BCE' },
  { id: 8, name: 'Muhammad ﷺ', emoji: '🌙', era: '~570 CE' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pick5(): typeof ALL_PROPHETS {
  return shuffle(ALL_PROPHETS).slice(0, 5).sort((a, b) => a.id - b.id);
}

const ProphetsTimeline = memo(function ProphetsTimeline({ onComplete }: { onComplete?: () => void }) {
  const [correct] = useState(() => pick5());
  const [order, setOrder] = useState(() => shuffle(correct));
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx: number) => {
    if (idx === order.length - 1) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const handleSubmit = () => {
    let c = 0;
    order.forEach((p, idx) => {
      if (p.id === correct[idx].id) c++;
    });
    setCorrectCount(c);
    setSubmitted(true);
    onComplete?.();
  };

  const restart = () => {
    const newCorrect = pick5();
    setOrder(shuffle(newCorrect));
    setSubmitted(false);
    setCorrectCount(0);
  };

  if (submitted) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{correctCount >= 4 ? '🌟' : correctCount >= 3 ? '⭐' : '💪'}</div>
          <h2 className="text-xl font-bold text-gray-800">
            {correctCount}/5 in correct order!
          </h2>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-blue-700 mb-2">Correct Order:</p>
          {correct.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2 py-1">
              {order[idx]?.id === p.id ? (
                <CheckCircle size={14} className="text-green-500" />
              ) : (
                <XCircle size={14} className="text-red-400" />
              )}
              <span className="text-sm text-gray-700">
                {idx + 1}. {p.emoji} {p.name} ({p.era})
              </span>
            </div>
          ))}
        </div>
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
      <div className="bg-amber-50 rounded-xl p-3 mb-4 text-center">
        <p className="text-sm text-amber-700 font-medium">
          Arrange these 5 Prophets from earliest to most recent!
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {order.map((prophet, idx) => (
          <motion.div
            key={prophet.id}
            layout
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 bg-white rounded-xl p-3.5 shadow-sm"
          >
            <span className="text-gray-400 font-bold text-sm w-4">{idx + 1}.</span>
            <span className="text-xl">{prophet.emoji}</span>
            <span className="flex-1 text-sm font-semibold text-gray-800">{prophet.name}</span>
            <div className="flex gap-1">
              <button
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
              >
                <ArrowUp size={14} className="text-gray-500" />
              </button>
              <button
                onClick={() => moveDown(idx)}
                disabled={idx === order.length - 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
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
        Submit Order
      </button>
    </div>
  );
});

export default ProphetsTimeline;
