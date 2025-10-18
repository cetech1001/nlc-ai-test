import {MenuItemType} from "@nlc-ai/types";
import {
  AboutIcon,
  CalendarIcon, ChatIcon,
  ClassroomIcon,
  CommunityIcon, CreditCardIcon,
  LeaderboardIcon,
  MembersIcon, SettingsIcon, UserIcon
} from "@/lib/components/layout/icons";

export const menuItems: MenuItemType[] = [
  { icon: LeaderboardIcon, label: "Leaderboard", path: "/home" },
  { icon: CommunityIcon, label: "Community", path: "/community" },
  { icon: ClassroomIcon, label: "Classroom", path: "/classroom" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: MembersIcon, label: "Members", path: "/members" },
  { icon: AboutIcon, label: "About", path: "/about" },
];

export const settingsItems = [
  {
    icon: SettingsIcon,
    label: 'Settings',
    dropdown: [
      { icon: CommunityIcon, label: "Communities", path: "/settings/communities" },
      { icon: UserIcon, label: "Account", path: "/settings/account" },
      { icon: ChatIcon, label: "Chat", path: "/settings/chat" },
      { icon: CreditCardIcon, label: "Billing", path: "/settings/billing" },
    ]
  },
]

export const pageConfig = {
  'home': {
    title: 'Leaderboard',
  },
  'community': {
    title: 'Community',
  },
  'classroom': {
    title: 'Classroom',
  },
  'calendar': {
    title: 'Calendar',
  },
  'members': {
    title: 'Members',
  },
  'about': {
    title: 'About',
  },
  'communities': {
    title: 'Settings - Communities',
  },
  'account': {
    title: 'Settings - Account',
  },
  'chat': {
    title: 'Settings - Chat',
  },
  'billing': {
    title: 'Settings - Billing',
  }
};
