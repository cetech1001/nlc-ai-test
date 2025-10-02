import {Skeleton} from "@nlc-ai/web-ui";

export const UserProfileSidebarSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center gap-4">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>

    {/* Bio */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton className="h-6 w-8 mx-auto mb-1" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
      ))}
    </div>

    {/* Contact Info */}
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  </div>
);
