export const CategoriesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 animate-pulse">
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-700 rounded-xl"></div>
            <div className="w-6 h-6 bg-neutral-700 rounded"></div>
          </div>
          <div className="h-6 bg-neutral-700 rounded w-32 mb-2"></div>
          <div className="h-4 bg-neutral-700 rounded w-full"></div>
        </div>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-neutral-700 rounded w-24"></div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-700 rounded w-4/5"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/5"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="h-5 bg-neutral-700 rounded w-16"></div>
              <div className="h-3 bg-neutral-700 rounded w-20"></div>
            </div>
            <div className="space-y-1">
              <div className="h-5 bg-neutral-700 rounded w-12"></div>
              <div className="h-3 bg-neutral-700 rounded w-24"></div>
            </div>
          </div>
          <div className="h-4 bg-neutral-700 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);
