'use client';

import { SidebarTrigger } from '@nlc-ai/ui';

export function DashboardHeader() {
  return (
    <header className="bg-[#0A0A0A] border-b border-[#1A1A1A] px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between relative z-20">
      <div className="flex items-center gap-4">
        <SidebarTrigger />

        <div className="hidden sm:block">
          <h1 className="text-white text-xl sm:text-2xl font-semibold">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-white text-sm font-medium">Andrew Kramer</p>
          <p className="text-[#A0A0A0] text-xs">
            kramer.andrew@example.com
          </p>
        </div>
        <div className="w-8 h-8 bg-[#7B21BA] rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">AK</span>
        </div>
      </div>
    </header>
  );
}
