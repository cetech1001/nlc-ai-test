'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/app/(auth)/components/logo';
import {
  HomeIcon,
  UserIcon,
  PlansIcon,
  CalendarIcon,
  TransactionsIcon,
  SleepIcon,
  SpeakerIcon,
  SettingsIcon,
  LogoutIcon,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
  useIsMobile,
} from '@nlc-ai/ui';

const menuItems = [
  { icon: HomeIcon, label: "Dashboard", path: "/home" },
  { icon: UserIcon, label: "Coaches", path: "/coaches" },
  { icon: PlansIcon, label: "Subscription Plans", path: "/subscription-plans" },
  { icon: TransactionsIcon, label: "Transactions", path: "/transactions" },
  { icon: SleepIcon, label: "Inactive Coaches", path: "/inactive-coaches" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: SpeakerIcon, label: "Help", path: "/help" },
];

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    // Clear auth token
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    // Close mobile sidebar after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home' || pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  // On mobile, use the Sheet-based sidebar
  if (isMobile) {
    return (
      <Sidebar
        side="left"
        variant="sidebar"
        collapsible="offcanvas"
        className="border-r border-[#1A1A1A]"
      >
        <SidebarHeader className="p-4 border-b border-[#1A1A1A] bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <Logo width={40} height={35} />
            <span className="text-white font-semibold text-lg">NLC AI</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4 bg-[#0A0A0A]">
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    isActive={active}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${active
                      ? "bg-[#7B21BA] text-white shadow-lg shadow-[#7B21BA]/25"
                      : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]"
                    }
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : ''}`} />
                    <span className="truncate">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>

          <SidebarSeparator className="mx-4 my-4 bg-[#1A1A1A]" />

          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation('/settings')}
                isActive={isActive('/settings')}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive('/settings')
                  ? "bg-[#7B21BA] text-white shadow-lg shadow-[#7B21BA]/25"
                  : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]"
                }
                `}
              >
                <SettingsIcon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-[#1A1A1A] bg-[#0A0A0A]">
          <SidebarMenuButton
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-all duration-200"
          >
            <LogoutIcon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
    );
  }

  // On desktop, render a fixed sidebar
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#0A0A0A] border-r border-[#1A1A1A] z-50">
      <div className="p-4 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <Logo width={40} height={35} />
          <span className="text-white font-semibold text-lg">NLC AI</span>
        </div>
      </div>

      <div className="flex-1 px-2 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${active
                  ? "bg-[#7B21BA] text-white shadow-lg shadow-[#7B21BA]/25"
                  : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]"
                }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : ''}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mx-4 my-4 h-px bg-[#1A1A1A]" />

        <nav className="space-y-1">
          <button
            onClick={() => handleNavigation('/settings')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive('/settings')
              ? "bg-[#7B21BA] text-white shadow-lg shadow-[#7B21BA]/25"
              : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]"
            }
            `}
          >
            <SettingsIcon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Settings</span>
          </button>
        </nav>
      </div>

      <div className="p-4 border-t border-[#1A1A1A]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-all duration-200"
        >
          <LogoutIcon className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </div>
  );
}
