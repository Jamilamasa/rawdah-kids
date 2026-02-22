'use client';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

const PROMPTS = [
  'Bismillah before every good action.',
  'Prayer gives peace to the heart.',
  'Speak kindly to your parents and siblings.',
  'Allah loves those who are patient.',
  'Say Alhamdulillah for every blessing.',
];

const GAME_SECONDS = 45;

const TypingSpeed = memo(function TypingSpeed({ onComplete }: { onComplete?: () => void }) {
  const [prompt, setPrompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [finished, onComplete, started, timeLeft]);

  const correctChars = useMemo(() => {
    let count = 0;
    for (let i = 0; i < typed.length; i += 1) {
      if (typed[i] === prompt[i]) count += 1;
    }
    return count;
  }, [prompt, typed]);

  const wordsTyped = useMemo(() => typed.trim().split(/\s+/).filter(Boolean).length, [typed]);
  const elapsedSeconds = GAME_SECONDS - timeLeft;

  const accuracy = useMemo(() => {
    if (typed.length === 0) return 100;
    return Math.max(0, Math.round((correctChars / typed.length) * 100));
  }, [correctChars, typed.length]);

  const wpm = useMemo(() => {
    if (elapsedSeconds <= 0) return 0;
    return Math.round((wordsTyped / elapsedSeconds) * 60);
  }, [elapsedSeconds, wordsTyped]);

  const handleChange = useCallback(
    (value: string) => {
      if (finished) return;
      if (!started) setStarted(true);
      setTyped(value);
      if (value.length >= prompt.length) {
        setFinished(true);
        onComplete?.();
      }
    },
    [finished, onComplete, prompt.length, started]
  );

  const restart = useCallback(() => {
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    setTyped('');
    setTimeLeft(GAME_SECONDS);
    setStarted(false);
    setFinished(false);
  }, []);

  if (finished) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{wpm >= 25 ? '⌨️' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-800">Typing Complete!</h2>
          <p className="text-sm text-gray-500 mt-1">Great focus and effort.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-800">{wpm}</p>
            <p className="text-xs text-gray-500">WPM</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-800">{accuracy}%</p>
            <p className="text-xs text-gray-500">Accuracy</p>
          </div>
        </div>
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
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
        <span>Type the sentence below</span>
        <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
        <p className="text-gray-800 leading-relaxed">{prompt}</p>
      </div>

      <textarea
        value={typed}
        onChange={(event) => handleChange(event.target.value)}
        className="w-full min-h-40 rounded-2xl border border-gray-200 p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Start typing here..."
        spellCheck={false}
      />

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-gray-800">{wpm}</p>
          <p className="text-xs text-gray-500">WPM</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-gray-800">{accuracy}%</p>
          <p className="text-xs text-gray-500">Accuracy</p>
        </div>
      </div>
    </div>
  );
});

export default TypingSpeed;
