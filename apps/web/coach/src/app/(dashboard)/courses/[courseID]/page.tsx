'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Menu } from 'lucide-react';
import type { ExtendedCourse, CreateCourseChapter, CreateCourseLesson } from '@nlc-ai/sdk-courses';
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
import {MediaTransformationType} from "@nlc-ai/types";

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
type ViewState = 'course' | 'chapter-form' | 'lesson-selector' | 'lesson-form' | 'edit-chapter' | 'edit-lesson';

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
  const [editingChapter, setEditingChapter] = useState<{ id: string; title: string; description?: string; orderIndex: number; } | null>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
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

  // Course update handler for Settings and Paywall tabs
  const handleCourseUpdate = (updatedCourse: ExtendedCourse) => {
    setCourse(updatedCourse);
    toast.success('Course updated successfully');
  };

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
      toast.success(`Course ${updatedCourse.isPublished ? 'published' : 'unpublished'} successfully`);
    } catch (error: any) {
      console.error('Error updating course status:', error);
      setError('Failed to update course status');
      toast.error('Failed to update course status');
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
      setEditingLesson(null);
      setViewState('lesson-selector');
    }
  };

  const handleEditChapter = (chapterID: string) => {
    const chapter = course?.chapters?.find(ch => ch.id === chapterID);
    if (chapter) {
      setEditingChapter({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        orderIndex: chapter.orderIndex
      });
      setShowChapterModal(true);
    }
  };

  const handleEditLesson = (chapterID: string, lessonID: string) => {
    const chapter = course?.chapters?.find(ch => ch.id === chapterID);
    const lesson = chapter?.lessons?.find(l => l.id === lessonID);

    if (lesson && chapter) {
      setSelectedChapter({
        chapterID: chapter.id,
        title: chapter.title,
        lessons: chapter.lessons?.length || 0
      });

      setEditingLesson({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        videoDuration: lesson.videoDuration,
        pdfUrl: lesson.pdfUrl,
        estimatedMinutes: lesson.estimatedMinutes,
        isLocked: lesson.isLocked
      });

      setLessonType(lesson.lessonType as LessonType);
      setViewState('lesson-form');
    }
  };

  const handleAddChapter = () => {
    setEditingChapter(null);
    setShowChapterModal(true);
  };

  const handleCreateChapter = async (chapterData: CreateCourseChapter) => {
    try {
      if (editingChapter) {
        // Update existing chapter
        await sdkClient.courses.chapters.updateChapter(courseID, editingChapter.id, chapterData);
        toast.success('Chapter updated successfully');
      } else {
        // Create new chapter
        await sdkClient.courses.chapters.createChapter(courseID, chapterData);
        toast.success('Chapter created successfully');
      }

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
      setEditingChapter(null);
      setViewState('course');
    } catch (error: any) {
      console.error('Error saving chapter:', error);
      toast.error(`Failed to ${editingChapter ? 'update' : 'create'} chapter`);
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

      if (editingLesson) {
        // Update existing lesson
        await sdkClient.courses.lessons.updateLesson(courseID, selectedChapter.chapterID, editingLesson.id, createLessonData);
        toast.success('Lesson updated successfully');
      } else {
        // Create new lesson
        await sdkClient.courses.lessons.createLesson(courseID, selectedChapter.chapterID, createLessonData);
        toast.success('Lesson created successfully');
      }

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
      setEditingLesson(null);
      setLessonType('');
    } catch (error: any) {
      console.error('Error saving lesson:', error);
      toast.error(`Failed to ${editingLesson ? 'update' : 'create'} lesson`);
    }
  };

  const handleReorderChapters = async (reorderedChapters: CurriculumState['chapters']) => {
    try {

      const chapterIDs = reorderedChapters.map(r => r.chapterID);
      await sdkClient.courses.chapters.reorderChapters(courseID, chapterIDs);

      // Update local state
      setCurriculum({ chapters: reorderedChapters });

      toast.success('Chapter order updated');
    } catch (error: any) {
      console.error('Error reordering chapters:', error);
      toast.error('Failed to update chapter order');
    }
  };

  const handleReorderLessons = async (chapterID: string, reorderedLessons: CurriculumState['chapters'][0]['lessons']) => {
    try {
      // Update order indexes
      /*const updates = reorderedLessons.map((lesson, index) => ({
        lessonID: lesson.lessonID,
        orderIndex: index
      }));*/

      const lessonIDs = reorderedLessons.map(r => r.lessonID);

      await sdkClient.courses.lessons.reorderLessons(courseID, chapterID, lessonIDs);

      // Call API to update lesson order
      /*await Promise.all(updates.map(update =>
        sdkClient.courses.lessons.updateLesson(courseID, chapterID, update.lessonID, { orderIndex: update.orderIndex })
      ));*/

      // Update local state
      setCurriculum(prev => ({
        ...prev,
        chapters: prev.chapters.map(chapter =>
          chapter.chapterID === chapterID
            ? { ...chapter, lessons: reorderedLessons }
            : chapter
        )
      }));

      toast.success('Lesson order updated');
    } catch (error: any) {
      console.error('Error reordering lessons:', error);
      toast.error('Failed to update lesson order');
    }
  };

  const handleDeleteChapter = async (chapterID: string) => {
    const chapter = curriculum.chapters.find(ch => ch.chapterID === chapterID);
    const chapterTitle = chapter?.title || 'this chapter';

    if (window.confirm(`Are you sure you want to delete "${chapterTitle}"? This will also delete all lessons within it. This action cannot be undone.`)) {
      try {
        await sdkClient.courses.chapters.deleteChapter(courseID, chapterID);

        // Remove from local state
        setCurriculum(prev => ({
          ...prev,
          chapters: prev.chapters.filter(ch => ch.chapterID !== chapterID)
        }));

        // Reload course data to ensure consistency
        const updatedCourse = await sdkClient.courses.getCourse(courseID);
        setCourse(updatedCourse);

        toast.success(`Chapter "${chapterTitle}" deleted successfully`);
      } catch (error: any) {
        console.error('Error deleting chapter:', error);
        toast.error('Failed to delete chapter');
      }
    }
  };

  const handleDeleteLesson = async (chapterID: string, lessonID: string) => {
    const chapter = curriculum.chapters.find(ch => ch.chapterID === chapterID);
    const lesson = chapter?.lessons.find(l => l.lessonID === lessonID);
    const lessonTitle = lesson?.title || 'this lesson';

    if (window.confirm(`Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`)) {
      try {
        await sdkClient.courses.lessons.deleteLesson(courseID, chapterID, lessonID);

        // Remove from local state
        setCurriculum(prev => ({
          ...prev,
          chapters: prev.chapters.map(chapter =>
            chapter.chapterID === chapterID
              ? {
                ...chapter,
                lessons: chapter.lessons.filter(lesson => lesson.lessonID !== lessonID)
              }
              : chapter
          )
        }));

        // Reload course data to ensure consistency
        const updatedCourse = await sdkClient.courses.getCourse(courseID);
        setCourse(updatedCourse);

        toast.success(`Lesson "${lessonTitle}" deleted successfully`);
      } catch (error: any) {
        console.error('Error deleting lesson:', error);
        toast.error('Failed to delete lesson');
      }
    }
  };

  const handleBackToSelector = () => {
    setLessonType('');
    setEditingLesson(null);
    setViewState('lesson-selector');
  };

  const handleBackToCourse = () => {
    setViewState('course');
    setSelectedChapter(null);
    setEditingLesson(null);
    setLessonType('');
  };

  const handleUploadContent = () => {
    console.log('Upload content');
  };

  const handleUploadVideo = async (file: File): Promise<{ url: string; assetID?: string; processingStatus?: string; message?: string }> => {
    try {
      const uploadResult = await sdkClient.media.uploadAsset(file, {
        folder: `nlc-ai/courses/${courseID}/videos`,
        tags: ['course-video', 'lesson-content'],
        metadata: {
          uploadedBy: 'coach',
          courseID: courseID,
          purpose: 'lesson-video'
        },
        transformation: [
          {
            type: MediaTransformationType.QUALITY,
            quality: 'auto'
          }
        ]
      });

      if (uploadResult.success && uploadResult.data?.asset) {
        const { data } = uploadResult;

        // Check if this is an async processing response
        const isAsyncProcessing = data.processingStatus === 'processing';

        if (isAsyncProcessing) {
          toast.success('Video uploaded! Processing for optimal quality...');
        } else {
          toast.success('Video uploaded successfully!');
        }

        return {
          url: data.asset!.secureUrl,
          assetID: data.asset!.id,
          processingStatus: data.processingStatus || 'complete',
          message: data.message || (isAsyncProcessing ?
            'Video uploaded successfully. Processing may take a few minutes for optimal playback quality.' :
            'Video uploaded and ready to use!')
        };
      } else {
        throw new Error(uploadResult.error?.message || 'Video upload failed');
      }
    } catch (error: any) {
      console.error('Failed to upload video:', error);
      toast.error(`Failed to upload video: ${error.message}`);
      throw error;
    }
  };

  const handleCheckProcessingStatus = async (assetID: string): Promise<{ status: string; asset?: any }> => {
    try {
      const statusResult = await sdkClient.media.checkProcessingStatus(assetID);

      if (statusResult.success && statusResult.data) {
        return {
          status: statusResult.data.status,
          asset: statusResult.data.asset
        };
      } else {
        throw new Error(statusResult.error?.message || 'Failed to check processing status');
      }
    } catch (error: any) {
      console.error('Failed to check processing status:', error);
      return { status: 'error' };
    }
  };

  const handleUploadPDF = async (file: File): Promise<string> => {
    try {
      const uploadResult = await sdkClient.media.uploadAsset(file, {
        folder: `nlc-ai/courses/${courseID}/pdfs`,
        tags: ['course-pdf', 'lesson-content'],
        metadata: {
          uploadedBy: 'coach',
          courseID: courseID,
          purpose: 'lesson-pdf'
        }
      });

      if (uploadResult.success && uploadResult.data?.asset) {
        toast.success('PDF uploaded successfully!');
        return uploadResult.data.asset.secureUrl;
      } else {
        throw new Error(uploadResult.error?.message || 'PDF upload failed');
      }
    } catch (error: any) {
      console.error('Failed to upload PDF:', error);
      toast.error(`Failed to upload PDF: ${error.message}`);
      throw error;
    }
  };

  const handleUploadFile = async (file: File): Promise<string> => {
    try {
      const uploadResult = await sdkClient.media.uploadAsset(file, {
        folder: `courses/${courseID}/downloads`,
        tags: ['course-download', 'lesson-resource'],
        metadata: {
          uploadedBy: 'coach',
          courseID: courseID,
          purpose: 'lesson-download',
          originalFileName: file.name
        }
      });

      if (uploadResult.success && uploadResult.data?.asset) {
        return uploadResult.data.asset.secureUrl;
      } else {
        throw new Error(uploadResult.error?.message || 'File upload failed');
      }
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onBack={handleBack} />;
  }

  const getCurrentChapterTitle = () => {
    return selectedChapter?.title || '';
  };

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
                  onEditChapter={handleEditChapter}
                  onEditLesson={handleEditLesson}
                  onDeleteChapter={handleDeleteChapter}
                  onDeleteLesson={handleDeleteLesson}
                  onAddChapter={handleAddChapter}
                  onUploadContent={handleUploadContent}
                  onReorderChapters={handleReorderChapters}
                  onReorderLessons={handleReorderLessons}
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
                        <SettingsTab
                          course={course}
                          onCourseUpdate={handleCourseUpdate}
                        />
                      )}

                      {activeTab === 'Drip schedule' && (
                        <DripScheduleTab courseID={courseID} course={course} />
                      )}

                      {activeTab === 'Pricing' && (
                        <PaywallTab
                          course={course}
                          onCourseUpdate={handleCourseUpdate}
                        />
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
          course={course}
          chapterToEdit={editingChapter}
          onBack={() => setShowChapterModal(false)}
          onSave={handleCreateChapter}
          isModal={true}
          onClose={() => {
            setShowChapterModal(false);
            setEditingChapter(null);
          }}
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
              onEditChapter={handleEditChapter}
              onEditLesson={handleEditLesson}
              onDeleteChapter={handleDeleteChapter}
              onDeleteLesson={handleDeleteLesson}
              onAddChapter={handleAddChapter}
              onUploadContent={handleUploadContent}
              onReorderChapters={handleReorderChapters}
              onReorderLessons={handleReorderLessons}
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
                      <SettingsTab
                        course={course}
                        onCourseUpdate={handleCourseUpdate}
                      />
                    )}

                    {activeTab === 'Drip schedule' && (
                      <DripScheduleTab courseID={courseID} course={course} />
                    )}

                    {activeTab === 'Pricing' && (
                      <PaywallTab
                        course={course}
                        onCourseUpdate={handleCourseUpdate}
                      />
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
                      lessonID={editingLesson?.id || ""}
                      lessonToEdit={editingLesson}
                      chapterTitle={getCurrentChapterTitle()}
                      onSave={handleCreateLesson}
                      onBack={handleBackToSelector}
                      onUploadVideo={handleUploadVideo}
                      onUploadFile={handleUploadFile}
                      onCheckProcessingStatus={handleCheckProcessingStatus}
                    />
                  )}

                  {lessonType === 'pdf' && (
                    <PDFLessonForm
                      chapterID={selectedChapter?.chapterID || ''}
                      lessonID={editingLesson?.id || ""}
                      lessonToEdit={editingLesson}
                      chapterTitle={getCurrentChapterTitle()}
                      onSave={handleCreateLesson}
                      onBack={handleBackToSelector}
                      onUploadPDF={handleUploadPDF}
                    />
                  )}

                  {lessonType === 'text' && (
                    <TextLessonForm
                      chapterID={selectedChapter?.chapterID || ''}
                      lessonID={editingLesson?.id || ""}
                      lessonToEdit={editingLesson}
                      chapterTitle={getCurrentChapterTitle()}
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
