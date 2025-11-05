import React, {useState, useMemo, FC} from 'react';
import { X, ChevronDown } from 'lucide-react';
import { CreateCourseChapter, type ExtendedCourse } from '@nlc-ai/sdk-courses';

interface FormContentProps {
  course?: ExtendedCourse | null;
  chapterToEdit?: {
    id: string;
    title: string;
    description?: string;
    orderIndex: number;
  } | null;
  onBack: () => void;
  isModal?: boolean;
  onClose?: () => void;
  onSave: (chapterData: CreateCourseChapter) => void;
}

const FormContent: FC<FormContentProps> = ({
  onBack,
  isModal,
  onClose,
  course,
  chapterToEdit,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: chapterToEdit?.title || '',
    description: chapterToEdit?.description || '',
    orderIndex: chapterToEdit?.orderIndex || 0,
    dripDelay: 0,
    isLocked: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Generate order options based on existing chapters
  const orderOptions = useMemo(() => {
    if (!course?.chapters) return [{ value: 0, label: 'First chapter' }];

    const options = [{ value: 0, label: 'First chapter' }];

    course.chapters
      .filter(ch => chapterToEdit ? ch.id !== chapterToEdit.id : true)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .forEach((chapter) => {
        options.push({
          value: chapter.orderIndex + 1,
          label: `After "${chapter.title}"`
        });
      });

    return options;
  }, [course?.chapters, chapterToEdit]);

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

  return (
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
          className={`w-full bg-neutral-800/50 border ${errors.title ? 'border-red-500' : 'border-neutral-600'} text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none`}
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
          className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none resize-none h-24"
        />
      </div>

      {/* Order Position */}
      <div className="space-y-2">
        <label className="block text-white text-sm font-medium">
          Position <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            value={formData.orderIndex}
            onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value))}
            className={`w-full bg-neutral-800/50 border ${errors.orderIndex ? 'border-red-500' : 'border-neutral-600'} text-white rounded-lg px-4 py-3 appearance-none focus:border-purple-500 focus:outline-none`}
          >
            {orderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none"/>
        </div>
        {errors.orderIndex && (
          <p className="text-red-400 text-sm">{errors.orderIndex}</p>
        )}
        <p className="text-neutral-400 text-sm">
          Choose where this chapter should appear in your course
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
            className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
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
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg font-medium transition-colors"
        >
          {chapterToEdit ? 'Update Chapter' : 'Create Chapter'}
        </button>
      </div>
    </div>
  );
};

interface ChapterFormProps {
  courseID: string;
  course?: ExtendedCourse | null;
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
  course,
  chapterToEdit,
  onBack,
  onSave,
  isModal = false,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-48 h-48 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-bold">
              {chapterToEdit ? 'Edit Chapter' : 'New Chapter'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <FormContent
            onBack={onBack}
            onSave={onSave}
            isModal={isModal}
            chapterToEdit={chapterToEdit}
            course={course}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};
