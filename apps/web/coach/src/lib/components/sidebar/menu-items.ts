import {
  CurrencyDollarIcon as HiCurrencyDollar,
  HomeIcon as HiHome,
  SparklesIcon as HiSparkles,
  LightBulbIcon as HiInsights,
  CogIcon as HiCog,
} from "@heroicons/react/24/outline";
import {
  TvMinimalPlay,
  Users,
  ShieldUser,
  Wallet,
  UserCheck,
  GraduationCap,
  Calendar,
  Quote,
  Globe,
  Heart,
  Target,
  Zap,
  MessageCircleReply,
} from "lucide-react";
import {MenuItemType} from "@nlc-ai/types";
import {RetentionIcon, CoachReplicaIcon, EmailAgentIcon} from "../icons";

export const menuItems: MenuItemType[] = [
  { icon: HiHome, label: "Dashboard", path: "/home" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: GraduationCap, label: "Courses", path: "/courses" },
  { icon: Target, label: "Leads", path: "/leads" },
  { icon: TvMinimalPlay, label: "Content Management", path: "/content" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  {
    icon: HiSparkles,
    label: 'AI Agents',
    dropdown: [
      { icon: CoachReplicaIcon, label: "Coach Replica", path: "/agents/replica" },
      { icon: RetentionIcon, label: "Retention", path: "/agents/retention/templates" },
      { icon: UserCheck, label: "Lead Follow-up", path: "/agents/followup" },
      { icon: EmailAgentIcon, label: "Email", path: "/agents/emails" },
      { icon: Zap, label: "Content Creation", path: "/agents/suggestion" },
    ]
  },
  {
    icon: HiInsights,
    label: 'Agent Analytics',
    dropdown: [
      { icon: CoachReplicaIcon, label: "Coach Replica", path: "/analytics/replica" },
      { icon: RetentionIcon, label: "Retention", path: "/analytics/retention" },
      { icon: UserCheck, label: "Lead Follow-up", path: "/analytics/leads" },
      { icon: EmailAgentIcon, label: "Email", path: "/analytics/emails" },
      { icon: Zap, label: "Content Creation", path: "/analytics/suggestion" },
    ]
  },
  { icon: Globe, label: "AI Vault", path: "/vault" },
  { icon: Heart, label: "Client Community", path: "/community" },
  { icon: MessageCircleReply, label: "Chat", path: "/messages" },
  { icon: Quote, label: "Testimonials", path: "/testimonials" },
  { icon: HiCurrencyDollar, label: "Payments", path: "/payment/requests" },
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
  },
  'messages': {
    title: 'Messages',
  }
};
