'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { quizzesApi } from '@/lib/api';
import { QuizTaker } from '@/components/quizzes/QuizTaker';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function QuizDetailPage() {
  const params = useParams<{ type: string; id: string }>();
  const { type, id } = params;

  const { data: quiz, isLoading, isError, error } = useQuery({
    queryKey: ['quiz', type, id],
    queryFn: () => quizzesApi.get(type, id),
    enabled: Boolean(type && id),
  });

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

  return <QuizTaker quiz={quiz} type={type} />;
}
