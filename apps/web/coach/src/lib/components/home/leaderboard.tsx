import React, {FC} from "react";
import { Skeleton } from "@nlc-ai/web-ui";

interface IProps {
  isLoading?: boolean;
}

export const Leaderboard: FC<IProps> = ({ isLoading }) => {
  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-stone-50 text-xl font-medium leading-relaxed">Client Leaderboard</h3>
          <button className="text-stone-400 text-sm hover:text-stone-300 transition-colors">
            View All
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-1">
          {[
            { rank: 1, name: "Andrew Kramer", milestones: "17/24", streak: "17", points: "+24pt", isTop3: true },
            { rank: 2, name: "Andrew Kramer", milestones: "16/24", streak: "5", points: "+19pt", isTop3: true },
            { rank: 3, name: "Andrew Kramer", milestones: "12/24", streak: "15", points: "+11pt", isTop3: true },
            { rank: 4, name: "Andrew Kramer", milestones: "14/24", streak: "15", points: "+8pt", isTop3: false },
          ].map((user, index) => (
            <div key={index} className="grid grid-cols-[2fr_1.5fr] py-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Replace the rank badge section (around line 30-40) */}
                {user.rank === 1 ? (
                  <div className="w-7 h-7 flex items-center justify-center">
                    {/*<img src={'/images/icons/leaderboard/gold.png'} alt={"Gold"}/>*/}
                    <span className={"text-2xl"}>🥇</span>
                  </div>
                ) : user.rank === 2 ? (
                  <div className="w-7 h-7 flex items-center justify-center">
                    <span className={"text-2xl"}>🥈</span>
                  </div>
                ) : user.rank === 3 ? (
                  <div className="w-7 h-7 flex items-center justify-center">
                    <span className={"text-2xl"}>🥉</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 flex items-center justify-center flex-shrink-0 ml-1">
                    <span className="w-6 text-center text-sm font-medium text-white flex-shrink-0">{user.rank}</span>
                  </div>
                )}
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/7b7ce78b469c6163f6e7431a602a7794238123c6?width=80"
                  alt={user.name}
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                />
                <span className="text-stone-300 text-sm truncate">{user.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-stone-400 text-xs">Milestones</span>
                    <span className="text-white font-semibold">{user.milestones}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-stone-400 text-xs">Streak</span>
                    <span className="text-white font-semibold">{user.streak}d</span>
                  </div>
                </div>
                <span className="text-lg font-semibold text-white ml-2 text-right">{user.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LeaderboardSkeleton = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-5 w-12 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
