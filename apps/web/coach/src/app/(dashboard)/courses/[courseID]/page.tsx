'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { ExtendedCourse } from '@nlc-ai/sdk-course';
import {
  sdkClient,
  CourseHeader,
  TabNavigation,
  CurriculumSidebar,
  CurriculumContent,
  DripScheduleTab,
  PaywallTab,
  LoadingSkeleton,
  ErrorState,
  PDFLessonForm,
  VideoLessonForm,
  TextLessonForm, SettingsTab
} from '@/lib';

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

type LessonType = 'video' | 'text' | 'pdf';

const CurriculumScreen = () => {
  const router = useRouter();
  const params = useParams();
  const courseID = params?.courseID as string;

  const [activeTab, setActiveTab] = useState('Curriculum');
  const [course, setCourse] = useState<ExtendedCourse | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumState>({ chapters: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [_, setSelectedChapter] = useState<string | null>(null);
  const [__, setShowCreateChapter] = useState(false);
  const [___, setShowCreateLesson] = useState(false);
  const [lessonType, setLessonType] = useState<LessonType | ''>('');

  // Load course data on mount
  useEffect(() => {
    if (!courseID) return;

    const loadCourse = async () => {
      try {
        setIsLoading(true);
        const courseData = await sdkClient.course.courses.getCourse(courseID);
        setCourse(courseData);

        // Transform course data to curriculum state
        if (courseData.chapters) {
          setCurriculum({
            chapters: courseData.chapters.map(chapter => ({
              chapterID: chapter.id,
              title: chapter.title,
              description: chapter.description,
              isExpanded: true, // Start with all chapters expanded
              lessons: chapter.lessons?.map(lesson => ({
                lessonID: lesson.id,
                title: lesson.title,
                type: lesson.lessonType,
                estimatedMinutes: lesson.estimatedMinutes
              })) || []
            }))
          });
        }
      } catch (error: any) {
        console.error('Error loading course:', error);
        setError('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseID]);

  // Event handlers
  const handleBack = () => {
    router.push('/courses');
  };

  const handlePreview = () => {
    if (course) {
      console.log('Preview course:', course.id);
      // TODO: Implement course preview
    }
  };

  const handleUpdateStatus = async () => {
    if (!course) return;

    try {
      if (course.isPublished) {
        await sdkClient.course.courses.unpublishCourse(course.id);
      } else {
        await sdkClient.course.courses.publishCourse(course.id);
      }

      // Reload course data to get updated status
      const updatedCourse = await sdkClient.course.courses.getCourse(course.id);
      setCourse(updatedCourse);
    } catch (error: any) {
      console.error('Error updating course status:', error);
      setError('Failed to update course status');
    }
  };

  const toggleChapter = (chapterID: string) => {
    setCurriculum(prev => ({
      ...prev,
      chapters: prev.chapters.map(chapter =>
        chapter.chapterID === chapterID
          ? { ...chapter, isExpanded: !chapter.isExpanded }
          : chapter
      )
    }));
  };

  const handleAddLesson = (chapterID: string) => {
    setSelectedChapter(chapterID);
    setShowCreateLesson(true);
  };

  const handleAddChapter = () => {
    setShowCreateChapter(true);
  };

  const handleCreateLesson = (type: LessonType) => {
    console.log('Create lesson of type:', type);
    setLessonType(type);
    // TODO: Implement lesson creation with specific type
  };

  const handleUploadContent = () => {
    console.log('Upload content');
    // TODO: Implement content upload flow
  };

  // Loading and error states
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>

      <div className="pt-8 pb-16 px-6 w-full relative z-10">
        <CourseHeader
          course={course}
          onBack={handleBack}
          onPreview={handlePreview}
          onUpdateStatus={handleUpdateStatus}
        />

        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="h-[calc(100vh-280px)] relative">
          {/*<div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-600/20 rounded-full blur-3xl"></div>*/}
          {/*<div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-l from-fuchsia-500/20 to-purple-600/20 rounded-full blur-3xl"></div>*/}

          <div className="h-full bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 overflow-hidden flex relative">
            <CurriculumSidebar
              course={course}
              curriculum={curriculum}
              onToggleChapter={toggleChapter}
              onAddLesson={handleAddLesson}
              onAddChapter={handleAddChapter}
              onUploadContent={handleUploadContent}
            />

            <div className="flex-1">
              <div className="h-full p-8 flex flex-col relative">
                <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-violet-500/10 rounded-full blur-2xl"></div>

                {lessonType === '' && (
                  <CurriculumContent
                    course={course}
                    activeTab={activeTab}
                    onCreateLesson={handleCreateLesson}
                    onTabChange={setActiveTab}
                  />
                )}

                {lessonType === 'video' && (
                  <VideoLessonForm
                    chapterID={''}
                    lessonID={''}
                    onSave={handleCreateLesson}
                    onBack={() => setLessonType('')}
                  />
                )}

                {lessonType === 'pdf' && (
                  <PDFLessonForm
                    chapterID={''}
                    lessonID={''}
                    onSave={handleCreateLesson}
                    onBack={() => setLessonType('')}
                  />
                )}

                {lessonType === 'text' && (
                  <TextLessonForm
                    chapterID={''}
                    lessonID={''}
                    onSave={handleCreateLesson}
                    onBack={() => setLessonType('')}
                  />
                )}

                {activeTab === 'Settings' && (
                  <SettingsTab courseID={courseID} />
                )}

                {activeTab === 'Drip schedule' && (
                  <DripScheduleTab courseID={courseID} />
                )}

                {activeTab === 'Pricing' && (
                  <PaywallTab courseID={courseID} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumScreen;
