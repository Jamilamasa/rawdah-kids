import { TaskListSkeleton } from '@/components/tasks/TaskListSkeleton';

export default function TasksLoading() {
  return (
    <div className="px-4 py-4">
      <div className="animate-pulse mb-4">
        <div className="h-6 bg-white/60 rounded-xl w-32 mb-1" />
        <div className="h-4 bg-white/60 rounded-xl w-48" />
      </div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-20 bg-white/60 rounded-xl animate-pulse" />
        ))}
      </div>
      <TaskListSkeleton count={3} />
    </div>
  );
}
