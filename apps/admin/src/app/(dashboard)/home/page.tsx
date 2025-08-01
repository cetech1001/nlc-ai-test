'use client'

import { RevenueGraph, StatCard } from "@nlc-ai/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {toast} from 'sonner';
import {coachesAPI, transactionsAPI} from "@nlc-ai/api-client";
import { AlertBanner } from "@nlc-ai/ui";
import {CoachStats, CoachWithStatus, RevenueStats, TimePeriodRevenueData} from "@nlc-ai/types";
import {CoachesTable} from "@/lib";

const AdminHome = () => {
  const router = useRouter();

  const [isRevenueDataLoading, setIsRevenueDataLoading] = useState(true);
  const [isRevenueStatsLoading, setIsRevenueStatsLoading] = useState(true);
  const [isCoachStatsLoading, setIsCoachStatsLoading] = useState(true);
  const [isRecentCoachesLoading, setIsRecentCoachesLoading] = useState(true);

  const [revenueData, setRevenueData] = useState<TimePeriodRevenueData>();
  const [coachStats, setCoachStats] = useState<CoachStats>();
  const [revenueStats, setRevenueStats] = useState<RevenueStats>();
  const [recentCoaches, setRecentCoaches] = useState<CoachWithStatus[]>([]);

  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    (() => fetchDashboardData())();
  }, []);

  const fetchCoachStats = async () => {
    try {
      setIsCoachStatsLoading(true);

      const coachStatsData = await coachesAPI.getCoachStats();
      setCoachStats(coachStatsData);
    } catch (e) {
      throw e;
    } finally {
      setIsCoachStatsLoading(false);
    }
  }

  const fetchRevenueStats = async () => {
    try {
      setIsRevenueStatsLoading(true);

      const revenueStatsData = await transactionsAPI.getRevenueStats();
      setRevenueStats(revenueStatsData);
    } catch (e) {
      throw e;
    } finally {
      setIsRevenueStatsLoading(false);
    }
  }

  const fetchRevenueData = async () => {
    try {
      setIsRevenueDataLoading(true);

      const [
        weeklyData,
        monthlyData,
        yearlyData,
      ] = await Promise.all([
        transactionsAPI.getRevenueByPeriod('week'),
        transactionsAPI.getRevenueByPeriod('month'),
        transactionsAPI.getRevenueByPeriod('year'),
      ]);

      setRevenueData({
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData
      });
    } catch (e) {
      throw e;
    } finally {
      setIsRevenueDataLoading(false);
    }
  }

  const fetchRecentCoaches = async () => {
    try {
      setIsRecentCoachesLoading(true);

      const recentCoachesData = await coachesAPI.getCoaches(1, 6);
      setRecentCoaches(recentCoachesData.data);
    } catch (e) {
      throw e;
    } finally {
      setIsRecentCoachesLoading(false);
    }
  }

  const fetchDashboardData = async () => {
    try {
      setError("");

      await Promise.all([
        fetchRecentCoaches(),
        fetchRevenueData(),
        fetchCoachStats(),
        fetchRevenueStats(),
      ]);
    } catch (error: any) {
      setError(error.message || "Failed to load dashboard data");
      toast.error(error.message || "Failed to load dashboard data");
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
          <RevenueGraph revenueData={revenueData} isLoading={isRevenueDataLoading || !revenueData} />
        </div>

        <div className="w-full xl:w-1/3 grid grid-cols-2 gap-4 lg:gap-6">
          <StatCard
            title="Total Coaches"
            value={coachStats?.totalCoaches.toLocaleString()}
            growth={coachStats?.totalCoachesGrowth}
            isLoading={isCoachStatsLoading || !coachStats}
          />
          <StatCard
            title="All Time Revenue"
            value={`$${revenueStats?.allTimeRevenue.toLocaleString()}`}
            growth={revenueStats?.allTimeRevenueGrowth}
            isLoading={isRevenueStatsLoading || !revenueStats}
          />
          <StatCard
            title="Inactive Coaches"
            value={coachStats?.inactiveCoaches.toLocaleString()}
            growth={(coachStats?.inactiveCoachesGrowth || 0) * -1}
            isLoading={isCoachStatsLoading || !coachStats}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${revenueStats?.monthlyRevenue.toLocaleString()}`}
            growth={revenueStats?.monthlyRevenueGrowth}
            isLoading={isRevenueStatsLoading || !revenueStats}
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

        <CoachesTable
          coaches={recentCoaches}
          handleRouteClick={handleMakePayment}
          handleActionSuccess={handleActionSuccess}
          setError={setError}
          emptyMessage={"No coaches found"}
          isLoading={isRecentCoachesLoading || !recentCoaches}
        />
      </div>
    </div>
  );
}

export default AdminHome;
