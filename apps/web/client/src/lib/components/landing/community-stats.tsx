import React from "react";

export const CommunityStats = ({ stats }: any) => {
  return (
    <div className="flex items-center gap-4 sm:gap-6 justify-center sm:justify-start">
      <div className="text-center">
        <div className="text-lg sm:text-xl font-semibold text-dark-900">{stats.members}</div>
        <div className="text-xs sm:text-sm text-dark-900/70">Members</div>
      </div>
      <div className="text-center">
        <div className="text-lg sm:text-xl font-semibold text-dark-900">{stats.online}</div>
        <div className="text-xs sm:text-sm text-dark-900/70">Online</div>
      </div>
      <div className="text-center">
        <div className="text-lg sm:text-xl font-semibold text-dark-900">{stats.admins}</div>
        <div className="text-xs sm:text-sm text-dark-900/70">Admins</div>
      </div>
    </div>
  );
};
