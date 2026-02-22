export default function GameDetailLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-brand-light border-t-brand-primary animate-spin" />
        <p className="text-sm text-brand-dark font-semibold">Preparing your game...</p>
      </div>
    </div>
  );
}
