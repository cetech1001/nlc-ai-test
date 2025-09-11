import React from 'react';
import { ChevronDown, ChevronRight, Plus, Upload } from 'lucide-react';
import type { ExtendedCourse } from '@nlc-ai/sdk-course';
import {LessonTypeIcon} from './lesson-type-icon';

interface CurriculumState {
  chapters: Array<{
    chapterID: string;
    title: string;
    description?: string;
    isExpanded: boolean;
    lessons: Array<{
      lessonID: string;
      title: string;
      type: string;
      estimatedMinutes?: number;
    }>;
  }>;
}

interface CurriculumSidebarProps {
  course: ExtendedCourse | null;
  curriculum: CurriculumState;
  onToggleChapter: (chapterID: string) => void;
  onAddLesson: (chapterID: string) => void;
  onAddChapter: () => void;
  onUploadContent: () => void;
}

export const CurriculumSidebar: React.FC<CurriculumSidebarProps> = ({
 course,
 curriculum,
 onToggleChapter,
 onAddLesson,
 onAddChapter,
 onUploadContent
}) => {
  return (
    <div className="w-96 flex-shrink-0 border-r border-neutral-700">
      <div className="p-6 h-full flex flex-col">
        {/* Course Stats */}
        {course && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-stone-400 mb-2">Course Overview</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-white font-medium">{curriculum.chapters.length}</div>
                <div className="text-stone-400">Chapters</div>
              </div>
              <div>
                <div className="text-white font-medium">
                  {curriculum.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)}
                </div>
                <div className="text-stone-400">Lessons</div>
              </div>
            </div>
          </div>
        )}

        {/* Curriculum Tree - Scrollable */}
        <div className="flex-1 overflow-y-auto -mr-2 pr-2">
          <div className="space-y-0">
            {curriculum.chapters.map((chapter) => (
              <div key={chapter.chapterID}>
                {/* Chapter Row */}
                <div className="flex items-center gap-3 py-3 border-b border-neutral-700 hover:bg-white/5 transition-colors">
                  <button
                    onClick={() => onToggleChapter(chapter.chapterID)}
                    className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                  >
                    {chapter.isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-white" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                  </svg>
                  <span className="text-white text-sm font-medium flex-1 leading-tight">
                    {chapter.title}
                  </span>
                </div>

                {chapter.isExpanded && (
                  <div className="space-y-0">
                    {chapter.lessons.map((lesson) => (
                      <div key={lesson.lessonID} className="flex items-center gap-3 py-3 pl-9 border-b border-neutral-700/50 hover:bg-white/5 transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                        <LessonTypeIcon type={lesson.type} />
                        <span className="text-stone-300 text-sm flex-1 leading-tight">
                          {lesson.title}
                        </span>
                        {lesson.estimatedMinutes && (
                          <span className="text-xs text-stone-500">
                            {lesson.estimatedMinutes}m
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {chapter.isExpanded && (
                  <div className="pl-9 py-2 border-b border-neutral-700/50">
                    <button
                      onClick={() => onAddLesson(chapter.chapterID)}
                      className="w-auto text-left px-3 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add lesson
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Empty state */}
            {curriculum.chapters.length === 0 && (
              <div className="text-center py-8">
                <p className="text-stone-400 text-sm">No chapters yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="pt-4 mt-4 border-t border-neutral-700 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={onAddChapter}
              className="flex-1 px-3 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm justify-center"
            >
              <Plus className="w-4 h-4" />
              Chapter
            </button>
            <button
              onClick={onUploadContent}
              className="flex-1 px-3 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm justify-center"
            >
              <Upload className="w-4 h-4" />
              Upload content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
