export default function HomeLoading() {
  return (
    <div className="px-4 py-4 space-y-4 animate-pulse">
      {/* Greeting skeleton */}
      <div>
        <div className="h-7 bg-white/60 rounded-xl w-3/4 mb-2" />
        <div className="h-4 bg-white/60 rounded-xl w-1/2" />
      </div>
      {/* XP Card skeleton */}
      <div className="h-32 bg-white/60 rounded-2xl" />
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-white/60 rounded-2xl" />
        <div className="h-16 bg-white/60 rounded-2xl" />
      </div>
      {/* Task summary skeleton */}
      <div className="h-28 bg-white/60 rounded-2xl" />
      {/* Tasks skeleton */}
      <div className="bg-white/60 rounded-2xl p-4 h-32" />
      {/* Badges skeleton */}
      <div className="h-24 bg-white/60 rounded-2xl" />
    </div>
  );
}
