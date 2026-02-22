export default function RantsLoading() {
  return (
    <div className="px-4 py-4">
      <div className="animate-pulse mb-4">
        <div className="h-6 bg-white/60 rounded-xl w-24 mb-1" />
        <div className="h-4 bg-white/60 rounded-xl w-48" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-full mb-1" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
