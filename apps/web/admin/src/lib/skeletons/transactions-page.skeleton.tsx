import { Skeleton } from "@nlc-ai/web-ui";
import { DataTableSkeleton } from "@nlc-ai/web-shared";

interface IProps {
  length: number;
}

export const TransactionsPageSkeleton = ({ length }: IProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
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
