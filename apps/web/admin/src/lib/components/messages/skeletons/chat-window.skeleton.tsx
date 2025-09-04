import { Skeleton } from "@nlc-ai/web-ui";

export const ChatWindowSkeleton = () => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-12" />
              <span className="text-stone-500">•</span>
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="w-9 h-9 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {Array.from({ length: 8 }).map((_, index) => {
          const isEven = index % 2 === 0;
          return (
            <div key={index} className={`flex ${isEven ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isEven ? 'order-2' : 'order-1'}`}>
                <Skeleton className="h-3 w-32 mb-1" />
                <div className={`p-3 rounded-2xl ${
                  isEven
                    ? 'bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 rounded-br-md'
                    : 'bg-neutral-700/20 rounded-bl-md'
                }`}>
                  <div className="relative">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                    </div>
                    <div className="relative z-10">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 border-t border-neutral-700">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-3 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};
