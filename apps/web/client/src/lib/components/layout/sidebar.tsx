import React from "react";
import {NavItem} from "@/lib";

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-[90px] px-4 sm:px-6 py-2.5 border-b border-sidebar-border flex items-center justify-between">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/c026fa572507ca79ba7cc19a31442c64c9741e13?width=300"
          alt="CoachAI Logo"
          className="h-8 sm:h-[45px] w-auto max-w-[120px] sm:max-w-[150px]"
        />

        <button
          onClick={onClose}
          className="lg:hidden p-2 text-white hover:text-purple-primary transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-3 sm:px-5 py-4 sm:py-6 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/bc244556a5bd5e0bd6244244993420a9fedcb56d?width=80"
            alt="Course thumbnail"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight sm:leading-8 truncate">Ultimate Branding Course</h2>
          </div>
          <svg className="w-5 h-5 sm:w-6 sm:h-6 opacity-40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 9l5 5 5-5" />
          </svg>
        </div>
      </div>

      <nav className="flex-1 px-2 sm:px-3 overflow-y-auto min-h-0">
        <div className="space-y-1 pb-4">
          <NavItem icon="community" label="Community" href="/community" />
          <NavItem icon="classroom" label="Classroom" href="/classroom" />
          <NavItem icon="calendar" label="Calendar" href="/calendar" />
          <NavItem icon="members" label="Members" href="/members" />
          <NavItem icon="leaderboard" label="Leaderboard" href="/" active />
          <NavItem icon="about" label="About" href="/about" />
        </div>
      </nav>

      <div className="p-2 sm:p-3 border-t border-sidebar-border flex-shrink-0">
        <button className="flex items-center gap-3 sm:gap-4 w-full px-2 sm:px-3 py-2 sm:py-3 rounded-lg hover:bg-sidebar-accent transition-colors">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sidebar-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-xs sm:text-sm font-semibold text-sidebar-foreground">Logout</span>
        </button>
      </div>
    </div>
  );
}
