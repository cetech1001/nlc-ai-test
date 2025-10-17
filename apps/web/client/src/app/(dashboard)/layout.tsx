'use client'

import React, {FC, ReactNode, useEffect, useState} from "react";
import {PageHeader, Sidebar} from "@/lib";
import {/*usePathname,*/ useRouter} from "next/navigation";
import {useAuth} from "@nlc-ai/web-auth";
import {UserType} from "@nlc-ai/types";

interface IProps {
  children: ReactNode;
}

const DashboardLayout: FC<IProps> = ({ children }) => {
  const router = useRouter();

  const { /*user,*/ isLoading, isAuthenticated, /*logout*/ } = useAuth(UserType.CLIENT);

  // const pathname = usePathname();
  // let path = pathname.split('/').filter(Boolean).shift();
  // const currentConfig = pageConfig[path as keyof typeof pageConfig] || defaultConfig;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return null;
  }

  /*const navigateTo = (path: string) => {
    router.push(path);
  }

  const goToNotifications = () => {
    router.push('/notifications');
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  }*/

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-[287px] border-r border-sidebar-border bg-sidebar fixed left-0 top-0 h-full z-30">
          <Sidebar />
        </aside>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <aside
              className="w-[287px] h-full border-r border-sidebar-border bg-sidebar flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 lg:ml-[287px] flex flex-col min-h-screen">
          <header className="h-[90px] border-b border-sidebar-border px-4 sm:px-6 lg:px-[30px] py-5 bg-background sticky top-0 z-20">
            <PageHeader onMenuClick={() => setSidebarOpen(true)} />
          </header>

          <div className="flex-1 p-4 sm:p-5 lg:p-[20px] lg:pl-[39px] lg:pt-[26px] overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
