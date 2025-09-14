import React from 'react';
import { Video, FileText, FileDown } from 'lucide-react';
import type { ExtendedCourse } from '@nlc-ai/sdk-course';

interface CurriculumContentProps {
  course: ExtendedCourse | null;
  activeTab: string;
  onCreateLesson: (type: 'video' | 'text' | 'pdf') => void;
  onTabChange: (tab: string) => void;
}

export const CurriculumContent: React.FC<CurriculumContentProps> = ({
 course,
 activeTab,
 onCreateLesson,
 onTabChange
}) => {
  if (activeTab !== 'Curriculum') {
    return null;
  }

  return (
    <>
      {/* Lesson Type Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8 relative z-10">
        <button
          onClick={() => onCreateLesson('video')}
          className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div className="text-white font-medium">Video</div>
        </button>

        <button
          onClick={() => onCreateLesson('text')}
          className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="text-white font-medium">Text</div>
        </button>

        <button
          onClick={() => onCreateLesson('pdf')}
          className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileDown className="w-6 h-6 text-white" />
          </div>
          <div className="text-white font-medium">PDF</div>
        </button>
      </div>

      {/* Course Summary Card */}
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

      {/* Upgrade Prompt */}
      <div className="relative bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 overflow-hidden z-10">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold mb-2">Upgrade to unlock more lesson types</h3>
            <p className="text-stone-300 text-sm">Access advanced lesson formats and interactive content</p>
          </div>
          <button className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-opacity">
            Upgrade
          </button>
        </div>
      </div>
    </>
  );
};
