'use client'

import {ReactNode, useEffect, useMemo} from 'react';
import { DashboardSidebarWrapper } from './components/dashboard-sidebar';
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@/lib/hooks/use-auth";
import {Skeleton} from "@nlc-ai/ui";


interface DashboardLayoutProps {
  children: ReactNode;
}

const pageConfig = {
  '/home': {
    title: 'Dashboard Overview',
    subtitle: 'Welcome back! Here\'s what\'s happening with your coaching business.',
    breadcrumb: 'Dashboard'
  },
  '/coaches': {
    title: 'Coaches',
    subtitle: 'View and manage all your coaches in one place.',
    breadcrumb: 'Coaches'
  },
  '/make-payment': {
    title: 'Coaches',
    subtitle: 'View and manage all your coaches in one place.',
    breadcrumb: 'Coaches'
  },
  '/subscription-plans': {
    title: 'Subscription Plans',
    subtitle: 'Manage your coaching plans and pricing.',
    breadcrumb: 'Plans'
  },
  '/transactions': {
    title: 'Transactions',
    subtitle: 'Track all payments and financial activities.',
    breadcrumb: 'Transactions'
  },
  '/inactive-coaches': {
    title: 'Inactive Coaches',
    subtitle: 'Coaches who are currently inactive or need attention.',
    breadcrumb: 'Inactive'
  },
  '/calendar': {
    title: 'Calendar & Schedule',
    subtitle: 'Manage appointments and coaching sessions.',
    breadcrumb: 'Calendar'
  },
  '/leads': {
    title: 'Leads',
    subtitle: 'Get assistance and find answers to common questions.',
    breadcrumb: 'Help'
  },
  '/settings': {
    title: 'Account Settings',
    subtitle: 'Customize your account and application preferences.',
    breadcrumb: 'Settings'
  }
};

const defaultConfig = {
  title: 'Admin Dashboard',
  subtitle: 'Manage your coaching business efficiently.',
  breadcrumb: 'Dashboard'
};

const UserDisplaySection = ({ user, isLoading }: { user: any; isLoading: boolean }) => {
  const userFullName = useMemo(() => {
    if (!user?.firstName || !user?.lastName) return '';
    return `${user.firstName} ${user.lastName}`;
  }, [user?.firstName, user?.lastName]);

  if (isLoading) {
    return (
      <div className="hidden sm:block">
        <Skeleton className="h-2 w-28 mb-1.5" />
        <Skeleton className="h-2 w-36 mb-1.5" />
      </div>
    );
  }

  return (
    <div className="text-right hidden sm:block">
      <p className="text-white text-sm font-medium">{userFullName}</p>
      <p className="text-[#A0A0A0] text-xs">{user?.email}</p>
    </div>
  );
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const { SidebarComponent, MobileMenuButton } = DashboardSidebarWrapper();

  const currentConfig = pageConfig[pathname as keyof typeof pageConfig] || defaultConfig;

  const userInitials = useMemo(() => {
    if (!user?.firstName || !user?.lastName) return '';
    return `${user.firstName[0]}${user.lastName[0]}`;
  }, [user?.firstName, user?.lastName]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      <SidebarComponent />

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[#1A1A1A] bg-[#0A0A0A] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <MobileMenuButton />

          <div className="h-6 w-px bg-[#1A1A1A] lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h1 className="text-white text-xl sm:text-2xl font-semibold">{currentConfig.title}</h1>
            </div>

            <div className="flex flex-1 justify-end items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-3">
                <UserDisplaySection user={user} isLoading={isLoading} />
                <div
                  key={`${user?.firstName}-${user?.lastName}`} // Force re-render when name changes
                  className="w-8 h-8 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-sm font-medium">
                    {userInitials}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
