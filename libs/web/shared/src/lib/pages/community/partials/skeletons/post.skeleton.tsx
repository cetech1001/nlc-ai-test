import { Skeleton } from "@nlc-ai/web-ui";

export const PostSkeleton = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[16px] sm:rounded-[20px] border border-neutral-700 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-24 sm:w-32 h-24 sm:h-32 -left-4 sm:-left-6 -top-6 sm:-top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px] sm:blur-[56px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 sm:w-12 h-10 sm:h-12 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-4 w-24 sm:w-32" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="mb-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 sm:w-5 sm:h-5" />
            <Skeleton className="h-4 w-6" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 sm:w-5 sm:h-5" />
            <Skeleton className="h-4 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
