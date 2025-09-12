import {Settings} from "lucide-react";

export const DiscussionTabNav = ({ activeTab, onTabChange }: any) => {
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'general', label: 'General Discussion' }
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
        {tabs.map((tab, index) => (
          <div key={tab.key} className="flex items-center gap-4 sm:gap-8">
            <span
              className={`text-lg sm:text-2xl font-medium cursor-pointer transition-colors ${
                activeTab === tab.key ? 'text-purple' : 'text-dark-700 hover:text-purple'
              }`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </span>
            {index < tabs.length - 1 && (
              <div className="hidden sm:block w-0.5 h-8 bg-dark-500 rotate-90" />
            )}
          </div>
        ))}
      </div>
      <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 cursor-pointer hover:text-purple transition-colors" />
    </div>
  );
};
