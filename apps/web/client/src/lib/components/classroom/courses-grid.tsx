import React, {FC} from 'react';
import { CourseCard } from '@/lib';
import {ExtendedCourse} from "@nlc-ai/types";

interface IProps {
  courses: ExtendedCourse[];
}

export const CoursesGrid: FC<IProps> = ({ courses }) => {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {courses.map((course, index) => (
          <CourseCard
            key={index}
            image={course.thumbnailUrl || ''}
            title={course.title}
            description={course.description || ''}
            locked={course.pricingType !== 'free'}
          />
        ))}
      </div>

      <div className="hidden sm:grid md:hidden grid-cols-2 gap-4 sm:gap-5">
        {courses.map((course, index) => (
          <CourseCard
            key={index}
            image={course.thumbnailUrl || ''}
            title={course.title}
            description={course.description || ''}
            locked={course.pricingType !== 'free'}
          />
        ))}
      </div>

      <div className="hidden md:block space-y-4 lg:space-y-6">
        <div className="grid grid-cols-3 gap-4 lg:gap-6">
          {courses.slice(0, 3).map((course, index) => (
            <CourseCard
              key={index}
              image={course.thumbnailUrl || ''}
              title={course.title}
              description={course.description || ''}
              locked={course.pricingType !== 'free'}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 lg:gap-6">
          {courses.slice(3, 6).map((course, index) => (
            <CourseCard
              key={index + 3}
              image={course.thumbnailUrl || ''}
              title={course.title}
              description={course.description || ''}
              locked={course.pricingType !== 'free'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
