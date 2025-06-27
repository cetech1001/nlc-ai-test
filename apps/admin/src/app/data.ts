import {tableRenderers} from "@/app/(dashboard)/components/data-table";

export const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
  { month: "Jul", revenue: 70000 },
  { month: "Aug", revenue: 62000 },
  { month: "Sep", revenue: 78000 },
  { month: "Oct", revenue: 85000 },
  { month: "Nov", revenue: 92000 },
  { month: "Dec", revenue: 98000 },
];

const colWidth = 100 / 7;
export const coachColumns = [
  {
    key: 'id',
    header: 'User ID',
    width: `${colWidth * (2 / 3)}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'name',
    header: 'Name',
    width: `${colWidth}%`,
    render: (value: string) => tableRenderers.truncateText(value, 18)
  },
  {
    key: 'email',
    header: 'Email',
    width: `${colWidth * (5 / 3)}%`,
    render: (value: string) => tableRenderers.truncateText(value, 25)
  },
  {
    key: 'dateJoined',
    header: 'Date Joined',
    width: `${colWidth}%`,
    render: tableRenderers.dateText
  },
  {
    key: 'plan',
    header: 'Plan',
    width: `${colWidth * (2 / 3)}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'status',
    header: 'Status',
    width: `${colWidth * (2 / 3)}%`,
    render: tableRenderers.simpleStatus
  },
  {
    key: 'actions',
    header: 'Actions',
    width: `auto`,
    render: tableRenderers.simpleActions
  }
];

export const coachesData = [
  {
    id: "#1234",
    name: "Charlie Levin",
    email: "charlie.levin@gmail.com",
    dateJoined: "Mar 25, 2025",
    plan: "Starter",
    status: "Active",
  },
  {
    id: "#1233",
    name: "Cheyenne Avera",
    email: "cheyenne@gmail.com",
    dateJoined: "Mar 25, 2025",
    plan: "Premium",
    status: "Blocked",
  },
  {
    id: "#1232",
    name: "Paylyn George",
    email: "paylyn.george@gmail.com",
    dateJoined: "Mar 22, 2025",
    plan: "Growth",
    status: "Active",
  },
  {
    id: "#1231",
    name: "Ryan Das",
    email: "ryan.d@gmail.com",
    dateJoined: "Mar 22, 2025",
    plan: "Premium",
    status: "Blocked",
  },
  {
    id: "#1230",
    name: "Erin Press",
    email: "erin.press@gmail.com",
    dateJoined: "Mar 21, 2025",
    plan: "Growth",
    status: "Active",
  },
  {
    id: "#1229",
    name: "Jordyn Herwitz",
    email: "jordyn.herwitz@gmail.com",
    dateJoined: "Mar 15, 2025",
    plan: "Starter",
    status: "Active",
  },
];

export const allCoachesData = [
  {
    id: "#1234",
    name: "Charlie Levin",
    email: "charlie.levin@gmail.com",
    dateJoined: "Mar 25, 2025",
    plan: "Starter",
    status: "Active",
  },
  {
    id: "#1233",
    name: "Cheyenne Avera",
    email: "cheyenne@gmail.com",
    dateJoined: "Mar 25, 2025",
    plan: "Premium",
    status: "Blocked",
  },
  {
    id: "#1232",
    name: "Paylyn George",
    email: "paylyn.george@gmail.com",
    dateJoined: "Mar 22, 2025",
    plan: "Growth",
    status: "Active",
  },
  {
    id: "#1231",
    name: "Ryan Das",
    email: "ryan.d@gmail.com",
    dateJoined: "Mar 22, 2025",
    plan: "Premium",
    status: "Blocked",
  },
  {
    id: "#1230",
    name: "Erin Press",
    email: "erin.press@gmail.com",
    dateJoined: "Mar 21, 2025",
    plan: "Growth",
    status: "Active",
  },
  {
    id: "#1229",
    name: "Jordyn Herwitz",
    email: "jordyn.herwitz@gmail.com",
    dateJoined: "Mar 15, 2025",
    plan: "Starter",
    status: "Active",
  },
  {
    id: "#1228",
    name: "Zaire Botosh",
    email: "zaire.botosh@gmail.com",
    dateJoined: "Mar 14, 2025",
    plan: "Growth",
    status: "Blocked",
  },
  {
    id: "#1227",
    name: "Zan Das",
    email: "zan.das@gmail.com",
    dateJoined: "Mar 14, 2025",
    plan: "Premium",
    status: "Blocked",
  },
  {
    id: "#1226",
    name: "Erin Herwitz",
    email: "erin.herwitz@gmail.com",
    dateJoined: "Mar 12, 2025",
    plan: "Starter",
    status: "Active",
  },
  {
    id: "#1225",
    name: "Philip Dokidis",
    email: "philip.d@gmail.com",
    dateJoined: "Mar 12, 2025",
    plan: "Starter",
    status: "Active",
  },
  // Additional coaches for pagination demo
  {
    id: "#1224",
    name: "Sarah Johnson",
    email: "sarah.johnson@gmail.com",
    dateJoined: "Mar 10, 2025",
    plan: "Premium",
    status: "Active",
  },
  {
    id: "#1223",
    name: "Mike Chen",
    email: "mike.chen@gmail.com",
    dateJoined: "Mar 09, 2025",
    plan: "Growth",
    status: "Blocked",
  },
  {
    id: "#1222",
    name: "Lisa Wang",
    email: "lisa.wang@gmail.com",
    dateJoined: "Mar 08, 2025",
    plan: "Starter",
    status: "Active",
  },
  {
    id: "#1221",
    name: "David Miller",
    email: "david.miller@gmail.com",
    dateJoined: "Mar 07, 2025",
    plan: "Premium",
    status: "Active",
  },
  {
    id: "#1220",
    name: "Emma Davis",
    email: "emma.davis@gmail.com",
    dateJoined: "Mar 06, 2025",
    plan: "Growth",
    status: "Blocked",
  },
];

