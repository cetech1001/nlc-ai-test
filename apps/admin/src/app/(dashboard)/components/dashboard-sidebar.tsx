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
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleLogout = () => {
    // Clear auth token
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home' || pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="icon"
      className="border-r border-[#1A1A1A]"
    >
      <SidebarHeader className="p-4 border-b border-[#1A1A1A]">
        <div className="flex items-center justify-center">
          {isCollapsed ? (
            <div className="w-8 h-8 bg-gradient-to-br from-[#7B21BA] to-[#DF69FF] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">N</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Logo width={40} height={35} />
              <span className="text-white font-semibold text-lg">NLC AI</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  onClick={() => handleNavigation(item.path)}
                  isActive={active}
                  tooltip={isCollapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                    ? "bg-[#7B21BA] text-white shadow-lg shadow-[#7B21BA]/25"
                    : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]"
                  }
                    ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : ''}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {!isCollapsed && <SidebarSeparator className="mx-4 my-4 bg-[#1A1A1A]" />}

        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleNavigation('/settings')}
              isActive={isActive('/settings')}
              tooltip={isCollapsed ? 'Settings' : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive('/settings')
                ? "bg-[#7B21BA] text-white shadow-lg shadow-[#7B21BA]/25"
                : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]"
              }
                ${isCollapsed ? 'justify-center px-2' : ''}
              `}
            >
              <SettingsIcon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-[#1A1A1A]">
        <SidebarMenuButton
          onClick={handleLogout}
          tooltip={isCollapsed ? 'Logout' : undefined}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-all duration-200
            ${isCollapsed ? 'justify-center px-2' : ''}
          `}
        >
          <LogoutIcon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Logout</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
