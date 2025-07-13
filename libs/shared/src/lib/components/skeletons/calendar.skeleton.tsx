import { Skeleton } from "@nlc-ai/ui";

export const CalendarSkeleton = () => {
  return (
    <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 xl:gap-8 h-full">
      <div className="w-full xl:w-80 lg:flex-shrink-0 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-3xl shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]">
        <div className="bg-[#1A1A1A] rounded-lg p-4 sm:p-6 border border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-12 sm:hidden" />
            <Skeleton className="h-8 w-16" />
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] h-full">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#2A2A2A]">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="hidden sm:grid grid-cols-7 mb-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-4 mx-auto w-8" />
              ))}
            </div>

            <div className="hidden sm:grid grid-cols-7 gap-0.5 sm:gap-1">
              {Array.from({ length: 35 }).map((_, index) => (
                <div key={index} className="min-h-[80px] lg:min-h-[120px] w-full p-2 border border-[#2A2A2A] bg-neutral-800 rounded-lg">
                  <Skeleton className="h-4 w-4 mb-2" />
                  <div className="space-y-1">
                    {Math.random() > 0.7 && (
                      <Skeleton className="h-8 w-full rounded" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:hidden">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex flex-row items-center gap-4 w-full">
                  <div className="w-1/5">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </div>
                  <div className="w-4/5">
                    <div className="min-h-[70px] w-full p-2 border border-[#2A2A2A] bg-neutral-800 rounded-lg">
                      <Skeleton className="h-4 w-4 mb-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
