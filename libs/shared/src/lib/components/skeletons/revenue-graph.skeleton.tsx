import { Skeleton } from "@nlc-ai/ui";

export const RevenueGraphSkeleton = () => {
  return (
    <div className="relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
        <div className="min-w-0 w-full sm:w-85">
          <Skeleton className="h-7 w-32 mb-1.5" />
          <Skeleton className="h-4 w-64 sm:w-80" />
        </div>

        <div className="flex items-center justify-start sm:justify-end gap-3 sm:gap-5 flex-shrink-0">
          <Skeleton className="h-4 w-10" />
          <div className="w-3 sm:w-4 h-0 border-t-[0.5px] border-neutral-600 rotate-90" />
          <Skeleton className="h-4 w-12" />
          <div className="w-3 sm:w-4 h-0 border-t-[0.5px] border-neutral-600 rotate-90" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>

      <div className="h-40 sm:h-48 lg:h-56 relative">
        <div className="w-full h-full bg-gradient-to-b from-neutral-800/20 to-neutral-900/20 rounded-lg border border-neutral-700">
          <div className="flex items-end justify-between h-full p-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton
                key={index}
                className="w-3 rounded-t-sm"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
