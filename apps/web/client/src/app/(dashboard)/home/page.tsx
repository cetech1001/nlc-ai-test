import React from 'react';
import {Achievements, CourseProgress, DailyStreak, Leaderboard, Milestones} from "@/lib";

const HomePage = () => {
  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-col sm:grid sm:grid-cols-2 xl:flex-row w-full gap-4 xl:gap-5">
        <div className="w-full sm:w-full xl:w-1/4">
          <CourseProgress/>
        </div>
        <div className="w-full sm:w-full xl:w-1/4">
          <DailyStreak/>
        </div>
        <div className="w-full sm:hidden xl:w-3/5">
          <Milestones/>
        </div>
      </div>
      <div className="w-full hidden sm:block xl:hidden">
        <Milestones/>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 lg:gap-5">
        <div className="w-full xl:w-1/2">
          <Leaderboard/>
        </div>
        <div className="w-full xl:w-3/5">
          <Achievements/>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
