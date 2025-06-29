import {TableColumn, tableRenderers} from "@/app/(dashboard)/components/data-table";

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
export const coachColumns: TableColumn<Coach>[] = [
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

export interface Coach {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  plan: string;
  status: string;
}

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
    colorClass: "bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200 rotate-45",
  },
];

const txColWidth = 100 / 8;
export const transactionColumns: TableColumn<Transaction>[] = [
  {
    key: 'id',
    header: 'Transaction ID',
    width: `${txColWidth * (3 / 4)}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'name',
    header: 'Name',
    width: `${txColWidth}%`,
    render: (value: string) => tableRenderers.truncateText(value, 16)
  },
  {
    key: 'email',
    header: 'Email',
    width: `${txColWidth * (5 / 4)}%`,
    render: (value: string) => tableRenderers.truncateText(value, 22)
  },
  {
    key: 'subscriptionPlan',
    header: 'Subscription Plan',
    width: `${txColWidth}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'invoiceDate',
    header: 'Invoice Date',
    width: `${txColWidth * (4 / 5)}%`,
    render: tableRenderers.dateText
  },
  {
    key: 'transactionDate',
    header: 'Transaction Date',
    width: `${txColWidth}%`,
    render: tableRenderers.dateText
  },
  {
    key: 'amount',
    header: 'Amount',
    width: `${txColWidth * (3 / 4)}%`,
    render: tableRenderers.currencyText
  },
  {
    key: 'actions',
    header: 'Actions',
    width: 'auto',
    render: (_: string, row: Transaction, callback) => {
      return tableRenderers.actions('Download', row, 'download', callback);
    }
  }
];

export interface Transaction {
  id: string;
  name: string;
  email: string;
  subscriptionPlan: 'Starter' | 'Premium' | 'Growth' | 'Scale Elite';
  invoiceDate: string;
  transactionDate: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  currency: string;
}

