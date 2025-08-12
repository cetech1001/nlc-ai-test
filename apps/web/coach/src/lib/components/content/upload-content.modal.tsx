'use client'

import { useState, useRef } from 'react';
import { X, Upload, FileVideo, ChevronDown } from 'lucide-react';

interface UploadContentModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onUploadAction: (file: File, category: string) => void;
  preselectedCategory?: string;
}

const categories = [
  { value: 'controversial', label: 'Controversial' },
  { value: 'informative', label: 'Informative' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'case-studies', label: 'Case Studies' }
];

export const UploadContentModal = ({
 isOpen,
 onCloseAction,
 onUploadAction,
 preselectedCategory = ''
}: UploadContentModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(preselectedCategory);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory) {
      alert('Please select a file and category');
      return;
    }

    setIsUploading(true);

    try {
      await onUploadAction(selectedFile, selectedCategory);
      // Reset form
      setSelectedFile(null);
      setSelectedCategory(preselectedCategory);
      onCloseAction();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDiscard = () => {
    setSelectedFile(null);
    setSelectedCategory(preselectedCategory);
    onCloseAction();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onCloseAction}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-b from-neutral-800/95 to-neutral-900/95 backdrop-blur-md rounded-[20px] border border-neutral-700 p-6 w-full max-w-md mx-4 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-stone-50 text-xl font-semibold">Upload New Content</h2>
            <button
              onClick={onCloseAction}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>

          {/* Upload Media Section */}
          <div className="space-y-2">
            <label className="block text-stone-50 text-sm font-medium">
              Upload Media <span className="text-red-400">*</span>
            </label>

            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-neutral-600 hover:border-neutral-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-xl flex items-center justify-center mx-auto">
                    <FileVideo className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-stone-50 font-medium">{selectedFile.name}</div>
                    <div className="text-stone-400 text-sm">{formatFileSize(selectedFile.size)}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-red-400 text-sm hover:text-red-300 transition-colors"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-xl flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-stone-50 font-medium">Drag or click to upload the file</div>
                    <div className="text-stone-400 text-sm">Maximum File size 30MB</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="block text-stone-50 text-sm font-medium">
              Select Category <span className="text-red-400">*</span>
            </label>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg focus:border-purple-500 outline-none appearance-none pr-10"
              >
                <option value="" disabled>Select a category</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedCategory || isUploading}
              className="flex-1 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Content'}
            </button>

            <button
              onClick={handleDiscard}
              disabled={isUploading}
              className="flex-1 border border-neutral-600 text-stone-300 py-2.5 rounded-lg font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
