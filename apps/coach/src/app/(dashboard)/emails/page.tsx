'use client'

import { useState, useEffect, FC } from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import { Search, RefreshCw, Clock, AlertCircle, CheckCircle, Mail, Zap, TrendingUp } from "lucide-react";
import { AlertBanner } from '@nlc-ai/ui';
import { Pagination } from '@nlc-ai/shared';
import { aiAgentsAPI } from '@nlc-ai/api-client';
import { ClientEmailResponse, ClientEmailThread, ClientEmailStats } from '@nlc-ai/types';

interface EmailCardProps {
  email: ClientEmailResponse;
  onClick: () => void;
}

const EmailCard: FC<EmailCardProps> = ({ email, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'approved': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'sent': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'cancelled': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval': return <AlertCircle className="w-3 h-3" />;
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'sent': return <CheckCircle className="w-3 h-3" />;
      case 'failed': return <AlertCircle className="w-3 h-3" />;
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
              <h3 className="text-stone-50 text-lg font-semibold leading-tight truncate">
                {email.client ? `${email.client.firstName} ${email.client.lastName}` : 'Unknown Client'}
              </h3>

              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(email.status)}`}>
                {getStatusIcon(email.status)}
                <span className="capitalize">{email.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="text-stone-300 text-sm mb-2 truncate">
              {email.subject}
            </div>

            <div className="text-stone-400 text-xs">
              {email.client?.email}
            </div>
          </div>

          <div className="text-stone-400 text-xs text-right ml-4">
            <div>{formatTimeAgo(email.generatedAt)}</div>
            <div className="mt-1">
              Score: {email.deliverabilityScore}/100
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="text-stone-300 text-sm leading-relaxed line-clamp-3 mb-4">
          {email.body.substring(0, 150)}...
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-stone-400">
            <span>AI Confidence: {Math.round(email.aiConfidence * 100)}%</span>
            {email.sentAt && (
              <span>Sent: {formatTimeAgo(email.sentAt)}</span>
            )}
          </div>

          {email.status === 'pending_approval' && (
            <div className="text-orange-400 font-medium">
              Awaiting Review
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmailsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-neutral-800/50 rounded-[20px] p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-5 bg-neutral-700 rounded w-48 mb-2"></div>
            <div className="h-4 bg-neutral-700 rounded w-64 mb-2"></div>
            <div className="h-3 bg-neutral-700 rounded w-40"></div>
          </div>
          <div className="h-4 bg-neutral-700 rounded w-16"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-neutral-700 rounded w-full"></div>
          <div className="h-3 bg-neutral-700 rounded w-3/4"></div>
          <div className="h-3 bg-neutral-700 rounded w-1/2"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-neutral-700 rounded w-32"></div>
          <div className="h-3 bg-neutral-700 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);

const ClientEmailsList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const clientID = searchParams.get('clientID');

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Data states
  const [emails, setEmails] = useState<ClientEmailResponse[]>([]);
  const [stats, setStats] = useState<ClientEmailStats | null>(null);
  const [_, setThreads] = useState<ClientEmailThread[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [emailsData, statsData, threadsData] = await Promise.all([
        aiAgentsAPI.getPendingClientResponses(),
        aiAgentsAPI.getClientEmailStats(),
        aiAgentsAPI.getClientEmailThreads(50)
      ]);

      setEmails(emailsData);
      setStats(statsData);
      setThreads(threadsData);
    } catch (err: any) {
      setError('Failed to load client emails');
      console.error('Error loading emails:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setError("");

      const result = await aiAgentsAPI.syncClientEmails();

      setSuccessMessage(`Sync completed! Found ${result.clientEmailsFound} client emails, generated ${result.responsesGenerated} responses.`);

      // Refresh data
      await loadData();
    } catch (err: any) {
      setError('Failed to sync emails: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEmailClick = (emailID: string) => {
    router.push(`/clients/${clientID}/emails/${emailID}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredEmails = emails.filter(email => {
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'pending' && email.status === 'pending_approval') ||
      (activeTab === 'approved' && ['approved', 'sent'].includes(email.status));

    const matchesSearch = searchQuery === "" ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.client?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.client?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.client?.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type="success" message={successMessage} onDismiss={clearMessages} />
        )}

        {error && (
          <AlertBanner type="error" message={error} onDismiss={clearMessages} />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Client Email Agent</h1>
            <p className="text-stone-400 mt-1">AI-powered responses to client emails</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Emails'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-stone-300 text-sm">Pending</div>
                  <div className="text-white text-2xl font-bold">{stats.pendingResponses}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-stone-300 text-sm">Today</div>
                  <div className="text-white text-2xl font-bold">{stats.emailsProcessedToday}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-stone-300 text-sm">This Week</div>
                  <div className="text-white text-2xl font-bold">{stats.emailsProcessedThisWeek}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-stone-300 text-sm">Avg Response</div>
                  <div className="text-white text-2xl font-bold">{stats.averageResponseTime}m</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-8 order-2 sm:order-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'text-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50'
              }`}
            >
              Pending ({emails.filter(e => e.status === 'pending_approval').length})
            </button>
            <div className="h-6 border-r border-gray-700"></div>
            <button
              onClick={() => setActiveTab('approved')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'approved'
                  ? 'text-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50'
              }`}
            >
              Approved ({emails.filter(e => ['approved', 'sent'].includes(e.status)).length})
            </button>
            <div className="h-6 border-r border-gray-700"></div>
            <button
              onClick={() => setActiveTab('all')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50'
              }`}
            >
              All ({emails.length})
            </button>
          </div>

          <div className="flex order-1 sm:order-2 gap-2 w-full justify-end">
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 max-w-md w-full">
              <input
                type="text"
                placeholder="Search emails by client, subject..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Email List */}
        {isLoading && <EmailsSkeleton />}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => handleEmailClick(email.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Mail className="w-16 h-16 text-stone-500 mx-auto mb-4" />
                <div className="text-stone-400 text-lg mb-2">
                  No {activeTab} emails found
                </div>
                <div className="text-stone-500 text-sm">
                  {searchQuery
                    ? `No emails match your search for "${searchQuery}"`
                    : activeTab === 'pending'
                      ? 'No emails are pending approval'
                      : `No ${activeTab} emails available`
                  }
                </div>
                {activeTab === 'pending' && (
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Sync Now to Check for New Emails
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <Pagination
          totalPages={Math.ceil(filteredEmails.length / 10)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ClientEmailsList;
