import {StatCardSkeleton, DataTableSkeleton, RevenueGraphSkeleton} from "@nlc-ai/ui";

export const HomePageSkeleton = (props: { length: number }) => {
  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        <div className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 top-52 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="absolute w-64 h-64 right-40 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <RevenueGraphSkeleton />
        </div>

        <div className="w-full xl:w-1/3 grid grid-cols-2 gap-4 lg:gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="h-6 sm:h-8 w-48 bg-neutral-800/50 rounded animate-pulse" />
          <div className="h-4 w-16 bg-neutral-800/50 rounded animate-pulse self-start sm:self-auto" />
        </div>

        <DataTableSkeleton
          columns={props.length}
          rows={6}
          showMobileCards={true}
        />
      </div>
    </div>
  );
}
