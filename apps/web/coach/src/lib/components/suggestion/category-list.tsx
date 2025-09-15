'use client'

import React from 'react';
import {GlassCard} from "@/lib/components/suggestion/glass-card";
import {ProgressBar} from "@/lib/components/suggestion/progress-bar";

interface CategoryData {
  name: string;
  views: number;
  percentage: number;
}

interface CategoryListProps {
  categories: CategoryData[];
  className?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, className = '' }) => {
  return (
    <GlassCard className={`w-full lg:w-[688px] h-auto ${className}`}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-[6px]">
          <h3 className="text-[#F9F9F9] font-inter text-xl sm:text-2xl font-semibold leading-[25.6px]">
            Content Categories
          </h3>
          <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            The data is based on the number of view each category gets
          </p>
        </div>

        <div className="flex flex-col gap-[20px]">
          {categories.map((category, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[#F9F9F9] font-inter text-sm font-semibold">
                  {category.name}
                </span>
                <span className="text-[#C5C5C5] font-inter text-sm font-normal">
                  {category.views.toLocaleString()} views
                </span>
              </div>
              <ProgressBar
                percentage={category.percentage}
                uniqueID={`category-${index}`}
              />
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};
