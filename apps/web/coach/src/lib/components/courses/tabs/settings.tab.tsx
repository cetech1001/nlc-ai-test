import React, { useState, useEffect } from 'react';
import { AlertCircle, Image as ImageIcon, X, Upload, RotateCw } from 'lucide-react';
import type { ExtendedCourse } from '@nlc-ai/sdk-courses';
import { sdkClient } from '@/lib';
import { toast } from 'sonner';
import { MediaTransformationType } from "@nlc-ai/types";
import { ImageCropper } from '@nlc-ai/web-settings';

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video' | 'raw';
  size: number;
}

interface SettingsTabProps {
  course: ExtendedCourse | null;
  onCourseUpdate?: (updatedCourse: ExtendedCourse) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ course, onCourseUpdate }) => {
  const [courseName, setCourseName] = useState(course?.title || '');
  const [courseDescription, setCourseDescription] = useState(course?.description || '');
  const [category, setCategory] = useState(course?.category || '');
  const [difficultyLevel, setDifficultyLevel] = useState(course?.difficultyLevel || 'Beginner');
  const [estimatedDuration, setEstimatedDuration] = useState(course?.estimatedDurationHours?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  // Cover image state with cropping
  const [showCoverUploadModal, setShowCoverUploadModal] = useState(false);
  const [showCoverCropModal, setShowCoverCropModal] = useState(false);
  const [coverOriginalImageUrl, setCoverOriginalImageUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverCroppedBlob, setCoverCroppedBlob] = useState<Blob | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Initialize cover image from course data
  const [coverImage, setCoverImage] = useState<UploadedFile | null>(
    course?.thumbnailUrl ? {
      id: 'existing',
      url: course.thumbnailUrl,
      name: 'Current cover image',
      type: 'image',
      size: 0
    } : null
  );

  // Update state when course prop changes
  useEffect(() => {
    if (course) {
      setCourseName(course.title);
      setCourseDescription(course.description || '');
      setCategory(course.category || '');
      setDifficultyLevel(course.difficultyLevel || 'Beginner');
      setEstimatedDuration(course.estimatedDurationHours?.toString() || '');

      if (course.thumbnailUrl && !coverImage) {
        setCoverImage({
          id: 'existing',
          url: course.thumbnailUrl,
          name: 'Current cover image',
          type: 'image',
          size: 0
        });
      }
    }
  }, [course]);

  // Cover image handlers
  const handleCoverFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB');
      return;
    }

    // Clear any existing errors
    setUploadError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCoverOriginalImageUrl(result);
      setCoverPreviewUrl(result);
      setShowCoverUploadModal(false);
      setShowCoverCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverCropComplete = (croppedBlob: Blob) => {
    setCoverCroppedBlob(croppedBlob);
    setShowCoverCropModal(false);
    setShowCoverUploadModal(true);

    const croppedUrl = URL.createObjectURL(croppedBlob);
    setCoverPreviewUrl(croppedUrl);
  };

  const handleCoverCropCancel = () => {
    setShowCoverCropModal(false);
    setCoverOriginalImageUrl(null);
    setCoverPreviewUrl(null);
    setCoverCroppedBlob(null);
  };

  const handleCoverReCrop = () => {
    if (coverOriginalImageUrl) {
      setShowCoverUploadModal(false);
      setShowCoverCropModal(true);
      setCoverPreviewUrl(coverOriginalImageUrl);
    }
  };

  const handleCoverUpload = async () => {
    if (!coverCroppedBlob || !course) return;

    setCoverUploading(true);
    try {
      const uploadOptions = {
        folder: `nlc-ai/courses/${course.id}/covers`,
        tags: ['course-cover'],
        metadata: {
          uploadedBy: 'coach',
          courseID: course.id,
          purpose: 'course-cover'
        },
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
      const result = await sdkClient.media.uploadAsset(coverCroppedBlob, uploadOptions);

      if (result.success && result.data?.asset) {
        const uploadedFile: UploadedFile = {
          id: result.data.asset.id,
          url: result.data.asset.secureUrl,
          name: result.data.asset.originalName || 'cover-image',
          type: result.data.asset.resourceType as 'image' | 'video' | 'raw',
          size: result.data.asset.fileSize || 0,
        };

        setCoverImage(uploadedFile);
        closeCoverUploadModal();
        toast.success('Cover image uploaded successfully');
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload cover image');
      toast.error(error.message || 'Failed to upload cover image');
    } finally {
      setCoverUploading(false);
    }
  };

  const closeCoverUploadModal = () => {
    setShowCoverUploadModal(false);
    setCoverOriginalImageUrl(null);
    setCoverPreviewUrl(null);
    setCoverCroppedBlob(null);
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setUploadError('');
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
      const updateData = {
        title: courseName.trim(),
        description: courseDescription.trim(),
        category: category.trim() || undefined,
        difficultyLevel,
        thumbnailUrl: coverImage?.url,
        estimatedDurationHours: estimatedDuration ? parseInt(estimatedDuration) : undefined
      };

      const updatedCourse = await sdkClient.courses.updateCourse(course.id, updateData);

      toast.success('Settings saved successfully');

      // Notify parent component of the update
      if (onCourseUpdate) {
        onCourseUpdate(updatedCourse);
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
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

  const categories = [
    'Business & Entrepreneurship',
    'Health & Fitness',
    'Personal Development',
    'Technology & Programming',
    'Creative Arts',
    'Marketing & Sales',
    'Finance & Investing',
    'Education & Teaching',
    'Lifestyle',
    'Other'
  ];

  return (
    <div className="h-full flex flex-col relative border border-neutral-800/50 rounded-[20px] md:rounded-[30px] overflow-y-auto">
      <div className="px-4 md:px-8 pt-4 md:pt-8 pb-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-[#F9F9F9] font-inter text-xl md:text-2xl font-semibold leading-[25.6px]">
              Settings
            </h3>
            <p className="text-[#838383] font-inter text-sm md:text-base font-normal">
              Configure your course details and appearance
            </p>
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
          {/* Glow orb */}
          <div className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-br from-purple-400/15 to-violet-500/15 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row justify-center items-start gap-[30px] w-full relative">
            <div className="flex flex-col items-start gap-3 w-full lg:w-auto">
              <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                Upload Cover
                <span className="text-red-500">*</span>
              </label>

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
                  {coverImage.size > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatFileSize(coverImage.size)}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowCoverUploadModal(true)}
                  className="flex w-full lg:w-[441px] h-[222px] p-6 md:p-14 justify-center items-center rounded-[10px] border border-dashed border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)] hover:border-purple-400 transition-colors"
                >
                  <div className="flex flex-col items-center gap-5">
                    <ImageIcon className="w-10 h-10 text-purple-400" />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="text-white font-inter text-lg md:text-xl font-normal leading-5">
                        Drag or click to upload
                      </span>
                      <span className="text-white font-inter text-sm md:text-base font-normal leading-5 opacity-50">
                        Maximum File size 10MB
                      </span>
                    </div>
                  </div>
                </button>
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
                  Category
                </label>
                <div className="flex h-[50px] px-5 justify-between items-center self-stretch rounded-[10px] border border-white/30 bg-white/5">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex-1 bg-transparent text-white font-inter text-base font-normal outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-neutral-800 text-white">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-neutral-800 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none">
                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
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

              <div className="flex flex-col items-start gap-3 self-stretch">
                <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                  Estimated Duration (hours)
                </label>
                <div className="flex h-[50px] px-5 justify-between items-center self-stretch rounded-[10px] border border-white/30 bg-white/5">
                  <input
                    type="number"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="e.g., 10"
                    min="1"
                    max="500"
                    className="flex-1 bg-transparent text-white font-inter text-base font-normal placeholder:text-white/50 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Upload Modal */}
      {showCoverUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Upload Cover Image</h3>
              <button
                onClick={closeCoverUploadModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!coverCroppedBlob && (
                <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileSelect}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Click to select an image
                    </span>
                    <span className="text-xs text-gray-500">
                      Max file size: 10MB
                    </span>
                  </label>
                </div>
              )}

              {coverPreviewUrl && coverCroppedBlob && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={coverPreviewUrl}
                      alt="Preview"
                      className="w-full h-32 rounded-lg object-cover"
                    />
                  </div>

                  <button
                    onClick={handleCoverReCrop}
                    className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    Crop Again
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeCoverUploadModal}
                  disabled={coverUploading}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/30 flex justify-center items-center text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCoverUpload}
                  disabled={!coverCroppedBlob || coverUploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg flex justify-center items-center disabled:opacity-50 text-white text-sm font-semibold"
                >
                  {coverUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Crop Modal */}
      {showCoverCropModal && coverOriginalImageUrl && (
        <ImageCropper
          imageSrc={coverOriginalImageUrl}
          onCropComplete={handleCoverCropComplete}
          onCancel={handleCoverCropCancel}
          cropType="banner"
          aspectRatio={2} // 2:1 aspect ratio for course covers
        />
      )}
    </div>
  );
};
