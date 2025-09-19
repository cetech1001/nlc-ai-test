import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Upload, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoLessonFormProps {
  chapterID?: string;
  lessonID?: string;
  lessonToEdit?: {
    id: string;
    title: string;
    description?: string;
    content?: string;
    videoUrl?: string;
    videoDuration?: number;
    estimatedMinutes?: number;
    isLocked?: boolean;
  } | null;
  chapterTitle?: string;
  onBack: () => void;
  onSave: (lessonData: any) => void;
  onUploadVideo?: (file: File) => Promise<{ url: string; assetID?: string; processingStatus?: string; message?: string }>;
  onUploadFile?: (file: File) => Promise<string>;
  onCheckProcessingStatus?: (assetID: string) => Promise<{ status: string; asset?: any }>;
}

export const VideoLessonForm: React.FC<VideoLessonFormProps> = ({
                                                                  chapterID,
                                                                  lessonID,
                                                                  lessonToEdit,
                                                                  chapterTitle,
                                                                  onBack,
                                                                  onSave,
                                                                  onUploadVideo,
                                                                  onUploadFile,
                                                                  onCheckProcessingStatus
                                                                }) => {
  const [formData, setFormData] = useState({
    title: '',
    selectedVideo: '',
    uploadedFile: null as File | null,
    uploadedVideoUrl: '',
    uploadedAssetID: '',
    text: '',
    downloads: [] as File[],
    uploadedDownloads: [] as string[],
    settings: {
      isFreePreview: false,
      isPrerequisite: false,
      enableDiscussions: false,
      makeVideoDownloadable: false
    },
    icon: '',
    label: '',
    estimatedMinutes: 30
  });

  const [showAddText, setShowAddText] = useState(false);
  const [showAddDownloads, setShowAddDownloads] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingDownloads, setIsUploadingDownloads] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [videoProcessingStatus, setVideoProcessingStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [processingMessage, setProcessingMessage] = useState<string>('');

  // Poll processing status for async uploads
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (videoProcessingStatus === 'processing' && formData.uploadedAssetID && onCheckProcessingStatus) {
      pollInterval = setInterval(async () => {
        try {
          const status = await onCheckProcessingStatus(formData.uploadedAssetID);

          if (status.status === 'complete') {
            setVideoProcessingStatus('complete');
            setProcessingMessage('Video processing complete! Your video is ready.');
            clearInterval(pollInterval);
          } else if (status.status === 'error') {
            setVideoProcessingStatus('error');
            setProcessingMessage('Video processing failed. Please try uploading again.');
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Failed to check processing status:', error);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [videoProcessingStatus, formData.uploadedAssetID, onCheckProcessingStatus]);

  // Populate form when editing
  useEffect(() => {
    if (lessonToEdit) {
      setFormData(prev => ({
        ...prev,
        title: lessonToEdit.title,
        text: lessonToEdit.content || lessonToEdit.description || '',
        uploadedVideoUrl: lessonToEdit.videoUrl || '',
        estimatedMinutes: lessonToEdit.estimatedMinutes || 30,
        settings: {
          ...prev.settings,
          isFreePreview: !lessonToEdit.isLocked
        }
      }));

      if (lessonToEdit.content || lessonToEdit.description) {
        setShowAddText(true);
      }

      // If editing and has video, assume it's processed
      if (lessonToEdit.videoUrl) {
        setVideoProcessingStatus('complete');
      }
    }
  }, [lessonToEdit]);

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadVideo) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file');
      return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      setUploadError('Video file size must be less than 500MB');
      return;
    }

    setIsUploadingVideo(true);
    setUploadError('');
    setVideoProcessingStatus('idle');

    try {
      const result = await onUploadVideo(file);

      setFormData(prev => ({
        ...prev,
        uploadedFile: file,
        uploadedVideoUrl: result.url,
        uploadedAssetID: result.assetID || ''
      }));

      if (result.processingStatus === 'processing') {
        setVideoProcessingStatus('processing');
        setProcessingMessage(result.message || 'Video is being processed for optimal playback quality. This may take a few minutes.');
      } else {
        setVideoProcessingStatus('complete');
        setProcessingMessage('Video uploaded successfully!');
      }
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload video');
      setVideoProcessingStatus('error');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDownloadUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !onUploadFile) return;

    setIsUploadingDownloads(true);
    setUploadError('');

    try {
      const uploadPromises = files.map(file => onUploadFile(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        downloads: [...prev.downloads, ...files],
        uploadedDownloads: [...prev.uploadedDownloads, ...uploadedUrls]
      }));
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload files');
    } finally {
      setIsUploadingDownloads(false);
    }
  };

  const removeDownload = (index: number) => {
    setFormData(prev => ({
      ...prev,
      downloads: prev.downloads.filter((_, i) => i !== index),
      uploadedDownloads: prev.uploadedDownloads.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const lessonData = {
      ...formData,
      type: 'video',
      videoUrl: formData.uploadedVideoUrl || formData.selectedVideo,
      downloadUrls: formData.uploadedDownloads,
      chapterID,
      lessonID,
      videoProcessingStatus
    };
    onSave(lessonData);
  };

  const getProcessingStatusIcon = () => {
    switch (videoProcessingStatus) {
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getProcessingStatusColor = () => {
    switch (videoProcessingStatus) {
      case 'processing':
        return 'border-yellow-500 bg-yellow-800/20';
      case 'complete':
        return 'border-green-500 bg-green-800/20';
      case 'error':
        return 'border-red-500 bg-red-800/20';
      default:
        return 'border-neutral-600';
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-scroll">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>

      <div className="pt-8 pb-16 px-6 w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-2xl font-bold">
              {lessonToEdit ? 'Edit Lesson' : 'New Lesson'}
            </h1>
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-medium">
              Video
            </span>
          </div>
        </div>

        {chapterTitle && (
          <div className="bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div>
                <h3 className="text-white font-semibold">Chapter: {chapterTitle}</h3>
                {lessonToEdit && (
                  <p className="text-purple-200 text-sm">Editing: {lessonToEdit.title}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 overflow-hidden">
            <div className="p-8 space-y-8">
              {uploadError && (
                <div className="p-4 bg-red-800/20 border border-red-600 rounded-lg">
                  <p className="text-red-400 text-sm">{uploadError}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-white text-sm font-medium">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white text-sm font-medium">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.estimatedMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 30 }))}
                  className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-white text-sm font-medium">Upload a video file</label>
                <div className={`border-2 border-dashed rounded-lg p-8 text-center ${getProcessingStatusColor()}`}>
                  {(formData.uploadedVideoUrl || videoProcessingStatus !== 'idle') && (
                    <div className="mb-4">
                      <div className={`border rounded-lg p-4 ${getProcessingStatusColor()}`}>
                        <div className="flex items-center justify-center gap-3 mb-2">
                          {getProcessingStatusIcon()}
                          <p className="text-white font-medium">
                            {videoProcessingStatus === 'processing' && 'Processing Video'}
                            {videoProcessingStatus === 'complete' && 'Video Ready'}
                            {videoProcessingStatus === 'error' && 'Processing Failed'}
                          </p>
                        </div>
                        {processingMessage && (
                          <p className="text-sm text-neutral-300">{processingMessage}</p>
                        )}
                        {videoProcessingStatus === 'processing' && (
                          <div className="mt-3">
                            <div className="w-full bg-neutral-700 rounded-full h-2">
                              <div className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                            <p className="text-xs text-neutral-400 mt-2">This may take several minutes for large files</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-neutral-400 mb-4">
                    {formData.uploadedFile ?
                      `${formData.uploadedFile.name} ${formData.uploadedVideoUrl ? '(Uploaded)' : '(Ready to upload)'}` :
                      lessonToEdit?.videoUrl ? 'Current video file uploaded' : 'No file selected'}
                  </div>

                  <button
                    type="button"
                    disabled={isUploadingVideo || videoProcessingStatus === 'processing'}
                    onClick={() => document.getElementById('video-upload')?.click()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    {isUploadingVideo ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {formData.uploadedVideoUrl ? 'Replace Video' : 'Browse files'}
                      </>
                    )}
                  </button>

                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={isUploadingVideo || videoProcessingStatus === 'processing'}
                  />
                </div>
                <div className="text-sm text-neutral-400 space-y-1">
                  <p>Pick a thumbnail image, add closed captions, update settings, and track your video performance analytics in the video library.</p>
                  <p><span className="text-purple-400 underline cursor-pointer">Learn more</span> about the video library.</p>
                  <p>Videos larger than 40MB are processed asynchronously for optimal quality and may take a few minutes to be ready for playback.</p>
                </div>
              </div>

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
                  <div className="bg-neutral-800/50 border border-neutral-600 rounded-lg p-4">
                    <textarea
                      placeholder="Add text content here..."
                      value={formData.text}
                      onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full bg-transparent text-white placeholder-neutral-400 resize-none h-32 focus:outline-none"
                    />
                  </div>
                )}
              </div>

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
                        type="button"
                        disabled={isUploadingDownloads}
                        onClick={() => document.getElementById('downloads-upload')?.click()}
                        className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                      >
                        {isUploadingDownloads ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload files
                          </>
                        )}
                      </button>
                      <input
                        id="downloads-upload"
                        type="file"
                        multiple
                        onChange={handleDownloadUpload}
                        className="hidden"
                        disabled={isUploadingDownloads}
                      />
                    </div>
                    {formData.downloads.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white text-sm font-medium">Uploaded Files:</h4>
                        {formData.downloads.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-neutral-800/50 p-3 rounded-lg">
                            <span className="text-white text-sm">{file.name}</span>
                            <button
                              onClick={() => removeDownload(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-white text-lg font-semibold">Lesson Settings</h3>

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
                    <span className="text-white">Make this file downloadable</span>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={videoProcessingStatus === 'processing'}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {videoProcessingStatus === 'processing' && (
                    <Clock className="w-4 h-4 animate-spin" />
                  )}
                  {lessonToEdit ? 'Update Lesson' : 'Add Lesson'}
                  {videoProcessingStatus === 'processing' && ' (Processing...)'}
                </button>
                {videoProcessingStatus === 'processing' && (
                  <p className="text-neutral-400 text-sm mt-2">
                    You can save the lesson now. The video will be available once processing is complete.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
