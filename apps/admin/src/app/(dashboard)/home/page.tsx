'use client'

import { StatCard } from "@/app/(dashboard)/home/components/stat-card";
import { DataTable, TableAction } from "@nlc-ai/shared";
import { useRouter } from "next/navigation";
import { RevenueGraph } from "@/app/(dashboard)/home/components/revenue-graph";
import { useEffect, useState } from "react";
import { HomePageSkeleton } from "@/lib/skeletons/home-page.skeleton";
import { dashboardAPI } from "@nlc-ai/api-client";
import {coachColumns} from "@/lib/utils/coaches";
import {DashboardData, RecentCoach} from "@nlc-ai/types";

const transformCoachData = (coaches: RecentCoach[]) => {
  return coaches.map(coach => ({
    id: `#${coach.id.slice(-4)}`,
    name: coach.name,
    email: coach.email,
    dateJoined: coach.dateJoined,
    plan: coach.plan,
    status: coach.status === 'active' ? 'Active' : coach.status === 'inactive' ? 'Inactive' : 'Blocked',
  }));
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await dashboardAPI.getDashboardData();
      setDashboardData(data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowAction = (action: string, coach: any) => {
    if (action === 'payment') {
      router.push('/coaches/make-payment');
    } else if (action === 'view') {
      console.log('Viewing coach:', coach.name);
    }
  };

  const actions: TableAction[] = [
    {
      label: 'Make Payment',
      action: 'payment',
      variant: 'primary',
    }
  ];

  if (error) {
    return (
      <div className="py-4 sm:py-6 lg:py-8 space-y-6">
        <div className="bg-red-800/20 border border-red-600 rounded-lg p-6 text-center">
          <h2 className="text-red-400 text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !dashboardData) {
    return <HomePageSkeleton length={coachColumns.length} />;
  }

  const { stats, revenueData, recentCoaches } = dashboardData;
  const transformedCoaches = transformCoachData(recentCoaches);

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        <div className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 top-52 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="absolute w-64 h-64 right-40 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <RevenueGraph revenueData={revenueData.yearly} />
        </div>

        <div className="w-full xl:w-1/3 grid grid-cols-2 gap-4 lg:gap-6">
          <StatCard
            title="Total Coaches"
            value={stats.totalCoaches.toLocaleString()}
            subtitle={stats.totalCoachesGrowth > 0 ? `+${stats.totalCoachesGrowth.toFixed(1)}%` : undefined}
            growth={stats.totalCoachesGrowth}
          />
          <StatCard
            title="All Time Revenue"
            value={`$${stats.allTimeRevenue.toLocaleString()}`}
            subtitle={stats.allTimeRevenueGrowth > 0 ? `+${stats.allTimeRevenueGrowth.toFixed(1)}%` : undefined}
            growth={stats.allTimeRevenueGrowth}
          />
          <StatCard
            title="Inactive Coaches"
            value={stats.inactiveCoaches.toLocaleString()}
            subtitle={stats.inactiveCoachesGrowth < 0 ? `-${stats.inactiveCoachesGrowth.toFixed(1)}%` : undefined}
            growth={stats.inactiveCoachesGrowth * -1}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            subtitle={stats.monthlyRevenueGrowth > 0 ? `+${stats.monthlyRevenueGrowth.toFixed(1)}%` : undefined}
            growth={stats.monthlyRevenueGrowth}
          />
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-stone-50 text-xl sm:text-2xl font-semibold leading-relaxed">
            Recently Joined Coaches
          </h2>
          <button
            onClick={() => router.push('/coaches')}
            className="text-fuchsia-400 text-sm font-bold hover:text-fuchsia-300 transition-colors self-start sm:self-auto"
          >
            View All
          </button>
        </div>

        {transformedCoaches.length === 0 ? (
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 text-center">
            <div className="text-stone-400 text-lg mb-2">No coaches found</div>
            <p className="text-stone-500 text-sm">New coaches will appear here when they join</p>
          </div>
        ) : (
          <DataTable
            columns={coachColumns}
            data={transformedCoaches}
            onRowAction={handleRowAction}
            actions={actions}
            showMobileCards={true}
            emptyMessage="No coaches found"
          />
        )}
      </div>
    </div>
  );
}
