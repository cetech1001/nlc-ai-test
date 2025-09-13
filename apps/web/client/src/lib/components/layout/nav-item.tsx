import React, {FC} from "react";
import {CogIcon} from "@heroicons/react/24/outline";


interface IProps {
  icon: string;
  label: string;
  href?: string;
  active?: boolean;
  hasSubmenu?: boolean;
  isSettings?: boolean;
}

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.875 3.75L13.125 10L6.875 16.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 6L8 11L3 6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const NavItem: FC<IProps> = ({
  icon,
  label,
  href,
  active = false,
  hasSubmenu,
  isSettings
}) => {
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
    ),
    settings: (<CogIcon className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg"/>)
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
      {hasSubmenu && (
        <ChevronRightIcon className="w-5 h-5 stroke-[#A0A0A0] ml-auto" />
      )}
      {isSettings && (
        <ChevronDownIcon className="w-4 h-4 stroke-white ml-auto rotate-90" />
      )}
    </Component>
  );
}
