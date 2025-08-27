import { Camera, Image, Send, Smile, X, Upload, AlertCircle } from "lucide-react";
import React, { FC, useState, useRef } from "react";
import { sdkClient } from "@/lib";

interface IProps {
  handleCreatePost: (post: string, mediaUrls?: string[]) => void;
}

export const NewPost: FC<IProps> = (props) => {
  const [newPost, setNewPost] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{
    id: string;
    url: string;
    name: string;
    type: string;
  }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePost = async () => {
    try {
      const mediaUrls = uploadedFiles.map(file => file.url);
      await props.handleCreatePost(newPost, mediaUrls);
      setNewPost('');
      setUploadedFiles([]);
      setUploadError('');
    } catch (e) {
      console.error('Failed to create post:', e);
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => uploadFile(file));
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError('');

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mpeg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, MPEG)');
      }

      // Use the main SDK client with media service
      const result = await sdkClient.media.uploadAsset(file, {
        folder: 'posts',
        tags: ['post-media'],
        metadata: { uploadedFor: 'post' }
      });

      if (result.success && result.data) {
        setUploadedFiles(prev => [...prev, {
          id: result.data!.id,
          url: result.data!.secureUrl,
          name: result.data!.originalName,
          type: result.data!.resourceType
        }]);
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[16px] sm:rounded-[20px] border border-neutral-700 overflow-hidden mb-4 sm:mb-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-24 sm:w-32 h-24 sm:h-32 -right-4 sm:-right-6 -top-6 sm:-top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px] sm:blur-[56px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <textarea
          placeholder="Share your coaching insights with fellow coaches..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          rows={3}
          className="w-full bg-transparent border border-neutral-600 rounded-lg px-4 py-3 text-stone-50 placeholder:text-stone-400 focus:outline-none focus:border-fuchsia-500 text-sm sm:text-base resize-none"
        />

        {/* Upload Error */}
        {uploadError && (
          <div className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{uploadError}</p>
            <button
              onClick={() => setUploadError('')}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-stone-300 text-sm font-medium">Attached Media:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-neutral-800 border border-neutral-600">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Camera className="w-6 sm:w-8 h-6 sm:h-8 text-stone-400 mb-1" />
                        <span className="text-xs text-stone-500 text-center px-1">Video</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-stone-400 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex items-center justify-between mt-4 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="text-stone-400 hover:text-fuchsia-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Upload images or videos"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-fuchsia-400"></div>
              ) : (
                <Image className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="text-xs sm:text-sm hidden sm:inline">Media</span>
            </button>
            <button className="text-stone-400 hover:text-fuchsia-400 transition-colors flex items-center gap-1">
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm hidden sm:inline">Emoji</span>
            </button>
          </div>
          <button
            onClick={handleCreatePost}
            disabled={!newPost.trim() || isUploading}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Post</span>
          </button>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-fuchsia-400" />
            <span className="text-stone-300 text-sm">Uploading media...</span>
            <div className="flex-1 bg-neutral-700 rounded-full h-1 overflow-hidden">
              <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 h-full rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
