'use client';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

type ColorKey = 'red' | 'blue' | 'green' | 'yellow';

const COLORS: Array<{ key: ColorKey; label: string; className: string; activeClass: string }> = [
  { key: 'red', label: 'Red', className: 'bg-red-400', activeClass: 'bg-red-500' },
  { key: 'blue', label: 'Blue', className: 'bg-blue-400', activeClass: 'bg-blue-500' },
  { key: 'green', label: 'Green', className: 'bg-green-400', activeClass: 'bg-green-500' },
  { key: 'yellow', label: 'Yellow', className: 'bg-yellow-400', activeClass: 'bg-yellow-500' },
];

const TARGET_LEVEL = 8;

const ColourPattern = memo(function ColourPattern({ onComplete }: { onComplete?: () => void }) {
  const [sequence, setSequence] = useState<ColorKey[]>([]);
  const [userInput, setUserInput] = useState<ColorKey[]>([]);
  const [level, setLevel] = useState(1);
  const [showingPattern, setShowingPattern] = useState(true);
  const [activeColor, setActiveColor] = useState<ColorKey | null>(null);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const addStep = useCallback(() => {
    const next = COLORS[Math.floor(Math.random() * COLORS.length)].key;
    setSequence((prev) => [...prev, next]);
    setUserInput([]);
    setShowingPattern(true);
  }, []);

  useEffect(() => {
    addStep();
  }, [addStep]);

  useEffect(() => {
    if (!showingPattern || sequence.length === 0 || status !== 'playing') return;

    let index = 0;
    const interval = setInterval(() => {
      setActiveColor(sequence[index]);
      setTimeout(() => setActiveColor(null), 350);
      index += 1;
      if (index >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => setShowingPattern(false), 450);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [sequence, showingPattern, status]);

  const handleColorClick = useCallback(
    (color: ColorKey) => {
      if (showingPattern || status !== 'playing') return;
      const nextInput = [...userInput, color];
      setUserInput(nextInput);

      const expected = sequence[nextInput.length - 1];
      if (color !== expected) {
        setStatus('lost');
        onComplete?.();
        return;
      }

      if (nextInput.length === sequence.length) {
        if (level >= TARGET_LEVEL) {
          setStatus('won');
          onComplete?.();
          return;
        }
        setLevel((prev) => prev + 1);
        addStep();
      }
    },
    [addStep, level, onComplete, sequence, showingPattern, status, userInput]
  );

  const restart = useCallback(() => {
    setSequence([]);
    setUserInput([]);
    setLevel(1);
    setShowingPattern(true);
    setActiveColor(null);
    setStatus('playing');
    setTimeout(addStep, 50);
  }, [addStep]);

  const helperText = useMemo(() => {
    if (showingPattern) return 'Watch carefully...';
    return 'Now repeat the pattern';
  }, [showingPattern]);

  if (status === 'won' || status === 'lost') {
    const won = status === 'won';
    return (
      <div className="p-4 max-w-sm mx-auto text-center">
        <div className="text-5xl mb-2">{won ? '🎨' : '💪'}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {won ? 'Amazing Memory!' : 'Nice Try!'}
        </h2>
        <p className="text-gray-500 mb-4">
          {won
            ? `You completed all ${TARGET_LEVEL} levels.`
            : `You reached level ${level}. Keep practicing!`}
        </p>
        <button
          onClick={restart}
          className="w-full py-3 rounded-xl text-white font-bold"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700">Level {level}</p>
        <p className="text-sm text-gray-500">{helperText}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {COLORS.map((color) => {
          const isActive = activeColor === color.key;
          return (
            <button
              key={color.key}
              onClick={() => handleColorClick(color.key)}
              disabled={showingPattern}
              className={`h-28 rounded-2xl text-white font-bold shadow-sm transition-all ${
                isActive ? `${color.activeClass} scale-95` : color.className
              } ${showingPattern ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
            >
              {color.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default ColourPattern;
