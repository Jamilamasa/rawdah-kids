export default function RewardsLoading() {
  return (
    <div className="px-4 py-4">
      <div className="mb-4 animate-pulse space-y-2">
        <div className="h-6 w-28 rounded-xl bg-white/60" />
        <div className="h-4 w-52 rounded-xl bg-white/60" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="h-20 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-20 animate-pulse rounded-2xl bg-white/70" />
      </div>

      <div className="mb-4 flex gap-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-9 w-24 animate-pulse rounded-xl bg-white/70" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-white/70" />
        ))}
      </div>
    </div>
  );
}
