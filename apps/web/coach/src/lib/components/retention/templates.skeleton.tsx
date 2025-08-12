export const TemplatesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 animate-pulse">
        <div className="border-b border-neutral-700 pb-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="h-6 bg-neutral-700 rounded w-3/4"></div>
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-neutral-700 rounded"></div>
              <div className="w-6 h-6 bg-neutral-700 rounded"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-5 bg-neutral-700 rounded w-20"></div>
            <div className="h-4 bg-neutral-700 rounded w-32"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-neutral-700 rounded w-40"></div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-700 rounded w-4/5"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/5"></div>
          </div>
          <div className="h-4 bg-neutral-700 rounded w-32"></div>
          <div className="h-4 bg-neutral-700 rounded w-36"></div>
        </div>
      </div>
    ))}
  </div>
);
