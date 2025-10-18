import React from 'react';
import { CourseLessonWithDetails, CourseChapterWithDetails, ExtendedCourse } from '@nlc-ai/types';
import {S3VideoPlayer} from "@nlc-ai/web-shared";

interface LessonVideoPlayerProps {
  lesson?: CourseLessonWithDetails;
  chapter?: CourseChapterWithDetails;
  course: ExtendedCourse;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({ lesson, chapter, course }) => {
  if (!lesson) {
    return (
      <div className="glass-card rounded-4xl p-6 sm:p-10 lg:p-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <svg className="w-20 h-20 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-lg text-muted-foreground">Select a lesson to begin</p>
          </div>
        </div>
      </div>
    );
  }

  const renderLessonContent = () => {
    switch (lesson.lessonType) {
      case 'video':
        return (
          <div className="flex justify-center">
            <div className="w-full max-w-[900px] max-h-[50vh] aspect-video relative rounded-2xl sm:rounded-3xl overflow-hidden">
              {lesson.videoUrl ? (
                <S3VideoPlayer
                  src={lesson.videoUrl}
                  className="w-full"
                  autoGenerateThumbnail={true}
                />
              ) : (
                <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <svg className="w-16 h-16 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <p className="text-muted-foreground">Video not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="max-w-[800px] mx-auto">
            <div className="prose prose-invert max-w-none">
              <div
                className="text-base leading-relaxed text-foreground"
                dangerouslySetInnerHTML={{ __html: lesson.content || '<p>No content available</p>' }}
              />
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="flex justify-center">
            <div className="w-full max-w-[900px]">
              {lesson.pdfUrl ? (
                <iframe
                  src={lesson.pdfUrl}
                  className="w-full h-[600px] sm:h-[700px] lg:h-[800px] rounded-2xl sm:rounded-3xl border border-border"
                  title={lesson.title}
                />
              ) : (
                <div className="w-full h-[600px] rounded-2xl sm:rounded-3xl bg-[#1A1A1A] flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <svg className="w-16 h-16 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <p className="text-muted-foreground">PDF not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-10">
            Unsupported lesson type: {lesson.lessonType}
          </div>
        );
    }
  };

  return (
    <div className="glass-card rounded-4xl p-6 relative">
      {/* Background glow orbs */}
      <div className="absolute left-[30px] -bottom-[142px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />
      <div className="absolute right-[13px] -bottom-[190px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />
      <div className="absolute left-[591px] -top-[197px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />

      <div className="relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <span>{course.title}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>{chapter?.title}</span>
        </div>

        {/* Lesson Title */}
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-base sm:text-lg text-muted-foreground">
              {lesson.description}
            </p>
          )}
          {lesson.estimatedMinutes && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{lesson.estimatedMinutes} minutes</span>
            </div>
          )}
        </div>

        {/* Lesson Content */}
        {renderLessonContent()}

        {/* Additional Content Section */}
        {lesson.content && lesson.lessonType === 'video' && (
          <div className="space-y-4 sm:space-y-6 max-w-[800px] mx-auto border-t border-border pt-6 mt-8">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Lesson Notes</h3>
            <div
              className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed text-foreground/80"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-6 mt-8">
          <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-border text-white hover:bg-[#1A1A1A] transition-colors text-sm sm:text-base">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>

          <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 text-white font-medium hover:opacity-90 transition-opacity text-sm sm:text-base">
            Mark Complete
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>

          <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-border text-white hover:bg-[#1A1A1A] transition-colors text-sm sm:text-base">
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
