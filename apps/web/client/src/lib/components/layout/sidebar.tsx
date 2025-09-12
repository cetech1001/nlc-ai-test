import React from "react";
import {NavItem} from "@/lib";

export const Sidebar = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="h-[90px] px-6 py-2.5 border-b border-sidebar-border flex items-center">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/c026fa572507ca79ba7cc19a31442c64c9741e13?width=300"
          alt="CoachAI Logo"
          className="h-[45px] w-[150px]"
        />
      </div>

      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/bc244556a5bd5e0bd6244244993420a9fedcb56d?width=80"
            alt="Course thumbnail"
            className="w-10 h-10 rounded-lg"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground leading-8">Ultimate Branding Course</h2>
          </div>
          <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 9l5 5 5-5" />
          </svg>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <div className="space-y-1">
          <NavItem icon="chat" label="Community" href="/" />
          <NavItem icon="users" label="Classroom" href="/classroom" />
          <NavItem icon="calendar" label="Calendar" href="/calendar" />
          <NavItem icon="group" label="Members" href="/members" />
          <NavItem icon="trophy" label="Leaderboard" href="/" active />
          <NavItem icon="archive" label="About" href="/about" />
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button className="flex items-center gap-4 w-full px-3 py-3 rounded-lg hover:bg-sidebar-accent transition-colors">
          <svg className="w-5 h-5 text-sidebar-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-semibold text-sidebar-foreground">Logout</span>
        </button>
      </div>
    </div>
  );
}
