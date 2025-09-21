import { Image, Send, Smile, X, Upload, AlertCircle, Video, Play } from "lucide-react";
import React, { FC, useState, useRef } from "react";
import { sdkClient } from "@/lib";
import { toast } from "sonner";

interface IProps {
  handleCreatePost: (post: string, mediaUrls?: string[]) => void;
  onOptimisticPost?: (content: string, mediaUrls?: string[]) => void;
}

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video' | 'raw';
  size: number;
  thumbnailUrl?: string;
}

export const NewPost: FC<IProps> = (props) => {
  const [newPost, setNewPost] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const POST_MAX_LENGTH = 2000;
  const characterCount = newPost.length;
  const isOverLimit = characterCount > POST_MAX_LENGTH;

  const handleCreatePost = async () => {
    if (!newPost.trim() || isPosting || isOverLimit) return;

    setIsPosting(true);

    try {
      const mediaUrls = uploadedFiles.map(file => file.url);

      if (props.onOptimisticPost) {
        props.onOptimisticPost(newPost, mediaUrls);
      }

      const postContent = newPost;
      const postMediaUrls = [...mediaUrls];
      setNewPost('');
      setUploadedFiles([]);
      setUploadError('');

      // Make actual API call
      await props.handleCreatePost(postContent, postMediaUrls);
    } catch (e) {
      // Restore form data on error
      setNewPost(newPost);
      setUploadedFiles([...uploadedFiles]);
      toast.error('Failed to create post. Please try again.');
      console.error('Failed to create post:', e);
    } finally {
      setIsPosting(false);
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'video' = 'media') => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => uploadFile(file, type));
    }
  };

  const uploadFile = async (file: File, type: 'media' | 'video' = 'media') => {
    try {
      setIsUploading(true);
      setUploadError('');

      // Enhanced file validation
      const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for images
      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      }

      // Enhanced file type validation
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/avi', 'video/webm'];
      const allowedTypes = type === 'video' ? allowedVideoTypes : [...allowedImageTypes, ...allowedVideoTypes];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type not supported. ${type === 'video' ? 'Please use MP4, MPEG, MOV, AVI, or WebM videos' : 'Please use JPEG, PNG, GIF, WebP images or MP4, MPEG videos'}`);
      }

      const fileID = `${Date.now()}-${Math.random()}`;
      setUploadProgress(prev => ({ ...prev, [fileID]: 0 }));

      // Determine resource type and folder
      const isVideo = allowedVideoTypes.includes(file.type);
      const resourceType = isVideo ? 'video' : 'image';

      // Create upload options with transformations for optimization
      const uploadOptions: any = {
        folder: `nlc-ai/posts/${resourceType}s`,
        tags: ['post-media', resourceType],
        metadata: {
          uploadedFor: 'post',
          originalSize: file.size,
          uploadType: type
        }
      };

      // Add transformations for optimization
      if (isVideo) {
        uploadOptions.transformation = [
          {
            type: 'quality',
            quality: 'auto'
          },
          {
            type: 'format',
            format: 'mp4' // Ensure consistent format
          }
        ];
      } else {
        uploadOptions.transformation = [
          {
            type: 'quality',
            quality: 'auto'
          },
          {
            type: 'format',
            format: 'webp' // Optimize images to WebP
          }
        ];
      }

      // Simulate upload progress (since we don't have real progress from the API)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileID]: Math.min((prev[fileID] || 0) + Math.random() * 20, 90)
        }));
      }, 300);

      const result = await sdkClient.media.uploadAsset(file, uploadOptions);

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileID]: 100 }));

      if (result.success && result.data) {
        const uploadedFile: UploadedFile = {
          id: result.data.id,
          url: result.data.secureUrl,
          name: result.data.originalName || file.name,
          type: result.data.resourceType as 'image' | 'video' | 'raw',
          size: result.data.fileSize || file.size,
          thumbnailUrl: isVideo ? generateVideoThumbnail(result.data.secureUrl) : result.data.secureUrl
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);
        toast.success(`${isVideo ? 'Video' : 'Image'} uploaded successfully`);
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload file');
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        Object.keys(newProgress).forEach(key => {
          if (newProgress[key] < 100) {
            delete newProgress[key];
          }
        });
        return newProgress;
      });

      // Clear file inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const generateVideoThumbnail = (videoUrl: string): string => {
    // For Cloudinary URLs, we can generate thumbnails by modifying the URL
    if (videoUrl.includes('cloudinary')) {
      return videoUrl.replace('/video/', '/image/').replace(/\.(mp4|mov|avi|webm)$/i, '.jpg');
    }
    return videoUrl; // Fallback to video URL
  };

  const removeFile = (fileID: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileID));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerVideoInput = () => {
    videoInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMediaPreview = (file: UploadedFile, index: number) => {
    const isVideo = file.type === 'video';

    return (
      <div key={file.id} className="relative group">
        <div className="aspect-square rounded-lg overflow-hidden bg-neutral-800 border border-neutral-600 relative">
          {isVideo ? (
            <>
              <video
                className="w-full h-full object-cover"
                preload="metadata"
                muted
              >
                <source src={file.url} type="video/mp4" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Play className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                VIDEO
              </div>
            </>
          ) : (
            <img
              src={file.thumbnailUrl || file.url}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <button
          onClick={() => removeFile(file.id)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="mt-1">
          <p className="text-xs text-stone-400 truncate">{file.name}</p>
          <p className="text-xs text-stone-500">{formatFileSize(file.size)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[16px] sm:rounded-[20px] border border-neutral-700 overflow-hidden mb-4 sm:mb-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-24 sm:w-32 h-24 sm:h-32 -right-4 sm:-right-6 -top-6 sm:-top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px] sm:blur-[56px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="space-y-4">
          {/* Text Input */}
          <div className="relative">
            <textarea
              placeholder="Share your coaching insights with fellow coaches..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
              disabled={isPosting}
              className={`w-full bg-transparent border rounded-lg px-4 py-3 text-stone-50 placeholder:text-stone-400 focus:outline-none text-sm sm:text-base resize-none disabled:opacity-50 ${
                isOverLimit
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-neutral-600 focus:border-fuchsia-500'
              }`}
            />

            {/* Character Counter */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span className={`text-xs ${
                isOverLimit ? 'text-red-400' :
                  characterCount > POST_MAX_LENGTH * 0.8 ? 'text-yellow-400' :
                    'text-stone-500'
              }`}>
                {characterCount}/{POST_MAX_LENGTH}
              </span>
              {isOverLimit && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>

          {/* Upload Error */}
          {uploadError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
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
            <div className="space-y-2">
              {Object.entries(uploadProgress)
                .filter(([_, progress]) => progress < 100)
                .map(([fileID, progress]) => (
                <div key={fileID} className="flex items-center gap-3">
                  <Upload className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-stone-300 mb-1">
                      <span>Uploading...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="bg-neutral-700 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-fuchsia-600 to-violet-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <p className="text-stone-300 text-sm font-medium">
                Attached Media ({uploadedFiles.length}):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {uploadedFiles.map(renderMediaPreview)}
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'media')}
          className="hidden"
        />

        <input
          ref={videoInputRef}
          type="file"
          multiple
          accept="video/*"
          onChange={(e) => handleFileSelect(e, 'video')}
          className="hidden"
        />

        <div className="flex items-center justify-between mt-4 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={triggerFileInput}
              disabled={isUploading || isPosting}
              className="text-stone-400 hover:text-fuchsia-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 group"
              title="Upload images"
            >
              <Image className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm hidden sm:inline">Photos</span>
            </button>

            <button
              onClick={triggerVideoInput}
              disabled={isUploading || isPosting}
              className="text-stone-400 hover:text-fuchsia-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 group"
              title="Upload videos"
            >
              <Video className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm hidden sm:inline">Videos</span>
            </button>

            <button
              className="text-stone-400 hover:text-fuchsia-400 transition-colors flex items-center gap-1 group"
              title="Add emoji"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm hidden sm:inline">Emoji</span>
            </button>
          </div>

          <button
            onClick={handleCreatePost}
            disabled={!newPost.trim() || isUploading || isPosting || isOverLimit}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
          >
            {isPosting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Post</span>
              </>
            )}
          </button>
        </div>

        {/* Upload Tips */}
        {!uploadedFiles.length && !uploadError && (
          <div className="mt-3 text-xs text-stone-500 text-center">
            📷 Images up to 10MB • 🎥 Videos up to 100MB • Supports MP4, WebM, JPEG, PNG, GIF, WebP
          </div>
        )}
      </div>
    </div>
  );
};
