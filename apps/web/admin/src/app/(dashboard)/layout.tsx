'use client'

import {ReactNode, useEffect} from 'react';
import { DashboardSidebarWrapper, DashboardHeader } from '@nlc-ai/web-shared';
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@nlc-ai/web-auth";
import {menuItems, pageConfig, sdkClient} from "@/lib";
import {UserType} from "@nlc-ai/types";


interface DashboardLayoutProps {
  children: ReactNode;
}

const defaultConfig = {
  title: 'Admin Dashboard',
  subtitle: 'Manage your coaching business efficiently.',
  breadcrumb: 'Dashboard'
};

const AdminDashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth(UserType.admin);
  const pathname = usePathname();
  const { SidebarComponent, MobileMenuButton } = DashboardSidebarWrapper();

  let path = pathname.split('/').filter(Boolean).shift();
  const currentConfig = pageConfig[path as keyof typeof pageConfig] || defaultConfig;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return null;
  }

  const navigateTo = (path: string) => {
    router.push(path);
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      <SidebarComponent
        dashboardHeader={'ADMIN PANEL'}
        pathname={pathname}
        navigateTo={navigateTo}
        menuItems={menuItems}
        logout={handleLogout} />

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[#1A1A1A] bg-[#0A0A0A] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <MobileMenuButton />

          <div className="h-6 w-px bg-[#1A1A1A] lg:hidden" aria-hidden="true" />

          <DashboardHeader
            sdkClient={sdkClient}
            goToNotifications={() => router.push('/notifications')}
            key={`${user?.firstName}-${user?.lastName}`}
            user={user}
            isLoading={isLoading}
            title={currentConfig.title}
            handleNavRouter={router.push}
            onLogout={handleLogout}
          />
        </div>

        <main className="py-6 md:py-0">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
