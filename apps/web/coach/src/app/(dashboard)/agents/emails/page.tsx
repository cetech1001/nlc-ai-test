'use client'

import React, { useState, useEffect, FC } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, RefreshCw, Mail, User, Clock, MessageSquare, AlertTriangle, CheckCircle2, Star, ArrowRight,
  AlertCircle
} from "lucide-react";
import {
  Pagination,
  PageHeader,
  DataFilter,
  MobilePagination,
} from "@nlc-ai/web-shared";
import { AlertBanner, Button, Skeleton } from '@nlc-ai/web-ui';
import { FilterValues } from "@nlc-ai/types";
import { emailFilters, emptyEmailFilterValues } from "@/lib/components/emails/filters";
import { sdkClient } from "@/lib";
import type { ClientEmailThread } from '@nlc-ai/sdk-email';

interface EmailThreadCardProps {
  thread: ClientEmailThread;
  onClick: () => void;
}

const EmailThreadCard: FC<EmailThreadCardProps> = ({ thread, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'archived': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'closed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'normal': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'normal': return <Clock className="w-3 h-3" />;
      case 'low': return <CheckCircle2 className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
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

  const hasGeneratedResponse = thread.generatedResponses && thread.generatedResponses.length > 0;

  return (
    <div
      onClick={onClick}
      className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-fuchsia-400" />
                <h3 className="text-stone-50 text-lg font-semibold leading-tight truncate">
                  {thread.participantName || 'Unknown Client'}
                </h3>
              </div>

              {!thread.isRead && (
                <div className="w-2 h-2 bg-fuchsia-400 rounded-full flex-shrink-0" />
              )}
            </div>

            <div className="text-stone-300 text-sm mb-2 truncate">
              {thread.subject}
            </div>

            <div className="text-stone-400 text-xs mb-2">
              {thread.participantEmail}
            </div>

            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(thread.status)}`}>
                <span className="capitalize">{thread.status}</span>
              </div>

              <div className={`flex items-center gap-1 ${getPriorityColor(thread.priority)}`}>
                {getPriorityIcon(thread.priority)}
                <span className="text-xs capitalize">{thread.priority}</span>
              </div>
            </div>
          </div>

          <div className="text-stone-400 text-xs text-right ml-4 flex-shrink-0">
            <div>{formatTimeAgo(thread.lastMessageAt)}</div>
            <div className="mt-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {thread.messageCount}
            </div>
          </div>
        </div>

        {/* Latest Message Preview */}
        <div className="text-stone-300 text-sm leading-relaxed line-clamp-2 mb-4 rounded-lg">
          {thread.lastMessagePreview}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span>From: {thread.lastMessageFrom}</span>
          </div>

          <div className="flex items-center gap-2">
            {hasGeneratedResponse ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs">
                <Star className="w-3 h-3" />
                <span>AI Response Ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-stone-500 text-xs">
                <span>No response yet</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] p-6">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
        </div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Skeleton className="h-5 bg-neutral-700 rounded w-48 mb-2"></Skeleton>
            <Skeleton className="h-4 bg-neutral-700 rounded w-64 mb-2"></Skeleton>
            <Skeleton className="h-3 bg-neutral-700 rounded w-40"></Skeleton>
          </div>
          <Skeleton className="h-4 bg-neutral-700 rounded w-16"></Skeleton>
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3 bg-neutral-700 rounded w-full"></Skeleton>
          <Skeleton className="h-3 bg-neutral-700 rounded w-3/4"></Skeleton>
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 bg-neutral-700 rounded w-32"></Skeleton>
          <Skeleton className="h-3 bg-neutral-700 rounded w-24"></Skeleton>
        </div>
      </div>
    ))}
  </div>
);

const ClientEmailsList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientID = searchParams.get('clientID');

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [accountExists, setAccountExists] = useState(true);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyEmailFilterValues);
  const [threads, setThreads] = useState<ClientEmailThread[]>([]);
  const [stats, setStats] = useState({
    unreadThreads: 0,
    totalThreads: 0,
    activeThreads: 0,
    pendingResponses: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const threadsPerPage = 10;

  useEffect(() => {
    sdkClient.email.accounts.hasAnAccount()
      .then((data) => {
        setAccountExists(data.exists);
        if (data.exists) {
          return loadData();
        }
        return null;
      })
      .catch(() => {
        setAccountExists(false);
      });
  }, [currentPage, searchQuery, filterValues, clientID]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params: any = {
        limit: threadsPerPage,
        search: searchQuery || undefined,
        clientID: clientID || undefined,
      };

      if (filterValues.status) params.status = filterValues.status;
      if (filterValues.isRead !== '') params.isRead = filterValues.isRead === 'true';
      if (filterValues.priority) params.priority = filterValues.priority;

      const [threadsData, statsData] = await Promise.all([
        sdkClient.email.threads.getEmailThreads(params),
        sdkClient.email.sync.getSyncStats()
      ]);

      setThreads(threadsData);

      const totalPages = Math.ceil(threadsData.length / threadsPerPage);
      setPagination({
        page: currentPage,
        limit: threadsPerPage,
        total: threadsData.length,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      });

      setStats({
        pendingResponses: threadsData.filter(t =>
          t.generatedResponses && t.generatedResponses.length > 0
        ).length,
        unreadThreads: statsData?.unreadThreads || 0,
        totalThreads: statsData?.totalThreadsToday || 0,
        activeThreads: threadsData.filter(t => t.status === 'active').length,
      });

    } catch (err: any) {
      setError('Failed to load email threads');
      console.error('Error loading threads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setError("");

      await sdkClient.email.sync.syncAllAccounts();

      setTimeout(() => {
        loadData();
      }, 2000);

      setSuccessMessage(`Sync started! Refresh to see results.`);
    } catch (err: any) {
      setError('Failed to sync emails: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleThreadClick = (threadID: string) => {
    router.push(`/agents/emails/${threadID}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterValues(emptyEmailFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const paginatedThreads = threads.slice(
    (currentPage - 1) * threadsPerPage,
    currentPage * threadsPerPage
  );

  return (
    <div className={`flex flex-col ${isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]'} px-4`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type="success" message={successMessage} onDismiss={clearMessages} />
        )}

        {error && (
          <AlertBanner type="error" message={error} onDismiss={clearMessages} />
        )}

        {!accountExists && (
          <div className="mb-4 p-4 bg-yellow-800/20 border border-yellow-600 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-400 text-sm font-medium">No connected email accounts</p>
              <p className="text-yellow-300 text-xs">Connect an email account to automate your email workflow.</p>
            </div>
            <Button
              onClick={() => router.push('/settings/account?tab=integrations')}
              className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer text-white text-sm px-3 py-1.5"
            >
              Configure
            </Button>
          </div>
        )}

        <PageHeader
          title={"Client Email Agent"}
          actionButton={{
            label: isSyncing ? 'Syncing...' : 'Sync Emails',
            onClick: handleSync,
            icon: <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />,
          }}
        >
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search threads by client, subject..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <DataFilter
              filters={emailFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />

            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors hidden sm:flex"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Emails'}
            </Button>
          </>
        </PageHeader>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 overflow-hidden">
              <div className="absolute w-16 h-16 -left-3 -top-3 opacity-30 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[28px]" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-stone-300 text-sm">Total Threads</div>
                  <div className="text-white text-2xl font-bold">{stats.totalThreads}</div>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 overflow-hidden">
              <div className="absolute w-16 h-16 -left-3 -top-3 opacity-30 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[28px]" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-fuchsia-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-fuchsia-400" />
                </div>
                <div>
                  <div className="text-stone-300 text-sm">Unread</div>
                  <div className="text-white text-2xl font-bold">{stats.unreadThreads}</div>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 overflow-hidden">
              <div className="absolute w-16 h-16 -left-3 -top-3 opacity-30 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[28px]" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-stone-300 text-sm">Active</div>
                  <div className="text-white text-2xl font-bold">{stats.activeThreads}</div>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 overflow-hidden">
              <div className="absolute w-16 h-16 -left-3 -top-3 opacity-30 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[28px]" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <div className="text-stone-300 text-sm">AI Responses</div>
                  <div className="text-white text-2xl font-bold">{stats.pendingResponses}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Threads List */}
        {isLoading && <EmailsSkeleton />}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
            {paginatedThreads.length > 0 ? (
              paginatedThreads.map((thread) => (
                <EmailThreadCard
                  key={thread.id}
                  thread={thread}
                  onClick={() => handleThreadClick(thread.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Mail className="w-16 h-16 text-stone-500 mx-auto mb-4" />
                <div className="text-stone-400 text-lg mb-2">
                  No email threads found
                </div>
                <div className="text-stone-500 text-sm mb-4">
                  {searchQuery
                    ? `No threads match your search for "${searchQuery}"`
                    : clientID
                      ? 'This client has no email threads yet'
                      : 'No email threads available'
                  }
                </div>
                {!clientID && (
                  <Button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Now to Check for New Emails
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <Pagination
          totalPages={pagination.totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
        />

        {!isLoading && threads.length > 0 && (
          <MobilePagination pagination={pagination} />
        )}
      </div>
    </div>
  );
};

export default ClientEmailsList;
