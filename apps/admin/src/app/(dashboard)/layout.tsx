import { ReactNode } from 'react';
import { SidebarProvider } from '@nlc-ai/ui';
import { DashboardSidebar } from './components/dashboard-sidebar';
import { DashboardHeader } from './components/dashboard-header';

export default function DashboardLayout({ children }: { children: ReactNode; }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-[#000000] flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
