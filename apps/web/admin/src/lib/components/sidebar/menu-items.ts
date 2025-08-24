import {
  CalendarIcon as HiCalendar,
  CurrencyDollarIcon as HiCurrencyDollar,
  HomeIcon as HiHome,
  MoonIcon as HiMoon,
  RectangleStackIcon as HiCollection,
  EnvelopeIcon as HiEnvelope,
  UsersIcon as HiUsers,
} from "@heroicons/react/24/outline";

export const menuItems = [
  { icon: HiHome, label: "Dashboard", path: "/home" },
  { icon: HiUsers, label: "Coaches", path: "/coaches" },
  { icon: HiMoon, label: "Inactive Coaches", path: "/coaches/inactive" },
  { icon: HiEnvelope, label: "Leads", path: "/leads" },
  { icon: HiCalendar, label: "Calendar", path: "/calendar" },
  { icon: HiCollection, label: "Subscription Plans", path: "/subscription-plans" },
  { icon: HiCurrencyDollar, label: "Transactions", path: "/transactions" },
];

export const pageConfig = {
  'home': {
    title: 'Dashboard Overview',
    subtitle: 'Welcome back! Here\'s what\'s happening with your coaching business.',
    breadcrumb: 'Dashboard'
  },
  'coaches': {
    title: 'Coaches',
    subtitle: 'View and manage all your coaches in one place.',
    breadcrumb: 'Coaches'
  },
  'make-payment': {
    title: 'Coaches',
    subtitle: 'View and manage all your coaches in one place.',
    breadcrumb: 'Coaches'
  },
  'subscription-plans': {
    title: 'Subscription Plans',
    subtitle: 'Manage your coaching plans and pricing.',
    breadcrumb: 'Plans'
  },
  'transactions': {
    title: 'Transactions',
    subtitle: 'Track all payments and financial activities.',
    breadcrumb: 'Transactions'
  },
  'coaches/inactive': {
    title: 'Inactive Coaches',
    subtitle: 'Coaches who are currently inactive or need attention.',
    breadcrumb: 'Inactive'
  },
  'calendar': {
    title: 'Calendar & Schedule',
    subtitle: 'Manage appointments and coaching sessions.',
    breadcrumb: 'Calendar'
  },
  'leads': {
    title: 'Leads',
    subtitle: 'Get assistance and find answers to common questions.',
    breadcrumb: 'Help'
  },
  'settings': {
    title: 'Account Settings',
    subtitle: 'Customize your account and application preferences.',
    breadcrumb: 'Settings'
  }
};
