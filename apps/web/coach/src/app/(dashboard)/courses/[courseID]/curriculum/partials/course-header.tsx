import React from 'react';
import { ArrowLeft, Eye, ChevronDown } from 'lucide-react';
import type { ExtendedCourse } from '@nlc-ai/sdk-course';

interface CourseHeaderProps {
  course: ExtendedCourse | null;
  onBack: () => void;
  onPreview: () => void;
  onUpdateStatus: () => void;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
 course,
 onBack,
 onPreview,
 onUpdateStatus
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-bold">Curriculum</h1>
            {course && (
              <p className="text-stone-400 text-sm mt-1">{course.title}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPreview}
            className="px-4 py-2 bg-black/20 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-black/30 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={onUpdateStatus}
            className="px-4 py-2 bg-black/20 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-black/30 transition-colors flex items-center gap-2"
          >
            {course?.isPublished ? 'Unpublish' : 'Publish'} Course
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Course Status Badge */}
      {course && (
        <div className="mb-6">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            course.isPublished
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {course.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      )}
    </>
  );
};
