import { Skeleton } from "@nlc-ai/web-ui";

export const ResultsSkeleton = () => {
  return (
    <div className="container mx-auto px-6 py-10 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="glass-card rounded-3xl p-8 md:p-12 border border-purple-500/20 relative overflow-hidden">
          {/* Glow orbs for theming */}
          <div className="glow-orb glow-orb--md -top-24 -left-28 sm:-top-28 sm:-left-24 opacity-60" />
          <div className="glow-orb glow-orb--sm glow-orb--purple -bottom-16 -right-20 opacity-50" />

          <div className="relative z-10">
            {/* Logo skeleton */}
            <div className="flex justify-center mb-6 w-full">
              <Skeleton className="h-14 w-16 rounded-md" />
            </div>

            {/* Main heading skeleton */}
            <div className="space-y-4 mb-6">
              <Skeleton className="h-10 sm:h-12 w-72 sm:w-96 mx-auto" />
              <Skeleton className="h-8 sm:h-10 w-64 sm:w-80 mx-auto" />
            </div>

            {/* Description paragraphs skeleton */}
            <div className="space-y-4 mb-8">
              <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
              <Skeleton className="h-6 w-full max-w-xl mx-auto" />
              <Skeleton className="h-6 w-full max-w-lg mx-auto" />
              <Skeleton className="h-5 w-48 mx-auto" />
            </div>

            {/* Card/Badge section skeleton (for qualified) or Social icons (for rejected) */}
            <div className="mb-8">
              {/* This will work for both the qualification card and social icons */}
              <div className="flex justify-center">
                <Skeleton className="h-20 w-80 rounded-xl" />
              </div>
            </div>

            {/* Action button skeleton */}
            <Skeleton className="h-12 w-56 mx-auto rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
