import { Skeleton } from "@nlc-ai/web-ui";
import { FormSkeleton, PlanCardSkeleton } from "@nlc-ai/web-shared";

export const PlanFormSkeleton = () => {
  return (
    <main className="flex-1 pt-2 sm:pt-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>

      <FormSkeleton />
    </main>
  );
}

export const PlansPageSkeleton = () => {
  return (
    <div className="mb-8 pt-2 sm:pt-8">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <PlanCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
