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
  },
  'clients': {
    title: 'Clients',
  },
  'client-retention': {
    title: 'Client',
  },
  'settings': {
    title: 'Account Settings',
  }
};
