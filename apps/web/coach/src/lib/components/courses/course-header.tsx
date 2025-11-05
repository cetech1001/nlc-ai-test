import React from 'react';
import { Eye } from 'lucide-react';
import type { ExtendedCourse } from '@nlc-ai/sdk-courses';
import { BackTo } from "@nlc-ai/web-shared";
import {useRouter} from "next/navigation";

interface CourseHeaderProps {
  course: ExtendedCourse | null;
  onBack: () => void;
  onPreview: () => void;
  onUpdateStatus: () => void;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
 course,
 onPreview,
 onUpdateStatus
}) => {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col xl:flex-row items-center justify-between">
        <BackTo onClick={router.back} title={course?.title}/>

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
            className="px-4 py-2 bg-gradient-to-r from-[#FEBEFA] via-[#7B21BA] to-[#7B26F0] text-white rounded-lg flex items-center gap-2"
          >
            {course?.isPublished ? 'Unpublish' : 'Publish'} Course
          </button>
        </div>
      </div>

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
