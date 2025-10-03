'use client'

import React, { FC, useState, useRef, useEffect } from 'react';
import { Video, X, Upload, AlertCircle, Play, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { NLCClient } from '@nlc-ai/sdk-main';
import { MediaTransformationType } from '@nlc-ai/types';

export interface UploadedVideo {
  id: string;
  url: string;
  name: string;
  size: number;
  duration?: number;
  thumbnailUrl?: string;
  processingStatus?: 'pending' | 'processing' | 'complete' | 'error';
}

interface VideoUploadProps {
  sdkClient: NLCClient;
  onVideosUploaded: (videos: UploadedVideo[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  folder?: string;
  tags?: string[];
  showPreview?: boolean;
  className?: string;
  disabled?: boolean;
  pollProcessingStatus?: boolean;
}

export const VideoUpload: FC<VideoUploadProps> = ({
                                                    sdkClient,
                                                    onVideosUploaded,
                                                    maxFiles = 5,
                                                    maxSizeMB = 10000, // 10GB default
                                                    folder = 'nlc-ai/uploads/videos',
                                                    tags = ['video'],
                                                    showPreview = true,
                                                    className = '',
                                                    disabled = false,
                                                    pollProcessingStatus = true,
                                                  }) => {
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [currentUploadSize, setCurrentUploadSize] = useState<{ current: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    onVideosUploaded(uploadedVideos);
  }, [uploadedVideos]);

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    // Check max files limit
    if (uploadedVideos.length + filesArray.length > maxFiles) {
      setUploadError(`You can only upload up to ${maxFiles} videos`);
      return;
    }

    filesArray.forEach(file => uploadVideo(file));
  };

  const uploadVideo = async (file: File) => {
    let progressInterval;
    try {
      setIsUploading(true);
      setUploadError('');

      // Validate file
      const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
      if (!allowedVideoTypes.includes(file.type)) {
        throw new Error('Please select valid video files (MP4, MPEG, MOV, WebM, AVI)');
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`Video size must be less than ${formatFileSize(maxSizeMB * 1024 * 1024)}`);
      }

      const fileID = `${Date.now()}-${Math.random()}`;
      setUploadProgress(prev => ({ ...prev, [fileID]: 0 }));
      setCurrentUploadSize({ current: 0, total: file.size });

      // Generate video thumbnail
      const thumbnail = await generateVideoThumbnail(file);

      // Simulate progress for large files
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileID] || 0;
          const increment = file.size > 100 * 1024 * 1024 ? Math.random() * 5 : Math.random() * 15;
          return {
            ...prev,
            [fileID]: Math.min(current + increment, 90)
          };
        });
      }, file.size > 100 * 1024 * 1024 ? 1000 : 500);

      // Upload with minimal transformations (S3 doesn't support complex transforms)
      const result = await sdkClient.media.uploadAsset(file, {
        folder,
        tags: [...tags, file.size > 40 * 1024 * 1024 ? 'large-video' : 'video'],
        metadata: {
          uploadedFor: 'video',
          originalSize: file.size,
          duration: await getVideoDuration(file),
        },
        transformation: [
          {
            type: MediaTransformationType.QUALITY,
            quality: 'auto',
          },
        ],
      });

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileID]: 100 }));
      setCurrentUploadSize(null);

      if (result.success && result.data?.asset) {
        const uploadedVideo: UploadedVideo = {
          id: result.data?.asset.id,
          url: result.data?.asset.secureUrl,
          name: result.data?.asset.originalName || file.name,
          size: result.data?.asset.fileSize || file.size,
          duration: result.data?.asset.duration,
          thumbnailUrl: thumbnail || undefined,
          processingStatus: result.data?.processingStatus as any || 'complete',
        };

        const newVideos = [...uploadedVideos, uploadedVideo];
        setUploadedVideos(newVideos);

        // Start polling for processing status if needed
        if (pollProcessingStatus && uploadedVideo.processingStatus === 'processing') {
          startPollingProcessingStatus(uploadedVideo.id);
        }
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setUploadProgress({});
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);

      // Clean up progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          Object.keys(newProgress).forEach(key => {
            if (newProgress[key] >= 100) {
              delete newProgress[key];
            }
          });
          return newProgress;
        });
      }, 2000);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startPollingProcessingStatus = (videoID: string) => {
    // Poll every 5 seconds
    const intervalID = setInterval(async () => {
      try {
        const status = await sdkClient.media.checkProcessingStatus(videoID);

        if (status && status.data && (status.data.status === 'complete' || status.data.status === 'error')) {
          // Update video status
          setUploadedVideos(prev =>
            prev.map(video =>
              video.id === videoID
                ? { ...video, processingStatus: status.data!.status }
                : video
            )
          );

          // Stop polling
          clearInterval(intervalID);
          delete pollIntervalsRef.current[videoID];
        }
      } catch (error) {
        console.error('Failed to check processing status:', error);
      }
    }, 5000);

    pollIntervalsRef.current[videoID] = intervalID;
  };

  const generateVideoThumbnail = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnail);
        } else {
          resolve(null);
        }

        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const getVideoDuration = async (file: File): Promise<number | undefined> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        resolve(undefined);
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const removeVideo = (videoID: string) => {
    // Stop polling if active
    if (pollIntervalsRef.current[videoID]) {
      clearInterval(pollIntervalsRef.current[videoID]);
      delete pollIntervalsRef.current[videoID];
    }

    const newVideos = uploadedVideos.filter(video => video.id !== videoID);
    setUploadedVideos(newVideos);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProcessingStatusIcon = (status?: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-stone-400" />;
    }
  };

  const getProcessingStatusText = (status?: string) => {
    switch (status) {
      case 'processing':
        return 'Processing...';
      case 'complete':
        return 'Ready';
      case 'error':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const triggerFileInput = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className={className}>
        {/* Upload Button */}
        <button
          onClick={triggerFileInput}
          disabled={disabled || isUploading || uploadedVideos.length >= maxFiles}
          className="text-stone-400 hover:text-fuchsia-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
          title="Upload videos"
        >
          <Video className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs sm:text-sm">Videos</span>
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/mp4,video/mpeg,video/quicktime,video/webm,video/x-msvideo"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Error Display */}
        {uploadError && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm flex-1">{uploadError}</p>
            <button
              onClick={() => setUploadError('')}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-3 space-y-2">
            {Object.entries(uploadProgress)
              .filter(([_, progress]) => progress < 100)
              .map(([fileID, progress]) => (
                <div key={fileID} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Upload className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-stone-300 mb-1">
                        <span>Uploading video...</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="bg-neutral-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {currentUploadSize && (
                    <div className="text-xs text-stone-500 ml-7">
                      {formatFileSize(currentUploadSize.current)} / {formatFileSize(currentUploadSize.total)}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Preview Grid */}
        {showPreview && uploadedVideos.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-stone-300 text-sm font-medium">
              Uploaded Videos ({uploadedVideos.length}/{maxFiles}):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {uploadedVideos.map((video) => (
                <div key={video.id} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden bg-neutral-800 border border-neutral-600 relative">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-stone-600" />
                      </div>
                    )}

                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    )}

                    {/* Processing Status Badge */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1.5">
                      {getProcessingStatusIcon(video.processingStatus)}
                      <span>{getProcessingStatusText(video.processingStatus)}</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeVideo(video.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Video Info */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-stone-400 truncate">{video.name}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">{formatFileSize(video.size)}</span>
                      {video.processingStatus === 'processing' && (
                        <span className="text-yellow-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Processing
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Large Video Upload Info */}
        {!uploadedVideos.length && !uploadError && (
          <div className="mt-3 text-xs text-stone-500 text-center">
            🎥 Videos up to {formatFileSize(maxSizeMB * 1024 * 1024)} • Supports MP4, WebM, MOV, AVI
            {maxSizeMB > 100 && (
              <div className="mt-1">
                ⚡ Large videos are optimized automatically for faster streaming
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
