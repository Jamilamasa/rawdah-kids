export default function QuizDetailLoading() {
  return (
    <div className="px-4 py-6 animate-pulse">
      <div className="h-5 bg-white/60 rounded-xl w-20 mb-6" />
      <div className="h-8 bg-white/60 rounded-xl w-3/4 mb-4" />
      <div className="h-24 bg-white/60 rounded-2xl mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-white/60 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
