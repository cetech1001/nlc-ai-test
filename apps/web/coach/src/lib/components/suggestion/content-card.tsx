'use client'

import React from 'react';
import {GlassCard} from './glass-card';
import { PlatformIcon } from "@nlc-ai/web-shared";

interface ContentCardData {
  id: string;
  image: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  duration: string;
  time: string;
  date: string;
  impressions: number;
  engagement: number;
}

interface ContentCardProps {
  content: ContentCardData;
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content, className = '' }) => {
  return (
    <GlassCard
      className={`min-w-[200px] w-full max-w-[230px] h-auto ${className}`}
      padding="p-0"
    >
      <img
        src={content.image}
        alt="Content"
        className="w-full h-[120px] sm:h-[140px] object-cover rounded-t-[20px]"
      />

      <div className="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
        <div className="flex justify-between items-center">
          <PlatformIcon platform={content.platform} />
          <div className="flex items-center gap-[6px] text-xs text-[#F9F9F9]">
            <span>{content.duration}</span>
            <div className="w-[0.5px] h-4 bg-white opacity-50"></div>
            <span className="hidden sm:inline">{content.time}</span>
            <div className="w-[0.5px] h-4 bg-white opacity-50 hidden sm:block"></div>
            <span>{content.date}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#F9F9F9] font-inter text-sm font-semibold">
            Impressions
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm">
            {content.impressions.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#F9F9F9] font-inter text-sm font-semibold">
            Engagement
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm">
            {content.engagement.toLocaleString()}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
