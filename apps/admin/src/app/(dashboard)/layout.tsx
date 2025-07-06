'use client'

import {ReactNode, useEffect} from 'react';
import { DashboardSidebarWrapper, PageHeader } from '@nlc-ai/shared';
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@nlc-ai/auth";
import {
  CalendarIcon as HiCalendar,
  CurrencyDollarIcon as HiCurrencyDollar,
  HomeIcon as HiHome, MoonIcon as HiMoon,
  RectangleStackIcon as HiCollection, SpeakerWaveIcon as HiSpeakerphone,
  UsersIcon as HiUsers
} from "@heroicons/react/24/outline";


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

const menuItems = [
  { icon: HiHome, label: "Dashboard", path: "/home" },
  { icon: HiUsers, label: "Coaches", path: "/coaches" },
  { icon: HiCollection, label: "Subscription Plans", path: "/subscription-plans" },
  { icon: HiCurrencyDollar, label: "Transactions", path: "/transactions" },
  { icon: HiMoon, label: "Inactive Coaches", path: "/inactive-coaches" },
  { icon: HiCalendar, label: "Calendar", path: "/calendar" },
  { icon: HiSpeakerphone, label: "Leads", path: "/leads" },
];

const AdminDashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const { SidebarComponent, MobileMenuButton } = DashboardSidebarWrapper();

  const currentConfig = pageConfig[pathname as keyof typeof pageConfig] || defaultConfig;

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
      <SidebarComponent menuItems={menuItems} logout={logout} />

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[#1A1A1A] bg-[#0A0A0A] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <MobileMenuButton />

          <div className="h-6 w-px bg-[#1A1A1A] lg:hidden" aria-hidden="true" />

          <PageHeader
            key={`${user?.firstName}-${user?.lastName}`}
            user={user}
            isLoading={isLoading}
            title={currentConfig.title}/>
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
