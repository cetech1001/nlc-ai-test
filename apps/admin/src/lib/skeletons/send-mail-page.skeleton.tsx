import { Skeleton } from "@nlc-ai/web-ui";

export const SendMailPageSkeleton = () => {
  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>

      <div className="w-full max-w-[1750px] relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 overflow-hidden">
        <div className="w-32 h-32 lg:w-64 lg:h-64 absolute right-[-25px] lg:right-[-50px] top-[-10px] lg:top-[-21px] opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[56px] lg:blur-[112.55px]" />

        {/* Mobile Layout Skeleton */}
        <div className="block lg:hidden">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-7 w-32" />
              </div>
              <Skeleton className="h-4 w-48" />

              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-neutral-700" />

            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-6 h-6" />
                <Skeleton className="w-6 h-6" />
                <Skeleton className="w-6 h-6" />
              </div>

              <Skeleton className="h-5 w-40" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-80 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout Skeleton */}
        <div className="hidden lg:block h-[792px]">
          <div className="absolute left-[30px] top-[30px] w-80 space-y-4">
            <div className="w-80 h-7 flex justify-between items-center">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-6 w-24 opacity-0" />
            </div>

            <Skeleton className="h-4 w-48" />

            <div className="grid grid-cols-2 gap-x-3 gap-y-4 mt-[47px]">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute left-[384px] top-0 w-px h-full bg-neutral-700" />

          <div className="absolute left-[433px] top-[32px] right-[30px] flex flex-col gap-5 h-[728px]">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-6 h-6" />
              <Skeleton className="w-6 h-6" />
              <Skeleton className="w-6 h-6" />
            </div>

            <Skeleton className="h-5 w-48" />

            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="flex-1 w-full rounded-lg min-h-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
        <Skeleton className="h-12 w-full sm:w-32 rounded-lg" />
        <Skeleton className="h-12 w-full sm:w-24 rounded-lg" />
      </div>
    </div>
  );
}
