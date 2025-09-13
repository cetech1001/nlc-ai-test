import React from "react";

export const CommunityFeatures = ({ features }: any) => {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white">
      {features.map((feature: any, index: number) => (
        <div key={index} className="flex items-center gap-2 sm:gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.iconPath} />
          </svg>
          <span className="text-base sm:text-lg font-semibold">{feature.text}</span>
        </div>
      ))}
    </div>
  );
};
