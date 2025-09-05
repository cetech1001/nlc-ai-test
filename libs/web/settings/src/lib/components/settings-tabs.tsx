import {FC, Fragment} from 'react';
import { SettingsTabProps } from '../types/settings.types';

export const SettingsTabs: FC<SettingsTabProps> = ({
 activeTab,
 setActiveTab,
 userType,
}) => {
  const tabs = [
    { id: 'profile', label: 'Edit Profile' },
    { id: 'integrations', label: userType === 'admin' ? 'System Integrations' : 'Apps & Socials' },
    // ...(userType === 'coach' ? [{ id: 'courses', label: 'Course Integrations' }] : []),
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-8 sm:mb-16">
      {tabs.map((tab, index) => (
        <Fragment key={tab.id}>
          <button
            onClick={() => setActiveTab(tab.id)}
            className={`text-lg sm:text-xl font-medium font-['Inter'] leading-relaxed transition-colors ${
              activeTab === tab.id
                ? "text-fuchsia-400"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {tab.label}
          </button>
          {index < tabs.length - 1 && (
            <div className="hidden sm:block w-7 h-0 rotate-90 border-t border-neutral-700" />
          )}
        </Fragment>
      ))}
    </div>
  );
};
