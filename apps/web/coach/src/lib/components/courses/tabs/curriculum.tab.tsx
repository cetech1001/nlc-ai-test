import React from 'react';
import type { ExtendedCourse } from '@nlc-ai/sdk-courses';

interface CurriculumContentProps {
  course: ExtendedCourse | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CurriculumContent: React.FC<CurriculumContentProps> = ({
 course,
 activeTab,
}) => {
  if (activeTab !== 'Curriculum') {
    return null;
  }

  return (
    <>
      {course && (
        <div className="relative bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 overflow-hidden z-10 mb-6">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
          </div>
          <div className="relative z-10">
            <h3 className="text-white font-semibold mb-2">Course Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-stone-300">Difficulty:</div>
                <div className="text-white capitalize">{course.difficultyLevel || 'Not set'}</div>
              </div>
              <div>
                <div className="text-stone-300">Duration:</div>
                <div className="text-white">{course.estimatedDurationHours || 0} hours</div>
              </div>
              <div>
                <div className="text-stone-300">Enrollments:</div>
                <div className="text-white">{course.totalEnrollments}</div>
              </div>
              <div>
                <div className="text-stone-300">Completion Rate:</div>
                <div className="text-white">{course.completionRate}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-center text-stone-300 mt-6">
        Add a chapter, add a lesson, or select an existing lesson to modify.
      </div>
    </>
  );
};
