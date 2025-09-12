export const MembersTabNav = ({ activeTab, onTabChange, stats }: any) => {
  const tabs = [
    { key: 'members', label: `Members (${stats.members})`, color: 'text-purple' },
    { key: 'admins', label: `Admins (${stats.admins})`, color: 'text-dark-700' },
    { key: 'online', label: `Online (${stats.online})`, color: 'text-dark-700' }
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full sm:w-auto overflow-x-auto">
        {tabs.map((tab, index) => (
          <div key={tab.key} className="flex items-center gap-4 sm:gap-8 whitespace-nowrap">
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
      <button className="bg-purple text-dark px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base w-full sm:w-auto">
        Invite
      </button>
    </div>
  );
};