export interface Plan {
  title: string;
  subtitle: string;
  price: number;
  monthlyPrice: number;
  billingCycle: string;
  monthlyBilling: string;
  features: string[];
  isCurrentPlan: boolean;
  colorClass: string;
}

export const getPlans = (currentPlan: string): Plan[] => [
  {
    title: "Solo Agent",
    subtitle: "Access to 1 agent",
    price: 360,
    monthlyPrice: 400,
    billingCycle: "per user/month billed annually",
    monthlyBilling: "$400 billed monthly",
    features: [
      "AI Email Management",
      "Weekly Client Check-Ins",
      "Content Suggestions",
      "Lead Follow-Up Automation",
      "Customizable Dashboard",
      "Appointment Scheduling Integration",
      "Progress Tracking and Analytics",
    ],
    isCurrentPlan: currentPlan === "Solo Agent",
    colorClass: "bg-[#9C55FF]",
  },
  {
    title: "Starter Pack",
    subtitle: "Access to any 2 agents",
    price: 360,
    monthlyPrice: 400,
    billingCycle: "per user/month billed annually",
    monthlyBilling: "$400 billed monthly",
    features: [
      "AI Email Management",
      "Weekly Client Check-Ins",
      "Content Suggestions",
      "Lead Follow-Up Automation",
      "Customizable Dashboard",
      "Appointment Scheduling Integration",
      "Progress Tracking and Analytics",
    ],
    isCurrentPlan: currentPlan === "Starter Pack",
    colorClass: "bg-[#B347FF]",
  },
  {
    title: "Growth Pro",
    subtitle: "Access to any 3 agents",
    price: 1099,
    monthlyPrice: 1200,
    billingCycle: "per user/month billed annually",
    monthlyBilling: "$1200 billed monthly",
    features: [
      "All Basic Plan Features",
      "Client Retention Agent",
      "Lead Qualification via Chatbot",
      "CRM and Calendar Integration",
      "Performance Analytics",
      "Social Media Insights",
      "Customizable Content Frameworks",
    ],
    isCurrentPlan: currentPlan === "Growth Pro",
    colorClass: "bg-fuchsia-400",
  },
  {
    title: "Scale Elite",
    subtitle: "Access to all 5 agents",
    price: 1899,
    monthlyPrice: 2000,
    billingCycle: "per user/month billed annually",
    monthlyBilling: "$2000 billed monthly",
    features: [
      "All Pro Plan Features",
      "AI Custom Training",
      "Multi-Coach Management",
      "Team Collaboration Tools",
      "Advanced Reporting & Insights",
      "Priority Customer Support",
      "API Integrations",
    ],
    isCurrentPlan: currentPlan === "Scale Elite",
    colorClass: "bg-gradient-to-l from-violet-600 via-fuchsia-600 to-fuchsia-200 rotate-45",
  },
];
