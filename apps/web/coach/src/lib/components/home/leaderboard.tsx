import React from "react";

export const Leaderboard = () => {
  return (
    <div className="glass-card rounded-4xl flex-1 w-full bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-3 sm:mb-0">Leaderboard</h3>
          <div className="text-sm">
            <a href={"/leaderboard"}>View All</a>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-0">
          {[
            { rank: 1, name: "Andrew Kramer", milestones: "17/24", streak: "17", points: "+24pt", isTop3: true },
            { rank: 2, name: "Andrew Kramer", milestones: "16/24", streak: "5", points: "+19pt", isTop3: true },
            { rank: 3, name: "Andrew Kramer", milestones: "12/24", streak: "15", points: "+11pt", isTop3: true },
            { rank: 4, name: "Andrew Kramer", milestones: "14/24", streak: "15", points: "+8pt", isTop3: false },
            // { rank: 5, name: "Andrew Kramer", milestones: "13/24", streak: "3", points: "+7pt", isTop3: false },
          ].map((user, index) => (
            <div key={index} className={`flex items-center justify-between py-2 ${index < 6 ? 'border-b border-border' : ''}`}>
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                {user.isTop3 ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-black">{user.rank}</span>
                  </div>
                ) : (
                  <span className="w-5 sm:w-6 text-center text-sm sm:text-lg font-medium text-foreground flex-shrink-0">{user.rank}</span>
                )}
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/7b7ce78b469c6163f6e7431a602a7794238123c6?width=80"
                  alt={user.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0"
                />
                <span className="font-medium text-foreground text-sm sm:text-base truncate">{user.name}</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-6 lg:gap-14 text-xs sm:text-sm">
                {/* Desktop view */}
                {/*<div className="hidden sm:flex items-center gap-4 lg:gap-8">
                  <div className="flex items-center gap-1.5 w-20 lg:w-[121px]">
                    <span className="text-muted-foreground hidden lg:inline">Milestones:</span>
                    <span className="font-semibold text-foreground">{user.milestones}</span>
                  </div>
                  <div className="flex items-center gap-1.5 w-16 lg:w-20">
                    <span className="text-muted-foreground hidden lg:inline">Streak:</span>
                    <span className="font-semibold text-foreground">{user.streak}</span>
                  </div>
                </div>*/}

                {/* Mobile view - compact */}
                {/*<div className="flex sm:hidden items-center gap-1 text-xs">
                  <span className="text-muted-foreground">{user.milestones}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{user.streak}d</span>
                </div>*/}

                <span className="text-sm sm:text-lg font-medium text-purple-primary whitespace-nowrap">{user.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
