'use client'

import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Users, Calendar, MoreVertical, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { appConfig } from "@nlc-ai/web-shared";
import { CoursesLanding } from "@/app/(dashboard)/courses/landing";
import { useRouter } from "next/navigation";
import { sdkClient } from "@/lib";
import type { ExtendedCourse } from '@nlc-ai/sdk-course';

const statusColors: Record<string, string> = {
  Published: 'bg-green-600/20 text-green-400 border-green-600/50',
  Draft: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50',
  Archived: 'bg-gray-600/20 text-gray-400 border-gray-600/50'
};

interface CourseCardProps {
  course: ExtendedCourse;
  onEdit: (course: ExtendedCourse) => void;
  onDelete: (course: ExtendedCourse) => void;
  onDuplicate: (course: ExtendedCourse) => void;
  onPreview: (course: ExtendedCourse) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete, onDuplicate, onPreview }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const getStatusDisplay = (course: ExtendedCourse) => {
    return course.isPublished ? 'Published' : 'Draft';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative group h-full">
      {/* Status Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[getStatusDisplay(course)]}`}>
          {getStatusDisplay(course)}
        </div>
      </div>

      {/* More Actions Dropdown */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 bg-black/20 hover:bg-black/30 cursor-pointer text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            <MoreVertical className="w-4 h-4 cursor-pointer" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-lg overflow-hidden z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-[#3A3A3A] flex items-center gap-3 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit Course</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(course);
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-[#3A3A3A] flex items-center gap-3 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Preview Course</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(course);
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-[#3A3A3A] flex items-center gap-3 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">Duplicate</span>
              </button>
              <div className="border-t border-[#3A3A3A]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(course);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-600/10 flex items-center gap-3 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete Course</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Card */}
      <div
        className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 overflow-hidden h-full flex flex-col cursor-pointer hover:border-purple-400/50 transition-all"
        onClick={() => onEdit(course)}
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
                className="w-full h-full object-cover rounded-2xl"
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
              <div className="text-stone-400 text-xs">
                Updated {formatDate(course.updatedAt)}
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
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 overflow-hidden h-full flex flex-col">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>
        <div className="relative z-10 p-6 flex flex-col h-full">
          <div className="w-full h-40 bg-neutral-700/50 rounded-2xl mb-4 animate-pulse"></div>
          <div className="space-y-3 flex-grow flex flex-col">
            <div className="h-6 bg-neutral-700/50 rounded animate-pulse"></div>
            <div className="h-4 bg-neutral-700/50 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-neutral-700/50 rounded animate-pulse w-1/2"></div>
            <div className="grid grid-cols-2 gap-4 pt-2 mt-auto">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neutral-700/50 rounded animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-4 w-8 bg-neutral-700/50 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-neutral-700/50 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neutral-700/50 rounded animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-4 w-8 bg-neutral-700/50 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-neutral-700/50 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const CoursesPage = () => {
  if (appConfig.features.enableLanding) {
    return <CoursesLanding />
  }

  const router = useRouter();

  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await sdkClient.courses.getCourses({
        page: 1,
        limit: 100 // Get all courses for initial load
      });

      setCourses(response.data);

      // Calculate stats
      setStats({
        totalCourses: response.data.length,
        publishedCourses: response.data.filter(course => course.isPublished).length,
        totalEnrollments: response.data.reduce((sum, course) => sum + course.totalEnrollments, 0),
      });

    } catch (error: any) {
      console.error('Error loading courses:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewCourse = () => {
    router.push('/courses/new');
  };

  const handleEditCourse = (course: ExtendedCourse) => {
    router.push(`/courses/${course.id}`);
  };

  const handleDeleteCourse = async (course: ExtendedCourse) => {
    if (confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      try {
        await sdkClient.courses.deleteCourse(course.id);
        // Remove from local state
        setCourses(prevCourses => prevCourses.filter(c => c.id !== course.id));

        // Update stats
        const updatedCourses = courses.filter(c => c.id !== course.id);
        setStats({
          totalCourses: updatedCourses.length,
          publishedCourses: updatedCourses.filter(course => course.isPublished).length,
          totalEnrollments: updatedCourses.reduce((sum, course) => sum + course.totalEnrollments, 0),
        });
      } catch (error: any) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const handleDuplicateCourse = async (course: ExtendedCourse) => {
    try {
      // Create a new course based on the existing one
      const duplicateData = {
        title: `${course.title} (Copy)`,
        description: course.description,
        category: course.category,
        difficultyLevel: course.difficultyLevel,
        pricingType: course.pricingType as any,
        price: course.price,
        currency: course.currency,
        estimatedDurationHours: course.estimatedDurationHours,
        allowInstallments: course.allowInstallments,
        allowSubscriptions: course.allowSubscriptions,
        isDripEnabled: course.isDripEnabled,
        dripInterval: course.dripInterval,
        dripCount: course.dripCount,
        // Note: chapters would need to be duplicated separately via chapter API
      };

      const newCourse = await sdkClient.courses.createCourse(duplicateData);

      // Add to local state at the beginning
      setCourses(prevCourses => [newCourse, ...prevCourses]);

      // Update stats
      setStats(prev => ({
        totalCourses: prev.totalCourses + 1,
        publishedCourses: prev.publishedCourses, // New course is draft by default
        totalEnrollments: prev.totalEnrollments,
      }));

    } catch (error: any) {
      console.error('Error duplicating course:', error);
      alert('Failed to duplicate course. Please try again.');
    }
  };

  const handlePreviewCourse = (course: ExtendedCourse) => {
    // TODO: Implement course preview functionality
    console.log('Preview course:', course.id);
    // You might want to navigate to a preview URL or open in new tab
    // window.open(`/courses/${course.id}/preview`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 pb-16">
          <div className="w-full px-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-white text-3xl font-bold mb-2">My Courses</h1>
                <p className="text-stone-300 text-lg">
                  Create and manage your course content
                </p>
              </div>
              <div className="w-full lg:w-auto">
                <div className="h-12 bg-neutral-700/50 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Stats Loading */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                  </div>
                  <div className="relative z-10">
                    <div className="h-4 w-24 bg-neutral-700/50 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-16 bg-neutral-700/50 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Courses Loading */}
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="pt-8 pb-16">
          <div className="w-full px-6">
            <div className="text-center py-16">
              <div className="text-red-400 text-lg mb-4">{error}</div>
              <button
                onClick={fetchCourses}
                className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-opacity"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-16">
        <div className="w-full px-6">
          {/* Header - Mobile responsive */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2">My Courses</h1>
              <p className="text-stone-300 text-lg">
                Create and manage your course content
              </p>
            </div>

            {/* Create button - full width on mobile */}
            <button
              onClick={handleCreateNewCourse}
              className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-opacity w-full lg:w-auto justify-center lg:justify-start"
            >
              <Plus className="w-5 h-5" />
              Create New Course
            </button>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
              </div>
              <div className="relative z-10">
                <div className="text-stone-300 text-sm mb-2">Total Courses</div>
                <div className="text-white text-2xl font-bold">{stats.totalCourses}</div>
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-green-200 via-green-600 to-emerald-600 rounded-full blur-[56px]" />
              </div>
              <div className="relative z-10">
                <div className="text-stone-300 text-sm mb-2">Published</div>
                <div className="text-white text-2xl font-bold">{stats.publishedCourses}</div>
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-blue-200 via-blue-600 to-indigo-600 rounded-full blur-[56px]" />
              </div>
              <div className="relative z-10">
                <div className="text-stone-300 text-sm mb-2">Total Enrollments</div>
                <div className="text-white text-2xl font-bold">{stats.totalEnrollments}</div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-stone-400 mx-auto mb-4" />
              <h2 className="text-white text-xl font-semibold mb-2">No courses yet</h2>
              <p className="text-stone-300 mb-6">Create your first course to get started</p>
              <button
                onClick={handleCreateNewCourse}
                className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-opacity"
              >
                <Plus className="w-5 h-5" />
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                  onDuplicate={handleDuplicateCourse}
                  onPreview={handlePreviewCourse}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
