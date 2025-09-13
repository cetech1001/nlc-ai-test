import React from "react";
import {CommunityStats} from "@/lib";

export const AboutHeroSection = ({ community, onJoinClick }: any) => {
  return (
    <div className="relative overflow-hidden">
      {/* Glow Effect */}
      <div className="glow-circle absolute left-[30px] -bottom-[88px]" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative rounded-[30px] border border-dark-600 card-gradient p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-8 lg:gap-32">
            <div className="flex-1 space-y-4 sm:space-y-5 w-full lg:w-auto">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="space-y-1">
                    <h1 className="text-lg sm:text-xl font-semibold text-dark-900">
                      {community.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-dark-900/70 break-all">
                      {community.url}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-dark-900 leading-relaxed">
                    {community.description}
                  </p>
                </div>
              </div>

              <CommunityStats stats={community.stats} />

              <button
                className="bg-gradient-to-r from-[#FEBEFA] via-[#B339D4] via-[#7B21BA] to-[#7B26F0] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto"
                onClick={onJoinClick}
              >
                Join ${community.pricing}/month
              </button>
            </div>

            <img
              src={community.heroImage}
              alt={community.name}
              className="w-full lg:w-[427px] h-[200px] sm:h-[266px] rounded-2xl border border-white/15 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
