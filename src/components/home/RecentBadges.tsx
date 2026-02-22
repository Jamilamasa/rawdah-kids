'use client';

const DEMO_BADGES = [
  { id: '1', icon: '⭐', name: 'First Task', description: 'Completed your first task!' },
  { id: '2', icon: '📖', name: 'Quiz Taker', description: 'Completed your first quiz!' },
  { id: '3', icon: '🎮', name: 'Gamer', description: 'Played your first game!' },
];

interface RecentBadgesProps {
  badges?: Array<{ id: string; icon: string; name: string; description: string }>;
}

export function RecentBadges({ badges = DEMO_BADGES }: RecentBadgesProps) {
  if (badges.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
      <h2 className="font-bold text-gray-800 mb-3">Recent Badges</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="flex flex-col items-center gap-1 min-w-[72px]"
            title={badge.description}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-2xl shadow-sm border border-amber-200">
              {badge.icon}
            </div>
            <span className="text-xs text-gray-600 text-center font-medium line-clamp-2 w-full">
              {badge.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
