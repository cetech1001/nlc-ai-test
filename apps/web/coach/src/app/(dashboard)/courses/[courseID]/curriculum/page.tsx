'use client'

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Plus, Video, FileText, FileDown, Upload, Eye, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { sdkClient } from '@/lib';
import type { ExtendedCourse } from '@nlc-ai/sdk-course';

const tabs = ['Curriculum', 'Settings', 'Pricing', 'Drip schedule'];

const LessonTypeIcon = ({ type }: { type: string }) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'video':
      return <Video className={iconClass} />;
    case 'text':
      return <FileText className={iconClass} />;
    case 'pdf':
      return <FileDown className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
};

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
  // const [__, setSelectedLesson] = useState<string | null>(null);
  const [___, setShowCreateChapter] = useState(false);
  const [____, setShowCreateLesson] = useState(false);

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

  /*const handleEditLesson = (lessonID: string) => {
    setSelectedLesson(lessonID);
    setShowCreateLesson(true);
  };*/

  const handleCreateLesson = (type: string) => {
    // TODO: Implement lesson creation with specific type
    console.log('Create lesson of type:', type);
  };

  const handleUploadContent = () => {
    console.log('Upload content');
    // TODO: Implement content upload flow
  };

  const handleBack = () => {
    router.push('/courses');
  };

  const handlePreview = () => {
    if (course) {
      // TODO: Implement course preview
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

      // Reload course data to get updated status
      const updatedCourse = await sdkClient.course.courses.getCourse(course.id);
      setCourse(updatedCourse);
    } catch (error: any) {
      console.error('Error updating course status:', error);
      setError('Failed to update course status');
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>
        <div className="pt-8 pb-16 px-6 w-full relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-neutral-700 rounded-lg animate-pulse"></div>
            <div className="w-32 h-8 bg-neutral-700 rounded animate-pulse"></div>
          </div>
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>
        <div className="pt-8 pb-16 px-6 w-full relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBack}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-2xl font-bold">Error</h1>
          </div>
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={handleBack}
                className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-opacity"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>

      <div className="pt-8 pb-16 px-6 w-full relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-white text-2xl font-bold">Curriculum</h1>
              {course && (
                <p className="text-stone-400 text-sm mt-1">{course.title}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-black/20 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-black/30 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleUpdateStatus}
              className="px-4 py-2 bg-black/20 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-black/30 transition-colors flex items-center gap-2"
            >
              {course?.isPublished ? 'Unpublish' : 'Publish'} Course
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Course Status Badge */}
        {course && (
          <div className="mb-6">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              course.isPublished
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-8 mb-8 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 transition-colors relative ${
                activeTab === tab
                  ? 'text-purple-400'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span className="font-medium">{tab}</span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"></div>
              )}
            </button>
          ))}
        </div>

        {/* Main Content - Single unified card */}
        <div className="h-[calc(100vh-280px)] relative">
          {/* Background glow orbs */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-l from-fuchsia-500/20 to-purple-600/20 rounded-full blur-3xl"></div>

          <div className="h-full bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 overflow-hidden flex relative">
            {/* Left Sidebar - Curriculum Tree */}
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
                    {curriculum.chapters.map((chapter, chapterIndex) => (
                      <div key={chapter.chapterID}>
                        {/* Chapter Row */}
                        <div className="flex items-center gap-3 py-3 border-b border-neutral-700 hover:bg-white/5 transition-colors">
                          <button
                            onClick={() => toggleChapter(chapter.chapterID)}
                            className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                          >
                            {chapter.isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-white" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                          <span className="text-white text-sm font-medium flex-1 leading-tight">
                            {chapter.title}
                          </span>
                        </div>

                        {/* Add Lesson Button for this chapter */}
                        {chapter.isExpanded && (
                          <div className="pl-9 py-2 border-b border-neutral-700/50">
                            <button
                              onClick={() => handleAddLesson(chapter.chapterID)}
                              className="w-full text-left px-3 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              Add lesson
                            </button>
                          </div>
                        )}

                        {/* Lessons */}
                        {chapter.isExpanded && (
                          <div className="space-y-0">
                            {chapter.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.lessonID} className="flex items-center gap-3 py-3 pl-9 border-b border-neutral-700/50 hover:bg-white/5 transition-colors">
                                <div className="w-2 h-2 bg-stone-400 rounded-full flex-shrink-0"></div>
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
                      onClick={handleAddChapter}
                      className="flex-1 px-3 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm justify-center"
                    >
                      <Plus className="w-4 h-4" />
                      Chapter
                    </button>
                    <button
                      onClick={handleUploadContent}
                      className="flex-1 px-3 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm justify-center"
                    >
                      <Upload className="w-4 h-4" />
                      Upload content
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1">
              <div className="h-full p-8 flex flex-col relative">
                {/* Additional glow orb inside content area */}
                <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-violet-500/10 rounded-full blur-2xl"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h2 className="text-white text-xl font-semibold">Course Content</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('Drip schedule')}
                      className="px-4 py-2 bg-blue-600/20 text-blue-300 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                    >
                      Manage Drip Schedule
                    </button>
                    <button
                      onClick={() => setActiveTab('Pricing')}
                      className="px-4 py-2 bg-green-600/20 text-green-300 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                    >
                      Setup Paywall
                    </button>
                  </div>
                </div>

                {activeTab === 'Curriculum' && (
                  <>
                {/* Lesson Type Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8 relative z-10">
                  <button
                    onClick={() => handleCreateLesson('video')}
                    className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white font-medium">Video</div>
                  </button>

                  <button
                    onClick={() => handleCreateLesson('text')}
                    className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white font-medium">Text</div>
                  </button>

                  <button
                    onClick={() => handleCreateLesson('pdf')}
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
                )}

                {activeTab === 'Drip schedule' && (
                  <DripScheduleTab courseId={courseID} />
                )}

                {activeTab === 'Pricing' && (
                  <PaywallTab courseId={courseID} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DripScheduleTab = ({ courseId }: { courseId: string }) => {
  const [dripSettings, setDripSettings] = useState({
    isDripEnabled: false,
    dripInterval: 'weekly',
    dripCount: 1,
    autoUnlockChapters: true,
    completionThreshold: 80
  });

  return (
    <div className="space-y-6 relative z-10">
      <h3 className="text-white text-xl font-semibold">Drip Schedule Settings</h3>

      <div className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Enable Drip Content</h4>
              <p className="text-stone-300 text-sm">Release course content gradually over time</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dripSettings.isDripEnabled}
                onChange={(e) => setDripSettings(prev => ({ ...prev, isDripEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {dripSettings.isDripEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Release Interval</label>
                  <select
                    value={dripSettings.dripInterval}
                    onChange={(e) => setDripSettings(prev => ({ ...prev, dripInterval: e.target.value }))}
                    className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Lessons per Release</label>
                  <input
                    type="number"
                    min="1"
                    value={dripSettings.dripCount}
                    onChange={(e) => setDripSettings(prev => ({ ...prev, dripCount: parseInt(e.target.value) }))}
                    className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-white font-medium">Auto-unlock Chapters</h5>
                    <p className="text-stone-400 text-sm">Automatically unlock next chapter when previous is completed</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dripSettings.autoUnlockChapters}
                    onChange={(e) => setDripSettings(prev => ({ ...prev, autoUnlockChapters: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Completion Threshold ({dripSettings.completionThreshold}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dripSettings.completionThreshold}
                    onChange={(e) => setDripSettings(prev => ({ ...prev, completionThreshold: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-stone-400 text-sm mt-1">Minimum completion percentage before unlocking next content</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <button className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity">
        Save Drip Settings
      </button>
    </div>
  );
};

const PaywallTab = ({ courseId }: { courseId: string }) => {
  const [paywallSettings, setPaywallSettings] = useState({
    isEnabled: false,
    freePreviewChapters: 1,
    paywallMessage: 'Unlock the full course to continue your learning journey!',
    priceOptions: [
      { type: 'one_time', price: 99, label: 'Full Access' },
      { type: 'installment', price: 33, installments: 3, label: '3 Monthly Payments' }
    ]
  });

  return (
    <div className="space-y-6 relative z-10">
      <h3 className="text-white text-xl font-semibold">Paywall Settings</h3>

      <div className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Enable Paywall</h4>
              <p className="text-stone-300 text-sm">Restrict access to course content behind payment</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paywallSettings.isEnabled}
                onChange={(e) => setPaywallSettings(prev => ({ ...prev, isEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {paywallSettings.isEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Free Preview Chapters</label>
                <input
                  type="number"
                  min="0"
                  value={paywallSettings.freePreviewChapters}
                  onChange={(e) => setPaywallSettings(prev => ({ ...prev, freePreviewChapters: parseInt(e.target.value) }))}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2"
                />
                <p className="text-stone-400 text-sm mt-1">Number of chapters accessible for free</p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Paywall Message</label>
                <textarea
                  value={paywallSettings.paywallMessage}
                  onChange={(e) => setPaywallSettings(prev => ({ ...prev, paywallMessage: e.target.value }))}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2 h-20 resize-none"
                  placeholder="Message shown when users hit the paywall..."
                />
              </div>

              <div>
                <h5 className="text-white font-medium mb-3">Payment Options</h5>
                <div className="space-y-3">
                  {paywallSettings.priceOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-neutral-700/50 rounded-lg">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...paywallSettings.priceOptions];
                          newOptions[index].label = e.target.value;
                          setPaywallSettings(prev => ({ ...prev, priceOptions: newOptions }));
                        }}
                        className="flex-1 bg-neutral-600 border border-neutral-500 text-white rounded px-2 py-1 text-sm"
                      />
                      <span className="text-white text-sm">${option.price}</span>
                      {option.installments && (
                        <span className="text-stone-400 text-sm">({option.installments}x)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity">
        Save Paywall Settings
      </button>
    </div>
  );
};

export default CurriculumScreen;
