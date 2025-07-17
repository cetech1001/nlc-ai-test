import {
  CalendarIcon as HiCalendar,
  CurrencyDollarIcon as HiCurrencyDollar,
  HomeIcon as HiHome,
  RectangleStackIcon as HiCollection,
  SpeakerWaveIcon as HiSpeakerphone,
  UsersIcon as HiUsers,
  EnvelopeIcon as HiEnvelope,
  AcademicCapIcon as HiCourse,
} from "@heroicons/react/24/outline";
import {
  Bot, MailQuestion, TvMinimalPlay
} from "lucide-react";


export const menuItems = [
  { icon: HiHome, label: "Dashboard", path: "/home" },
  { icon: HiEnvelope, label: "AI Email Agent", path: "/clients" },
  { icon: HiCollection, label: "Client Retention", path: "/client-retention" },
  { icon: TvMinimalPlay, label: "Content Management", path: "/content-management" },
  { icon: MailQuestion, label: "Content Suggestion", path: "/content-suggestion" },
  { icon: HiCalendar, label: "Calendar", path: "/calendar" },
  { icon: HiCourse, label: "Courses", path: "/courses" },
  { icon: HiSpeakerphone, label: "Lead Follow-up", path: "/leads" },
  { icon: HiUsers, label: "Community", path: "/community" },
  { icon: Bot, label: "Bot Training", path: "/bot-training" },
  { icon: HiCurrencyDollar, label: "Payment Requests", path: "/payments" },
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
  'inactive-coaches': {
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
