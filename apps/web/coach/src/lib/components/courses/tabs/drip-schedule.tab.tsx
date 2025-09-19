import { cn } from "@nlc-ai/web-ui";
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calendar, Clock, Save, Info } from 'lucide-react';
import type { ExtendedCourse } from '@nlc-ai/sdk-course';
import { sdkClient } from '@/lib';
import { toast } from 'sonner';

interface LessonDripProps {
  lessonID: string;
  title: string;
  defaultDays?: number;
  dripType: 'course_start' | 'previous_lesson';
  onDripChange: (lessonID: string, days: number, type: 'course_start' | 'previous_lesson') => void;
  isFirst?: boolean;
}

const LessonDrip: React.FC<LessonDripProps> = ({
                                                 lessonID,
                                                 title,
                                                 defaultDays = 0,
                                                 dripType,
                                                 onDripChange,
                                                 isFirst = false
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
              onChange={(e) => handleDaysChange(Math.max(0, Number(e.target.value)))}
              min="0"
              max="365"
              disabled={isFirst && selectedType === 'course_start'}
              className="w-16 bg-neutral-800 border border-neutral-600 text-white rounded px-2 py-1 text-sm focus:border-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-sm text-white/70">days</span>
          </div>

          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value as 'course_start' | 'previous_lesson')}
              disabled={isFirst} // First lesson should always be available from course start
              className="bg-neutral-800 border border-neutral-600 text-white rounded px-2 py-1 text-sm focus:border-purple-500 focus:outline-none appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="course_start">from course start</option>
              <option value="previous_lesson">from previous lesson</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="text-xs text-white/50">
        {isFirst && selectedType === 'course_start' ? (
          days === 0 ? 'Available immediately upon enrollment' : `Available ${days} days after student enrolls`
        ) : selectedType === 'course_start'
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
  dripSettings: { [lessonID: string]: { days: number; type: 'course_start' | 'previous_lesson' } };
}

