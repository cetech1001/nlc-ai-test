import { FormSkeleton, Skeleton } from "@nlc-ai/ui";

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
