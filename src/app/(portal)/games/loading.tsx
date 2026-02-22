export default function GamesLoading() {
  return (
    <div className="px-4 py-4">
      <div className="animate-pulse mb-4">
        <div className="h-6 bg-white/60 rounded-xl w-28 mb-1" />
        <div className="h-4 bg-white/60 rounded-xl w-56" />
      </div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-9 w-24 bg-white/60 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 animate-pulse h-40">
            <div className="h-8 w-8 rounded-lg bg-gray-200 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-full mb-1" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
