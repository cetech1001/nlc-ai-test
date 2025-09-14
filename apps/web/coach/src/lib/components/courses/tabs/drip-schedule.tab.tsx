import { cn } from "@nlc-ai/web-ui";
import React, { useState } from 'react';

interface LessonProps {
  title: string;
  defaultDays?: number;
}

const Lesson: React.FC<LessonProps> = ({ title, defaultDays = 0 }) => {
  const [days, setDays] = useState(defaultDays);

  return (
    <div className="flex flex-col items-start gap-3 self-stretch">
      <div className="flex justify-between items-center self-stretch">
        <span className="flex-1 text-white font-inter text-lg font-normal truncate">
          {title}
        </span>
        <div className="flex w-[308px] h-[50px] px-5 items-center border border-white/30 rounded-[10px]">
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            placeholder="Open after (days)"
            className="flex-1 bg-transparent text-white font-inter text-base font-normal placeholder:text-white/50 outline-none"
          />
        </div>
      </div>
      <div className="h-px self-stretch bg-[#2B2A2A]"></div>
    </div>
  );
};

interface CourseModuleProps {
  title: string;
  lessonCount: number;
  lessons?: string[];
  isExpanded?: boolean;
  onToggle: () => void;
}

const CourseModule: React.FC<CourseModuleProps> = ({
                                                     title,
                                                     lessonCount,
                                                     lessons = [],
                                                     isExpanded = false,
                                                     onToggle
                                                   }) => {
  return (
    <div className="flex p-6 flex-col justify-center items-start gap-5 self-stretch rounded-[20px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-6">
          <div className="flex items-start gap-1">
            <span className="text-white font-inter text-xl font-medium leading-[25.6px]">
              {title}
            </span>
            <span className="text-white font-inter text-sm font-normal leading-[25.6px] opacity-60">
              ({lessonCount})
            </span>
          </div>
        </div>
        <svg
          className={cn(
            "w-6 h-6 transition-transform",
            isExpanded ? "rotate-180" : "rotate-90"
          )}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19.5 8.25L12 15.75L4.5 8.25" stroke="#A0A0A0" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {isExpanded && lessons.length > 0 && (
        <div className="flex flex-col items-start gap-3 self-stretch">
          {lessons.map((lesson, index) => (
            <Lesson key={index} title={lesson} defaultDays={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export const DripScheduleTab: React.FC<{ courseID: string; }> = () => {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  // const [activeTab, setActiveTab] = useState<'curriculum' | 'settings' | 'pricing' | 'drip'>('drip');

  const toggleModule = (index: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedModules(newExpanded);
  };

  const courseModules = [
    {
      title: "Introduction To Monetizing on Instagram",
      lessonCount: 3,
      lessons: [
        "Priming Your IG Profile",
        "How to Grow Your Instagram Followin.",
        "What NOT to Post on Instagram"
      ]
    },
    {
      title: "Tik Tok / Reels Training",
      lessonCount: 12,
      lessons: []
    }
  ];

  return (
    <div className="flex h-auto p-8 flex-col items-start flex-shrink-0 rounded-[30px] border border-[#2B2A2A]">
      <div className="flex w-full flex-col items-start gap-8">
        {/* Header */}
        <div className="flex flex-col items-start gap-3 self-stretch">
          <div className="flex w-full flex-col items-start gap-1">
            <div className="flex h-7 flex-col justify-center self-stretch">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px]">
                Publish content on your schedule
              </h3>
            </div>
          </div>
          <p className="self-stretch text-[#838383] font-inter text-base font-normal">
            Drip schedules will release lessons over a set period of time that you can customize. You can drip content starting on a specific date, or set students up on their own personal schedule.
          </p>
        </div>

        {/* Course Modules */}
        <div className="flex flex-col items-start gap-5 self-stretch">
          {courseModules.map((module, index) => (
            <CourseModule
              key={index}
              title={module.title}
              lessonCount={module.lessonCount}
              lessons={module.lessons}
              isExpanded={expandedModules.has(index)}
              onToggle={() => toggleModule(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
