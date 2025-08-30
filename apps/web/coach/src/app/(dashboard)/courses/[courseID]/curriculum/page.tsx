'use client'

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Plus, Video, FileText, FileDown, Upload, Eye } from 'lucide-react';

// Mock data structure
const mockCurriculum = {
  chapters: [
    {
      chapterID: '1',
      title: 'Introduction To Monetizing on Instagram',
      isExpanded: true,
      lessons: [
        { lessonID: '1-1', title: 'Priming Your IG Profile', type: 'video' },
        { lessonID: '1-2', title: 'How to Grow Your Instagram...', type: 'text' },
        { lessonID: '1-3', title: 'What NOT to Post on Instagram', type: 'video' }
      ]
    },
    {
      chapterID: '2',
      title: 'Tik Tok / Reels Training',
      isExpanded: false,
      lessons: [
        { lessonID: '2-1', title: 'How to Make a Tik Tok', type: 'video' },
        { lessonID: '2-2', title: 'How to Create Viral TikTok/Re...', type: 'text' },
        { lessonID: '2-3', title: 'How to Convert Videos into P...', type: 'pdf' },
        { lessonID: '2-4', title: 'How to Make a Tik Tok', type: 'video' },
        { lessonID: '2-5', title: 'How to Convert Videos into P...', type: 'pdf' },
        { lessonID: '2-6', title: 'How to Increase Your Watch T...', type: 'video' },
        { lessonID: '2-7', title: 'How to Convert Videos into P...', type: 'pdf' },
        { lessonID: '2-8', title: 'How to Increase Your Watch T...', type: 'video' }
      ]
    }
  ]
};

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

const CurriculumScreen = () => {
  const [activeTab, setActiveTab] = useState('Curriculum');
  const [curriculum, setCurriculum] = useState(mockCurriculum);

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
    console.log('Add lesson to chapter:', chapterID);
  };

  const handleAddChapter = () => {
    console.log('Add new chapter');
  };

  const handleUploadContent = () => {
    console.log('Upload content');
  };

  const handleBack = () => {
    console.log('Navigate back to courses');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-violet-900">
      <div className="pt-8 pb-16 px-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-2xl font-bold">Communities</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-black/20 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-black/30 transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button className="px-4 py-2 bg-black/20 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-black/30 transition-colors flex items-center gap-2">
              Update status
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

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

        {/* Main Content */}
        <div className="flex gap-8 h-[calc(100vh-280px)]">
          {/* Left Sidebar - Curriculum Tree */}
          <div className="w-96 flex-shrink-0">
            <div className="h-full bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 overflow-hidden">
              <div className="p-6 h-full flex flex-col">
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
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
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
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            <div className="h-full bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 p-8 flex flex-col">
              <h2 className="text-white text-xl font-semibold mb-8">Lessons</h2>

              {/* Lesson Type Cards */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <button className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-medium">Video</div>
                </button>

                <button className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-medium">Text</div>
                </button>

                <button className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileDown className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-medium">PDF</div>
                </button>
              </div>

              {/* Upgrade Prompt */}
              <div className="relative bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 overflow-hidden">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumScreen;
