'use client'

import React from 'react';
import {GlassCard} from "@/lib/components/suggestion/glass-card";
import {useRouter} from "next/navigation";

/*interface ContentIdeaData {
  id: string;
  title: string;
  category: string;
  platform: string;
  predictedEngagement: string;
}*/

interface ContentIdeaCardProps {
  idea: ContentSuggestion;
  className?: string;
}

interface ContentSuggestion {
  id: string;
  title: string;
  originalIdea: string;
  script: {
    hook: string;
    mainContent: string;
    callToAction: string;
  };
  contentCategory: string;
  recommendedPlatforms: string[];
  bestPostingTimes: string[];
  estimatedEngagement: {
    min: number;
    max: number;
  };
  confidence: number;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const ContentIdeaCard: React.FC<ContentIdeaCardProps> = ({ idea, className = '' }) => {
  const router = useRouter();

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
              {idea.contentCategory}
            </span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[#C5C5C5] font-inter text-sm sm:text-xs font-normal leading-[25.6px]">
              Best Platform
            </span>
            <span className="text-[#F9F9F9] font-inter text-sm font-medium">
              {idea.recommendedPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-200 capitalize"
                >
                {platform}
              </span>
              ))}
            </span>
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[#C5C5C5] font-inter text-sm sm:text-xs font-normal leading-[25.6px]">
              Predicted Engagement
            </span>
            <span className="text-[#F9F9F9] font-inter text-sm font-medium">
              {idea.estimatedEngagement.min.toLocaleString()} - {idea.estimatedEngagement.max.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/agents/suggestion/${idea.id}`)}
          className="text-[#DF69FF] font-inter text-sm font-bold self-start">
          View Details
        </button>
      </div>
    </GlassCard>
  );
};
