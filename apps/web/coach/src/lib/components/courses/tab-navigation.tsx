import React from 'react';

const tabs = ['Curriculum', 'Settings', 'Pricing', 'Drip schedule'];

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-4 md:gap-8 mb-6 md:mb-8 border-b border-white/10 overflow-x-auto pb-4">
      <div className="flex items-center gap-4 md:gap-8 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`pb-4 transition-colors relative whitespace-nowrap ${
              activeTab === tab
                ? 'text-purple-400'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span className="font-medium text-sm md:text-base">{tab}</span>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
