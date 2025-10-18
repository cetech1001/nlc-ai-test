'use client'

import React from 'react';
import {Achievements, CourseProgress, DailyStreak, Leaderboard, Milestones} from "@/lib";

const HomePage = () => {
  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_2.5fr] w-full gap-4 xl:gap-5">
        <div className="w-full">
          <CourseProgress/>
        </div>
        <div className="w-full">
          <DailyStreak/>
        </div>
        <div className="w-full hidden xl:block">
          <Milestones/>
        </div>
      </div>
      <div className="w-full block xl:hidden">
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
