'use client'

import {ReactNode, useEffect, useState} from 'react';
import { DashboardSidebarWrapper, DashboardHeader } from '@nlc-ai/web-shared';
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@nlc-ai/web-auth";
import {menuItems, pageConfig, sdkClient, settingsItems} from "@/lib";
import {UserType} from "@nlc-ai/types";


interface DashboardLayoutProps {
  children: ReactNode;
}

interface Community {
  id: string;
  slug: string;
  avatarUrl: string | null;
  name: string;
  coachID: string | null;
}

const defaultConfig = {
  title: 'Coach Dashboard',
  subtitle: 'Manage your coaching business efficiently.',
  breadcrumb: 'Dashboard'
};

const ClientDashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth(UserType.CLIENT);
  const pathname = usePathname();
  const { SidebarComponent, MobileMenuButton } = DashboardSidebarWrapper();

  const [currentCommunityID, setCurrentCommunityID] = useState<string>('');
  const [communities, setCommunities] = useState<Community[]>([]);

  const currentCommunity = communities.find(c => c.id === currentCommunityID);

  let path = pathname.split('/').filter(Boolean).shift();
  const currentConfig = pageConfig[path as keyof typeof pageConfig] || defaultConfig;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    if (user) {
      const primaryCoach = user.clientCoaches![0];
      setCurrentCommunityID(primaryCoach.communities[0]?.id);

      const communities: Community[] = [];
      user.clientCoaches?.forEach(cc => {
        communities.push(...cc.communities);
      });

      setCommunities(communities);
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (!isAuthenticated) {
    return null;
  }

  const navigateTo = (path: string) => {
    router.push(path);
  }

  const goToNotifications = () => {
    router.push('/notifications');
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  const handleCommunityChange = (communityID: string) => {
    setCurrentCommunityID(communityID);
    // Add any additional logic here (e.g., API calls, state updates, navigation)
    console.log('Switched to community:', communityID);
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      <SidebarComponent
        dashboardHeader={"COACH PANEL"}
        pathname={pathname}
        navigateTo={navigateTo}
        menuItems={menuItems}
        settingsItems={settingsItems}
        logout={handleLogout}
        logoSize={'large'}
        showCommunitySelector={true}
        currentCommunity={currentCommunity}
        communities={communities}
        onCommunityChange={handleCommunityChange}
      />

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[#1A1A1A] bg-[#0A0A0A] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <MobileMenuButton />

          <div className="h-6 w-px bg-[#1A1A1A] lg:hidden" aria-hidden="true" />

          <DashboardHeader
            sdkClient={sdkClient}
            key={`${user?.firstName}-${user?.lastName}`}
            user={user}
            isLoading={isLoading}
            title={currentConfig.title}
            goToNotifications={goToNotifications}
            handleNavRouter={router.push}
            onLogout={handleLogout}
          />
        </div>

        <main className="main-content">
          <div className="m-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClientDashboardLayout;
