import { QuizListSkeleton } from '@/components/quizzes/QuizListSkeleton';

export default function QuizzesLoading() {
  return (
    <div className="px-4 py-4">
      <div className="animate-pulse mb-4">
        <div className="h-6 bg-white/60 rounded-xl w-32 mb-1" />
        <div className="h-4 bg-white/60 rounded-xl w-48" />
      </div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 flex-1 bg-white/60 rounded-xl animate-pulse" />
        ))}
      </div>
      <QuizListSkeleton count={3} />
    </div>
  );
}
