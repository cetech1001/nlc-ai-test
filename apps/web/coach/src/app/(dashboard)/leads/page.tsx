'use client'

import {appConfig} from "@nlc-ai/web-shared";

import {LeadsLanding} from "@/app/(dashboard)/leads/landing";
import {CoachLeads} from "@/app/(dashboard)/leads/details";

const LeadsPage = () => {
  if (appConfig.features.enableLanding) {
    return <LeadsLanding/>;
  }

  return <CoachLeads/>
}

export default LeadsPage;
