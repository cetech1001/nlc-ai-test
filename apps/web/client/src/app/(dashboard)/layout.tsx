'use client'

import React, {FC, ReactNode} from "react";
import {PageHeader, Sidebar} from "@/lib";

interface IProps {
  children: ReactNode;
}

const DashboardLayout: FC<IProps> = ({ children }) => {
  const [sideBarOpen, setSideBarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSideBarOpen(!sideBarOpen);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-[287px] border-r border-sidebar-border bg-sidebar flex-col">
          <Sidebar />
        </aside>

        {sideBarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
            <aside className="w-[287px] h-full border-r border-sidebar-border bg-sidebar flex flex-col">
              <Sidebar/>
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0">
          <header className="h-[90px] border-b border-sidebar-border px-4 sm:px-6 lg:px-[30px] py-5">
            <PageHeader toggleSidebar={toggleSidebar} />
          </header>

          <div className="p-4 sm:p-5 lg:p-[20px] lg:pl-[39px] lg:pt-[26px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
