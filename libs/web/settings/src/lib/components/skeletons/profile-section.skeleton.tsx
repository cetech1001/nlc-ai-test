import { Skeleton } from "@nlc-ai/web-ui";

export const ProfileSectionSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-7 mb-8 lg:mb-16">
        <div className="mx-auto lg:mx-0">
          <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-[20px]" />
        </div>

        <div className="w-full lg:w-60 flex flex-col gap-3 text-center lg:text-left">
          <Skeleton className="h-8 w-48 mx-auto lg:mx-0" />
          <Skeleton className="h-4 w-56 mx-auto lg:mx-0" />
        </div>

        <div className="hidden lg:block w-32 h-0 rotate-90 border-t border-neutral-700"/>

        <div className="w-full lg:w-80 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-36" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-16 h-7 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-16 h-7 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Skeleton className="h-7 w-28 mb-4 sm:mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-[10px]" />
            </div>
          ))}
        </div>

        <div className="mb-6 lg:mb-8">
          <Skeleton className="h-4 w-8 mb-3" />
          <Skeleton className="h-32 w-full rounded-[10px]" />
          <Skeleton className="h-3 w-64 mt-2" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <Skeleton className="w-full sm:w-44 h-12 rounded-lg" />
          <Skeleton className="w-full sm:w-20 h-12 rounded-lg" />
        </div>
      </div>

      <Skeleton className="w-full h-px mb-6 lg:mb-8" />

      <div>
        <Skeleton className="h-7 w-36 mb-4 sm:mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-[10px]" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-12 w-full rounded-[10px]" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <Skeleton className="w-full sm:w-36 h-12 rounded-lg" />
          <Skeleton className="w-full sm:w-20 h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
