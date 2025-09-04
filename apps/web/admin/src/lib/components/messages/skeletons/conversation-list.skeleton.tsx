import React from 'react';
import { Skeleton } from "@nlc-ai/web-ui";

export const ConversationListSkeleton = () => {
  return (
    <div className="w-80 border-r border-neutral-700 flex flex-col">
      <div className="p-6 border-b border-neutral-700">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="relative">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-4 border-b border-neutral-700/50">
            <div className="relative">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full border-2 border-black">
                <div className="w-full h-full rounded-full opacity-20">
                  <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="w-5 h-5 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-3 w-32 mt-2" />
              <div className="flex items-center gap-1 mt-2">
                <Skeleton className="w-2 h-2 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
