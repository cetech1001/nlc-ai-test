import { Skeleton } from "@nlc-ai/web-ui";

export const PlanCardSkeleton = () => {
  return (
    <div className="w-auto h-full shadow-[0px_2px_12px_0px_rgba(0,0,0,0.09)] flex flex-col">
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
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="w-3 h-3" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

