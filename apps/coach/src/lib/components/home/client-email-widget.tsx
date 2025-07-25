'use client'

import { useState, useEffect, FC } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Zap,
  TrendingUp
} from 'lucide-react';
import { aiAgentsAPI } from '@nlc-ai/api-client';
import { ClientEmailStats, ClientEmailThread } from '@nlc-ai/types';

interface IProps {
  className?: string;
}

export const ClientEmailWidget: FC<IProps> = ({ className = '' }) => {
  const router = useRouter();
  const [stats, setStats] = useState<ClientEmailStats | null>(null);
  const [recentThreads, setRecentThreads] = useState<ClientEmailThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [statsData, threadsData] = await Promise.all([
        aiAgentsAPI.getClientEmailStats(),
        aiAgentsAPI.getClientEmailThreads(3, 'active')
      ]);

      setStats(statsData);
      setRecentThreads(threadsData);
    } catch (err: any) {
      setError('Failed to load email data');
      console.error('Error loading client email data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await aiAgentsAPI.syncClientEmails();
      await loadData(); // Refresh data after sync
    } catch (err: any) {
      setError('Failed to sync emails');
      console.error('Error syncing emails:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewAll = () => {
    router.push('/clients/emails');
  };

  const handleViewThread = (threadID: string) => {
    router.push(`/clients/emails/${threadID}`);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className={`relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden ${className}`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-blue-200 via-blue-600 to-violet-600 rounded-full blur-[112px]" />
        </div>

        <div className="relative z-10 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-neutral-700 rounded-xl"></div>
            <div>
              <div className="h-6 bg-neutral-700 rounded w-40 mb-2"></div>
              <div className="h-4 bg-neutral-700 rounded w-60"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-neutral-700 rounded w-16"></div>
                <div className="h-6 bg-neutral-700 rounded w-12"></div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden ${className}`}>
      {/* Background glow orb */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-blue-200 via-blue-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Client Email Agent</h3>
              <p className="text-stone-400 text-sm">
                AI-powered client email responses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="p-2 border border-neutral-700 text-stone-300 hover:text-white hover:border-blue-500 transition-colors rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleViewAll}
              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-1">
              <div className="text-stone-300 text-sm">Pending Responses</div>
              <div className="flex items-center gap-2">
                <span className="text-white text-xl font-semibold">{stats.pendingResponses}</span>
                {stats.pendingResponses > 0 && (
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm">Today</div>
              <div className="flex items-center gap-2">
                <span className="text-white text-xl font-semibold">{stats.emailsProcessedToday}</span>
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm">This Week</div>
              <div className="flex items-center gap-2">
                <span className="text-white text-xl font-semibold">{stats.emailsProcessedThisWeek}</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm">Avg Response</div>
              <div className="flex items-center gap-2">
                <span className="text-white text-xl font-semibold">{stats.averageResponseTime}m</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Last Sync Status */}
        <div className="flex items-center justify-between mb-4 p-3 bg-neutral-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-stone-300 text-sm">Last sync:</span>
            <span className="text-white text-sm">{formatLastSync(stats?.lastSyncAt || null)}</span>
          </div>

          {stats && stats.clientEmailsFound > 0 && (
            <div className="text-stone-400 text-sm">
              {stats.clientEmailsFound} client emails found
            </div>
          )}
        </div>

        {/* Recent Threads */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium text-sm">Recent Activity</h4>
            {recentThreads.length > 0 && (
              <span className="text-stone-400 text-xs">{recentThreads.length} active threads</span>
            )}
          </div>

          {recentThreads.length > 0 ? (
            <div className="space-y-2">
              {recentThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => handleViewThread(thread.id)}
                  className="p-3 bg-neutral-800/30 border border-neutral-700/50 rounded-lg hover:border-blue-500/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium truncate">
                          {thread.client.firstName} {thread.client.lastName}
                        </span>

                        {thread.hasPendingResponse && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded-full">
                            <AlertCircle className="w-3 h-3 text-orange-400" />
                            <span className="text-orange-400 text-xs font-medium">Pending</span>
                          </div>
                        )}

                        {!thread.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>

                      <div className="text-stone-400 text-xs truncate">
                        {thread.subject}
                      </div>
                    </div>

                    <div className="text-stone-500 text-xs text-right ml-2">
                      {formatLastSync(thread.lastMessageAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Mail className="w-8 h-8 text-stone-500 mx-auto mb-2" />
              <p className="text-stone-400 text-sm">No recent client emails</p>
              <p className="text-stone-500 text-xs">Client emails will appear here when received</p>
            </div>
          )}
        </div>

        {/* Action prompt for pending responses */}
        {stats && stats.pendingResponses > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">
                  {stats.pendingResponses} response{stats.pendingResponses > 1 ? 's' : ''} awaiting approval
                </span>
              </div>

              <button
                onClick={handleViewAll}
                className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
              >
                Review →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
