import {Skeleton} from "../data-display/skeleton";


export const StatCardSkeleton = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[100px] sm:min-h-[120px]">
        <Skeleton className="h-4 w-24 sm:w-32" />
        <div className="flex justify-between items-end mt-auto pt-2">
          <Skeleton className="h-6 sm:h-8 lg:h-10 w-16 sm:w-20 lg:w-24" />
          <Skeleton className="h-6 w-12 opacity-0" />
        </div>
      </div>
    </div>
  );
}
