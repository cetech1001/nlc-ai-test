import React from "react";
import {CommunityDescription, CommunityFeatures} from "@/lib";

export const CommunityDetails = ({ community }: any) => {
  return (
    <div className="relative overflow-hidden">
      {/* Glow Effects */}
      <div className="glow-circle absolute right-[178px] top-[133px]" />
      <div className="glow-circle absolute -left-[71px] -bottom-[41px]" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative rounded-[30px] border border-dark-600 p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-dark-900">
                {community.name}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <img
                    src={community.mainImage}
                    alt="Airbnb Arbitrage Course"
                    className="w-full h-auto rounded-2xl border border-white/15 object-cover"
                  />
                </div>
                <div>
                  <img
                    src={community.previewImage}
                    alt="Course Preview"
                    className="w-full h-[120px] sm:h-[167px] rounded-2xl border border-white/15 object-cover"
                  />
                </div>
              </div>

              <CommunityFeatures features={community.features} />
            </div>

            <div className="h-px bg-white/10" />

            <CommunityDescription description={community.detailedDescription} />
          </div>
        </div>
      </div>
    </div>
  );
};
