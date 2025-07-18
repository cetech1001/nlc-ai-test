export const VideosSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[15px] border border-neutral-700 overflow-hidden animate-pulse">
        <div className="aspect-video bg-neutral-700"></div>
        <div className="p-4 space-y-3">
          <div className="h-3 bg-neutral-700 rounded w-32"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 bg-neutral-700 rounded w-16"></div>
            <div className="h-3 bg-neutral-700 rounded w-12 ml-auto"></div>
          </div>
          <div className="h-8 bg-neutral-700 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);
