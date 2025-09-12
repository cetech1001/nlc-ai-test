import React, {FC, ReactNode} from "react";
import {PageHeader, Sidebar} from "@/lib";

interface IProps {
  children: ReactNode;
}

const DashboardLayout: FC<IProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="w-[287px] border-r border-sidebar-border bg-sidebar flex flex-col">
          <Sidebar />
        </aside>

        <main className="flex-1">
          <header className="h-[90px] border-b border-sidebar-border px-[30px] py-5">
            <PageHeader />
          </header>

          <div className="p-[20px] pl-[39px] pt-[26px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
