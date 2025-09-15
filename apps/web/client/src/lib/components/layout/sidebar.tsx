'use client'

import React from "react";
import {NavItem} from "@/lib";
import { cn } from "@nlc-ai/web-ui";
import {usePathname} from "next/navigation";

interface SidebarProps {
  onClose?: () => void;
}

const CommunityIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.4999 15.94C13.2107 16.1464 13.9472 16.2508 14.6874 16.25C15.8777 16.2517 17.0526 15.9803 18.1215 15.4567C18.1531 14.7098 17.9404 13.9729 17.5155 13.3578C17.0906 12.7427 16.4768 12.2828 15.7671 12.0479C15.0574 11.813 14.2904 11.8159 13.5825 12.0562C12.8746 12.2964 12.2642 12.7609 11.844 13.3792M12.4999 15.94V15.9375C12.4999 15.01 12.2615 14.1375 11.844 13.3792M12.4999 15.94V16.0283C10.8961 16.9942 9.0587 17.5032 7.18652 17.5C5.24402 17.5 3.42652 16.9625 1.87486 16.0283L1.87402 15.9375C1.87338 14.7579 2.26537 13.6116 2.98818 12.6794C3.71098 11.7472 4.7235 11.082 5.8661 10.7888C7.00869 10.4956 8.21638 10.5911 9.29874 11.0601C10.3811 11.5291 11.2766 12.345 11.844 13.3792M9.99986 5.3125C9.99986 6.05842 9.70354 6.77379 9.1761 7.30124C8.64865 7.82868 7.93328 8.125 7.18736 8.125C6.44144 8.125 5.72607 7.82868 5.19862 7.30124C4.67117 6.77379 4.37486 6.05842 4.37486 5.3125C4.37486 4.56658 4.67117 3.85121 5.19862 3.32376C5.72607 2.79632 6.44144 2.5 7.18736 2.5C7.93328 2.5 8.64865 2.79632 9.1761 3.32376C9.70354 3.85121 9.99986 4.56658 9.99986 5.3125ZM16.8749 7.1875C16.8749 7.76766 16.6444 8.32406 16.2342 8.7343C15.8239 9.14453 15.2675 9.375 14.6874 9.375C14.1072 9.375 13.5508 9.14453 13.1406 8.7343C12.7303 8.32406 12.4999 7.76766 12.4999 7.1875C12.4999 6.60734 12.7303 6.05094 13.1406 5.6407C13.5508 5.23047 14.1072 5 14.6874 5C15.2675 5 15.8239 5.23047 16.2342 5.6407C16.6444 6.05094 16.8749 6.60734 16.8749 7.1875Z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.6258 16.44V16.4375C15.6258 15.51 15.3875 14.6375 14.97 13.8792M15.6258 16.44V16.5283C14.0221 17.4942 12.1847 18.0032 10.3125 18C8.37 18 6.5525 17.4625 5.00083 16.5283L5 16.4375C4.99936 15.2579 5.39135 14.1116 6.11415 13.1794C6.83696 12.2472 7.84948 11.582 8.99207 11.2888C10.1347 10.9956 11.3424 11.0911 12.4247 11.5601C13.5071 12.0291 14.4026 12.845 14.97 13.8792M13.1258 5.8125C13.1258 6.55842 12.8295 7.27379 12.3021 7.80124C11.7746 8.32868 11.0593 8.625 10.3133 8.625C9.56741 8.625 8.85204 8.32868 8.3246 7.80124C7.79715 7.27379 7.50083 6.55842 7.50083 5.8125C7.50083 5.06658 7.79715 4.35121 8.3246 3.82376C8.85204 3.29632 9.56741 3 10.3133 3C11.0593 3 11.7746 3.29632 12.3021 3.82376C12.8295 4.35121 13.1258 5.06658 13.1258 5.8125Z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.25 7.375H13.75M6.25 9.875H10M1.875 11.1333C1.875 12.4667 2.81083 13.6283 4.13083 13.8225C5.07167 13.9608 6.0225 14.0667 6.98333 14.1383C7.275 14.16 7.54167 14.3133 7.70417 14.5558L10 18L12.2958 14.5558C12.3764 14.4361 12.4831 14.3362 12.608 14.2639C12.733 14.1915 12.8727 14.1486 13.0167 14.1383C13.971 14.0671 14.9224 13.9617 15.8692 13.8225C17.1892 13.6283 18.125 12.4675 18.125 11.1325V6.1175C18.125 4.7825 17.1892 3.62167 15.8692 3.4275C13.9258 3.14226 11.9642 2.99938 10 3C8.00667 3 6.04667 3.14584 4.13083 3.4275C2.81083 3.62167 1.875 4.78334 1.875 6.1175V11.1325V11.1333Z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.875 7.375H18.125M1.875 8H18.125M4.375 12.375H9.375M4.375 14.25H6.875M3.75 16.75H16.25C16.7473 16.75 17.2242 16.5525 17.5758 16.2008C17.9275 15.8492 18.125 15.3723 18.125 14.875V6.125C18.125 5.62772 17.9275 5.15081 17.5758 4.79917C17.2242 4.44754 16.7473 4.25 16.25 4.25H3.75C3.25272 4.25 2.77581 4.44754 2.42417 4.79917C2.07254 5.15081 1.875 5.62772 1.875 6.125V14.875C1.875 15.3723 2.07254 15.8492 2.42417 16.2008C2.77581 16.5525 3.25272 16.75 3.75 16.75Z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const settingsSubItems = [
  { icon: CommunityIcon, label: 'Communities', href: '/settings/communities', active: true },
  { icon: UserIcon, label: 'Profile', href: '/settings/profile' },
  // { icon: AccountIcon, label: 'Account', href: '/settings/account' },
  // { icon: BellIcon, label: 'Notification', href: '/settings/notifications' },
  { icon: ChatIcon, label: 'Chat', href: '/settings/chat' },
  { icon: CreditCardIcon, label: 'Billing', href: '/settings/billing' },
  // { icon: MoonIcon, label: 'Theme', href: '/settings/theme' },
];

