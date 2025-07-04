import { Skeleton } from "@nlc-ai/ui";

export const SettingsPageSkeleton = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-black overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-8 sm:mb-16">
        <Skeleton className="h-6 w-24" />
        <div className="hidden sm:block w-7 h-0 rotate-90 border-t border-neutral-700" />
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-7 mb-8 lg:mb-16">
        <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-[20px] mx-auto lg:mx-0" />

        <div className="w-full lg:w-60 flex flex-col gap-3 text-center lg:text-left">
          <Skeleton className="h-8 w-32 mx-auto lg:mx-0" />
          <Skeleton className="h-4 w-48 mx-auto lg:mx-0" />
        </div>

        <div className="hidden lg:block w-32 h-0 rotate-90 border-t border-neutral-700" />

        <div className="w-full lg:w-80 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="h-4 w-6" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="h-4 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Skeleton className="h-7 w-32 mb-4 sm:mb-6" />

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-7 mb-6 lg:mb-8">
          <div className="w-full lg:w-[532px] flex flex-col gap-3">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-2" />
            </div>
            <Skeleton className="h-12 w-full rounded-[10px]" />
          </div>

          <div className="w-full lg:w-[532px] flex flex-col gap-3">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-3 w-2" />
            </div>
            <Skeleton className="h-12 w-full rounded-[10px]" />
          </div>

          <div className="w-full lg:w-[532px] flex flex-col gap-3">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-3 w-2" />
            </div>
            <Skeleton className="h-12 w-full rounded-[10px]" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <Skeleton className="h-12 w-full sm:w-44 rounded-lg" />
          <Skeleton className="h-12 w-full sm:w-20 rounded-lg" />
        </div>
      </div>

      <div className="w-full max-w-[1094px] h-0 border-t border-neutral-700 mb-6 lg:mb-8" />

      <div>
        <Skeleton className="h-7 w-36 mb-4 sm:mb-6" />

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-7 mb-6 lg:mb-8">
          <div className="w-full lg:w-[532px] flex flex-col gap-3">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-2" />
            </div>
            <Skeleton className="h-12 w-full rounded-[10px]" />
          </div>

          <div className="w-full lg:w-[532px] flex flex-col gap-3">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-2" />
            </div>
            <Skeleton className="h-12 w-full rounded-[10px]" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <Skeleton className="h-12 w-full sm:w-36 rounded-lg" />
          <Skeleton className="h-12 w-full sm:w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
