import {TrendingUp, Users} from "lucide-react";
import React, {FC} from "react";
import {Community} from "@nlc-ai/sdk-communities";

interface IProps {
  community: Community | null;
}

export const CommunityHeader: FC<IProps> = (props) => {
  if (!props.community) {
    return (
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[16px] sm:rounded-[20px] border border-neutral-700 overflow-hidden mb-4 sm:mb-6">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-24 sm:w-32 h-24 sm:h-32 -right-4 sm:-right-6 -top-6 sm:-top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px] sm:blur-[56px]" />
        </div>
        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full animate-pulse" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-6 sm:h-8 bg-neutral-700/50 rounded animate-pulse w-48" />
              <div className="h-4 bg-neutral-700/50 rounded animate-pulse w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[16px] sm:rounded-[20px] border border-neutral-700 overflow-hidden mb-4 sm:mb-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-24 sm:w-32 h-24 sm:h-32 -right-4 sm:-right-6 -top-6 sm:-top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px] sm:blur-[56px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
              {props.community.name}
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm">
              <span className="inline-block">{props.community.memberCount} coach{props.community.memberCount !== 1 && 'es'}</span>
              <span className="mx-1 hidden sm:inline">•</span>
              <span className="block sm:inline">{props.community.postCount} post{props.community.postCount !== 1 && 's'}</span>
            </p>
          </div>
          <div className="flex-shrink-0">
            <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 text-fuchsia-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
