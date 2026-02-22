'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  XCircle,
} from 'lucide-react';
import { cn, getScoreColor, getScoreEmoji } from '@/lib/utils';
import { useStartQuiz, useSubmitQuiz } from '@/hooks/useQuizzes';
import { XPPopup } from '@/components/shared/XPPopup';
import { toast } from 'sonner';
import type {
  Flashcard,
  HadithQuiz,
  ProphetQuiz,
  QuranQuiz,
  QuizAnswer,
  QuizQuestion,
  TopicQuiz,
} from '@/types';

type AnyQuiz = HadithQuiz | ProphetQuiz | QuranQuiz | TopicQuiz;

type QuizState = 'reading' | 'answering' | 'reviewing' | 'complete';

interface QuizTakerProps {
  quiz: AnyQuiz;
  type: string;
  lesson?: QuizLesson;
  flashcards?: Flashcard[];
  lessonLoading?: boolean;
}

interface AnsweredQuestion {
  questionId: string;
  selected: string;
  isCorrect: boolean;
}

export interface QuizLesson {
  title: string;
  subtitle?: string;
  primaryText?: string;
  secondaryText?: string;
  helperText?: string;
}

export function QuizTaker({
  quiz,
  type,
  lesson,
  flashcards = [],
  lessonLoading = false,
}: QuizTakerProps) {
  const router = useRouter();
  const startQuiz = useStartQuiz();
  const submitQuiz = useSubmitQuiz();

  const [quizState, setQuizState] = useState<QuizState>(() => {
    if (quiz.status === 'completed') return 'complete';
    if (quiz.status === 'pending') return 'reading';
    return 'answering';
  });

  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);
  const initialMemorizeTimer = useMemo(() => {
    if (type !== 'hadith') return 0;
    const memorizeUntil = (quiz as HadithQuiz).memorize_until;
    if (!memorizeUntil) return 0;
    const remainingSeconds = Math.floor((new Date(memorizeUntil).getTime() - Date.now()) / 1000);
    return Math.max(0, remainingSeconds);
  }, [quiz, type]);

  const [memorizeTimer, setMemorizeTimer] = useState(initialMemorizeTimer);
  const [showXP, setShowXP] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [xpEarned, setXpEarned] = useState(0);

  // If already completed, set from existing data
  useEffect(() => {
    if (quiz.status === 'completed' && quiz.score !== undefined) {
      setFinalScore(quiz.score);
    }
  }, [quiz]);

  useEffect(() => {
    setMemorizeTimer(initialMemorizeTimer);
  }, [initialMemorizeTimer]);

  useEffect(() => {
    setFlashcardIndex(0);
    setShowFlashcardBack(false);
  }, [quiz.id]);

  // Memorize timer countdown
  useEffect(() => {
    if (quizState !== 'reading') return;
    if (memorizeTimer <= 0) return;
    const interval = setInterval(() => {
      setMemorizeTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizState, memorizeTimer]);

  const questions: QuizQuestion[] = useMemo(() => quiz.questions ?? [], [quiz.questions]);
  const currentQuestion = questions[currentQ];
  const currentFlashcard = useMemo(
    () => flashcards[Math.min(flashcardIndex, Math.max(0, flashcards.length - 1))],
    [flashcardIndex, flashcards]
  );

  const handleStartAnswering = useCallback(async () => {
    if (lessonLoading) return;
    if (quiz.status === 'pending') {
      await startQuiz.mutateAsync({ type, id: quiz.id });
    }
    setQuizState('answering');
  }, [lessonLoading, quiz.status, quiz.id, type, startQuiz]);

  const handleSelectAnswer = useCallback(
    (option: string) => {
      if (selected !== null) return; // Already answered
      if (!currentQuestion) return;

      const isCorrect = option === currentQuestion.correct_answer;
      setSelected(option);
      setShowExplanation(true);
      setAnswered((prev) => [
        ...prev,
        { questionId: currentQuestion.id, selected: option, isCorrect },
      ]);
    },
    [selected, currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      // Submit quiz
      const answers: QuizAnswer[] = answered.map((a) => ({
        question_id: a.questionId,
        selected_answer: a.selected,
        is_correct: a.isCorrect,
      }));

      submitQuiz.mutate(
        { type, id: quiz.id, answers },
        {
          onSuccess: (result) => {
            const score = result.score ?? 0;
            const xp = result.xp_awarded ?? 0;
            setFinalScore(score);
            setXpEarned(xp);
            setQuizState('complete');
            setShowXP(true);
            toast.success(
              `🧠 Quiz done! You scored ${score}%! You earned ${xp} XP!`
            );
          },
        }
      );
    }
  }, [currentQ, questions.length, answered, submitQuiz, type, quiz.id]);

  const correctCount = useMemo(
    () => answered.filter((a) => a.isCorrect).length,
    [answered]
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Reading / Memorize State
  if (quizState === 'reading') {
    const showTimer = memorizeTimer > 0;
    return (
      <div className="px-4 py-6 flex flex-col min-h-[60vh]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-500 mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 text-lg">Learn First</h2>
            {showTimer ? (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full',
                  memorizeTimer < 30 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                )}
              >
                <Clock size={14} />
                {formatTime(memorizeTimer)}
              </div>
            ) : null}
          </div>

          {lessonLoading ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 size={16} className="animate-spin" />
                Loading lesson...
              </div>
            </div>
          ) : lesson ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-base font-semibold text-gray-800">{lesson.title}</p>
                {lesson.subtitle ? <p className="mt-1 text-sm text-gray-600">{lesson.subtitle}</p> : null}
              </div>

              {lesson.primaryText ? (
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-base leading-relaxed text-gray-800">{lesson.primaryText}</p>
                </div>
              ) : null}

              {lesson.secondaryText ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm leading-relaxed text-blue-800">{lesson.secondaryText}</p>
                </div>
              ) : null}

              {lesson.helperText ? (
                <p className="text-sm text-gray-500">{lesson.helperText}</p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                Read the lesson carefully, then continue to the quiz.
              </p>
            </div>
          )}

          {flashcards.length > 0 && currentFlashcard ? (
            <div className="mt-4 space-y-3 rounded-xl border border-fuchsia-100 bg-fuchsia-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-fuchsia-900">Flashcards</p>
                <p className="text-xs font-medium text-fuchsia-700">
                  {flashcardIndex + 1} / {flashcards.length}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFlashcardBack((prev) => !prev)}
                className="w-full rounded-xl border border-fuchsia-200 bg-white p-4 text-left"
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-fuchsia-600">
                  {showFlashcardBack ? 'Answer' : 'Prompt'}
                </p>
                <p className="text-sm leading-relaxed text-fuchsia-900">
                  {showFlashcardBack ? currentFlashcard.back : currentFlashcard.front}
                </p>
                <p className="mt-2 text-xs text-fuchsia-700">
                  Tap to {showFlashcardBack ? 'show prompt' : 'reveal answer'}
                </p>
              </button>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFlashcardIndex((prev) => Math.max(0, prev - 1));
                    setShowFlashcardBack(false);
                  }}
                  disabled={flashcardIndex === 0}
                  className="inline-flex items-center gap-1 rounded-lg border border-fuchsia-200 bg-white px-3 py-2 text-xs font-semibold text-fuchsia-800 disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlashcardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                    setShowFlashcardBack(false);
                  }}
                  disabled={flashcardIndex >= flashcards.length - 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-fuchsia-200 bg-white px-3 py-2 text-xs font-semibold text-fuchsia-800 disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <button
          onClick={handleStartAnswering}
          disabled={startQuiz.isPending || lessonLoading}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all min-h-[52px] flex items-center justify-center gap-2"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          {lessonLoading ? 'Loading lesson...' : startQuiz.isPending ? 'Starting...' : "I'm Ready! Start Quiz"}
        </button>
      </div>
    );
  }

  // Complete State
  if (quizState === 'complete') {
    const score = finalScore ?? quiz.score ?? 0;
    const displayedXp = xpEarned || quiz.xp_awarded;

    return (
      <div className="px-4 py-6">
        <XPPopup xp={displayedXp} show={showXP} onDone={() => setShowXP(false)} />
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-500 mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <div className="text-6xl mb-3">{getScoreEmoji(score)}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Quiz Complete!</h2>
          <div className={cn('text-5xl font-bold mb-1', getScoreColor(score))}>
            {score}%
          </div>
          <p className="text-gray-500 text-sm">
            {answered.length > 0
              ? `${correctCount} / ${questions.length} correct`
              : `${Math.round((score / 100) * questions.length)} / ${questions.length} correct`}
          </p>
          {displayedXp > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 font-bold px-4 py-2 rounded-full border border-yellow-200">
              ⭐ +{displayedXp} XP earned!
            </div>
          )}
        </motion.div>

        {/* Question Review */}
        <div className="space-y-3 mb-6">
          {questions.map((q, i) => {
            const userAnswer = answered.find((a) => a.questionId === q.id) ??
              (quiz.answers?.find((a) => a.question_id === q.id)
                ? {
                    questionId: q.id,
                    selected: quiz.answers!.find((a) => a.question_id === q.id)!.selected_answer,
                    isCorrect: quiz.answers!.find((a) => a.question_id === q.id)!.is_correct,
                  }
                : null);
            const isCorrect = userAnswer?.isCorrect ?? false;

            return (
              <div
                key={q.id}
                className={cn(
                  'bg-white rounded-2xl p-4 border-l-4',
                  isCorrect ? 'border-green-500' : 'border-red-400'
                )}
              >
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Q{i + 1}: {q.question}
                    </p>
                    {!isCorrect && userAnswer && (
                      <p className="text-xs text-red-500 mb-0.5">
                        Your answer: {q.options[userAnswer.selected as keyof typeof q.options]}
                      </p>
                    )}
                    <p className="text-xs text-green-600 font-medium">
                      Correct: {q.options[q.correct_answer]}
                    </p>
                    {q.explanation && (
                      <p className="text-xs text-gray-500 mt-1 italic">{q.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push('/quizzes')}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-base"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  // Answering State
  if (!currentQuestion) return null;

  const progress = ((currentQ + 1) / questions.length) * 100;
  const optionKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="px-4 py-4 flex flex-col min-h-[70vh]">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
              router.back();
            }
          }}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <p className="text-lg font-semibold text-gray-800 leading-snug">
              {currentQuestion.question}
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {optionKeys.map((key) => {
              const optionText = currentQuestion.options[key];
              const isSelected = selected === key;
              const isCorrect = key === currentQuestion.correct_answer;
              const showResult = selected !== null;

              let btnClass =
                'w-full p-4 rounded-2xl text-left font-medium text-sm transition-all border-2 min-h-[52px]';
              if (!showResult) {
                btnClass += ' bg-white border-gray-200 hover:border-primary hover:bg-primary/5 text-gray-700';
              } else if (isCorrect) {
                btnClass += ' bg-green-50 border-green-500 text-green-700';
              } else if (isSelected && !isCorrect) {
                btnClass += ' bg-red-50 border-red-400 text-red-700';
              } else {
                btnClass += ' bg-white border-gray-200 text-gray-400';
              }

              return (
                <motion.button
                  key={key}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                  onClick={() => handleSelectAnswer(key)}
                  disabled={showResult}
                  className={btnClass}
                  style={
                    !showResult && isSelected
                      ? { borderColor: 'hsl(var(--primary))', backgroundColor: 'hsl(var(--primary) / 0.05)' }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        showResult && isCorrect
                          ? 'bg-green-500 text-white'
                          : showResult && isSelected && !isCorrect
                          ? 'bg-red-400 text-white'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {key}
                    </span>
                    <span className="flex-1">{optionText}</span>
                    {showResult && isCorrect && (
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle size={18} className="text-red-400 flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100"
              >
                <p className="text-xs font-semibold text-blue-700 mb-1">
                  Explanation
                </p>
                <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Next Button */}
      {selected !== null && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          disabled={submitQuiz.isPending}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 min-h-[52px] transition-all"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          {submitQuiz.isPending
            ? 'Submitting...'
            : currentQ < questions.length - 1
            ? (
              <>
                Next Question <ChevronRight size={20} />
              </>
            )
            : 'Submit Quiz'}
        </motion.button>
      )}
    </div>
  );
}
