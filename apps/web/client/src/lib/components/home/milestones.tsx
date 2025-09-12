import React, {FC} from "react";

interface MilestoneProps {
  title: string;
  progress: number;
}

const MilestoneCard: FC<MilestoneProps> = ({ title, progress }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs sm:text-sm font-semibold text-foreground pr-2">{title}</span>
        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{progress}%</span>
      </div>
      <div className="w-full h-1 bg-white/20 rounded-full">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FEBEFA] via-[#B339D4] to-[#7B26F0]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export const Milestones = () => {
  return (
    <div className="glass-card rounded-4xl overflow-hidden w-full min-h-[280px] sm:min-h-[320px] lg:min-h-[400px]">
      <div className="absolute -left-11 -bottom-13 w-56 h-56 bg-streak-gradient opacity-50 blur-[112.55px] rounded-full" />
      <div className="relative z-10 p-4 sm:p-5 lg:p-6 h-full flex flex-col">
        <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6 lg:mb-7">Milestones</h3>

        <div className="flex flex-row items-center gap-4 mb-6">
          <div className="w-full h-12 sm:h-14 relative">
            <div className="w-full h-full bg-gray-800 rounded-lg absolute" />
            <div
              className="h-full bg-gradient-purple rounded-lg absolute bottom-0"
              style={{ width: '32%' }}
            />
          </div>
          <span className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-foreground">7/22</span>
        </div>

        <div className="flex-1">
          <h4 className="text-base sm:text-lg font-medium text-muted-foreground mb-3 sm:mb-4">Nearest Milestones</h4>
          <div className="space-y-4 sm:space-y-5">
            <MilestoneCard title={'Check out the first module of lessons'} progress={60}/>
            <MilestoneCard title={'Check out the first module of lessons 2'} progress={30}/>
            <MilestoneCard title={'Check out the first module of lessons 3'} progress={55}/>
          </div>
        </div>
      </div>
    </div>
  );
}
