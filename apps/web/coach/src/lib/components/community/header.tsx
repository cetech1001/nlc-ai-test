import {TrendingUp, Users} from "lucide-react";
import React, {FC} from "react";
import {Community} from "@nlc-ai/sdk-community";

interface IProps {
  community: Community
}

export const CommunityHeader: FC<IProps> = (props) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden mb-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{props.community.name}</h1>
            <p className="text-stone-400">{props.community.memberCount} coaches • {props.community.postCount} posts</p>
          </div>
          <div className="ml-auto">
            <TrendingUp className="w-6 h-6 text-fuchsia-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
