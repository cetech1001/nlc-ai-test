import React, {useRef, useState} from 'react';
import {AlertCircle, Image as ImageIcon, X} from 'lucide-react';
import type {ExtendedCourse} from '@nlc-ai/sdk-course';
import {sdkClient} from '@/lib';
import {toast} from 'sonner';
import {MediaTransformationType} from "@nlc-ai/sdk-media";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video' | 'raw';
  size: number;
}

export const SettingsTab: React.FC<{ course: ExtendedCourse | null }> = ({ course }) => {
  const [courseName, setCourseName] = useState(course?.title || '');
  const [courseDescription, setCourseDescription] = useState(course?.description || '');
  const [difficultyLevel, setDifficultyLevel] = useState(course?.difficultyLevel || 'Beginner');
  const [coverImage, setCoverImage] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError('');

      // File validation
      const maxSize = 30 * 1024 * 1024; // 30MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 30MB');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please use JPEG, PNG, GIF, or WebP images');
      }

      const uploadOptions = {
        folder: 'course-covers',
        tags: ['course-cover'],
        transformation: [
          {
            type: MediaTransformationType.QUALITY,
            quality: 'auto'
          },
          {
            type: MediaTransformationType.FORMAT,
            format: 'webp'
          }
        ]
      };

      // @ts-ignore
      const result = await sdkClient.media.uploadAsset(file, uploadOptions);

      if (result.success && result.data) {
        const uploadedFile: UploadedFile = {
          id: result.data.id,
          url: result.data.secureUrl,
          name: result.data.originalName || file.name,
          type: result.data.resourceType as 'image' | 'video' | 'raw',
          size: result.data.fileSize || file.size,
        };

        setCoverImage(uploadedFile);
        toast.success('Cover image uploaded successfully');
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload file');
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setUploadError('');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveSettings = async () => {
    if (!course) return;

    if (!courseName.trim()) {
      toast.error('Course name is required');
      return;
    }

    if (!courseDescription.trim()) {
      toast.error('Course description is required');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Replace with actual SDK call
      console.log('Saving settings:', {
        courseID: course.id,
        title: courseName,
        description: courseDescription,
        difficultyLevel,
        coverImageUrl: coverImage?.url
      });

      // Example SDK call structure:
      // await sdkClient.course.courses.updateCourse(course.id, {
      //   title: courseName,
      //   description: courseDescription,
      //   difficultyLevel,
      //   coverImageUrl: coverImage?.url
      // });

      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col relative border border-neutral-800/50 rounded-[20px] md:rounded-[30px]">
      <div className="px-4 md:px-8 pt-4 md:pt-8 pb-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-[#F9F9F9] font-inter text-xl md:text-2xl font-semibold leading-[25.6px]">
              Settings
            </h3>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex px-5 py-2 justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-[#FEBEFA] via-[#7B21BA] to-[#7B26F0] disabled:opacity-50 disabled:cursor-not-allowed self-start md:self-auto"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-white font-inter text-sm font-semibold leading-6 tracking-[-0.32px]">
                  Saving...
                </span>
              </>
            ) : (
              <span className="text-white font-inter text-sm font-semibold leading-6 tracking-[-0.32px]">
                Save Settings
              </span>
            )}
          </button>
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg w-full mt-4">
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
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          <div className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-br from-purple-400/15 to-violet-500/15 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row justify-center items-start gap-[30px] w-full relative">
            <div className="flex flex-col items-start gap-3 w-full lg:w-auto">
              <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                Upload Cover
                <span className="text-red-500">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {coverImage ? (
                <div className="relative group w-full lg:w-[441px] h-[222px] rounded-[10px] overflow-hidden border border-white/20">
                  <img
                    src={coverImage.url}
                    alt={coverImage.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={removeCoverImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatFileSize(coverImage.size)}
                  </div>
                </div>
              ) : (
                <div
                  onClick={triggerFileInput}
                  className="flex w-full lg:w-[441px] h-[222px] p-6 md:p-14 justify-center items-center rounded-[10px] border border-dashed border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)] cursor-pointer hover:border-purple-400 transition-colors"
                >
                  <div className="flex flex-col items-center gap-5">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400"></div>
                    ) : (
                      <ImageIcon className="w-10 h-10 text-purple-400" />
                    )}

                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="text-white font-inter text-lg md:text-xl font-normal leading-5">
                        {isUploading ? 'Uploading...' : 'Drag or click to upload'}
                      </span>
                      <span className="text-white font-inter text-sm md:text-base font-normal leading-5 opacity-50">
                        Maximum File size 30MB
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-start gap-[30px] flex-1 w-full">
              <div className="flex flex-col items-start gap-3 self-stretch">
                <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                  Course Name
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex h-[50px] px-5 justify-between items-center self-stretch rounded-[10px] border border-white/30 bg-white/5">
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Enter course name.."
                    className="flex-1 bg-transparent text-white font-inter text-base font-normal placeholder:text-white/50 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 self-stretch">
                <label className="self-stretch text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                  Course Description
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex px-5 py-[15px] justify-between items-start self-stretch min-h-[100px] rounded-[10px] border border-white/30 bg-white/5">
                  <textarea
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="Enter your course description..."
                    className="flex-1 bg-transparent text-white font-inter text-base font-normal placeholder:text-white/50 outline-none resize-none min-h-[70px]"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 self-stretch">
                <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                  Course Difficulty
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex h-[50px] px-5 justify-between items-center self-stretch rounded-[10px] border border-white/30 bg-white/5">
                  <select
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                    className="flex-1 bg-transparent text-white font-inter text-base font-normal outline-none appearance-none cursor-pointer"
                  >
                    <option value="Beginner" className="bg-neutral-800 text-white">Beginner</option>
                    <option value="Intermediate" className="bg-neutral-800 text-white">Intermediate</option>
                    <option value="Advanced" className="bg-neutral-800 text-white">Advanced</option>
                  </select>
                  <div className="pointer-events-none">
                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
