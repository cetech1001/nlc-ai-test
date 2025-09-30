import { Skeleton } from "@nlc-ai/web-ui";

export const CommunityMembershipsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative glass-card rounded-2xl p-6 overflow-hidden bg-gradient-to-b from-neutral-800/50 to-neutral-900/50">
          {/* Glow Orb */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute w-32 h-32 -right-6 -bottom-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
          </div>

          <div className="relative z-10 flex items-center gap-6">
            <Skeleton className="w-14 h-14 rounded-[9px] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="w-1 h-1 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
