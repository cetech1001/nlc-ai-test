'use client'

import React, {useEffect, useState} from 'react';
import {WelcomeHero, CoursesGrid, sdkClient} from "@/lib";
import {ExtendedCourse} from "@nlc-ai/types";
import { useCommunityStore } from "@/lib/stores/community.store";

const ClassroomPage = () => {
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCoachID = useCommunityStore(state => state.selectedCoachID);

  useEffect(() => {
    console.log("Coach ID: ", selectedCoachID);
    if (selectedCoachID) {
      fetchCourses();
    }
  }, [selectedCoachID]);

  const fetchCourses = async () => {
    if (!selectedCoachID) {
      console.warn('No coach selected');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await sdkClient.courses.getCourses({}, {
        coachID: selectedCoachID,
        isPublished: true,
        isActive: true
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        <div className="glass-card rounded-4xl p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-center h-40">
            <div className="text-foreground/60">Loading courses...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCoachID) {
    return (
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        <div className="glass-card rounded-4xl p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-center h-40">
            <div className="text-foreground/60">Please select a community to view courses</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <WelcomeHero />
      <CoursesGrid courses={courses} />
    </div>
  );
};

export default ClassroomPage;
