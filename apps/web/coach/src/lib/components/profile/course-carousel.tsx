'use client'

import React, {useEffect, useRef, useState} from 'react';
import {ChevronLeft, ChevronRight, BookOpen, Users, Calendar} from 'lucide-react';
import { ExtendedCourse } from '@nlc-ai/types';
import { CourseCarouselSkeleton } from '@/lib';

interface CourseCarouselProps {
  userID: string;
  onLoadMore: (page: number) => Promise<ExtendedCourse[]>;
  initialCourses: ExtendedCourse[];
  isLoading?: boolean;
}

export const CourseCarousel: React.FC<CourseCarouselProps> = ({
                                                                userID,
                                                                onLoadMore,
                                                                initialCourses,
                                                                isLoading: initialLoading = false
                                                              }) => {
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  if (initialLoading) {
    return <CourseCarouselSkeleton />;
  }

  const handleScroll = async () => {
    if (!scrollContainerRef.current || isLoading || !hasMore) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth;

    if (scrollPercentage > 0.8) {
      setIsLoading(true);
      try {
        const nextPage = currentPage + 1;
        const newCourses = await onLoadMore(nextPage);

        if (newCourses.length === 0) {
          setHasMore(false);
        } else {
          setCourses(prev => [...prev, ...newCourses]);
          setCurrentPage(nextPage);
        }
      } catch (error) {
        console.error('Error loading more courses:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 text-stone-400 mx-auto mb-4" />
        <p className="text-stone-300">No courses available</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="px-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {courses.map((course) => (
          <div
            className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 overflow-hidden h-full flex flex-col cursor-pointer hover:border-purple-400/50 transition-all"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10 p-6 flex flex-col h-full">
              {/* Thumbnail */}
              <div className="w-full h-40 bg-gradient-to-br from-purple-600/20 to-violet-800/20 rounded-2xl mb-4 flex items-center justify-center border border-purple-600/20">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full rounded-2xl"
                  />
                ) : (
                  <BookOpen className="w-12 h-12 text-purple-400" />
                )}
              </div>

              {/* Course Info */}
              <div className="space-y-3 flex-grow flex flex-col">
                <h3 className="text-white text-xl font-semibold leading-tight">
                  {course.title}
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed line-clamp-2 flex-grow">
                  {course.description || 'No description available'}
                </p>

                {/* Category Badge */}
                {course.category && (
                  <div className="flex">
                <span className="inline-flex px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full capitalize">
                  {course.category}
                </span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2 mt-auto">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-stone-400" />
                    <div>
                      <div className="text-white text-sm font-medium">{course.totalChapters}</div>
                      <div className="text-stone-400 text-xs">Chapters</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-stone-400" />
                    <div>
                      <div className="text-white text-sm font-medium">{course.totalLessons}</div>
                      <div className="text-stone-400 text-xs">Lessons</div>
                    </div>
                  </div>
                </div>

                {/* Enrollment and Price */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-300 text-sm">
                      {course.totalEnrollments} enrolled
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                {course.price && (
                  <div className="flex justify-between items-center pt-2">
                <span className="text-white font-medium">
                  ${(course.price / 100).toFixed(2)}
                </span>
                    {course.estimatedDurationHours && (
                      <span className="text-stone-400 text-xs">
                    {course.estimatedDurationHours}h duration
                  </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="glass-card rounded-2xl p-6 min-w-[400px] snap-start flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-primary"></div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
