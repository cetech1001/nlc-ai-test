import React, {FC} from 'react';
import { CourseCard } from '@/lib';
import {ExtendedCourse} from "@nlc-ai/types";

interface IProps {
  courses: ExtendedCourse[];
}

export const CoursesGrid: FC<IProps> = ({ courses }) => {
  if (courses.length === 0) {
    return (
      <div className="glass-card rounded-4xl p-10">
        <div className="text-center space-y-4">
          <svg className="w-20 h-20 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Courses Available</h3>
            <p className="text-muted-foreground">There are no courses in this community yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Mobile: Single column */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Tablet: 2 columns */}
      <div className="hidden sm:grid md:hidden grid-cols-2 gap-4 sm:gap-5">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Desktop: 3 columns */}
      <div className="hidden md:block space-y-4 lg:space-y-6">
        <div className="grid grid-cols-3 gap-4 lg:gap-6">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {courses.length > 3 && (
          <div className="grid grid-cols-3 gap-4 lg:gap-6">
            {courses.slice(3, 6).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {courses.length > 6 && (
          <div className="grid grid-cols-3 gap-4 lg:gap-6">
            {courses.slice(6, 9).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
