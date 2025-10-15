'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  TrendingUp,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  StopCircle,
  Search,
  BarChart3,
  Users,
  Calendar,
  ArrowUpRight,
  Edit3,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, AlertBanner } from '@nlc-ai/web-ui';
import { PageHeader, StatCard } from '@nlc-ai/web-shared';
import { EmailSequence, EmailSequenceStatus, EmailParticipantType, EmailMessage } from '@nlc-ai/types';
import { sdkClient } from '@/lib';

interface SequenceWithDetails extends Omit<EmailSequence, 'emailMessages'> {
  leadName?: string;
  leadEmail?: string;
  emailMessages?: EmailMessage[];
  _count?: {
    emailMessages: number;
  };
}

interface SequenceStats {
  totalSequences: number;
  activeSequences: number;
  totalEmailsSent: number;
  totalEmailsScheduled: number;
  averageOpenRate: number;
  averageClickRate: number;
}

const LeadFollowUpPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sequences, setSequences] = useState<SequenceWithDetails[]>([]);
  const [filteredSequences, setFilteredSequences] = useState<SequenceWithDetails[]>([]);
  const [stats, setStats] = useState<SequenceStats>({
    totalSequences: 0,
    activeSequences: 0,
    totalEmailsSent: 0,
    totalEmailsScheduled: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EmailSequenceStatus>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSequence, setSelectedSequence] = useState<SequenceWithDetails | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    (() => fetchSequences())();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sequences, searchQuery, statusFilter, activeFilter]);

  const fetchSequences = async () => {
    try {
      setIsLoading(true);
      const { sequences: fetchedSequences } = await sdkClient.email.sequences.getSequences();

      // Enrich sequences with lead information
      const enrichedSequences = await Promise.all(
        fetchedSequences.map(async (seq) => {
          if (seq.targetType === EmailParticipantType.LEAD && seq.targetID) {
            try {
              const lead = await sdkClient.leads.getLead(seq.targetID);
              return {
                ...seq,
                leadName: lead.name,
                leadEmail: lead.email,
              };
            } catch {
              return seq;
            }
          }
          return seq;
        })
      );

      setSequences(enrichedSequences);
      calculateStats(enrichedSequences);
    } catch (e: any) {
      setError(e.message || 'Failed to load sequences');
      toast.error('Failed to load sequences');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (seqs: SequenceWithDetails[]) => {
    const totalSequences = seqs.length;
    const activeSequences = seqs.filter(s => s.isActive).length;

    let totalEmailsSent = 0;
    let totalEmailsScheduled = 0;

    seqs.forEach(seq => {
      if (seq.emailMessages) {
        totalEmailsSent += seq.emailMessages.filter(e => e.status === 'sent').length;
        totalEmailsScheduled += seq.emailMessages.filter(e => e.status === 'scheduled').length;
      }
    });

    setStats({
      totalSequences,
      activeSequences,
      totalEmailsSent,
      totalEmailsScheduled,
      averageOpenRate: 0,
      averageClickRate: 0,
    });
  };

  const applyFilters = () => {
    let filtered = [...sequences];

    if (searchQuery) {
      filtered = filtered.filter(seq =>
        seq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seq.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seq.leadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seq.leadEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(seq => seq.status === statusFilter);
    }

    if (activeFilter === 'active') {
      filtered = filtered.filter(seq => seq.isActive);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter(seq => !seq.isActive);
    }

    setFilteredSequences(filtered);
  };

  const handlePauseSequence = async (sequenceID: string, targetID: string) => {
    try {
      await sdkClient.email.sequences.pauseSequence(
        sequenceID,
        targetID,
        EmailParticipantType.LEAD
      );
      setSuccessMessage('Sequence paused successfully');
      await fetchSequences();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to pause sequence');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleResumeSequence = async (sequenceID: string, targetID: string) => {
    try {
      await sdkClient.email.sequences.resumeSequence(
        sequenceID,
        targetID,
        EmailParticipantType.LEAD
      );
      setSuccessMessage('Sequence resumed successfully');
      await fetchSequences();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to resume sequence');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteSequence = async (sequenceID: string) => {
    if (!confirm('Are you sure you want to delete this sequence? This will cancel all scheduled emails.')) {
      return;
    }

    try {
      await sdkClient.email.sequences.deleteSequence(sequenceID);
      setSuccessMessage('Sequence deleted successfully');
      await fetchSequences();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to delete sequence');
      setTimeout(() => setError(''), 3000);
    }
  };

  const viewSequenceDetails = (sequence: SequenceWithDetails) => {
    setSelectedSequence(sequence);
    setShowAnalytics(true);
  };

  const navigateToLead = (sequence: SequenceWithDetails) => {
    if (sequence.targetID) {
      router.push(`/leads?leadID=${sequence.targetID}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-green-600/20', text: 'text-green-400', label: 'Active' },
      paused: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', label: 'Paused' },
      completed: { bg: 'bg-blue-600/20', text: 'text-blue-400', label: 'Completed' },
      cancelled: { bg: 'bg-red-600/20', text: 'text-red-400', label: 'Cancelled' },
      scheduled: { bg: 'bg-purple-600/20', text: 'text-purple-400', label: 'Scheduled' },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col px-4">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {/* Absolute background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 top-1/4 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="absolute w-64 h-64 right-1/4 -top-20 opacity-30 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
          <div className="absolute w-56 h-56 right-12 bottom-1/4 opacity-25 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full blur-[112px]" />
        </div>

        {successMessage && (
          <AlertBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
        )}

        {error && (
          <AlertBanner type="error" message={error} onDismiss={() => setError('')} />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 relative z-10">
          <StatCard
            title="Total Sequences"
            value={stats.totalSequences}
            icon={Sparkles}
            subtitle="AI-powered"
            iconBgColor="from-violet-600/20 to-fuchsia-600/20"
            isLoading={isLoading}
          />
          <StatCard
            title="Active Now"
            value={stats.activeSequences}
            icon={TrendingUp}
            subtitle={`${stats.totalSequences - stats.activeSequences} paused`}
            iconBgColor="from-green-600/20 to-emerald-600/20"
            isLoading={isLoading}
          />
          <StatCard
            title="Emails Sent"
            value={stats.totalEmailsSent}
            icon={CheckCircle}
            subtitle="Delivered"
            iconBgColor="from-blue-600/20 to-cyan-600/20"
            isLoading={isLoading}
          />
          <StatCard
            title="Scheduled"
            value={stats.totalEmailsScheduled}
            icon={Clock}
            subtitle="Ready to send"
            iconBgColor="from-purple-600/20 to-pink-600/20"
            isLoading={isLoading}
          />
          <StatCard
            title="Avg Open Rate"
            value={`${stats.averageOpenRate.toFixed(1)}%`}
            icon={Mail}
            subtitle="Last 30 days"
            iconBgColor="from-yellow-600/20 to-orange-600/20"
            isLoading={isLoading}
          />
        </div>

        {/* Page Header with Filters */}
        <PageHeader title="AI Email Sequences">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search sequences, leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-neutral-800/50 border border-neutral-600 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value={EmailSequenceStatus.ACTIVE}>Active</option>
                <option value={EmailSequenceStatus.PAUSED}>Paused</option>
                <option value={EmailSequenceStatus.COMPLETED}>Completed</option>
                <option value={EmailSequenceStatus.CANCELLED}>Cancelled</option>
              </select>

              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="bg-neutral-800/50 border border-neutral-600 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Sequences</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </PageHeader>

        {/* Sequences List */}
        <div className="relative z-10 space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-stone-300">Loading sequences...</p>
            </div>
          ) : filteredSequences.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-stone-500 mx-auto mb-4" />
              <p className="text-stone-300 mb-4">
                {searchQuery || statusFilter !== 'all' || activeFilter !== 'all'
                  ? 'No sequences match your filters'
                  : 'No AI email sequences yet'}
              </p>
              <Button
                onClick={() => router.push('/leads')}
                className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Your First Sequence
              </Button>
            </div>
          ) : (
            filteredSequences.map((sequence) => (
              <div
                key={sequence.id}
                className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 hover:border-purple-500/50 transition-all overflow-hidden group"
              >
                <div className="absolute w-56 h-56 -right-12 -top-20 opacity-0 group-hover:opacity-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px] transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{sequence.name}</h3>
                        {getStatusBadge(sequence.status)}
                        {sequence.isActive ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400 flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            Running
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-400 flex items-center gap-1">
                            <Pause className="w-3 h-3" />
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-stone-300 text-sm mb-2">{sequence.description}</p>
                      {sequence.leadName && (
                        <button
                          onClick={() => navigateToLead(sequence)}
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          {sequence.leadName} ({sequence.leadEmail})
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewSequenceDetails(sequence)}
                        className="border-neutral-600 text-stone-300 hover:text-stone-50 hover:border-purple-500"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>

                      {sequence.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePauseSequence(sequence.id, sequence.targetID!)}
                          className="border-yellow-600/30 text-yellow-400 hover:bg-yellow-600/10"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResumeSequence(sequence.id, sequence.targetID!)}
                          className="border-green-600/30 text-green-400 hover:bg-green-600/10"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSequence(sequence.id)}
                        className="border-red-600/30 text-red-400 hover:bg-red-600/10"
                      >
                        <StopCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-stone-400">Total Emails</span>
                      </div>
                      <div className="text-xl font-semibold text-white">
                        {sequence._count?.emailMessages || 0}
                      </div>
                    </div>

                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-stone-400">Sent</span>
                      </div>
                      <div className="text-xl font-semibold text-green-400">
                        {sequence.emailMessages?.filter(e => e.status === 'sent').length || 0}
                      </div>
                    </div>

                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-stone-400">Scheduled</span>
                      </div>
                      <div className="text-xl font-semibold text-blue-400">
                        {sequence.emailMessages?.filter(e => e.status === 'scheduled').length || 0}
                      </div>
                    </div>

                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-stone-400">Failed</span>
                      </div>
                      <div className="text-xl font-semibold text-red-400">
                        {sequence.emailMessages?.filter(e => e.status === 'failed').length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-6 text-xs text-stone-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created {new Date(sequence.createdAt).toLocaleDateString()}
                    </div>
                    {sequence.updatedAt && (
                      <div className="flex items-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        Updated {new Date(sequence.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      Type: {sequence.type || 'lead_followup'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && selectedSequence && (
        <SequenceAnalyticsModal
          sequence={selectedSequence}
          onClose={() => {
            setShowAnalytics(false);
            setSelectedSequence(null);
          }}
        />
      )}
    </div>
  );
};

// Analytics Modal Component
const SequenceAnalyticsModal = ({
                                  sequence,
                                  onClose,
                                }: {
  sequence: SequenceWithDetails;
  onClose: () => void;
}) => {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative group max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

        <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[#3A3A3A]">
            <div>
              <h2 className="text-xl font-semibold text-white">{sequence.name}</h2>
              <p className="text-sm text-stone-400">{sequence.description}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center text-stone-400 hover:text-white hover:border-[#555] transition-colors"
            >
              ×
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Lead Info */}
              {sequence.leadName && (
                <div className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-600/20 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Lead Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-stone-400">Name:</span>
                      <span className="text-white ml-2">{sequence.leadName}</span>
                    </div>
                    <div>
                      <span className="text-stone-400">Email:</span>
                      <span className="text-white ml-2">{sequence.leadEmail}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/leads?leadID=${sequence.targetID}`)}
                    className="mt-3 border-violet-600/30 text-violet-400 hover:bg-violet-600/10"
                  >
                    View Lead Profile
                    <ArrowUpRight className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              )}

              {/* Email Messages */}
              <div>
                <h3 className="text-white font-medium mb-4">Email Messages</h3>
                <div className="space-y-3">
                  {sequence.emailMessages && sequence.emailMessages.length > 0 ? (
                    sequence.emailMessages
                      .slice()
                      .sort((a, b) => {
                        const aTime = a.sentAt
                          ? new Date(a.sentAt).getTime()
                          : (a.scheduledFor ? new Date(a.scheduledFor).getTime() : Infinity);
                        const bTime = b.sentAt
                          ? new Date(b.sentAt).getTime()
                          : (b.scheduledFor ? new Date(b.scheduledFor).getTime() : Infinity);
                        return aTime - bTime;
                      })
                      .map((email, index) => (
                      <div key={email.id} className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-violet-400">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{email.subject}</h4>
                              <div className="text-xs text-stone-400 mt-1">
                                {email.status === 'sent'
                                  ? `Sent ${new Date(email.sentAt!).toLocaleString()}`
                                  : `Scheduled for ${new Date(email.scheduledFor!).toLocaleString()}`
                                }
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            email.status === 'sent' ? 'bg-green-600/20 text-green-400' :
                              email.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400' :
                                email.status === 'failed' ? 'bg-red-600/20 text-red-400' :
                                  'bg-gray-600/20 text-gray-400'
                          }`}>
                            {email.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-400 text-center py-8">No email messages found</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-[#3A3A3A]">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadFollowUpPage;
