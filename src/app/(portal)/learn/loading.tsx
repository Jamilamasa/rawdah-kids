export default function LearnLoading() {
  return (
    <div className="px-4 py-4">
      <div className="animate-pulse mb-4">
        <div className="h-6 bg-white/60 rounded-xl w-20 mb-1" />
        <div className="h-4 bg-white/60 rounded-xl w-64" />
      </div>
      <div className="bg-white rounded-2xl p-6 animate-pulse h-48" />
    </div>
  );
}
