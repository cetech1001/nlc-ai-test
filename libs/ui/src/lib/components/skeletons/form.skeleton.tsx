import {Skeleton} from "../data-display/skeleton";

export const FormSkeleton = () => {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-18" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="w-4 h-4" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>
    </div>
  );
}
