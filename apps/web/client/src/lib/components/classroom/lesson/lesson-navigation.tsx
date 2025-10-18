'use client'

import React, { useState } from 'react';
import { ExtendedCourse, CourseLessonWithDetails } from '@nlc-ai/types';

interface LessonItemProps {
  lesson: CourseLessonWithDetails;
  completed?: boolean;
  active?: boolean;
  locked?: boolean;
  onClick: () => void;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, completed = false, active = false, locked = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`flex items-center gap-2 py-3 pl-9 border-b border-neutral-700/50 h-16 hover:bg-white/5 transition-colors rounded-lg group w-full text-left ${
        locked ? 'opacity-50 cursor-not-allowed' : active ? 'bg-white/5' : ''
      }`}
    >
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>

      <span className={`text-sm flex-1 leading-tight pr-2 ${
        active ? 'text-white font-medium' : 'text-stone-300'
      }`}>
        {lesson.title}
      </span>

      <div className="flex items-center gap-2 flex-shrink-0">
        {locked && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75C16.5 5.55653 16.0259 4.41193 15.182 3.56802C14.3381 2.72411 13.1935 2.25 12 2.25C10.8065 2.25 9.66193 2.72411 8.81802 3.56802C7.97411 4.41193 7.5 5.55653 7.5 6.75V10.5M6.75 21.75H17.25C17.8467 21.75 18.419 21.5129 18.841 21.091C19.2629 20.669 19.5 20.0967 19.5 19.5V12.75C19.5 12.1533 19.2629 11.581 18.841 11.159C18.419 10.7371 17.8467 10.5 17.25 10.5H6.75C6.15326 10.5 5.58097 10.7371 5.15901 11.159C4.73705 11.581 4.5 12.1533 4.5 12.75V19.5C4.5 20.0967 4.73705 20.669 5.15901 21.091C5.58097 21.5129 6.15326 21.75 6.75 21.75Z" />
          </svg>
        )}
        {completed && !locked && (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M9 12.75L11.25 15L15 9.75M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z" stroke="#09B90F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  );
};

interface LessonNavigationProps {
  course: ExtendedCourse;
  selectedLessonID: string;
  onLessonSelect: (lessonID: string) => void;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
                                                                    course,
                                                                    selectedLessonID,
                                                                    onLessonSelect
                                                                  }) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(course.chapters?.map(c => c.id) || [])
  );

  const toggleChapter = (chapterID: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterID)) {
        newSet.delete(chapterID);
      } else {
        newSet.add(chapterID);
      }
      return newSet;
    });
  };

  if (!course.chapters || course.chapters.length === 0) {
    return (
      <div className="w-full lg:w-[346px] relative p-6">
        {/* Glow orbs */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full blur-xl"></div>
        <p className="text-stone-400 text-center text-sm relative z-10">No chapters available</p>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[346px] h-full flex flex-col relative">
      {/* Glow orbs */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-20 h-20 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-xl"></div>

      <style jsx>{`
        .sidebar-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .sidebar-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
      `}</style>

      <div className="flex-1 overflow-y-auto sidebar-scrollbar pr-2 space-y-0 relative z-10">
        {course.chapters.map((chapter) => (
          <div key={chapter.id}>
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="flex items-center gap-2 w-full py-3 border-b border-neutral-700 hover:bg-white/5 transition-colors rounded-lg group h-20 text-left"
            >
              <div className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0">
                {expandedChapters.has(chapter.id) ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>

              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>

              <span className="text-white text-sm font-medium flex-1 leading-tight pr-2">
                {chapter.title}
              </span>
            </button>

            {expandedChapters.has(chapter.id) && chapter.lessons && (
              <div className="space-y-0">
                {chapter.lessons.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-stone-400 pl-9">
                    No lessons in this chapter
                  </div>
                ) : (
                  chapter.lessons.map((lesson) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      completed={false} // TODO: Track lesson progress
                      active={lesson.id === selectedLessonID}
                      locked={lesson.isLocked}
                      onClick={() => !lesson.isLocked && onLessonSelect(lesson.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
