import { Skeleton } from "@nlc-ai/web-ui";

export const ProfileHeaderSkeleton = () => {
  return (
    <div className="glass-card rounded-[30px] p-8 mb-10 relative overflow-hidden">
      <div className="absolute -left-7 -bottom-32 w-[267px] h-[267px] bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 opacity-40 blur-[112.55px] rounded-full" />

      <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
        <Skeleton className="w-[124px] h-[124px] rounded-full" />

        <div className="flex-1 w-full">
          <div className="mb-5">
            <Skeleton className="h-4 w-48 mb-1" />
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-6 w-64" />
            </div>

            <div className="flex flex-wrap items-center gap-6 mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="text-center">
                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
