'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Menu } from 'lucide-react';
import type { ExtendedCourse, CreateCourseChapter, CreateCourseLesson } from '@nlc-ai/sdk-course';
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
  SettingsTab,
  ChapterForm,
  LessonTypeSelector
} from '@/lib';
import {toast} from "sonner";

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
type ViewState = 'course' | 'chapter-form' | 'lesson-selector' | 'lesson-form';

const CourseEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseID = params?.courseID as string;

  const [activeTab, setActiveTab] = useState('Curriculum');
  const [course, setCourse] = useState<ExtendedCourse | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumState>({ chapters: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewState, setViewState] = useState<ViewState>('course');
  const [selectedChapter, setSelectedChapter] = useState<{ chapterID: string; title: string; lessons: number; } | null>(null);
  const [lessonType, setLessonType] = useState<LessonType | ''>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);

  // Load course data on mount
  useEffect(() => {
    if (!courseID) return;

    const loadCourse = async () => {
      try {
        setIsLoading(true);
        const courseData = await sdkClient.courses.getCourse(courseID);
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
        await sdkClient.courses.unpublishCourse(course.id);
      } else {
        await sdkClient.courses.publishCourse(course.id);
      }

      const updatedCourse = await sdkClient.courses.getCourse(course.id);
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
    const chapter = curriculum.chapters.find(ch => ch.chapterID === chapterID);
    if (chapter) {
      setSelectedChapter({
        chapterID: chapter.chapterID,
        title: chapter.title,
        lessons: chapter.lessons.length,
      });
      setViewState('lesson-selector');
    }
  };

  const handleAddChapter = () => {
    setShowChapterModal(true);
  };

  const handleCreateChapter = async (chapterData: CreateCourseChapter) => {
    try {
      await sdkClient.courses.chapters.createChapter(courseID, chapterData);

      // Reload course data
      const updatedCourse = await sdkClient.courses.getCourse(courseID);
      setCourse(updatedCourse);

      // Update curriculum state
      if (updatedCourse.chapters) {
        setCurriculum({
          chapters: updatedCourse.chapters.map(chapter => ({
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

      setShowChapterModal(false);
      setViewState('course');
    } catch (error: any) {
      console.error('Error creating chapter:', error);
      toast.error('Failed to create chapter');
      // setError('Failed to create chapter');
    }
  };

  const handleSelectLessonType = (type: LessonType) => {
    setLessonType(type);
    setViewState('lesson-form');
  };

  const handleCreateLesson = async (lessonData: any) => {
    if (!selectedChapter) return;

    try {

      const createLessonData: CreateCourseLesson = {
        title: lessonData.title,
        description: lessonData.description || undefined,
        orderIndex: selectedChapter.lessons,
        lessonType: lessonData.type,
        content: lessonData.content || lessonData.text || undefined,
        videoUrl: lessonData.videoUrl || undefined,
        videoDuration: lessonData.videoDuration || undefined,
        pdfUrl: lessonData.pdfUrl || undefined,
        estimatedMinutes: lessonData.estimatedMinutes || 30,
        dripDelay: 0,
        isLocked: !lessonData.settings?.isFreePreview || false
      };

      await sdkClient.courses.lessons.createLesson(courseID, selectedChapter.chapterID, createLessonData);

      // Reload course data
      const updatedCourse = await sdkClient.courses.getCourse(courseID);
      setCourse(updatedCourse);

      // Update curriculum state
      if (updatedCourse.chapters) {
        setCurriculum({
          chapters: updatedCourse.chapters.map(chapter => ({
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

      // Reset state
      setViewState('course');
      setSelectedChapter(null);
      setLessonType('');
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      toast.error('Failed to create lesson');
      // setError('Failed to create lesson');
    }
  };

  const handleBackToSelector = () => {
    setLessonType('');
    setViewState('lesson-selector');
  };

  const handleBackToCourse = () => {
    setViewState('course');
    setSelectedChapter(null);
    setLessonType('');
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

  // Render chapter form as modal
  if (showChapterModal) {
    return (
      <>
        <div className="min-h-screen w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>
          <div className="absolute top-32 left-20 w-40 h-40 bg-gradient-to-br from-purple-400/15 to-violet-500/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>

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
                <CurriculumSidebar
                  course={course}
                  curriculum={curriculum}
                  onToggleChapter={toggleChapter}
                  onAddLesson={handleAddLesson}
                  onAddChapter={handleAddChapter}
                  onUploadContent={handleUploadContent}
                  isMobileOpen={sidebarOpen}
                  onMobileClose={() => setSidebarOpen(false)}
                />

                <div className="flex-1 flex flex-col">
                  <div className="md:hidden p-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                    >
                      <Menu className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="h-full p-4 md:p-8 flex flex-col relative overflow-auto">
                      <CurriculumContent
                        course={course}
                        activeTab={activeTab}
                        onCreateLesson={() => {}}
                        onTabChange={setActiveTab}
                      />

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

        <ChapterForm
          courseID={courseID}
          onBack={() => setShowChapterModal(false)}
          onSave={handleCreateChapter}
          isModal={true}
          onClose={() => setShowChapterModal(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>
      <div className="absolute top-32 left-20 w-40 h-40 bg-gradient-to-br from-purple-400/15 to-violet-500/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-32 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>

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
            <CurriculumSidebar
              course={course}
              curriculum={curriculum}
              onToggleChapter={toggleChapter}
              onAddLesson={handleAddLesson}
              onAddChapter={handleAddChapter}
              onUploadContent={handleUploadContent}
              isMobileOpen={sidebarOpen}
              onMobileClose={() => setSidebarOpen(false)}
            />

            {viewState === 'course' && (
              <div className="flex-1 flex flex-col">
                <div className="md:hidden p-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="h-full p-4 md:p-8 flex flex-col relative overflow-auto">
                    <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-violet-500/10 rounded-full blur-2xl"></div>

                    <CurriculumContent
                      course={course}
                      activeTab={activeTab}
                      onCreateLesson={() => setViewState('lesson-selector')}
                      onTabChange={setActiveTab}
                    />

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
            )}

            {viewState === 'lesson-selector' && (
              <div className="flex-1 overflow-hidden">
                <div className="h-full p-4 md:p-8 flex flex-col relative overflow-auto">
                  <LessonTypeSelector
                    selectedChapter={selectedChapter}
                    onBack={handleBackToCourse}
                    onSelectType={handleSelectLessonType}
                  />
                </div>
              </div>
            )}

            {viewState === 'lesson-form' && (
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto">
                  {lessonType === 'video' && (
                    <VideoLessonForm
                      chapterID={selectedChapter?.chapterID || ''}
                      lessonID=""
                      onSave={handleCreateLesson}
                      onBack={handleBackToSelector}
                    />
                  )}

                  {lessonType === 'pdf' && (
                    <PDFLessonForm
                      chapterID={selectedChapter?.chapterID || ''}
                      lessonID=""
                      onSave={handleCreateLesson}
                      onBack={handleBackToSelector}
                    />
                  )}

                  {lessonType === 'text' && (
                    <TextLessonForm
                      chapterID={selectedChapter?.chapterID || ''}
                      lessonID=""
                      onSave={handleCreateLesson}
                      onBack={handleBackToSelector}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEditPage;
