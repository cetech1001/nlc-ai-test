import {
  CurrencyDollarIcon as HiCurrencyDollar,
  HomeIcon as HiHome,
  SparklesIcon as HiSparkles,
  LightBulbIcon as HiInsights,
  CogIcon as HiCog,
} from "@heroicons/react/24/outline";
import {
  Bot,
  TvMinimalPlay,
  Users,
  ShieldUser,
  Wallet,
  MessageSquare,
  UserCheck,
  GraduationCap,
  Calendar,
  Quote,
  Globe,
  Heart,
  Target,
  Mail,
  Zap
} from "lucide-react";
import {MenuItemType} from "@nlc-ai/types";

// Updated menu items with better names and more appropriate icons
export const menuItems: MenuItemType[] = [
  { icon: HiHome, label: "Dashboard", path: "/home" },
  { icon: Users, label: "Client Management", path: "/clients" }, // Better name
  { icon: TvMinimalPlay, label: "Social Content Hub", path: "/content" }, // More specific name
  { icon: GraduationCap, label: "Course Studio", path: "/courses" }, // More creative name
  { icon: Target, label: "Lead Pipeline", path: "/leads" }, // More specific than "Lead Follow-up"
  {
    icon: HiSparkles,
    label: 'AI Assistants', // More user-friendly than "AI Agents"
    dropdown: [
      { icon: Mail, label: "Lead Nurturing", path: "/agents/lead-followup" },
      { icon: MessageSquare, label: "Email Assistant", path: "/agents/client-email" },
      { icon: UserCheck, label: "Retention Helper", path: "/agents/client-retention" },
      { icon: Zap, label: "Content Ideas", path: "/agents/content-suggestion" },
      { icon: Bot, label: "AI Coach", path: "/agents/coach-replica" },
    ]
  },
  {
    icon: HiInsights,
    label: 'Assistant Analytics', // More specific than "AI Agent Insights"
    dropdown: [
      { icon: Target, label: "Lead Nurturing", path: "/insights/lead-followup" },
      { icon: MessageSquare, label: "Email Assistant", path: "/insights/client-email" },
      { icon: UserCheck, label: "Retention Helper", path: "/insights/client-retention" },
      { icon: Zap, label: "Content Ideas", path: "/insights/content-suggestion" },
      { icon: Bot, label: "AI Coach", path: "/insights/coach-replica" },
    ]
  },
  { icon: Calendar, label: "Smart Booking", path: "/calendar" }, // More descriptive
  { icon: Globe, label: "AI Vault", path: "/vault" }, // Keep as is since it's unique
  { icon: Heart, label: "Client Community", path: "/community" }, // More specific
  { icon: Quote, label: "Success Stories", path: "/testimonials" }, // More engaging name
  { icon: HiCurrencyDollar, label: "Payment Hub", path: "/payment/requests" }, // Cleaner name
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
    title: 'Client Management',
  },
  'retention': {
    title: 'Client Retention',
  },
  'content': {
    title: 'Social Content Hub',
  },
  'courses': {
    title: 'Course Studio',
  },
  'leads': {
    title: 'Lead Pipeline',
  },
  'agents': {
    title: 'AI Assistants',
  },
  'insights': {
    title: 'Assistant Analytics',
  },
  'calendar': {
    title: 'Smart Booking',
  },
  'vault': {
    title: 'AI Vault',
  },
  'community': {
    title: 'Client Community',
  },
  'testimonials': {
    title: 'Success Stories',
  },
  'payment': {
    title: 'Payment Hub',
  },
  'settings': {
    title: 'Account Settings',
  }
};