const CourseModule: React.FC<CourseModuleProps> = ({
                                                     chapterID,
                                                     title,
                                                     lessonCount,
                                                     lessons = [],
                                                     isExpanded = false,
                                                     onToggle,
                                                     onDripChange,
                                                     dripSettings
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
          {lessons.map((lesson, index) => {
            const lessonDripSetting = dripSettings[lesson.lessonID] || {
              days: index === 0 ? 0 : 7,
              type: index === 0 ? 'course_start' : 'previous_lesson'
            };

            return (
              <LessonDrip
                key={lesson.lessonID}
                lessonID={lesson.lessonID}
                title={lesson.title}
                defaultDays={lessonDripSetting.days}
                dripType={lessonDripSetting.type}
                onDripChange={onDripChange}
                isFirst={index === 0}
              />
            );
          })}
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
  const [isDripEnabled, setIsDripEnabled] = useState(course?.isDripEnabled || false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load existing drip schedule on mount
  useEffect(() => {
    loadDripSchedule();
  }, [courseID]);

  const loadDripSchedule = async () => {
    if (!courseID) return;

    setIsLoading(true);
    try {
      const dripData = await sdkClient.courses.dripSchedule.getDripSchedule(courseID);

      setIsDripEnabled(dripData.isDripEnabled);

      // Initialize drip settings for all lessons
      const initialSettings: typeof dripSettings = {};

      course?.chapters?.forEach(chapter => {
        chapter.lessons?.forEach((lesson, index) => {
          // Check if we have existing drip settings for this lesson
          const existingSetting = dripData.lessons?.find((l: any) => l.lessonID === lesson.id);

          if (existingSetting) {
            initialSettings[lesson.id] = {
              days: existingSetting.dripDelay || 0,
              type: existingSetting.dripType || (index === 0 ? 'course_start' : 'previous_lesson')
            };
          } else {
            // Default settings
            initialSettings[lesson.id] = {
              days: index === 0 ? 0 : 7, // First lesson immediate, others weekly
              type: index === 0 ? 'course_start' : 'previous_lesson'
            };
          }
        });
      });

      setDripSettings(initialSettings);
    } catch (error: any) {
      console.error('Failed to load drip schedule:', error);
      toast.error('Failed to load drip schedule');
    } finally {
      setIsLoading(false);
    }
  };

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
    setHasUnsavedChanges(true);
  };

  const handleDripEnabledToggle = (enabled: boolean) => {
    setIsDripEnabled(enabled);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!courseID) return;

    setIsSaving(true);
    try {
      // Update course-level drip settings
      await sdkClient.courses.dripSchedule.updateDripSchedule(courseID, {
        isDripEnabled,
        dripInterval: 'custom', // Using custom intervals per lesson
        dripCount: Object.keys(dripSettings).length
      });

      // Update individual lesson drip settings
      const lessonSettings = Object.entries(dripSettings).map(([lessonID, setting]) => ({
        lessonID,
        days: setting.days,
        type: setting.type
      }));

      await sdkClient.courses.dripSchedule.updateLessonDripSchedule(courseID, {
        lessonSettings
      });

      toast.success('Drip schedule saved successfully');
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error('Failed to save drip schedule:', error);
      toast.error(error.message || 'Failed to save drip schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSetup = (pattern: 'immediate' | 'daily' | 'weekly' | 'monthly') => {
    const newSettings: typeof dripSettings = {};

    course?.chapters?.forEach(chapter => {
      chapter.lessons?.forEach((lesson, lessonIndex, allLessons) => {
        const globalIndex = course.chapters!.reduce((acc, ch, chIndex) => {
          if (chIndex < course.chapters!.indexOf(chapter)) {
            return acc + (ch.lessons?.length || 0);
          }
          return acc;
        }, 0) + lessonIndex;

        let days = 0;
        let type: 'course_start' | 'previous_lesson' = 'course_start';

        switch (pattern) {
          case 'immediate':
            days = 0;
            type = 'course_start';
            break;
          case 'daily':
            days = globalIndex;
            type = globalIndex === 0 ? 'course_start' : 'previous_lesson';
            break;
          case 'weekly':
            days = globalIndex * 7;
            type = globalIndex === 0 ? 'course_start' : 'previous_lesson';
            break;
          case 'monthly':
            days = globalIndex * 30;
            type = globalIndex === 0 ? 'course_start' : 'previous_lesson';
            break;
        }

        newSettings[lesson.id] = { days, type };
      });
    });

    setDripSettings(newSettings);
    setHasUnsavedChanges(true);
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

  if (isLoading) {
    return (
      <div className="flex h-auto p-4 md:p-8 flex-col items-center justify-center rounded-[20px] md:rounded-[30px] border border-[#2B2A2A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mb-4"></div>
        <p className="text-white/60">Loading drip schedule...</p>
      </div>
    );
  }

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

            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Info className="w-4 h-4" />
                  <span>Unsaved changes</span>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity self-start disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Schedule
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Drip Schedule Toggle */}
          <div className="flex items-center gap-4 p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50 w-full">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  id="drip-enabled"
                  checked={isDripEnabled}
                  onChange={(e) => handleDripEnabledToggle(e.target.checked)}
                  className="sr-only"
                />
                <div
                  onClick={() => handleDripEnabledToggle(!isDripEnabled)}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    isDripEnabled ? 'bg-purple-600' : 'bg-neutral-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                      isDripEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </div>
              <label htmlFor="drip-enabled" className="text-white font-medium cursor-pointer">
                Enable Drip Schedule
              </label>
            </div>

            <div className="text-sm text-white/60">
              {isDripEnabled
                ? 'Lessons will be released according to the schedule below'
                : 'All lessons will be available immediately upon enrollment'
              }
            </div>
          </div>

          {/* Quick Setup Options */}
          {isDripEnabled && (
            <div className="flex flex-col gap-3 p-4 bg-neutral-800/10 rounded-lg border border-neutral-700/30 w-full">
              <div className="text-white/80 font-medium text-sm">Quick Setup:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickSetup('immediate')}
                  className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
                >
                  All Immediate
                </button>
                <button
                  onClick={() => handleQuickSetup('daily')}
                  className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
                >
                  Daily Release
                </button>
                <button
                  onClick={() => handleQuickSetup('weekly')}
                  className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
                >
                  Weekly Release
                </button>
                <button
                  onClick={() => handleQuickSetup('monthly')}
                  className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
                >
                  Monthly Release
                </button>
              </div>
            </div>
          )}

          {/* Legend */}
          {isDripEnabled && (
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
          )}
        </div>

        {/* Course Modules */}
        {courseModules.length > 0 && isDripEnabled ? (
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
                dripSettings={dripSettings}
              />
            ))}
          </div>
        ) : courseModules.length > 0 && !isDripEnabled ? (
          <div className="flex flex-col items-center justify-center p-8 text-center w-full bg-neutral-800/10 rounded-lg border border-neutral-700/30">
            <Calendar className="w-12 h-12 text-white/40 mb-4" />
            <div className="text-white/60 mb-2">Drip Schedule Disabled</div>
            <div className="text-white/40 text-sm">All lessons are available immediately upon enrollment. Enable drip schedule above to control content release timing.</div>
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
