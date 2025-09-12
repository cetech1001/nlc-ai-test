import React from 'react';
import {Achievements, CourseProgress, DailyStreak, Leaderboard, Milestones} from "@/lib";

const HomePage = () => {
  return (
    <div className="space-y-5">
      <div className="flex w-full gap-5">
        <CourseProgress/>
        <DailyStreak/>
        <Milestones/>
      </div>

      <div className="flex gap-5">
        <Leaderboard/>
        <Achievements/>
      </div>
    </div>
  );
}

export default HomePage;
