import { Skeleton } from "@nlc-ai/web-ui";

export const AccountVerificationSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-8 w-24 mx-auto" />
        </div>
      </div>
    </div>
  );
}
