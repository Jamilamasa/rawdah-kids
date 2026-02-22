export default function RequestsLoading() {
  return (
    <div className="px-4 py-4">
      <div className="animate-pulse mb-4">
        <div className="h-6 bg-white/60 rounded-xl w-28 mb-1" />
        <div className="h-4 bg-white/60 rounded-xl w-64" />
      </div>
      <div className="bg-white rounded-2xl p-4 animate-pulse mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-10 bg-gray-100 rounded-xl mb-2" />
        <div className="h-20 bg-gray-100 rounded-xl mb-3" />
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
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
