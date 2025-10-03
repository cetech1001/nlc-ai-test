'use client'

import React, { FC, useState, useRef } from 'react';
import { Image, X, Upload, AlertCircle } from 'lucide-react';
import { NLCClient } from '@nlc-ai/sdk-main';
import { MediaTransformationType } from '@nlc-ai/types';
import { ImageCropper } from './image-cropper';

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  thumbnailUrl?: string;
}

interface ImageUploadProps {
  sdkClient: NLCClient;
  onImagesUploaded: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  folder?: string;
  tags?: string[];
  enableCropping?: boolean;
  cropType?: 'square' | 'banner';
  aspectRatio?: number;
  showPreview?: boolean;
  className?: string;
  disabled?: boolean;
}

export const ImageUpload: FC<ImageUploadProps> = ({
  sdkClient,
  onImagesUploaded,
  maxFiles = 10,
  maxSizeMB = 10,
  folder = 'nlc-ai/uploads/images',
  tags = ['image'],
  enableCropping = false,
  cropType = 'square',
  aspectRatio,
  showPreview = true,
  className = '',
  disabled = false,
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const [showCropModal, setShowCropModal] = useState(false);
  const [currentImageForCrop, setCurrentImageForCrop] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    if (uploadedImages.length + filesArray.length > maxFiles) {
      setUploadError(`You can only upload up to ${maxFiles} images`);
      return;
    }

    if (enableCropping) {
      setPendingImages(filesArray);
      processNextImage(filesArray);
    } else {
      filesArray.forEach(file => uploadImage(file));
    }
  };

  const processNextImage = (images: File[]) => {
    if (images.length === 0) {
      setPendingImages([]);
      return;
    }

    const [currentFile, ...remainingFiles] = images;

    if (!currentFile.type.startsWith('image/')) {
      setUploadError('Please select valid image files');
      processNextImage(remainingFiles);
      return;
    }

    if (currentFile.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`Image size must be less than ${maxSizeMB}MB`);
      processNextImage(remainingFiles);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCurrentImageForCrop({
        file: currentFile,
        url: result,
      });
      setPendingImages(remainingFiles);
      setShowCropModal(true);
    };
    reader.readAsDataURL(currentFile);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropModal(false);

    if (!currentImageForCrop) return;

    const croppedFile = new File(
      [croppedBlob],
      currentImageForCrop.file.name,
      { type: 'image/jpeg' }
    );

    await uploadImage(croppedFile);

    if (pendingImages.length > 0) {
      processNextImage(pendingImages);
    } else {
      setCurrentImageForCrop(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setCurrentImageForCrop(null);
    setPendingImages([]);
  };

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError('');

      if (!file.type.startsWith('image/')) {
        throw new Error('Please select valid image files');
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`Image size must be less than ${maxSizeMB}MB`);
      }

      const fileID = `${Date.now()}-${Math.random()}`;
      setUploadProgress(prev => ({ ...prev, [fileID]: 0 }));

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileID]: Math.min((prev[fileID] || 0) + Math.random() * 20, 90)
        }));
      }, 300);

      const result = await sdkClient.media.uploadAsset(file, {
        folder,
        tags,
        metadata: {
          uploadedFor: 'image',
          originalSize: file.size,
        },
        transformation: [
          {
            type: MediaTransformationType.QUALITY,
            quality: 'auto',
          },
          {
            type: MediaTransformationType.FORMAT,
            format: 'webp',
          },
        ],
      });

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileID]: 100 }));

      if (result.success && result.data?.asset) {
        const uploadedImage: UploadedImage = {
          id: result.data.asset.id,
          url: result.data.asset.secureUrl,
          name: result.data.asset.originalName || file.name,
          size: result.data.asset.fileSize || file.size,
          thumbnailUrl: result.data.asset.secureUrl,
        };

        const newImages = [...uploadedImages, uploadedImage];
        setUploadedImages(newImages);
        onImagesUploaded(newImages);
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);

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
      }, 1000);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (imageID: string) => {
    const newImages = uploadedImages.filter(img => img.id !== imageID);
    setUploadedImages(newImages);
    onImagesUploaded(newImages);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const triggerFileInput = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className={className}>
        <button
          onClick={triggerFileInput}
          disabled={disabled || isUploading || uploadedImages.length >= maxFiles}
          className="text-stone-400 hover:text-fuchsia-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
          title="Upload images"
        >
          <Image className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs sm:text-sm">Photos</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple={!enableCropping}
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

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

        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-3 space-y-2">
            {Object.entries(uploadProgress)
              .filter(([_, progress]) => progress < 100)
              .map(([fileID, progress]) => (
                <div key={fileID} className="flex items-center gap-3">
                  <Upload className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-stone-300 mb-1">
                      <span>Uploading image...</span>
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

        {showPreview && uploadedImages.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-stone-300 text-sm font-medium">
              Uploaded Images ({uploadedImages.length}/{maxFiles}):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-neutral-800 border border-neutral-600">
                    <img
                      src={image.thumbnailUrl || image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="mt-1">
                    <p className="text-xs text-stone-400 truncate">{image.name}</p>
                    <p className="text-xs text-stone-500">{formatFileSize(image.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCropModal && currentImageForCrop && (
        <ImageCropper
          imageSrc={currentImageForCrop.url}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          cropType={cropType}
          aspectRatio={aspectRatio}
        />
      )}
    </>
  );
};
