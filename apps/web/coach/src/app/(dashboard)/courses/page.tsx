'use client'

import React, {useEffect, useState} from 'react';
import { Plus, BookOpen, Users, Calendar, MoreVertical, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { appConfig } from "@nlc-ai/web-shared";
import {CoursesLanding} from "@/app/(dashboard)/courses/landing";
import {useRouter} from "next/navigation";

// Mock data for courses
const mockCourses = [
  {
    courseID: '1',
    title: 'Instagram Marketing Mastery',
    description: 'Complete guide to growing your Instagram presence and monetizing your content',
    totalChapters: 8,
    totalLessons: 32,
    enrolledStudents: 245,
    status: 'Published',
    createdAt: '2024-01-15',
    updatedAt: '2024-02-20',
    thumbnail: '/api/placeholder/300/200'
  },
  {
    courseID: '2',
    title: 'Life Coaching Fundamentals',
    description: 'Essential skills and techniques for becoming an effective life coach',
    totalChapters: 12,
    totalLessons: 48,
    enrolledStudents: 189,
    status: 'Published',
    createdAt: '2024-01-10',
    updatedAt: '2024-02-18',
    thumbnail: '/api/placeholder/300/200'
  },
  {
    courseID: '3',
    title: 'TikTok Growth Strategy',
    description: 'Advanced strategies for viral content creation and audience building',
    totalChapters: 6,
    totalLessons: 24,
    enrolledStudents: 0,
    status: 'Draft',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-22',
    thumbnail: '/api/placeholder/300/200'
  },
  {
    courseID: '4',
    title: 'Personal Branding Blueprint',
    description: 'Build a powerful personal brand that attracts your ideal clients',
    totalChapters: 10,
    totalLessons: 40,
    enrolledStudents: 156,
    status: 'Published',
    createdAt: '2024-01-20',
    updatedAt: '2024-02-15',
    thumbnail: '/api/placeholder/300/200'
  }
];

const statusColors: Record<string, string> = {
  Published: 'bg-green-600/20 text-green-400 border-green-600/50',
  Draft: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50',
  Archived: 'bg-gray-600/20 text-gray-400 border-gray-600/50'
};

const CourseCard = ({ course, onEdit, onDelete, onDuplicate, onPreview }: any) => {
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

  return (
    <div className="relative group h-full">
      {/* Status Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[course.status]}`}>
          {course.status}
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
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 overflow-hidden h-full flex flex-col">
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Thumbnail */}
          <div className="w-full h-40 bg-gradient-to-br from-purple-600/20 to-violet-800/20 rounded-2xl mb-4 flex items-center justify-center border border-purple-600/20">
            <BookOpen className="w-12 h-12 text-purple-400" />
          </div>

          {/* Course Info */}
          <div className="space-y-3 flex-grow flex flex-col">
            <h3 className="text-white text-xl font-semibold leading-tight">
              {course.title}
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed line-clamp-2 flex-grow">
              {course.description}
            </p>

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

            {/* Enrollment */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-400" />
                <span className="text-stone-300 text-sm">
                  {course.enrolledStudents} enrolled
                </span>
              </div>
              <div className="text-stone-400 text-xs">
                Updated {new Date(course.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CoursesPage = () => {
  if (appConfig.features.enableLanding) {
    return <CoursesLanding/>
  }

  const router = useRouter();

  const [courses, setCourses] = useState(mockCourses);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNewCourse = () => {
    router.push('/courses/new');
  };

  const handleEditCourse = (course: any) => {
    // Navigate to course edit page
    console.log('Edit course:', course.courseID);
  };

  const handleDeleteCourse = (course: any) => {
    if (confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      setCourses(courses.filter(c => c.courseID !== course.courseID));
      setIsLoading(false);
    }
  };

  const handleDuplicateCourse = (course: any) => {
    const duplicatedCourse = {
      ...course,
      courseID: Date.now().toString(),
      title: `${course.title} (Copy)`,
      status: 'Draft',
      enrolledStudents: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setCourses([duplicatedCourse, ...courses]);
  };

  const handlePreviewCourse = (course: any) => {
    // Open course preview
    console.log('Preview course:', course.courseID);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-violet-900 flex items-center justify-center">
        <div className="text-white">Loading courses...</div>
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
                <div className="text-white text-2xl font-bold">{courses.length}</div>
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-green-200 via-green-600 to-emerald-600 rounded-full blur-[56px]" />
              </div>
              <div className="relative z-10">
                <div className="text-stone-300 text-sm mb-2">Published</div>
                <div className="text-white text-2xl font-bold">
                  {courses.filter(c => c.status === 'Published').length}
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-blue-200 via-blue-600 to-indigo-600 rounded-full blur-[56px]" />
              </div>
              <div className="relative z-10">
                <div className="text-stone-300 text-sm mb-2">Total Enrollments</div>
                <div className="text-white text-2xl font-bold">
                  {courses.reduce((sum, course) => sum + course.enrolledStudents, 0)}
                </div>
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
                  key={course.courseID}
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
