export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-4 shadow-sm animate-pulse"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="h-5 bg-gray-200 rounded-xl flex-1" />
            <div className="h-5 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="h-4 bg-gray-100 rounded-xl w-3/4 mb-3" />
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
