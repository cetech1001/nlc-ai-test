'use client';

import React, { useState, useEffect } from 'react';
import { Download, DollarSign, CreditCard, Users, Activity } from 'lucide-react';
import { transactionsAPI } from '@nlc-ai/web-api-client';
import {AlertBanner, Button } from '@nlc-ai/web-ui';
import {RevenueComparison, TopCoach, TransactionStats} from "@nlc-ai/types";
import { StatCard } from '@nlc-ai/web-shared';

export const TransactionAnalytics: React.FC = () => {
  // Separate loading states for each section
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isRevenueComparisonLoading, setIsRevenueComparisonLoading] = useState(true);
  const [isTopCoachesLoading, setIsTopCoachesLoading] = useState(true);

  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [revenueComparison, setRevenueComparison] = useState<RevenueComparison | null>(null);
  const [topCoaches, setTopCoaches] = useState<TopCoach[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (() => fetchAnalyticsData())();
  }, []);

  const fetchTransactionStats = async () => {
    try {
      setIsStatsLoading(true);
      const statsData = await transactionsAPI.getTransactionStats();
      setStats(statsData);
    } catch (e) {
      throw e;
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchRevenueComparison = async () => {
    try {
      setIsRevenueComparisonLoading(true);
      const revenueData = await transactionsAPI.getMonthlyRevenueComparison();
      setRevenueComparison(revenueData);
    } catch (e) {
      throw e;
    } finally {
      setIsRevenueComparisonLoading(false);
    }
  };

  const fetchTopCoaches = async () => {
    try {
      setIsTopCoachesLoading(true);
      const topCoachesData = await transactionsAPI.getTopPayingCoaches(5);
      setTopCoaches(topCoachesData);
    } catch (e) {
      throw e;
    } finally {
      setIsTopCoachesLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setError("");

      await Promise.all([
        fetchTransactionStats(),
        fetchRevenueComparison(),
        fetchTopCoaches(),
      ]);
    } catch (error: any) {
      setError(error.message || 'Failed to load transactions data');
    }
  };

  const handleBulkExport = async () => {
    try {
      // Create a temporary link to download the bulk export
      const link = document.createElement('a');
      link.href = `${process.env.NEXT_PUBLIC_API_URL}/transactions/export/bulk`;
      link.download = `transactions-export-${new Date().toISOString().split('T')[0]}.json`;

      // Add the link to the DOM and click it
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
    } catch (error: any) {
      setError(error.message || 'Failed to export transactions');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {error && (
        <AlertBanner type={'error'} message={error} onDismiss={() => setError('')}/>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={'Total Revenue'}
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          iconBgColor={'bg-green-500/20'}
          iconTextColor={'text-green-400'}
          growth={revenueComparison?.percentageChange || 0}
          subtitle={'vs last month'}
          isLoading={isStatsLoading || isRevenueComparisonLoading}
        />

        <StatCard
          title={'Total Transactions'}
          value={stats?.total.toLocaleString() || 0}
          icon={CreditCard}
          iconBgColor={'bg-blue-500/20'}
          iconTextColor={'text-blue-400'}
          subtitle="&nbsp;"
          isLoading={isStatsLoading}
        />

        <StatCard
          title={'Completed'}
          value={stats?.completed.toLocaleString() || 0}
          icon={Activity}
          iconBgColor={'bg-green-500/20'}
          iconTextColor={'text-green-400'}
          subtitle={`Success Rate: ${stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`}
          isLoading={isStatsLoading}
        />

        <StatCard
          title={'Pending/Failed'}
          value={stats ? (stats.pending + stats.failed).toLocaleString() : 0}
          icon={Users}
          iconBgColor={'bg-orange-500/20'}
          iconTextColor={'text-orange-400'}
          subtitle={
            <div className="mb-4">
              <div className="text-xs text-stone-400 leading-tight">
                Pending: {stats?.pending.toLocaleString()}
              </div>
              <div className="text-xs text-stone-400 leading-tight">
                Failed: {stats?.failed.toLocaleString()}
              </div>
            </div>
          }
          isLoading={isStatsLoading}
        />
      </div>

      {/* Top Coaches and Export */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Coaches Card */}
        <div className="lg:col-span-2 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-stone-50 text-lg font-semibold">Top Paying Coaches</h3>
              <div className="text-sm text-stone-400">
                Last 30 days
              </div>
            </div>

            {isTopCoachesLoading ? (
              <TopCoachesSkeleton />
            ) : topCoaches.length > 0 ? (
              <div className="space-y-4">
                {topCoaches.map((coach, index) => (
                  <div key={coach.coachID} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-stone-50 font-medium">{coach.coachName}</p>
                        <p className="text-stone-400 text-sm">{coach.coachEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-stone-50 font-semibold">{formatCurrency(coach.totalAmount)}</p>
                      <p className="text-stone-400 text-sm">{coach.transactionCount} transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400">
                No transaction data available
              </div>
            )}
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 -top-20 opacity-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />

          <div className="relative z-10">
            <h3 className="text-stone-50 text-lg font-semibold mb-6">Export Data</h3>

            {isStatsLoading ? (
              <ExportDataSkeleton />
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleBulkExport}
                  className="w-full bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Transactions
                </Button>

                <div className="text-sm text-stone-400 space-y-2">
                  <p>• Export includes all transaction details</p>
                  <p>• Coach and plan information included</p>
                  <p>• JSON format for easy processing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExportDataSkeleton = () => (
  <div className="space-y-4">
    <div className="w-full h-10 bg-neutral-700 rounded-lg animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-3 bg-neutral-700 rounded w-full animate-pulse"></div>
      <div className="h-3 bg-neutral-700 rounded w-4/5 animate-pulse"></div>
      <div className="h-3 bg-neutral-700 rounded w-3/4 animate-pulse"></div>
    </div>
  </div>
);

const TopCoachesSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg backdrop-blur-sm animate-pulse">
        <div className="flex items-center gap-4">
          <div className="bg-neutral-700 rounded-full w-8 h-8"></div>
          <div>
            <div className="h-4 bg-neutral-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-neutral-700 rounded w-40"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-4 bg-neutral-700 rounded w-20 mb-2"></div>
          <div className="h-3 bg-neutral-700 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);
