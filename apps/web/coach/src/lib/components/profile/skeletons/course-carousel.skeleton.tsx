import { Skeleton } from "@nlc-ai/web-ui";

export const CourseCarouselSkeleton = () => {
  return (
    <div className="flex gap-6 overflow-x-hidden pb-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="glass-card rounded-2xl p-6 min-w-[400px]"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-start gap-6 flex-1">
              <Skeleton className="w-16 h-16 rounded-[13px] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-48 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="w-1 h-1 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
            <Skeleton className="w-20 h-10 rounded-lg flex-shrink-0" />
          </div>

          <div className="mb-5 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="text-center">
                <Skeleton className="h-5 w-8 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
