'use client'

import {appConfig} from "@nlc-ai/web-shared";
import CalendarDetailsPage from "@/app/(dashboard)/calendar/details";
import {CalendarLanding} from "@/app/(dashboard)/calendar/landing";

const CalendarPage = () => {
  if (appConfig.features.enableLanding) {
    return <CalendarLanding />;
  }

  return <CalendarDetailsPage/>;
};

export default CalendarPage;
