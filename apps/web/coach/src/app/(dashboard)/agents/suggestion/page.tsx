'use client'

import React from 'react';
import {
  CategoryList,
  TopPerformingContentSuggestion,
  ContentIdeaCard,
  GradientButton
} from '@/lib';
import { PageHeader } from "@nlc-ai/web-shared";

// Type definitions
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

interface ContentIdeaData {
  id: string;
  title: string;
  category: string;
  platform: string;
  predictedEngagement: string;
}

interface CategoryData {
  name: string;
  views: number;
  percentage: number;
}

const ContentSuggestion: React.FC = () => {
  // Sample data
  const contentCards: ContentCardData[] = [
    {
      id: '1',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/2243659c97ad2ff34e81a10b4e97c210303b7063',
      platform: 'instagram',
      duration: '01:20',
      time: '08:57 PM',
      date: '14 APR',
      impressions: 11121,
      engagement: 7180
    },
    {
      id: '2',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/d5d81c69f3ce25c2b751c1f700146fb93ccbee95',
      platform: 'facebook',
      duration: '01:20',
      time: '08:57 PM',
      date: '14 APR',
      impressions: 11121,
      engagement: 7180
    },
    {
      id: '3',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/92549a03151793d3c4fc834ded69306d5bf431b5',
      platform: 'tiktok',
      duration: '01:20',
      time: '08:57 PM',
      date: '14 APR',
      impressions: 11121,
      engagement: 7180
    },
    {
      id: '4',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/666029de4905c2850ecdd930f83aca94a8a7366c',
      platform: 'instagram',
      duration: '01:20',
      time: '08:57 PM',
      date: '14 APR',
      impressions: 11121,
      engagement: 7180
    }
  ];

  const contentIdeas: ContentIdeaData[] = [
    {
      id: '1',
      title: 'The Unspoken Truth About Fitness Myths',
      category: 'Controversial',
      platform: 'Instagram, TikTok',
      predictedEngagement: '3000-5000'
    },
    {
      id: '2',
      title: 'The Ultimate Guide to Building Muscle',
      category: 'Educational',
      platform: 'Instagram, TikTok',
      predictedEngagement: '3000-5000'
    },
    {
      id: '3',
      title: 'Fitness Challenge: 30 Days to Get Fit',
      category: 'Challenge',
      platform: 'Instagram, TikTok',
      predictedEngagement: '3000-5000'
    },
    {
      id: '4',
      title: 'Q&A with Followers',
      category: 'Interactive',
      platform: 'Instagram, TikTok',
      predictedEngagement: '3000-5000'
    },
    {
      id: '5',
      title: 'Behind the Scenes: My Daily Routine',
      category: 'Lifestyle',
      platform: 'Instagram, TikTok',
      predictedEngagement: '3000-5000'
    },
    {
      id: '6',
      title: 'Common Workout Mistakes to Avoid',
      category: 'Educational',
      platform: 'Instagram, TikTok',
      predictedEngagement: '3000-5000'
    }
  ];

  const categoryData: CategoryData[] = [
    { name: 'Controversial', views: 11121, percentage: 82 },
    { name: 'Informative', views: 3150, percentage: 33 },
    { name: 'Conversational', views: 8352, percentage: 76 },
    { name: 'Entertainment', views: 5280, percentage: 55 },
    { name: 'Case Studies', views: 4375, percentage: 41 }
  ];

  const handleGenerateNewIdea = () => {
    // Handle generate new idea logic
    console.log('Generate new idea clicked');
  };

  // @ts-ignore
  return (
    <div className="flex flex-col gap-6 w-full mx-auto py-4">
      <PageHeader title={'Content Suggestion Agent'}/>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Content Categories */}
          <CategoryList
            categories={categoryData}
            className="w-full xl:w-auto xl:flex-shrink-0"
          />

          {/* Top Performing Content */}
          <TopPerformingContentSuggestion
            contentCards={contentCards}
            className="w-full"
          />
        </div>
      </div>

      {/* Content Ideas Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[#F9F9F9] font-inter text-xl sm:text-2xl font-medium leading-[25.6px]">
              Content Ideas
            </h2>
            <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
              Here you will see ideas for future videos based on the analytics of your top performing content.
            </p>
          </div>

          <GradientButton
            onClick={handleGenerateNewIdea}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Generate New Idea
          </GradientButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5">
          {contentIdeas.map((idea) => (
            <ContentIdeaCard
              key={idea.id}
              idea={idea}
              className="w-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentSuggestion;
