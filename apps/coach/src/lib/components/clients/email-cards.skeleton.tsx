export const EmailCardsSkeleton = () => (
  <div className="grid gird-cols-1 sm:grid-cols-2 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 animate-pulse">
        <div className="space-y-3">
          <div className="h-6 bg-neutral-700 rounded w-3/4"></div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-700 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-neutral-700 rounded w-32"></div>
              <div className="h-3 bg-neutral-700 rounded w-48"></div>
            </div>
            <div className="text-right space-y-1">
              <div className="h-4 bg-neutral-700 rounded w-20"></div>
              <div className="h-3 bg-neutral-700 rounded w-16"></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-700 rounded w-4/5"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/5"></div>
          </div>

          <div className="pt-2">
            <div className="h-4 bg-neutral-700 rounded w-40"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
