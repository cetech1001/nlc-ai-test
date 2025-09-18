import { cn } from "@nlc-ai/web-ui";
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-react';
import type { ExtendedCourse } from '@nlc-ai/sdk-course';

interface LessonDripProps {
  lessonID: string;
  title: string;
  defaultDays?: number;
  dripType: 'course_start' | 'previous_lesson';
  onDripChange: (lessonID: string, days: number, type: 'course_start' | 'previous_lesson') => void;
}

const LessonDrip: React.FC<LessonDripProps> = ({
 lessonID,
 title,
 defaultDays = 0,
 dripType,
 onDripChange
}) => {
  const [days, setDays] = useState(defaultDays);
  const [selectedType, setSelectedType] = useState(dripType);

  const handleDaysChange = (newDays: number) => {
    setDays(newDays);
    onDripChange(lessonID, newDays, selectedType);
  };

  const handleTypeChange = (newType: 'course_start' | 'previous_lesson') => {
    setSelectedType(newType);
    onDripChange(lessonID, days, newType);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="flex-1 text-white font-inter text-sm md:text-base font-normal truncate">
          {title}
        </span>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <input
              type="number"
              value={days}
              onChange={(e) => handleDaysChange(Number(e.target.value))}
              min="0"
              className="w-16 bg-neutral-800 border border-neutral-600 text-white rounded px-2 py-1 text-sm focus:border-purple-500 focus:outline-none"
            />
            <span className="text-sm text-white/70">days</span>
          </div>

          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value as 'course_start' | 'previous_lesson')}
              className="bg-neutral-800 border border-neutral-600 text-white rounded px-2 py-1 text-sm focus:border-purple-500 focus:outline-none appearance-none pr-8"
            >
              <option value="course_start">from course start</option>
              <option value="previous_lesson">from previous lesson</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="text-xs text-white/50">
        {selectedType === 'course_start'
          ? `Available ${days} days after student enrolls`
          : `Available ${days} days after previous lesson is completed`
        }
      </div>
    </div>
  );
};

interface CourseModuleProps {
  chapterID: string;
  title: string;
  lessonCount: number;
  lessons: Array<{
    lessonID: string;
    title: string;
    type: string;
    estimatedMinutes?: number;
  }>;
  isExpanded?: boolean;
  onToggle: () => void;
  onDripChange: (lessonID: string, days: number, type: 'course_start' | 'previous_lesson') => void;
}

const CourseModule: React.FC<CourseModuleProps> = ({
                                                     chapterID,
                                                     title,
                                                     lessonCount,
                                                     lessons = [],
                                                     isExpanded = false,
                                                     onToggle,
                                                     onDripChange
                                                   }) => {
  return (
    <div className="flex p-4 md:p-6 flex-col justify-center items-start gap-5 self-stretch rounded-[20px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
      <div className="flex items-center gap-3 cursor-pointer w-full" onClick={onToggle}>
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "transition-transform flex-shrink-0",
            isExpanded ? "rotate-90" : "rotate-0"
          )}>
            <ChevronRight className="w-5 h-5 text-white/60" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-white font-inter text-lg md:text-xl font-medium leading-[25.6px]">
              {title}
            </span>
            <span className="text-white/60 font-inter text-sm font-normal leading-[25.6px]">
              ({lessonCount} lessons)
            </span>
          </div>
        </div>
      </div>

      {isExpanded && lessons.length > 0 && (
        <div className="flex flex-col items-start gap-3 self-stretch w-full animate-in slide-in-from-top-2 duration-200">
          <div className="text-white/70 text-sm font-medium mb-2">
            Lesson Drip Schedule:
          </div>
          {lessons.map((lesson, index) => (
            <LessonDrip
              key={lesson.lessonID}
              lessonID={lesson.lessonID}
              title={lesson.title}
              defaultDays={index === 0 ? 0 : index * 7} // First lesson available immediately, others weekly
              dripType={index === 0 ? 'course_start' : 'previous_lesson'}
              onDripChange={onDripChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface DripScheduleTabProps {
  courseID: string;
  course?: ExtendedCourse | null;
}

export const DripScheduleTab: React.FC<DripScheduleTabProps> = ({ courseID, course }) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [dripSettings, setDripSettings] = useState<{
    [lessonID: string]: { days: number; type: 'course_start' | 'previous_lesson' }
  }>({});

  const toggleModule = (chapterID: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(chapterID)) {
      newExpanded.delete(chapterID);
    } else {
      newExpanded.add(chapterID);
    }
    setExpandedModules(newExpanded);
  };

  const handleDripChange = (lessonID: string, days: number, type: 'course_start' | 'previous_lesson') => {
    setDripSettings(prev => ({
      ...prev,
      [lessonID]: { days, type }
    }));
  };

  const handleSave = () => {
    console.log('Saving drip schedule for course:', courseID, dripSettings);
    // TODO: Implement API call
    // await sdkClient.course.dripSchedule.updateSchedule(courseID, dripSettings);
  };

  // Transform course data to display format
  const courseModules = course?.chapters?.map(chapter => ({
    chapterID: chapter.id,
    title: chapter.title,
    lessonCount: chapter.lessons?.length || 0,
    lessons: chapter.lessons?.map(lesson => ({
      lessonID: lesson.id,
      title: lesson.title,
      type: lesson.lessonType,
      estimatedMinutes: lesson.estimatedMinutes
    })) || []
  })) || [];

  return (
    <div className="flex h-auto p-4 md:p-8 flex-col items-start flex-shrink-0 rounded-[20px] md:rounded-[30px] border border-[#2B2A2A] max-h-full overflow-auto">
      <div className="flex w-full flex-col items-start gap-6 md:gap-8">
        {/* Header */}
        <div className="flex flex-col items-start gap-3 self-stretch">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 w-full">
            <div className="flex flex-col items-start gap-1 flex-1">
              <h3 className="text-[#F9F9F9] font-inter text-xl md:text-2xl font-semibold leading-[25.6px]">
                Drip Schedule
              </h3>
              <p className="text-[#838383] font-inter text-sm md:text-base font-normal">
                Control when lessons become available to students. Set up automatic content release based on enrollment date or lesson completion.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity self-start"
            >
              Save Schedule
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 p-3 bg-neutral-800/20 rounded-lg border border-neutral-700/50 w-full">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/70">Course Start: Available X days after enrollment</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/70">Previous Lesson: Available X days after previous lesson completion</span>
            </div>
          </div>
        </div>

        {/* Course Modules */}
        {courseModules.length > 0 ? (
          <div className="flex flex-col items-start gap-5 self-stretch w-full">
            {courseModules.map((module) => (
              <CourseModule
                key={module.chapterID}
                chapterID={module.chapterID}
                title={module.title}
                lessonCount={module.lessonCount}
                lessons={module.lessons}
                isExpanded={expandedModules.has(module.chapterID)}
                onToggle={() => toggleModule(module.chapterID)}
                onDripChange={handleDripChange}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center w-full">
            <div className="text-white/60 mb-2">No chapters found</div>
            <div className="text-white/40 text-sm">Create chapters and lessons first to set up drip scheduling</div>
          </div>
        )}
      </div>
    </div>
  );
};
