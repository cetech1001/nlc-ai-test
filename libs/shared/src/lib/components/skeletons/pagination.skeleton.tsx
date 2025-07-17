import { Skeleton } from "@nlc-ai/ui"

export const PaginationSkeleton = () => {
  return (
    <div className="bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="flex items-center justify-end gap-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="w-10 h-10 rounded-[10px]" />
        ))}
      </div>
    </div>
  );
}
