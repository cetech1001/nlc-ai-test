import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';

interface VideoLessonFormProps {
  chapterID?: string;
  lessonID?: string; // For editing existing lessons
  onBack: () => void;
  onSave: (lessonData: any) => void;
}

export const VideoLessonForm: React.FC<VideoLessonFormProps> = ({
 chapterID,
 lessonID,
 onBack,
 onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    selectedVideo: '',
    uploadedFile: null as File | null,
    text: '',
    downloads: [] as File[],
    settings: {
      isFreePreview: false,
      isPrerequisite: false,
      enableDiscussions: false,
      makeVideoDownloadable: false
    },
    icon: '',
    label: ''
  });

  const [showAddText, setShowAddText] = useState(false);
  const [showAddDownloads, setShowAddDownloads] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, uploadedFile: file }));
    }
  };

  const handleDownloadUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      downloads: [...prev.downloads, ...files]
    }));
  };

  const handleSave = () => {
    const lessonData = {
      ...formData,
      type: 'video',
      chapterID,
      lessonID
    };
    onSave(lessonData);
  };

  return (
    <div className="min-h-screen w-full relative overflow-scroll">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>

      <div className="pb-16 px-6 mb-32 w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-2xl font-bold">New Lessons</h1>
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-medium">
              Video
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium">Title</label>
                <input
                  type="text"
                  placeholder="Enter title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Video from library */}
              <div className="space-y-4">
                <label className="block text-white text-sm font-medium">Video from your library</label>
                <div className="relative">
                  <select
                    value={formData.selectedVideo}
                    onChange={(e) => setFormData(prev => ({ ...prev, selectedVideo: e.target.value }))}
                    className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg px-4 py-3 appearance-none focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Choose video</option>
                    <option value="video1">Sample Video 1</option>
                    <option value="video2">Sample Video 2</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Upload video file */}
              <div className="space-y-4">
                <label className="block text-white text-sm font-medium">Upload a video file</label>
                <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center">
                  <div className="text-neutral-400 mb-4">
                    {formData.uploadedFile ? formData.uploadedFile.name : 'No file selected'}
                  </div>
                  <button
                    onClick={() => document.getElementById('video-upload')?.click()}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Browse files
                  </button>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-sm text-neutral-400 space-y-1">
                  <p>Pick a thumbnail image, add closed captions, update settings, and track your video performance analytics in the video library.</p>
                  <p><span className="text-purple-400 underline cursor-pointer">Learn more</span> about the video library.</p>
                  <p>Videos larger than 1GB may take longer to upload and load. Consider compressing them with <span className="text-purple-400 underline cursor-pointer">HandBrake</span> before uploading them to the video library.</p>
                </div>
              </div>

              {/* Add text (optional) */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowAddText(!showAddText)}
                  className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
                >
                  <span>Add text</span>
                  <span className="text-neutral-400 text-sm">(optional)</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAddText ? 'rotate-180' : ''}`} />
                </button>
                {showAddText && (
                  <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-4">
                    <textarea
                      placeholder="Add text content here..."
                      value={formData.text}
                      onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full bg-transparent text-white placeholder-neutral-400 resize-none h-32 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Add downloads (optional) */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowAddDownloads(!showAddDownloads)}
                  className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
                >
                  <span>Add downloads</span>
                  <span className="text-neutral-400 text-sm">(optional)</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAddDownloads ? 'rotate-180' : ''}`} />
                </button>
                {showAddDownloads && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center">
                      <button
                        onClick={() => document.getElementById('downloads-upload')?.click()}
                        className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Upload files
                      </button>
                      <input
                        id="downloads-upload"
                        type="file"
                        multiple
                        onChange={handleDownloadUpload}
                        className="hidden"
                      />
                    </div>
                    {formData.downloads.length > 0 && (
                      <div className="space-y-2">
                        {formData.downloads.map((file, index) => (
                          <div key={index} className="text-white text-sm">
                            {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Lesson settings */}
              <div className="space-y-6">
                <h3 className="text-white text-lg font-semibold">Lessons settings</h3>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.isFreePreview}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, isFreePreview: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Make this a free preview lesson</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.isPrerequisite}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, isPrerequisite: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Make this a prerequisite</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.enableDiscussions}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, enableDiscussions: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Enable discussions for this lesson</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.makeVideoDownloadable}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, makeVideoDownloadable: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Make this video downloadable</span>
                  </label>
                </div>

                {/* Icon & label */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Lesson icon & label</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg px-4 py-3 appearance-none focus:border-purple-500 focus:outline-none"
                      >
                        <option value="">Choose icon</option>
                        <option value="video">Video icon</option>
                        <option value="play">Play icon</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter label"
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-neutral-400 text-sm">You can hide all lesson icon & labels in Settings. Max 16 characters</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-8 py-3 rounded-lg font-medium transition-opacity"
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
