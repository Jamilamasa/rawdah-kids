'use client';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { hadithsApi, prophetsApi, quranApi, quizzesApi } from '@/lib/api';
import { QuizTaker, type QuizLesson } from '@/components/quizzes/QuizTaker';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type {
  Flashcard,
  Hadith,
  HadithQuiz,
  Prophet,
  ProphetQuiz,
  QuranQuiz,
  QuranVerse,
  TopicQuiz,
} from '@/types';

type AnyQuiz = HadithQuiz | ProphetQuiz | QuranQuiz | TopicQuiz;

function isHadithQuiz(quiz: AnyQuiz): quiz is HadithQuiz {
  return 'hadith_id' in quiz;
}

function isProphetQuiz(quiz: AnyQuiz): quiz is ProphetQuiz {
  return 'prophet_id' in quiz;
}

function isTopicQuiz(quiz: AnyQuiz): quiz is TopicQuiz {
  return 'topic' in quiz && 'lesson_content' in quiz;
}

export default function QuizDetailPage() {
  const params = useParams<{ type: string; id: string }>();
  const { type, id } = params;

  const { data: quiz, isLoading, isError, error } = useQuery({
    queryKey: ['quiz', type, id],
    queryFn: () => quizzesApi.get(type, id),
    enabled: Boolean(type && id),
  });

  const lessonQuery = useQuery({
    queryKey: ['quiz', type, id, 'lesson', quiz?.id],
    enabled: Boolean(quiz && quiz.status === 'pending' && !isTopicQuiz(quiz)),
    queryFn: async () => {
      if (!quiz) return null;
      if (isHadithQuiz(quiz)) {
        return hadithsApi.get(quiz.hadith_id);
      }
      if (isProphetQuiz(quiz)) {
        return prophetsApi.get(quiz.prophet_id);
      }
      if (isTopicQuiz(quiz)) {
        return null;
      }
      return quranApi.get(quiz.verse_id);
    },
  });

  const lesson = useMemo<QuizLesson | undefined>(() => {
    if (!quiz) return undefined;

    if (isTopicQuiz(quiz)) {
      return {
        title: `${quiz.topic} (${quiz.category.replaceAll('_', ' ')})`,
        subtitle: 'AI learning lesson',
        primaryText: quiz.lesson_content,
        helperText: 'Read the lesson and review flashcards before starting the quiz.',
      };
    }

    if (!lessonQuery.data) return undefined;

    if (isHadithQuiz(quiz)) {
      const hadith = lessonQuery.data as Hadith;
      return {
        title: `Hadith from ${hadith.source}`,
        subtitle: hadith.topic ? `Topic: ${hadith.topic}` : undefined,
        primaryText: hadith.text_ar ?? hadith.text_en,
        secondaryText: hadith.text_ar ? hadith.text_en : undefined,
        helperText: 'Understand the hadith meaning before answering the quiz questions.',
      };
    }

    if (isProphetQuiz(quiz)) {
      const prophet = lessonQuery.data as Prophet;
      const details = [prophet.key_miracles, prophet.nation, prophet.quran_refs].filter(Boolean);
      return {
        title: `Prophet ${prophet.name_en}`,
        subtitle: prophet.name_ar,
        primaryText: prophet.story_summary,
        secondaryText: details.length ? details.join(' • ') : undefined,
        helperText: 'Read the story summary carefully before starting the quiz.',
      };
    }

    const verse = lessonQuery.data as QuranVerse;
    return {
      title: `${verse.surah_name_en} (${verse.surah_number}:${verse.ayah_number})`,
      subtitle: verse.topic ? `Topic: ${verse.topic}` : undefined,
      primaryText: verse.text_ar,
      secondaryText: `${verse.text_en}\n\n${verse.tafsir_simple}`,
      helperText: 'Reflect on the verse and tafsir before you begin the quiz.',
    };
  }, [lessonQuery.data, quiz]);

  const flashcards = useMemo<Flashcard[]>(
    () => (quiz && isTopicQuiz(quiz) ? quiz.flashcards ?? [] : []),
    [quiz]
  );

  if (isLoading) {
    return (
      <div className="px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/60 rounded-xl w-1/2" />
          <div className="h-32 bg-white/60 rounded-2xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-white/60 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="px-4 py-8 flex flex-col items-center gap-3 text-center">
        <AlertTriangle size={40} className="text-red-400" />
        <p className="text-gray-700 font-medium">Could not load this quiz</p>
        <p className="text-gray-500 text-sm">
          {error instanceof Error ? error.message : 'Please try again later.'}
        </p>
        <Link
          href="/quizzes"
          className="flex items-center gap-1 text-sm font-medium mt-2"
          style={{ color: 'hsl(var(--primary))' }}
        >
          <ArrowLeft size={16} /> Back to Quizzes
        </Link>
      </div>
    );
  }

  return (
    <QuizTaker
      quiz={quiz}
      type={type}
      lesson={lesson}
      flashcards={flashcards}
      lessonLoading={lessonQuery.isLoading}
    />
  );
}
