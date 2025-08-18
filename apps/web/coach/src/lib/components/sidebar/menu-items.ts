import {
  CalendarIcon as HiCalendar,
  CurrencyDollarIcon as HiCurrencyDollar,
  HomeIcon as HiHome,
  RectangleStackIcon as HiCollection,
  SpeakerWaveIcon as HiSpeakerphone,
  UsersIcon as HiUsers,
  EnvelopeIcon as HiEnvelope,
  AcademicCapIcon as HiCourse,
  SparklesIcon as HiSparkles,
  LightBulbIcon as HiInsights,
  CogIcon as HiCog,
} from "@heroicons/react/24/outline";
import {
  Bot, MailQuestion, TvMinimalPlay, Users, ShieldUser, Wallet
} from "lucide-react";
import {MenuItemType} from "@nlc-ai/types";


export const menuItems: MenuItemType[] = [
  { icon: HiHome, label: "Dashboard", path: "/home" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: TvMinimalPlay, label: "Content Management", path: "/content/categories" },
  { icon: HiCourse, label: "Courses", path: "/courses" },
  { icon: HiSpeakerphone, label: "Lead Follow-up", path: "/leads" },
  {
    icon: HiSparkles,
    label: 'AI Agents',
    dropdown: [
      { icon: HiEnvelope, label: "Lead Follow-up", path: "/agents/lead-followup" },
      { icon: HiEnvelope, label: "Client Email", path: "/agents/client-email" },
      { icon: HiCollection, label: "Client Retention", path: "agents/client-retention" },
      { icon: MailQuestion, label: "Content Suggestion", path: "/agents/content-suggestion" },
      { icon: Bot, label: "Coach Replica", path: "/agents/coach-replica" },
    ]
  },
  {
    icon: HiInsights,
    label: 'AI Agent Insights',
    dropdown: [
      { icon: TvMinimalPlay, label: "Lead Follow-up", path: "/insights/lead-followup" },
      { icon: HiEnvelope, label: "Client Email", path: "/insights/client-email" },
      { icon: HiCollection, label: "Client Retention", path: "/insights/client-retention" },
      { icon: MailQuestion, label: "Content Suggestion", path: "/insights/content-suggestion" },
      { icon: Bot, label: "Coach Replica", path: "/insights/coach-replica" },
    ]
  },
  { icon: HiCalendar, label: "Calendar", path: "/calendar" },
  { icon: HiUsers, label: "AI Vault", path: "/vault" },
  { icon: HiUsers, label: "Community", path: "/community" },
  { icon: HiUsers, label: "Testimonials", path: "/testimonials" },
  { icon: HiCurrencyDollar, label: "Payment Requests", path: "/payment/requests" },
];

export const settingsItems = [
  {
    icon: HiCog,
    label: 'Settings',
    dropdown: [
      { icon: ShieldUser, label: "Account", path: "/settings/account" },
      { icon: Wallet, label: "Billing", path: "/settings/billing" },
    ]
  },
]

export const pageConfig = {
  'home': {
    title: 'Dashboard Overview',
  },
  'clients': {
    title: 'Clients',
  },
  'retention': {
    title: 'Client Retention',
  },
  'content': {
    title: 'Content Management',
  },
  'settings': {
    title: 'Account Settings',
  }
};
