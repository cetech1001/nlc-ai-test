import React, {FC} from "react";
import { useRouter } from "next/navigation";
import { ExtendedCourse } from "@nlc-ai/types";

interface IProps {
  course: ExtendedCourse;
}

export const CourseCard: FC<IProps> = ({ course }) => {
  const router = useRouter();

  const handleStartLesson = () => {
    // Get first lesson from first chapter
    const firstChapter = course.chapters?.[0];
    const firstLesson = firstChapter?.lessons?.[0];

    if (firstLesson) {
      router.push(`/classroom/${course.id}/lesson/${firstLesson.id}`);
    }
  };

  const isLocked = course.price && course.price > 0;
  const hasLessons = course.chapters?.some(chapter => chapter.lessons && chapter.lessons.length > 0);

  return (
    <div className="glass-card rounded-4xl flex-1 relative overflow-hidden min-w-0">
      <div className="absolute left-[30px] -bottom-[10px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />

      <div className="relative z-10">
        <img
          src={course.thumbnailUrl || 'https://via.placeholder.com/400x220?text=Course+Thumbnail'}
          alt={course.title}
          className="w-full h-40 sm:h-48 lg:h-[218px] object-cover"
        />

        <div className="p-4 sm:p-6 lg:p-7.5 space-y-5 sm:space-y-6 lg:space-y-7">
          <div className="space-y-2 sm:space-y-3">
            <h3 className={`text-lg sm:text-xl font-semibold leading-normal text-foreground`}>
              {course.title}
            </h3>
            <p className="text-sm sm:text-base text-foreground/40 leading-relaxed sm:leading-[22px]">
              {course.description || 'No description available'}
            </p>
          </div>

          {isLocked ? (
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-semibold text-foreground/40">
                  {course.totalLessons || 0} Lessons
                </span>
                <button className="text-xs sm:text-sm text-[#FF7915] underline hover:text-[#FF7915]/80 transition-colors">
                  Pay to unlock
                </button>
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full" />
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-semibold text-foreground/40">
                  {course.totalLessons || 0} Lessons
                </span>
                {hasLessons ? (
                  <button
                    onClick={handleStartLesson}
                    className="text-xs sm:text-sm text-[#FF7915] underline hover:text-[#FF7915]/80 transition-colors"
                  >
                    Start Lesson
                  </button>
                ) : (
                  <span className="text-xs sm:text-sm text-foreground/40">
                    No lessons yet
                  </span>
                )}
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full" />
            </div>
          )}
        </div>

        {isLocked && (
          <div className="absolute top-3 sm:top-4 lg:top-5 left-3 sm:left-4 lg:left-5 p-2 sm:p-2.5 lg:p-3 rounded-xl lg:rounded-2xl bg-background">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75C16.5 5.55653 16.0259 4.41193 15.182 3.56802C14.3381 2.72411 13.1935 2.25 12 2.25C10.8065 2.25 9.66193 2.72411 8.81802 3.56802C7.97411 4.41193 7.5 5.55653 7.5 6.75V10.5M6.75 21.75H17.25C17.8467 21.75 18.419 21.5129 18.841 21.091C19.2629 20.669 19.5 20.0967 19.5 19.5V12.75C19.5 12.1533 19.2629 11.581 18.841 11.159C18.419 10.7371 17.8467 10.5 17.25 10.5H6.75C6.15326 10.5 5.58097 10.7371 5.15901 11.159C4.73705 11.581 4.5 12.1533 4.5 12.75V19.5C4.5 20.0967 4.73705 20.669 5.15901 21.091C5.58097 21.5129 6.15326 21.75 6.75 21.75Z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