export const sampleTransactions: Transaction[] = [
  {
    id: '#1234',
    name: 'Charlie Levin',
    email: 'charlie.levin@email.com',
    subscriptionPlan: 'Starter',
    invoiceDate: 'Mar 25, 2025',
    transactionDate: 'Mar 25, 2025',
    amount: 400,
    status: 'completed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1233',
    name: 'Cheyenne Avara',
    email: 'cheyenne@email.com',
    subscriptionPlan: 'Premium',
    invoiceDate: 'Mar 25, 2025',
    transactionDate: 'Mar 25, 2025',
    amount: 2000,
    status: 'completed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1232',
    name: 'Paityn George',
    email: 'paityn.george@email.com',
    subscriptionPlan: 'Growth',
    invoiceDate: 'Mar 22, 2025',
    transactionDate: 'Mar 22, 2025',
    amount: 1200,
    status: 'completed',
    paymentMethod: 'debit_card',
    currency: 'USD'
  },
  {
    id: '#1231',
    name: 'Ryan Dias',
    email: 'ryan.d@email.com',
    subscriptionPlan: 'Premium',
    invoiceDate: 'Mar 22, 2025',
    transactionDate: 'Mar 22, 2025',
    amount: 2000,
    status: 'completed',
    paymentMethod: 'paypal',
    currency: 'USD'
  },
  {
    id: '#1230',
    name: 'Erin Press',
    email: 'erin.press@email.com',
    subscriptionPlan: 'Growth',
    invoiceDate: 'Mar 21, 2025',
    transactionDate: 'Mar 21, 2025',
    amount: 1200,
    status: 'completed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1229',
    name: 'Jordyn Herwitz',
    email: 'jordyn.herwitz@email.com',
    subscriptionPlan: 'Starter',
    invoiceDate: 'Mar 15, 2025',
    transactionDate: 'Mar 15, 2025',
    amount: 400,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    currency: 'USD'
  },
  {
    id: '#1228',
    name: 'Zaire Botosh',
    email: 'zaire.botosh@email.com',
    subscriptionPlan: 'Growth',
    invoiceDate: 'Mar 14, 2025',
    transactionDate: 'Mar 14, 2025',
    amount: 1200,
    status: 'completed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1227',
    name: 'Zain Dias',
    email: 'zain.dias@email.com',
    subscriptionPlan: 'Premium',
    invoiceDate: 'Mar 14, 2025',
    transactionDate: 'Mar 14, 2025',
    amount: 2000,
    status: 'completed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1226',
    name: 'Erin Herwitz',
    email: 'erin.herwitz@email.com',
    subscriptionPlan: 'Starter',
    invoiceDate: 'Mar 12, 2025',
    transactionDate: 'Mar 12, 2025',
    amount: 400,
    status: 'completed',
    paymentMethod: 'paypal',
    currency: 'USD'
  },
  {
    id: '#1225',
    name: 'Phillip Dokidis',
    email: 'phillip.d@email.com',
    subscriptionPlan: 'Starter',
    invoiceDate: 'Mar 12, 2025',
    transactionDate: 'Mar 12, 2025',
    amount: 400,
    status: 'completed',
    paymentMethod: 'debit_card',
    currency: 'USD'
  },
  {
    id: '#1224',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    subscriptionPlan: 'Scale Elite',
    invoiceDate: 'Mar 10, 2025',
    transactionDate: 'Mar 10, 2025',
    amount: 1899,
    status: 'completed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1223',
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    subscriptionPlan: 'Growth',
    invoiceDate: 'Mar 08, 2025',
    transactionDate: 'Mar 08, 2025',
    amount: 1200,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    currency: 'USD'
  },
  {
    id: '#1222',
    name: 'Lisa Chen',
    email: 'lisa.chen@email.com',
    subscriptionPlan: 'Premium',
    invoiceDate: 'Mar 07, 2025',
    transactionDate: 'Mar 07, 2025',
    amount: 2000,
    status: 'completed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1221',
    name: 'David Rodriguez',
    email: 'david.rodriguez@email.com',
    subscriptionPlan: 'Starter',
    invoiceDate: 'Mar 05, 2025',
    transactionDate: 'Mar 05, 2025',
    amount: 400,
    status: 'failed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1220',
    name: 'Emma Thompson',
    email: 'emma.thompson@email.com',
    subscriptionPlan: 'Growth',
    invoiceDate: 'Mar 03, 2025',
    transactionDate: 'Mar 03, 2025',
    amount: 1200,
    status: 'completed',
    paymentMethod: 'paypal',
    currency: 'USD'
  },
  {
    id: '#1219',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    subscriptionPlan: 'Scale Elite',
    invoiceDate: 'Mar 01, 2025',
    transactionDate: 'Mar 01, 2025',
    amount: 1899,
    status: 'completed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1218',
    name: 'Jessica Davis',
    email: 'jessica.davis@email.com',
    subscriptionPlan: 'Premium',
    invoiceDate: 'Feb 28, 2025',
    transactionDate: 'Feb 28, 2025',
    amount: 2000,
    status: 'refunded',
    paymentMethod: 'debit_card',
    currency: 'USD'
  },
  {
    id: '#1217',
    name: 'Robert Wilson',
    email: 'robert.wilson@email.com',
    subscriptionPlan: 'Starter',
    invoiceDate: 'Feb 26, 2025',
    transactionDate: 'Feb 26, 2025',
    amount: 400,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    currency: 'USD'
  },
  {
    id: '#1216',
    name: 'Ashley Martinez',
    email: 'ashley.martinez@email.com',
    subscriptionPlan: 'Growth',
    invoiceDate: 'Feb 24, 2025',
    transactionDate: 'Feb 24, 2025',
    amount: 1200,
    status: 'completed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1215',
    name: 'Christopher Lee',
    email: 'chris.lee@email.com',
    subscriptionPlan: 'Premium',
    invoiceDate: 'Feb 22, 2025',
    transactionDate: 'Feb 22, 2025',
    amount: 2000,
    status: 'completed',
    paymentMethod: 'paypal',
    currency: 'USD'
  },
  {
    id: '#1214',
    name: 'Amanda Taylor',
    email: 'amanda.taylor@email.com',
    subscriptionPlan: 'Starter',
    invoiceDate: 'Feb 20, 2025',
    transactionDate: 'Feb 20, 2025',
    amount: 400,
    status: 'pending',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1213',
    name: 'Daniel Anderson',
    email: 'daniel.anderson@email.com',
    subscriptionPlan: 'Scale Elite',
    invoiceDate: 'Feb 18, 2025',
    transactionDate: 'Feb 18, 2025',
    amount: 1899,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    currency: 'USD'
  },
  {
    id: '#1212',
    name: 'Stephanie White',
    email: 'stephanie.white@email.com',
    subscriptionPlan: 'Growth',
    invoiceDate: 'Feb 16, 2025',
    transactionDate: 'Feb 16, 2025',
    amount: 1200,
    status: 'completed',
    paymentMethod: 'debit_card',
    currency: 'USD'
  },
  {
    id: '#1211',
    name: 'Kevin Harris',
    email: 'kevin.harris@email.com',
    subscriptionPlan: 'Premium',
    invoiceDate: 'Feb 14, 2025',
    transactionDate: 'Feb 14, 2025',
    amount: 2000,
    status: 'completed',
    paymentMethod: 'credit_card',
    currency: 'USD'
  },
  {
    id: '#1210',
    name: 'Rachel Clark',
    email: 'rachel.clark@email.com',
    subscriptionPlan: 'Starter',
    invoiceDate: 'Feb 12, 2025',
    transactionDate: 'Feb 12, 2025',
    amount: 400,
    status: 'failed',
    paymentMethod: 'paypal',
    currency: 'USD'
  }
];
