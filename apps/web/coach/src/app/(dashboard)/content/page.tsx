'use client'

import {appConfig} from "@nlc-ai/web-shared";
import {ContentManagementLanding} from "@/app/(dashboard)/content/landing";
import {useRouter} from "next/navigation";

const ContentManagementPage = () => {
  const router = useRouter();

  if (appConfig.features.enableLanding) {
    return <ContentManagementLanding />;
  }

  return router.push('/content/categories');
};

export default ContentManagementPage;
