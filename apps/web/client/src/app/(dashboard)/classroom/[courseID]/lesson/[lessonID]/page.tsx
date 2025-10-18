'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LessonLayout, sdkClient } from '@/lib';
import { ExtendedCourse } from '@nlc-ai/types';
// import { useCommunityStore } from '@/lib/stores/community.store';

const LessonPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseID = params?.courseID as string;
  const lessonID = params?.lessonID as string;

  const [course, setCourse] = useState<ExtendedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const selectedCoachID = useCommunityStore(state => state.selectedCoachID);

  useEffect(() => {
    if (courseID) {
      fetchCourse();
    }
  }, [courseID]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sdkClient.courses.getCourse(courseID);
      setCourse(response);
    } catch (err: any) {
      console.error('Error fetching course:', err);
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-foreground/60">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card rounded-4xl p-8 max-w-md text-center space-y-4">
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-foreground">Course Not Found</h2>
          <p className="text-foreground/60">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/classroom')}
            className="px-6 py-3 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Classroom
          </button>
        </div>
      </div>
    );
  }

  return <LessonLayout course={course} currentLessonID={lessonID} />;
};

export default LessonPage;
