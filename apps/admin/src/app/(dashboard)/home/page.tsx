'use client'

import { RevenueGraph, StatCard } from "@nlc-ai/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {coachesAPI, transactionsAPI} from "@nlc-ai/api-client";
import {HomePageSkeleton, CoachesTable} from "@/lib";
import { AlertBanner } from "@nlc-ai/ui";
import {CoachStats, CoachWithStatus, RevenueStats, TimePeriodRevenueData} from "@nlc-ai/types";

const AdminHome = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  const [revenueData, setRevenueData] = useState<TimePeriodRevenueData>();
  const [coachStats, setCoachStats] = useState<CoachStats>();
  const [revenueStats, setRevenueStats] = useState<RevenueStats>();
  const [recentCoaches, setRecentCoaches] = useState<CoachWithStatus[]>([]);

  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    (() => fetchDashboardData())();
  }, []);



  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [
        coachStatsData,
        revenueStatsData,
        weeklyData,
        monthlyData,
        yearlyData,
        coachesData
      ] = await Promise.all([
        coachesAPI.getCoachStats(),
        transactionsAPI.getRevenueStats(),
        transactionsAPI.getRevenueByPeriod('week'),
        transactionsAPI.getRevenueByPeriod('month'),
        transactionsAPI.getRevenueByPeriod('year'),
        coachesAPI.getCoaches(1, 6),
      ]);

      setCoachStats(coachStatsData);
      setRevenueStats(revenueStatsData);
      setRevenueData({
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData
      });
      setRecentCoaches(coachesData.data);
    } catch (error: any) {
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakePayment = (coachID: string) => {
    router.push(`/coaches/make-payment?coachID=${coachID}`);
  }

  const handleActionSuccess = async (message: string) => {
    setSuccessMessage(message);
    const recentCoaches = await coachesAPI.getCoaches(1, 6);
    setRecentCoaches(recentCoaches.data);
    setTimeout(() => setSuccessMessage(""), 3000);
  }

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

  if (isLoading || !revenueData || !revenueStats || !coachStats) {
    return <HomePageSkeleton length={7} />;
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        <div className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 top-52 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="absolute w-64 h-64 right-40 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <RevenueGraph revenueData={revenueData} isLoading={isLoading} />
        </div>

        <div className="w-full xl:w-1/3 grid grid-cols-2 gap-4 lg:gap-6">
          <StatCard
            title="Total Coaches"
            value={coachStats.totalCoaches.toLocaleString()}
            growth={coachStats.totalCoachesGrowth}
          />
          <StatCard
            title="All Time Revenue"
            value={`$${revenueStats.allTimeRevenue.toLocaleString()}`}
            growth={revenueStats.allTimeRevenueGrowth}
          />
          <StatCard
            title="Inactive Coaches"
            value={coachStats.inactiveCoaches.toLocaleString()}
            growth={coachStats.inactiveCoachesGrowth * -1}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${revenueStats.monthlyRevenue.toLocaleString()}`}
            growth={revenueStats.monthlyRevenueGrowth}
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

        {recentCoaches.length === 0 ? (
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 text-center">
            <div className="text-stone-400 text-lg mb-2">No coaches found</div>
            <p className="text-stone-500 text-sm">New coaches will appear here when they join</p>
          </div>
        ) : (
          <CoachesTable
            coaches={recentCoaches}
            handleRouteClick={handleMakePayment}
            handleActionSuccess={handleActionSuccess}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
}

export default AdminHome;
