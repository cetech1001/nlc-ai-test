'use client'

import React, { useState } from 'react';

interface LessonItemProps {
  title: string;
  completed?: boolean;
  active?: boolean;
}

const LessonItem: React.FC<LessonItemProps> = ({ title, completed = false, active = false }) => {
  return (
    <div className={`flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 rounded-lg transition-colors ${
      active ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/20'
    }`}>
      <span className={`text-sm sm:text-base truncate flex-1 pr-2 ${
        active ? 'text-purple-primary font-medium' :
          completed ? 'text-muted-foreground' : 'text-muted-foreground'
      }`}>
        {title}
      </span>
      {completed && (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <path d="M9 12.75L11.25 15L15 9.75M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z" stroke="#09B90F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
};

interface LessonSection {
  id: string;
  title: string;
  lessons: Array<{
    title: string;
    completed?: boolean;
    active?: boolean;
  }>;
}

const lessonSections: LessonSection[] = [
  {
    id: 'instagram',
    title: 'Introduction To Monetizing on Instagram',
    lessons: [
      { title: 'Priming Your IG Profile', completed: true },
      { title: 'How to Grow Your Instagram Followin..', completed: true },
      { title: 'What NOT to Post on Instagram', completed: true }
    ]
  },
  {
    id: 'tiktok',
    title: 'Tik Tok / Reels Training',
    lessons: [
      { title: 'How to Make a Tik Tok', completed: true },
      { title: 'How to Create Viral TikTok/Reels', active: true },
      { title: 'How to Convert Videos into Paying Cli..', completed: true },
      { title: 'How to Make a Tik Tok' },
      { title: 'How to Convert Videos into Paying Cli..' },
      { title: 'How to Increase Your Watch Through', completed: true },
      { title: 'How to Convert Videos into Paying Cli..' },
      { title: 'How to Make a Tik Tok' },
      { title: 'How to Increase Your Watch Through', completed: true },
      { title: 'How to Create Viral TikTok/Reels', completed: true },
      { title: 'How to Convert Videos into Paying Cli..', completed: true },
      { title: 'How to Make a Tik Tok' },
      { title: 'How to Make a Tik Tok' },
      { title: 'How to Increase Your Watch Through' }
    ]
  }
];

export const LessonNavigation = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['instagram', 'tiktok']);

  const toggleSection = (sectionID: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionID)
        ? prev.filter(id => id !== sectionID)
        : [...prev, sectionID]
    );
  };

  return (
    <div className="w-full lg:w-[346px] space-y-4 sm:space-y-5">
      {lessonSections.map((section) => (
        <div key={section.id} className="space-y-2 sm:space-y-2.5">
          <button
            onClick={() => toggleSection(section.id)}
            className="flex items-center justify-between w-full p-3 sm:p-4 rounded-lg border border-border bg-glass-gradient text-white font-medium text-sm sm:text-base hover:bg-glass-gradient/80 transition-colors"
          >
            <span className="text-left truncate pr-2">{section.title}</span>
            <svg
              className={`w-5 h-5 sm:w-6 sm:h-6 opacity-40 transition-transform flex-shrink-0 ${
                expandedSections.includes(section.id) ? 'rotate-180' : ''
              }`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 8.5l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.includes(section.id) && (
            <div className="space-y-0 max-h-80 overflow-y-auto">
              {section.lessons.map((lesson, index) => (
                <LessonItem
                  key={index}
                  title={lesson.title}
                  completed={lesson.completed}
                  active={lesson.active}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
