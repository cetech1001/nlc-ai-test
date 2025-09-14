import React from 'react';

const tabs = ['Curriculum', 'Settings', 'Pricing', 'Drip schedule'];

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-8 mb-8 border-b border-white/10">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`pb-4 transition-colors relative ${
            activeTab === tab
              ? 'text-purple-400'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <span className="font-medium">{tab}</span>
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"></div>
          )}
        </button>
      ))}
    </div>
  );
};
