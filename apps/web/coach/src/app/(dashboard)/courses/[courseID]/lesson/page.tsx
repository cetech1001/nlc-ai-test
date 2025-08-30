'use client'

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Plus, Upload, Eye } from 'lucide-react';

const VideoLessonScreen = () => {
  const [lessonTitle, setLessonTitle] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [showAddText, setShowAddText] = useState(false);
  const [showAddDownloads, setShowAddDownloads] = useState(false);
  const [lessonSettings, setLessonSettings] = useState({
    freePreview: true,
    prerequisite: false,
    enableDiscussions: false,
    videoDownloadable: false
  });
  const [selectedIcon, setSelectedIcon] = useState('');
  const [lessonLabel, setLessonLabel] = useState('');

  const handleBack = () => {
    console.log('Navigate back to curriculum');
  };

  const handleAddLesson = () => {
    console.log('Add lesson with data:', {
      title: lessonTitle,
      video: selectedVideo,
      settings: lessonSettings,
      icon: selectedIcon,
      label: lessonLabel
    });
  };

  const handleBrowseFiles = () => {
    console.log('Open file browser for video upload');
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
          {['Curriculum', 'Settings', 'Pricing', 'Drip schedule'].map((tab) => (
            <button
              key={tab}
              className={`pb-4 transition-colors relative ${
                tab === 'Curriculum'
                  ? 'text-purple-400'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span className="font-medium">{tab}</span>
              {tab === 'Curriculum' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"></div>
              )}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex gap-8 h-[calc(100vh-280px)]">
          {/* Left Sidebar - Same as curriculum screen */}
          <div className="w-96 flex-shrink-0">
            <div className="h-full bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 overflow-hidden">
              <div className="p-6 h-full flex flex-col">
                <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                  <div className="space-y-0">
                    {/* Sample chapters - simplified for this screen */}
                    <div className="flex items-center gap-3 py-3 border-b border-neutral-700">
                      <ChevronDown className="w-4 h-4 text-white" />
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-white text-sm font-medium">Introduction To Monetizing on Instagram</span>
                    </div>
                    <div className="pl-9 py-2 border-b border-neutral-700/50">
                      <button className="w-full text-left px-3 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" />
                        Add lesson
                      </button>
                    </div>
                    <div className="flex items-center gap-3 py-3 pl-9 border-b border-neutral-700/50">
                      <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                      <span className="text-stone-300 text-sm">Priming Your IG Profile</span>
                    </div>
                    <div className="flex items-center gap-3 py-3 pl-9 border-b border-neutral-700/50">
                      <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                      <span className="text-stone-300 text-sm">How to Grow Your Instagram...</span>
                    </div>
                    <div className="flex items-center gap-3 py-3 pl-9 border-b border-neutral-700/50">
                      <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                      <span className="text-stone-300 text-sm">What NOT to Post on Instagram</span>
                    </div>

                    <div className="flex items-center gap-3 py-3 border-b border-neutral-700">
                      <ChevronRight className="w-4 h-4 text-white" />
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-white text-sm font-medium">Tik Tok / Reels Training</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-700 space-y-3">
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm justify-center">
                      <Plus className="w-4 h-4" />
                      Chapter
                    </button>
                    <button className="flex-1 px-3 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm justify-center">
                      <Upload className="w-4 h-4" />
                      Upload content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area - New Lesson Form */}
          <div className="flex-1">
            <div className="h-full bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 overflow-y-auto">
              <div className="p-8">
                {/* Header with Video Tag */}
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={handleBack}
                    className="p-1 text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-white text-xl font-semibold">New Lessons</h2>
                  <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium">Video</span>
                </div>

                {/* Title Input */}
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="Enter title..."
                    className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-2 focus:ring-[#7B21BA]/20 rounded-lg px-4 py-3 text-base outline-none transition-colors"
                  />
                </div>

                {/* Video Selection */}
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">Video from your library</label>
                  <div className="relative mb-3">
                    <select
                      value={selectedVideo}
                      onChange={(e) => setSelectedVideo(e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white focus:border-[#7B21BA] focus:ring-2 focus:ring-[#7B21BA]/20 rounded-lg px-4 py-3 text-base outline-none transition-colors appearance-none"
                    >
                      <option value="">Choose video</option>
                      <option value="video1">Sample Video 1</option>
                      <option value="video2">Sample Video 2</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  </div>

                  {/* Upload Section */}
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Upload a video file</label>
                    <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-6 text-center">
                      <p className="text-stone-400 text-sm mb-3">No file selected</p>
                      <button
                        onClick={handleBrowseFiles}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Browse files
                      </button>
                    </div>
                  </div>

                  <p className="text-stone-400 text-sm mb-2">
                    Pick a thumbnail image, add closed captions, update settings, and track your video performance analytics in the video library.
                  </p>
                  <p className="text-stone-400 text-sm">
                    Videos larger than 1GB may take longer to upload and load. Consider compressing them with <span className="text-blue-400 underline">HandBrake</span> before uploading them to the video library.
                  </p>
                </div>

                {/* Add Text Section */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowAddText(!showAddText)}
                    className="w-full flex items-center justify-between p-4 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
                  >
                    <span className="text-white font-medium">Add text <span className="text-stone-400">(optional)</span></span>
                    {showAddText ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
                  </button>
                </div>

                {/* Add Downloads Section */}
                <div className="mb-8">
                  <button
                    onClick={() => setShowAddDownloads(!showAddDownloads)}
                    className="w-full flex items-center justify-between p-4 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
                  >
                    <span className="text-white font-medium">Add downloads <span className="text-stone-400">(optional)</span></span>
                    {showAddDownloads ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
                  </button>
                </div>

                {/* Lessons Settings */}
                <div className="mb-8">
                  <h3 className="text-white text-lg font-semibold mb-4">Lessons settings</h3>

                  <div className="space-y-4">
                    {/* Checkboxes */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonSettings.freePreview}
                        onChange={(e) => setLessonSettings(prev => ({ ...prev, freePreview: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-[#2A2A2A] border-[#3A3A3A] rounded focus:ring-purple-500"
                      />
                      <span className="text-white text-sm">Make this a free preview lesson</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonSettings.prerequisite}
                        onChange={(e) => setLessonSettings(prev => ({ ...prev, prerequisite: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-[#2A2A2A] border-[#3A3A3A] rounded focus:ring-purple-500"
                      />
                      <span className="text-white text-sm">Make this a prerequisite</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonSettings.enableDiscussions}
                        onChange={(e) => setLessonSettings(prev => ({ ...prev, enableDiscussions: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-[#2A2A2A] border-[#3A3A3A] rounded focus:ring-purple-500"
                      />
                      <span className="text-white text-sm">Enable discussions for this lesson</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonSettings.videoDownloadable}
                        onChange={(e) => setLessonSettings(prev => ({ ...prev, videoDownloadable: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-[#2A2A2A] border-[#3A3A3A] rounded focus:ring-purple-500"
                      />
                      <span className="text-white text-sm">Make this video downloadable</span>
                    </label>
                  </div>

                  {/* Icon and Label Section */}
                  <div className="mt-6">
                    <label className="block text-white text-sm font-medium mb-2">Lesson icon & label</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <select
                          value={selectedIcon}
                          onChange={(e) => setSelectedIcon(e.target.value)}
                          className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white focus:border-[#7B21BA] focus:ring-2 focus:ring-[#7B21BA]/20 rounded-lg px-4 py-3 text-base outline-none transition-colors appearance-none"
                        >
                          <option value="">Choose icon</option>
                          <option value="video">Video Icon</option>
                          <option value="play">Play Icon</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                      </div>
                      <input
                        type="text"
                        value={lessonLabel}
                        onChange={(e) => setLessonLabel(e.target.value)}
                        placeholder="Enter label"
                        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-2 focus:ring-[#7B21BA]/20 rounded-lg px-4 py-3 text-base outline-none transition-colors"
                      />
                    </div>
                    <p className="text-stone-400 text-sm mt-2">You can hide all lesson icon & labels in Settings. Max 16 characters</p>
                  </div>
                </div>

                {/* Upgrade Prompt */}
                <div className="relative bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold mb-1">Upgrade to access lesson settings!</h3>
                    </div>
                    <button className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-opacity">
                      Upgrade
                    </button>
                  </div>
                </div>

                {/* Add Lesson Button */}
                <button
                  onClick={handleAddLesson}
                  className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-8 py-3 rounded-lg font-semibold transition-opacity"
                >
                  Add Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoLessonScreen;
