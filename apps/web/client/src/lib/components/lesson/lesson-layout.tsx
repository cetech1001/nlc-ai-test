'use client';

import React, { useState } from 'react';
import { LessonNavigation, LessonVideoPlayer } from '@/lib';
import { ExtendedCourse } from '@nlc-ai/types';

interface LessonLayoutProps {
  course: ExtendedCourse;
  currentLessonID?: string;
}

export const LessonLayout: React.FC<LessonLayoutProps> = ({ course, currentLessonID }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLessonID, setSelectedLessonID] = useState<string>(
    currentLessonID || course.chapters?.[0]?.lessons?.[0]?.id || ''
  );

  // Find the current lesson
  const currentLesson = course.chapters
    ?.flatMap(chapter => chapter.lessons || [])
    .find(lesson => lesson.id === selectedLessonID);

  // Find the chapter that contains the current lesson
  const currentChapter = course.chapters?.find(chapter =>
    chapter.lessons?.some(lesson => lesson.id === selectedLessonID)
  );

  const handleLessonSelect = (lessonID: string) => {
    setSelectedLessonID(lessonID);
    setSidebarOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-glass-gradient rounded-lg border border-border text-white text-sm font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Course Navigation
      </button>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Mobile Overlay Navigation */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <div
              className="w-80 h-full bg-sidebar border-r border-sidebar-border p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-muted-foreground hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <LessonNavigation
                course={course}
                selectedLessonID={selectedLessonID}
                onLessonSelect={handleLessonSelect}
              />
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden lg:block flex-shrink-0">
          <LessonNavigation
            course={course}
            selectedLessonID={selectedLessonID}
            onLessonSelect={handleLessonSelect}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <LessonVideoPlayer
            lesson={currentLesson}
            chapter={currentChapter}
            course={course}
          />
        </div>
      </div>
    </div>
  );
};
