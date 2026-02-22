export default function AILoading() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="animate-pulse space-y-2">
        <div className="h-6 w-32 rounded-xl bg-white/60" />
        <div className="h-4 w-60 rounded-xl bg-white/60" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-white/70" />
      <div className="h-44 animate-pulse rounded-2xl bg-white/70" />
    </div>
  );
}
