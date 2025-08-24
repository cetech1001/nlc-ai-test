import { Skeleton } from "@nlc-ai/web-ui";

export const CoachDetailsSkeleton = () => (
  <div className="py-4 sm:py-6 lg:py-8 space-y-6 animate-pulse">
    <div className="h-6 bg-neutral-700 rounded w-48"></div>
    <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
      <div className="space-y-4">
        <div className="h-8 bg-neutral-700 rounded w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20"/>
              <Skeleton className="h-5 w-24"/>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-neutral-800/30 rounded-[20px] p-6 space-y-4">
          <Skeleton className="h-6 w-32"/>
          <Skeleton className="h-8 w-16"/>
        </div>
      ))}
    </div>
  </div>
);

export const MakePaymentSkeleton = () => {
  return (
    <div>
      <div className="py-8">
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="mb-8">
        <div className="flex flex-col px-4 gap-4 justify-center w-full h-72 sm:h-44 bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] rounded-[30px] border border-neutral-700">
          <div>
            <Skeleton className="h-8 w-32" />
          </div>

          <div className="w-full flex flex-col gap-2 sm:grid sm:grid-cols-7 sm:gap-0">
            <div className="flex sm:flex-col gap-3 sm:gap-1.5">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex sm:flex-col gap-3 sm:gap-1.5 grid-cols-subgrid col-span-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex sm:flex-col gap-3 sm:gap-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex sm:flex-col gap-3 sm:gap-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex sm:flex-col gap-3 sm:gap-1.5">
              <Skeleton className="h-4 w-22" />
              <Skeleton className="h-5 w-18" />
            </div>
            <div className="flex sm:flex-col gap-3 sm:gap-1.5">
              <Skeleton className="h-4 w-26" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Skeleton className="h-8 w-28" />
      </div>

      <div className="gap-4 grid grid-cols-1 mb-2 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-auto h-full shadow-[0px_2px_12px_0px_rgba(0,0,0,0.09)] flex flex-col">
            <div className="w-auto px-6 pt-7 pb-5 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-tl-[20px] rounded-tr-[20px] flex flex-col gap-2.5">
              <div className="flex flex-col gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>

            <div className="w-auto px-6 py-5 bg-neutral-900/70 rounded-bl-[20px] rounded-br-[20px] border-t border-stone-50/20 flex flex-col gap-5 flex-1">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              <div className="w-full mt-auto">
                <Skeleton className="h-10 w-full rounded-[10px]" />
              </div>

              <div className="flex flex-col gap-4 flex-1">
                <Skeleton className="h-3 w-24" />
                <div className="flex flex-col gap-2.5">
                  {Array.from({ length: 5 }).map((_, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
