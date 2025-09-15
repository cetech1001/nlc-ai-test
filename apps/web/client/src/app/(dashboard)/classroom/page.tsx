'use client'

import React from 'react';
import { WelcomeHero, LessonsGrid } from "@/lib";

const ClassroomPage = () => {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <WelcomeHero />
      <LessonsGrid />
    </div>
  );
};

export default ClassroomPage;
