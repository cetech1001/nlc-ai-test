import { Skeleton } from "@nlc-ai/ui";

export const PaymentModalSkeleton = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75" />

      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-[linear-gradient(202deg,rgba(38, 38, 38, 0.30)_11.62%,rgba(19, 19, 19, 0.30)_87.57%)] border border-[#2A2A2A] p-6 text-left align-middle shadow-xl">
        <div className="text-center mb-6">
          <Skeleton className="h-6 w-48 mx-auto" />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-2" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-3 w-2" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-2" />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-12 w-full rounded" />
          </div>
        </div>

        <div className="flex gap-3 pt-3 mt-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
