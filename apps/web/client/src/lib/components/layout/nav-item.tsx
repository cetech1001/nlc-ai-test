import React from "react";

export const NavItem = ({ icon, label, href, active = false }: { icon: string; label: string; href?: string; active?: boolean }) => {
  const iconComponent = {
    community: (
      <img
        src="/images/icons/community.svg"
        alt="Bell Icon"
        className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg"
      />
    ),
    classroom: (
      <img
        src="/images/icons/classroom.svg"
        alt="Bell Icon"
        className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg"
      />
    ),
    calendar: (
      <img
        src="/images/icons/calendar.svg"
        alt="Bell Icon"
        className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg"
      />
    ),
    members: (
      <img
        src="/images/icons/members.svg"
        alt="Bell Icon"
        className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg"
      />
    ),
    leaderboard: (
      <img
        src="/images/icons/leaderboard.svg"
        alt="Bell Icon"
        className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg"
      />
    ),
    about: (
      <img
        src="/images/icons/about.svg"
        alt="Bell Icon"
        className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg"
      />
    )
  };

  const Component = href ? 'a' : 'button';

  return (
    <Component
      {...(href ? { href } : {})}
      className={`flex items-center gap-3 sm:gap-4 w-full px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition-colors ${
        active
          ? 'bg-sidebar-accent text-white'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
      }`}
    >
      {iconComponent[icon as keyof typeof iconComponent]}
      <span className="text-xs sm:text-sm font-semibold truncate">{label}</span>
    </Component>
  );
}
