'use client'

import React from 'react';
import {appConfig} from "@nlc-ai/web-shared";
import {HomeLandingPage} from "@/app/(dashboard)/home/landing";
import {CoachDetailsPage} from "@/app/(dashboard)/home/details";

const CoachHome = () => {
  if (appConfig.features.enableLanding) {
    return <HomeLandingPage/>;
  }
  return <CoachDetailsPage/>;
}

export default CoachHome;
