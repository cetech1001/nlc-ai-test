'use client'

import {appConfig} from "@nlc-ai/web-shared";
import {CommunityLanding} from "@/app/(dashboard)/community/landing";

const CommunityPage = () => {
  if (appConfig.features.enableLanding) {
    return <CommunityLanding/>;
  }
  return <div/>;
}

export default CommunityPage;
