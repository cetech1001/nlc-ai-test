import { DataTableSkeleton } from "@nlc-ai/shared";
import { Skeleton } from "@nlc-ai/ui";

interface IProps {
  length: number;
}

export const CoachesPageSkeleton = ({ length }: IProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {/*<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-80 rounded-xl" />
            <Skeleton className="w-10 h-10 rounded-xl" />
          </div>
        </div>*/}

        <DataTableSkeleton
          columns={length}
          rows={10}
          showMobileCards={true}
        />

        <div className="bg-black/50 backdrop-blur-sm p-4 sm:p-6">
          <div className="flex items-center justify-end gap-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="w-10 h-10 rounded-[10px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
