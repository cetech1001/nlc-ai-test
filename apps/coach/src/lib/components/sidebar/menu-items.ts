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
      { icon: HiEnvelope, label: "Email Management", path: "/emails" },
      { icon: HiCollection, label: "Client Retention", path: "/retention/templates" },
      { icon: MailQuestion, label: "Content Suggestion", path: "/suggestions" },
      { icon: Bot, label: "Bot Training", path: "/bot-training" },
    ]
  },
  {
    icon: HiInsights,
    label: 'Insights',
    dropdown: [
      { icon: HiEnvelope, label: "AI Email Agent", path: "/insights/emails" },
      { icon: HiCollection, label: "Client Retention", path: "/insights/retention/templates" },
      { icon: TvMinimalPlay, label: "Content Management", path: "/insights/content/categories" },
      { icon: MailQuestion, label: "Content Suggestion", path: "/insights/suggestions" },
      { icon: Bot, label: "Bot Training", path: "/insights/bot-training" },
    ]
  },
  { icon: HiCalendar, label: "Calendar", path: "/calendar" },
  { icon: HiUsers, label: "Community", path: "/community" },
  { icon: HiCurrencyDollar, label: "Payment Requests", path: "/payments" },
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
