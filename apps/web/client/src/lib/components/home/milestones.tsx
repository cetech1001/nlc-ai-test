import React, {FC} from "react";

interface MilestoneProps {
  title: string;
  progress: number;
}

const MilestoneCard: FC<MilestoneProps> = ({ title, progress }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <div className="w-full h-1 bg-white/20 rounded-full">
        <div className={`h-full w-[${progress}%] rounded-full bg-gradient-to-r from-[#FEBEFA] via-[#B339D4] to-[#7B26F0]`} />
      </div>
    </div>
  );
}

export const Milestones = () => {
  return (
    <div className="glass-card rounded-4xl overflow-hidden w-3/5">
      <div className="absolute -left-11 -bottom-13 w-56 h-56 bg-streak-gradient opacity-50 blur-[112.55px] rounded-full" />
      <div className="relative z-10 p-6">
        <h3 className="text-2xl font-semibold text-foreground mb-7">Milestones</h3>
        <div className="flex items-center gap-6 mb-8">
          <div className="w-full h-14 relative">
            <div className="w-full h-full bg-gray-800 rounded-lg absolute" />
            <div
              className="h-full bg-gradient-purple rounded-lg absolute bottom-0"
              style={{ width: '32%', height: '100%' }}
            />
          </div>
          <span className="text-[40px] font-semibold text-foreground">7/22</span>
        </div>
        <div>
          <h4 className="text-lg font-medium text-muted-foreground mb-4">Nearest Milestones</h4>
          <div className="space-y-5">
            <MilestoneCard title={'Check out the first module of lessons'} progress={60}/>

            <MilestoneCard title={'Check out the first module of lessons 2'} progress={30}/>

            <MilestoneCard title={'Check out the first module of lessons 3'} progress={55}/>
          </div>
        </div>
      </div>
    </div>
  );
}
