import {TableColumn, tableRenderers} from "@nlc-ai/shared";

export const inactiveCoachesData = [
  {
    id: "#1234",
    name: "Charlie Levin",
    email: "charlie.levin@gmail.com",
    dateJoined: "Mar 25, 2025",
    plan: "Starter",
    status: "Inactive",
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
    status: "Inactive",
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
    status: "Inactive",
  },
  {
    id: "#1229",
    name: "Jordyn Herwitz",
    email: "jordyn.herwitz@gmail.com",
    dateJoined: "Mar 15, 2025",
    plan: "Starter",
    status: "Inactive",
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
    status: "Inactive",
  },
  {
    id: "#1225",
    name: "Philip Dokidis",
    email: "philip.d@gmail.com",
    dateJoined: "Mar 12, 2025",
    plan: "Starter",
    status: "Inactive",
  },
  // Additional coaches for pagination demo
  {
    id: "#1224",
    name: "Sarah Johnson",
    email: "sarah.johnson@gmail.com",
    dateJoined: "Mar 10, 2025",
    plan: "Premium",
    status: "Inactive",
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
    status: "Inactive",
  },
  {
    id: "#1221",
    name: "David Miller",
    email: "david.miller@gmail.com",
    dateJoined: "Mar 07, 2025",
    plan: "Premium",
    status: "Inactive",
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

export const appointments = [
  {
    name: "Rachel Greene",
    date: "May 15, 2024",
    time: "10:00AM - 11:00AM",
    avatar: "RG",
  },
  {
    name: "John Doe",
    date: "May 15, 2024",
    time: "11:00AM - 12:00PM",
    avatar: "JD",
  },
  {
    name: "Ben Affleck",
    date: "May 16, 2024",
    time: "12:00PM - 01:00PM",
    avatar: "BA",
  },
];

export interface CalendarEvent {
  title: string;
  time: string;
  color: string;
}
export type CalendarEvents = Record<number, CalendarEvent[]>

export const calendarEvents: CalendarEvents = {
  1: [
    { title: "RDHP Interview", time: "13:00 - 14:00", color: "bg-gradient-to-l from-violet-600 via-fuchsia-600 to-fuchsia-200" },
  ],
  7: [
    {
      title: "Thomas Interview",
      time: "10:00 - 12:00",
      color: "bg-gradient-to-l from-violet-600 via-fuchsia-600 to-fuchsia-200",
    },
  ],
  15: [
    {
      title: "Emily's Interview",
      time: "14:00 - 15:00",
      color: "bg-gradient-to-l from-violet-600 via-fuchsia-600 to-fuchsia-200",
    },
  ],
  18: [
    {
      title: "Simon's Interview",
      time: "09:00 - 10:00",
      color: "bg-gradient-to-l from-violet-600 via-fuchsia-600 to-fuchsia-200",
    },
  ],
  30: [
    {
      title: "Gabriel Interview",
      time: "08:30 - 17:00",
      color: "bg-gradient-to-l from-violet-600 via-fuchsia-600 to-fuchsia-200",
    },
  ],
};

export interface Lead {
  id: string;
  name: string;
  email: string;
  meetingDate: string;
  meetingTime: string;
  status: 'Converted' | 'No Show' | 'Not Converted' | 'Scheduled';
  phone?: string;
  source?: string;
  notes?: string;
}

export const leadsData: Lead[] = [
  {
    id: "#L001",
    name: "Leslie Alexander",
    email: "leslie.alexander@email.com",
    meetingDate: "Mar 26, 2025",
    meetingTime: "10:00 PM",
    status: "No Show",
    phone: "+1 (555) 123-4567",
    source: "Website Contact Form",
    notes: "Interested in scaling coaching business"
  },
  {
    id: "#L002",
    name: "Savannah Nguyen",
    email: "savannah.nguyen@email.com",
    meetingDate: "Mar 26, 2025",
    meetingTime: "10:00 PM",
    status: "Converted",
    phone: "+1 (555) 234-5678",
    source: "Social Media",
    notes: "New life coach, looking for automation"
  },
  {
    id: "#L003",
    name: "Kathryn Murphy",
    email: "kathryn.murphy@email.com",
    meetingDate: "Mar 26, 2025",
    meetingTime: "10:00 PM",
    status: "Scheduled",
    phone: "+1 (555) 345-6789",
    source: "Referral",
    notes: "Existing business, wants to improve client retention"
  },
  {
    id: "#L004",
    name: "Dianne Russell",
    email: "dianne.russell@email.com",
    meetingDate: "Mar 26, 2025",
    meetingTime: "10:00 PM",
    status: "Converted",
    phone: "+1 (555) 456-7890",
    source: "Google Ads",
    notes: "Health coach with 50+ clients"
  },
  {
    id: "#L005",
    name: "Annette Black",
    email: "annette.black@email.com",
    meetingDate: "Mar 26, 2025",
    meetingTime: "10:00 PM",
    status: "No Show",
    phone: "+1 (555) 567-8901",
    source: "LinkedIn",
    notes: "Business coach, expressed interest in lead generation"
  },
  {
    id: "#L006",
    name: "Kristin Watson",
    email: "kristin.watson@email.com",
    meetingDate: "Mar 26, 2025",
    meetingTime: "10:00 PM",
    status: "No Show",
    phone: "+1 (555) 678-9012",
    source: "Webinar",
    notes: "Career coach, interested in email automation"
  },
  {
    id: "#L007",
    name: "Matthew Wade",
    email: "matthew.wade@email.com",
    meetingDate: "Mar 26, 2025",
    meetingTime: "10:00 PM",
    status: "Converted",
    phone: "+1 (555) 789-0123",
    source: "Podcast",
    notes: "Executive coach with enterprise clients"
  },
  {
    id: "#L008",
    name: "Eleanor Pena",
    email: "eleanor.pena@email.com",
    meetingDate: "Mar 27, 2025",
    meetingTime: "2:00 PM",
    status: "Not Converted",
    phone: "+1 (555) 890-1234",
    source: "Website Contact Form",
    notes: "Relationship coach, wants content suggestions"
  },
  {
    id: "#L009",
    name: "Cameron Williamson",
    email: "cameron.williamson@email.com",
    meetingDate: "Mar 27, 2025",
    meetingTime: "3:30 PM",
    status: "No Show",
    phone: "+1 (555) 901-2345",
    source: "Social Media",
    notes: "Fitness coach, needs client check-in automation"
  },
  {
    id: "#L010",
    name: "Brooklyn Simmons",
    email: "brooklyn.simmons@email.com",
    meetingDate: "Mar 28, 2025",
    meetingTime: "11:00 AM",
    status: "Not Converted",
    phone: "+1 (555) 012-3456",
    source: "Referral",
    notes: "Wellness coach, exploring AI solutions"
  },
  {
    id: "#L011",
    name: "Theresa Webb",
    email: "theresa.webb@email.com",
    meetingDate: "Mar 28, 2025",
    meetingTime: "4:00 PM",
    status: "Converted",
    phone: "+1 (555) 123-0987",
    source: "Google Ads",
    notes: "Mindfulness coach, interested in analytics"
  },
  {
    id: "#L012",
    name: "Marvin McKinney",
    email: "marvin.mckinney@email.com",
    meetingDate: "Mar 29, 2025",
    meetingTime: "9:00 AM",
    status: "Not Converted",
    phone: "+1 (555) 234-1098",
    source: "LinkedIn",
    notes: "Performance coach for athletes"
  },
  {
    id: "#L013",
    name: "Jerome Bell",
    email: "jerome.bell@email.com",
    meetingDate: "Mar 29, 2025",
    meetingTime: "1:00 PM",
    status: "No Show",
    phone: "+1 (555) 345-2109",
    source: "Webinar",
    notes: "Leadership coach, wants CRM integration"
  },
  {
    id: "#L014",
    name: "Courtney Henry",
    email: "courtney.henry@email.com",
    meetingDate: "Mar 30, 2025",
    meetingTime: "10:30 AM",
    status: "Not Converted",
    phone: "+1 (555) 456-3210",
    source: "Podcast",
    notes: "Nutrition coach, needs lead qualification"
  },
  {
    id: "#L015",
    name: "Ralph Edwards",
    email: "ralph.edwards@email.com",
    meetingDate: "Mar 30, 2025",
    meetingTime: "3:00 PM",
    status: "No Show",
    phone: "+1 (555) 567-4321",
    source: "Website Contact Form",
    notes: "Business development coach"
  }
];

const leadColWidth = 100 / 5;
export const leadColumns: TableColumn<Lead>[] = [
  {
    key: 'name',
    header: 'Name',
    width: `${leadColWidth}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'email',
    header: 'Email',
    width: `${leadColWidth * 1.4}%`,
    render: (value: string) => tableRenderers.truncateText(value, 25)
  },
  {
    key: 'meetingDate',
    header: 'Meeting Date',
    width: `${leadColWidth * 0.9}%`,
    render: tableRenderers.dateText
  },
  {
    key: 'meetingTime',
    header: 'Time',
    width: `${leadColWidth * 0.6}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'status',
    header: 'Status',
    width: `${leadColWidth * 0.8}%`,
    render: (value: string) => {
      return tableRenderers.status(value);
    }
  }
];
