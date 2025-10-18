'use client'

import React, {useEffect, useState} from 'react';
import {WelcomeHero, CoursesGrid, sdkClient} from "@/lib";
import {ExtendedCourse} from "@nlc-ai/types";
import {useAuth} from "@nlc-ai/web-auth";

const ClassroomPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    const response = await sdkClient.courses.getCourses({}, {
      coachID: user?.clientCoaches![0].coachID,
    });
    setCourses(response.data);
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <WelcomeHero />
      <CoursesGrid courses={courses} />
    </div>
  );
};

export default ClassroomPage;
