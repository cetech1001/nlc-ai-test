'use client'

import React from 'react';
import {GlassCard} from "@/lib/components/suggestion/glass-card";

interface ContentIdeaData {
  id: string;
  title: string;
  category: string;
  platform: string;
  predictedEngagement: string;
}

interface ContentIdeaCardProps {
  idea: ContentIdeaData;
  className?: string;
}

export const ContentIdeaCard: React.FC<ContentIdeaCardProps> = ({ idea, className = '' }) => {
  return (
    <GlassCard
      className={`w-full max-w-[570px] ${className}`}
      glowOrbs={[
        {
          size: 267,
          position: 'bottom-left',
          color: 'pink'
        }
      ]}
    >
      <div className="flex flex-col gap-5">
        <h3 className="text-[#F9F9F9] font-inter text-lg sm:text-xl font-semibold leading-[25.6px]">
          {idea.title}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-[6px]">
            <span className="text-[#C5C5C5] font-inter text-sm sm:text-xs font-normal leading-[25.6px]">
              Category
            </span>
            <span className="text-[#F9F9F9] font-inter text-sm font-medium">
              {idea.category}
            </span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[#C5C5C5] font-inter text-sm sm:text-xs font-normal leading-[25.6px]">
              Best Platform
            </span>
            <span className="text-[#F9F9F9] font-inter text-sm font-medium">
              {idea.platform}
            </span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[#C5C5C5] font-inter text-sm sm:text-xs font-normal leading-[25.6px]">
              Predicted Engagement
            </span>
            <span className="text-[#F9F9F9] font-inter text-sm font-medium">
              {idea.predictedEngagement}
            </span>
          </div>
        </div>

        <button className="text-[#DF69FF] font-inter text-sm font-bold self-start">
          View Details
        </button>
      </div>
    </GlassCard>
  );
};
