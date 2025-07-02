'use client'

import {ReactNode, useEffect} from 'react';
import { DashboardSidebarWrapper } from './components/dashboard-sidebar';
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@/lib/hooks/use-auth";

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
  '/leads-follow-up': {
    title: 'Leads Follow Up',
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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const { SidebarComponent, MobileMenuButton } = DashboardSidebarWrapper();

  const currentConfig = pageConfig[pathname as keyof typeof pageConfig] || defaultConfig;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
                <div className="text-right hidden sm:block">
                  <p className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[#A0A0A0] text-xs">
                    {user?.email}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName[0]}{user?.lastName[0]}
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
