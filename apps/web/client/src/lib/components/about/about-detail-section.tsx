import React from "react";
import {AboutContent, CommunityFeatures, CommunityImageGrid} from "@/lib";

export const AboutDetailSection = ({ community }: any) => {
  return (
    <div className="relative overflow-hidden">
      <div className="glow-circle absolute right-[178px] top-[133px]" />
      <div className="glow-circle absolute -left-[71px] -bottom-[41px]" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative rounded-[30px] border border-dark-600 p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-dark-900">
              {community.name}
            </h2>

            <CommunityImageGrid
              mainImage={community.mainImage}
              previewImage={community.previewImage}
            />

            <CommunityFeatures features={community.features} />

            <div className="h-px bg-white/10" />

            <AboutContent description={community.detailedDescription} />
          </div>
        </div>
      </div>
    </div>
  );
};
