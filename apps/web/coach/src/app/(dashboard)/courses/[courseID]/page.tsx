'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Menu } from 'lucide-react';
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
  TextLessonForm,
  SettingsTab
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

const CourseEditPage = () => {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              isExpanded: true,
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
  };

  const handleUploadContent = () => {
    console.log('Upload content');
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

      <div className="pt-4 md:pt-8 pb-16 px-4 md:px-6 w-full relative z-10">
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

        <div className="h-[calc(100vh-240px)] md:h-[calc(100vh-280px)] relative">
          <div className="h-full bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[16px] md:rounded-[20px] border border-neutral-700 overflow-hidden flex relative">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <div className={`
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              md:translate-x-0 transition-transform duration-300 ease-in-out
              fixed md:relative z-50 md:z-auto
              w-80 md:w-96 flex-shrink-0 border-r border-neutral-700
              h-full
            `}>
              <CurriculumSidebar
                course={course}
                curriculum={curriculum}
                onToggleChapter={toggleChapter}
                onAddLesson={handleAddLesson}
                onAddChapter={handleAddChapter}
                onUploadContent={handleUploadContent}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Mobile Menu Button */}
              <div className="md:hidden p-4 border-b border-neutral-700">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="h-full p-4 md:p-8 flex flex-col relative overflow-auto">
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
                    <SettingsTab course={course} />
                  )}

                  {activeTab === 'Drip schedule' && (
                    <DripScheduleTab courseID={courseID} course={course} />
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
    </div>
  );
};

export default CourseEditPage;
