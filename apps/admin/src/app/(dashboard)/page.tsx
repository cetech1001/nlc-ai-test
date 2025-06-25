"use client"

import {
  DashboardLayout,
  PageHeader,
  MetricCard,
  Button, DataTable, DataTableColumn
} from "@nlc-ai/ui";
import {
  Users,
  Building,
  DollarSign,
  Activity,
  Settings,
  Shield,
  BarChart3
} from "lucide-react"

const adminNavItems = [
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics", active: true },
  { icon: Users, label: "Coaches", href: "/admin/coaches" },
  { icon: Building, label: "Organizations", href: "/admin/organizations" },
  { icon: DollarSign, label: "Billing", href: "/admin/billing" },
  { icon: Activity, label: "System Health", href: "/admin/health" },
  { icon: Shield, label: "Security", href: "/admin/security" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

const columns: DataTableColumn<{ userId: string; name: string; }>[] = [
  { key: 'userId', header: 'User ID' },
  { key: 'name', header: 'Name' },
];

const data = [
  {
    userId: '2903',
    name: 'James Willock',
  }
]

export default function AdminDashboardPage() {
  const adminUser = {
    name: "Admin User",
    email: "admin@platform.com",
    role: "Super Admin",
  }

  return (
    <DashboardLayout
      user={adminUser}
      navItems={adminNavItems}
      onNavigate={(href) => console.log("Navigate to:", href)}
      onLogout={() => console.log("Admin logout")}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Platform Analytics"
          description="Monitor platform performance and user activity"
          actions={
            <Button>
              Export Report
            </Button>
          }
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Coaches"
            value={156}
            change={{ value: 8, type: "increase", period: "last month" }}
            icon={Users}
          />
          <MetricCard
            title="Active Sessions"
            value={1240}
            change={{ value: 15, type: "increase", period: "last week" }}
            icon={Activity}
          />
          <MetricCard
            title="Monthly Revenue"
            value="$24,500"
            change={{ value: 12, type: "increase", period: "last month" }}
            icon={DollarSign}
          />
          <MetricCard
            title="Platform Uptime"
            value="99.9%"
            change={{ value: 0, type: "neutral", period: "last month" }}
            icon={Shield}
          />
        </div>

        <div className={"mt-8"}>
          <DataTable columns={columns} data={data}></DataTable>
        </div>
      </div>
    </DashboardLayout>
  )
}
