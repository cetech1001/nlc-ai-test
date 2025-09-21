import { Skeleton } from "@nlc-ai/web-ui";

export const MemberSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <div className="relative">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="w-3 h-3" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

export const MembersSectionSkeleton = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-24 rounded-sm" />
      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <MemberSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};
