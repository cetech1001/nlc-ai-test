import { Skeleton } from "@nlc-ai/ui";

export const CourseIntegrationsSkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div>
                <Skeleton className="h-6 w-52 mb-1" />
                <Skeleton className="h-4 w-80" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>

          <div className="mb-6">
            <Skeleton className="h-5 w-36 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 1 }).map((_, index) => (
                <div key={index} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-5 w-18 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-40 mb-1" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Skeleton className="h-8 w-14 rounded-lg" />
                      <Skeleton className="h-8 w-12 rounded-lg" />
                      <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <Skeleton className="h-5 w-36 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="w-full h-9 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-800/30 border border-neutral-700 rounded-xl p-6">
            <Skeleton className="h-5 w-72 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