interface SubNavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  isActive: boolean;
}

const SubNavItem: React.FC<SubNavItemProps> = ({ icon: Icon, label, href, isActive }) => {
  return (
    <a
      href={href}
      className={cn(
        "flex px-3 py-3 items-center gap-4 rounded-r-[10px] transition-colors",
        isActive
          ? "border-l-2 border-[#D946EF] bg-gradient-to-r from-[#35173B] to-[#251B3A]"
          : "hover:bg-[#1A1A1A]/50"
      )}
    >
      <Icon className={cn(
        "w-5 h-5",
        isActive ? "stroke-white" : "stroke-[#A0A0A0]"
      )} />
      <span className={cn(
        "font-inter text-sm font-semibold leading-[25.6px]",
        isActive ? "text-white" : "text-[#A0A0A0]"
      )}>
        {label}
      </span>
    </a>
  );
};

export const Sidebar = ({ onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-[90px] px-4 sm:px-6 py-2.5 border-b border-sidebar-border flex items-center justify-between">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/c026fa572507ca79ba7cc19a31442c64c9741e13?width=300"
          alt="CoachAI Logo"
          className="h-8 sm:h-[45px] w-auto max-w-[120px] sm:max-w-[150px]"
        />

        <button
          onClick={onClose}
          className="lg:hidden p-2 text-white hover:text-purple-primary transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-3 sm:px-5 py-4 sm:py-6 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/bc244556a5bd5e0bd6244244993420a9fedcb56d?width=80"
            alt="Community thumbnail"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight sm:leading-8 truncate">Ultimate Branding Course</h2>
          </div>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 9l5-4 5 4M7 16l5 4 5-4" />
          </svg>
          {/*<svg className="w-5 h-5 sm:w-6 sm:h-6 opacity-40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 9l5 5 5-5" />
          </svg>*/}
        </div>
      </div>

      <nav className="flex-1 px-2 sm:px-3 overflow-y-auto min-h-0">
        <div className="space-y-1 pb-4">
          <NavItem icon="community" label="Community" href="/community" />
          <NavItem icon="classroom" label="Classroom" href="/classroom" />
          <NavItem icon="calendar" label="Calendar" href="/calendar" />
          <NavItem icon="members" label="Members" href="/members" />
          <NavItem icon="leaderboard" label="Leaderboard" href="/" active />
          <NavItem icon="about" label="About" href="/about" />
        </div>
      </nav>

      <div className="p-2 sm:p-3 border-t border-sidebar-border">
        <div className="flex flex-col gap-2">
          <NavItem
            icon={"settings"}
            label="Settings"
            href="/settings"
            active={pathname.startsWith('/settings')}
            isSettings={true}
          />

          <div className="flex flex-col gap-[10px] pl-3">
            {settingsSubItems.map((item) => (
              <SubNavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3 border-t border-sidebar-border flex-shrink-0">
        <button className="flex items-center gap-3 sm:gap-4 w-full px-2 sm:px-3 py-2 sm:py-3 rounded-lg hover:bg-sidebar-accent transition-colors">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sidebar-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-xs sm:text-sm font-semibold text-sidebar-foreground">Logout</span>
        </button>
      </div>
    </div>
  );
}
