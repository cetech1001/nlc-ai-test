import React, { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { CreateCourseChapter } from '@nlc-ai/sdk-course';

interface ChapterFormProps {
  courseID: string;
  chapterToEdit?: {
    id: string;
    title: string;
    description?: string;
    orderIndex: number;
  } | null;
  onBack: () => void;
  onSave: (chapterData: CreateCourseChapter) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const ChapterForm: React.FC<ChapterFormProps> = ({
  courseID,
  chapterToEdit,
  onBack,
  onSave,
  isModal = false,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: chapterToEdit?.title || '',
    description: chapterToEdit?.description || '',
    orderIndex: chapterToEdit?.orderIndex || 0,
    dripDelay: 0,
    isLocked: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Chapter title is required';
    }

    if (formData.orderIndex < 0) {
      newErrors.orderIndex = 'Order index must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const chapterData: CreateCourseChapter = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      orderIndex: formData.orderIndex,
      dripDelay: formData.dripDelay,
      isLocked: formData.isLocked
    };

    onSave(chapterData);
  };

  const FormContent = () => (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="block text-white text-sm font-medium">
          Chapter Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter chapter title..."
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full bg-neutral-800 border ${errors.title ? 'border-red-500' : 'border-neutral-600'} text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none`}
        />
        {errors.title && (
          <p className="text-red-400 text-sm">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-white text-sm font-medium">
          Description (Optional)
        </label>
        <textarea
          placeholder="Enter chapter description..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none resize-none h-24"
        />
      </div>

      {/* Order Index */}
      <div className="space-y-2">
        <label className="block text-white text-sm font-medium">
          Chapter Order <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          min="0"
          placeholder="0"
          value={formData.orderIndex}
          onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value) || 0)}
          className={`w-full bg-neutral-800 border ${errors.orderIndex ? 'border-red-500' : 'border-neutral-600'} text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none`}
        />
        {errors.orderIndex && (
          <p className="text-red-400 text-sm">{errors.orderIndex}</p>
        )}
        <p className="text-neutral-400 text-sm">
          The order in which this chapter appears in the course (0 = first)
        </p>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h3 className="text-white text-lg font-semibold">Advanced Settings</h3>

        <div className="space-y-2">
          <label className="block text-white text-sm font-medium">
            Drip Delay (Days)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={formData.dripDelay}
            onChange={(e) => handleInputChange('dripDelay', parseInt(e.target.value) || 0)}
            className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
          />
          <p className="text-neutral-400 text-sm">
            Number of days to wait before making this chapter available
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isLocked}
            onChange={(e) => handleInputChange('isLocked', e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
          />
          <span className="text-white">Lock this chapter initially</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={isModal ? onClose : onBack}
          className="px-6 py-3 bg-transparent border border-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity"
        >
          {chapterToEdit ? 'Update Chapter' : 'Create Chapter'}
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-gradient-to-b from-neutral-800/95 to-neutral-900/95 backdrop-blur-sm rounded-[20px] border border-neutral-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">
                {chapterToEdit ? 'Edit Chapter' : 'New Chapter'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FormContent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>

      <div className="pt-8 pb-16 px-6 w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-2xl font-bold">
            {chapterToEdit ? 'Edit Chapter' : 'New Chapter'}
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 overflow-hidden">
            <div className="p-8">
              <FormContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
