'use client';

import React, { useState, useEffect } from 'react';
import { Download, DollarSign, CreditCard, Users, Activity } from 'lucide-react';
import { transactionsAPI } from '@nlc-ai/api-client';
import {AlertBanner, Button } from '@nlc-ai/ui';
import {RevenueComparison, TopCoach, TransactionStats} from "@nlc-ai/types";
import { StatCard } from '@nlc-ai/shared';

export const TransactionAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [revenueComparison, setRevenueComparison] = useState<RevenueComparison | null>(null);
  const [topCoaches, setTopCoaches] = useState<TopCoach[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (() => fetchAnalyticsData())();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [statsData, revenueData, topCoachesData] = await Promise.all([
        transactionsAPI.getTransactionStats(),
        transactionsAPI.getMonthlyRevenueComparison(),
        transactionsAPI.getTopPayingCoaches(5),
      ]);

      setStats(statsData);
      setRevenueComparison(revenueData);
      setTopCoaches(topCoachesData);
    } catch (error: any) {
      setError(error.message || 'Failed to load transactions data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkExport = async () => {
    try {
      await transactionsAPI.bulkExportTransactions();
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

  /*if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-lg border border-neutral-700 p-6 animate-pulse">
            <div className="h-4 bg-neutral-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-neutral-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
        <p className="text-red-400">{error}</p>
        <Button onClick={fetchAnalyticsData} className="mt-2" variant="outline">
          Retry
        </Button>
      </div>
    );
  }*/

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
          isLoading={isLoading}
        />

        <StatCard
          title={'Total Transactions'}
          value={stats?.total.toLocaleString() || 0}
          icon={CreditCard}
          iconBgColor={'bg-blue-500/20'}
          iconTextColor={'text-blue-400'}
          isLoading={isLoading}
        />

        <StatCard
          title={'Completed'}
          value={stats?.completed.toLocaleString() || 0}
          icon={Activity}
          iconBgColor={'bg-green-500/20'}
          iconTextColor={'text-green-400'}
          subtitle={`Success Rate: ${stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`}
          isLoading={isLoading}
        />

        <StatCard
          title={'Pending/Failed'}
          value={stats ? (stats.pending + stats.failed).toLocaleString() : 0}
          icon={Users}
          iconBgColor={'bg-orange-500/20'}
          iconTextColor={'text-orange-400'}
          subtitle={
            <div className="mt-4 space-y-1">
              <div className="text-xs text-stone-400">
                Pending: {stats?.pending.toLocaleString()}
              </div>
              <div className="text-xs text-stone-400">
                Failed: {stats?.failed.toLocaleString()}
              </div>
            </div>
          }
          isLoading={isLoading}
        />
      </div>

      {/* Top Coaches and Export */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-lg border border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-semibold">Top Paying Coaches</h3>
            <div className="text-sm text-stone-400">
              Last 30 days
            </div>
          </div>

          {topCoaches.length > 0 ? (
            <div className="space-y-4">
              {topCoaches.map((coach, index) => (
                <div key={coach.coachID} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{coach.coachName}</p>
                      <p className="text-stone-400 text-sm">{coach.coachEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatCurrency(coach.totalAmount)}</p>
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

        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-lg border border-neutral-700 p-6">
          <h3 className="text-white text-lg font-semibold mb-6">Export Data</h3>

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
        </div>
      </div>
    </div>
  );
};
