'use client'

import { RevenueGraph, StatCard } from "@nlc-ai/web-shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertBanner } from "@nlc-ai/web-ui";
import { AdminDashboardData } from "@nlc-ai/sdk-analytics";
import {RecentCoachesTable, sdkClient} from "@/lib";

const AdminHome = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    (() => fetchDashboardData())();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await sdkClient.analytics.admin.getDashboardData();
      setDashboardData(data);
    } catch (error: any) {
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (coachID: string) => {
    router.push(`/coaches/${coachID}`);
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      {error && (
        <AlertBanner
          type={'error'}
          message={error}
          onDismiss={() => setError('')}
        />
      )}

      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        <div className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 top-52 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="absolute w-64 h-64 right-40 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <RevenueGraph
            revenueData={dashboardData?.revenueData}
            isLoading={isLoading}
          />
        </div>

        <div className="w-full xl:w-1/3 grid grid-cols-2 gap-4 lg:gap-6">
          <StatCard
            title="Total Coaches"
            value={dashboardData?.totalCoaches.toLocaleString()}
            growth={dashboardData?.totalCoachesGrowth}
            isLoading={isLoading}
          />
          <StatCard
            title="All Time Revenue"
            value={dashboardData?.allTimeRevenue.toLocaleString()}
            growth={dashboardData?.allTimeRevenueGrowth}
            isLoading={isLoading}
          />
          <StatCard
            title="Inactive Coaches"
            value={dashboardData?.inactiveCoaches.toLocaleString()}
            growth={dashboardData ? (dashboardData.inactiveCoachesGrowth * -1) : undefined}
            isLoading={isLoading}
          />
          <StatCard
            title="Monthly Revenue"
            value={dashboardData?.monthlyRevenue.toLocaleString()}
            growth={dashboardData?.monthlyRevenueGrowth}
            isLoading={isLoading}
          />
        </div>
      </div>

      {successMessage && (
        <AlertBanner
          type={'success'}
          message={successMessage}
          onDismiss={() => setSuccessMessage('')}
        />
      )}

      <div className="relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-stone-50 text-xl sm:text-2xl font-semibold leading-relaxed">
              Recently Joined Coaches
            </h2>
          </div>
          <div>
            <button
              onClick={() => router.push('/coaches')}
              className="text-fuchsia-400 text-sm font-bold hover:text-fuchsia-300 transition-colors self-start sm:self-auto"
            >
              View All
            </button>
          </div>
        </div>

        <RecentCoachesTable
          coaches={dashboardData?.recentCoaches || []}
          handleRouteClick={handleViewDetails}
          emptyMessage={"No coaches found"}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default AdminHome;
