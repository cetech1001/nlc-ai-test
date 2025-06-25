'use client';

import { SidebarTrigger, useIsMobile } from '@nlc-ai/ui';
import { Menu } from 'lucide-react';

export function DashboardHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="bg-[#0A0A0A] border-b border-[#1A1A1A] px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between relative z-20">
      <div className="flex items-center gap-4">
        {/* Sidebar trigger for both mobile and desktop */}
        <SidebarTrigger className="h-8 w-8 p-1 hover:bg-[#1A1A1A] transition-colors">
          <Menu className="h-5 w-5 text-[#A0A0A0]" />
        </SidebarTrigger>

        <div className="hidden sm:block">
          <h1 className="text-white text-xl sm:text-2xl font-semibold">Dashboard</h1>
        </div>
      </div>

      {/* User profile section */}
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
