'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Mail,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit3,
  RotateCcw,
  Play,
  Pause,
  StopCircle,
  Eye
} from 'lucide-react';
import { Button } from '@nlc-ai/web-ui';
import { EmailSequence, EmailMessage, EmailParticipantType } from '@nlc-ai/types';
import { sdkClient } from "@/lib";

interface EmailAutomationModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  leadName: string;
  leadEmail: string;
  leadStatus: string;
  leadID: string;
}

export const EmailAutomationModal = ({
                                       isOpen,
                                       onCloseAction,
                                       leadName,
                                       leadEmail,
                                       leadStatus,
                                       leadID,
                                     }: EmailAutomationModalProps) => {
  const router = useRouter();
  const [sequence, setSequence] = useState<EmailSequence | null>(null);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'emails' | 'analytics'>('emails');

  useEffect(() => {
    if (isOpen) {
      (() => fetchSequence())();
    }
  }, [isOpen, leadID]);

  const fetchSequence = async () => {
    try {
      setIsLoading(true);
      const { sequences } = await sdkClient.email.sequences.getSequencesForLead(leadID);

      if (sequences.length > 0) {
        const seq = sequences[0];
        setSequence(seq);

        // Fetch full sequence details with emails
        const { sequence: fullSequence } = await sdkClient.email.sequences.getSequence(seq.id);
        setEmails(fullSequence.emailMessages || []);
      } else {
        setSequence(null);
        setEmails([]);
      }
    } catch (error) {
      console.error('Failed to fetch sequence:', error);
      setSequence(null);
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmail = (emailID: string) => {
    const params = new URLSearchParams({
      emailID,
      leadID,
      leadName,
      leadEmail,
      sequenceID: sequence?.id || '',
      returnUrl: window.location.pathname + window.location.search
    });

    router.push(`/leads/edit-email?${params.toString()}`);
  };

  const handleSequenceAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!sequence) return;

    try {
      setIsProcessing(true);
      switch (action) {
        case 'pause':
          await sdkClient.email.sequences.pauseSequence(
            sequence.id,
            leadID,
            EmailParticipantType.LEAD
          );
          break;
        case 'resume':
          await sdkClient.email.sequences.resumeSequence(
            sequence.id,
            leadID,
            EmailParticipantType.LEAD
          );
          break;
        case 'cancel':
          if (confirm('Are you sure you want to cancel this sequence?')) {
            await sdkClient.email.sequences.deleteSequence(sequence.id);
          }
          break;
      }
      await fetchSequence();
    } catch (error) {
      console.error(`Failed to ${action} sequence:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerateEmails = async (emailOrders: number[]) => {
    if (!sequence) return;

    try {
      setIsProcessing(true);

      // Generate new content with AI
      const newEmails = await sdkClient.agents.leadFollowup.regenerateEmails({
        sequenceID: sequence.id,
        emailOrders,
      });

      // Update each email in the sequence
      for (const email of newEmails.emails) {
        const existingEmail = emails.find(e => {
          const metadata = e.metadata as any;
          return metadata?.sequenceOrder === email.sequenceOrder;
        });

        if (existingEmail) {
          await sdkClient.email.sequences.updateEmail(existingEmail.id, {
            subject: email.subject,
            body: email.body,
          });
        }
      }

      await fetchSequence();
    } catch (error) {
      console.error('Failed to regenerate emails:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'scheduled':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'failed':
        return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'cancelled':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative group max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

        <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#3A3A3A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Email Sequence</h2>
                <p className="text-sm text-[#A0A0A0]">{leadName} ({leadEmail})</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {sequence && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSequenceAction(sequence.isActive ? 'pause' : 'resume')}
                    disabled={isProcessing}
                    className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
                  >
                    {sequence.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSequenceAction('cancel')}
                    disabled={isProcessing}
                    className="border-red-600/30 text-red-400 hover:bg-red-600/10"
                  >
                    <StopCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <button
                onClick={onCloseAction}
                className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center text-[#A0A0A0] hover:text-white hover:border-[#555] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#3A3A3A]">
            <button
              onClick={() => setActiveTab('emails')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'emails'
                  ? 'text-violet-400 bg-violet-600/10'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Email Sequence
              {activeTab === 'emails' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-violet-400 bg-violet-600/10'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Analytics
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"></div>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#A0A0A0]">Loading email sequence...</p>
              </div>
            ) : !sequence ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-[#666] mx-auto mb-4" />
                <p className="text-[#A0A0A0] mb-4">No email sequence found for this lead.</p>
                <Button
                  onClick={onCloseAction}
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create New Sequence
                </Button>
              </div>
            ) : activeTab === 'emails' ? (
              <div className="space-y-4">
                {/* Sequence Overview */}
                <div className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-600/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">{sequence.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sequence.isActive ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {sequence.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sequence.status === 'active' ? 'bg-blue-600/20 text-blue-400' :
                          sequence.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                            sequence.status === 'cancelled' ? 'bg-red-600/20 text-red-400' :
                              'bg-gray-600/20 text-gray-400'
                      }`}>
                        {sequence.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-[#A0A0A0]">Total Emails:</span>
                      <span className="text-white ml-2">{emails.length}</span>
                    </div>
                    <div>
                      <span className="text-[#A0A0A0]">Sent:</span>
                      <span className="text-green-400 ml-2">{emails.filter(e => e.status === 'sent').length}</span>
                    </div>
                    <div>
                      <span className="text-[#A0A0A0]">Pending:</span>
                      <span className="text-blue-400 ml-2">{emails.filter(e => e.status === 'scheduled').length}</span>
                    </div>
                  </div>
                </div>

                {/* Email List */}
                {emails.length > 0 ? (
                  emails
                    .sort((a, b) => {
                      const aOrder = (a.metadata as any)?.sequenceOrder || 0;
                      const bOrder = (b.metadata as any)?.sequenceOrder || 0;
                      return aOrder - bOrder;
                    })
                    .map((email, index) => {
                      const metadata = email.metadata as any;
                      const sequenceOrder = metadata?.sequenceOrder || index + 1;

                      return (
                        <div
                          key={email.id}
                          className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4 hover:border-violet-600/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-violet-400">
                                  {sequenceOrder}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate">{email.subject}</h4>
                                <div className="flex items-center gap-3 text-sm text-[#A0A0A0] mt-1">
                                  <span>
                                    {email.status === 'sent'
                                      ? `Sent ${formatDate(email.sentAt || email.scheduledFor || new Date())}`
                                      : `Scheduled for ${formatDate(email.scheduledFor || new Date())}`
                                    }
                                  </span>
                                  {metadata?.timing && (
                                    <>
                                      <span>•</span>
                                      <span>Timing: {metadata.timing}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                              {getStatusIcon(email.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(email.status)}`}>
                                {email.status}
                              </span>

                              {email.status !== 'sent' && (
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditEmail(email.id)}
                                    className="h-8 px-2 border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-violet-600/50"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRegenerateEmails([sequenceOrder])}
                                    disabled={isProcessing}
                                    className="h-8 px-2 border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-fuchsia-600/50"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-[#1A1A1A] rounded-lg p-3">
                            <div
                              className="text-sm text-[#D0D0D0] line-clamp-3"
                              dangerouslySetInnerHTML={{
                                __html: (email.html || email.text || '').substring(0, 300) + '...'
                              }}
                            />
                          </div>

                          {metadata?.keyPoints && metadata.keyPoints.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {metadata.keyPoints.slice(0, 3).map((point: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-violet-600/10 border border-violet-600/20 rounded text-xs text-violet-400"
                                >
                                  {point}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#A0A0A0]">No emails found in this sequence</p>
                  </div>
                )}
              </div>
            ) : (
              // Analytics Tab
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-violet-400" />
                      <span className="text-sm text-[#A0A0A0]">Total Emails</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{emails.length}</div>
                  </div>

                  <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-[#A0A0A0]">Sent</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {emails.filter(e => e.status === 'sent').length}
                    </div>
                  </div>

                  <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-[#A0A0A0]">Scheduled</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {emails.filter(e => e.status === 'scheduled').length}
                    </div>
                  </div>

                  <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-[#A0A0A0]">Failed</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400">
                      {emails.filter(e => e.status === 'failed').length}
                    </div>
                  </div>
                </div>

                {/* Sequence Information */}
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4">
                  <h3 className="text-white font-medium mb-4">Sequence Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#A0A0A0]">Sequence Name:</span>
                      <span className="text-white">{sequence.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A0A0A0]">Type:</span>
                      <span className="text-white">{sequence.type || 'lead_followup'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A0A0A0]">Trigger:</span>
                      <span className="text-white">{sequence.triggerType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A0A0A0]">Created:</span>
                      <span className="text-white">{formatDate(sequence.createdAt)}</span>
                    </div>
                    {sequence.updatedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#A0A0A0]">Last Updated:</span>
                        <span className="text-white">{formatDate(sequence.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lead Information */}
                <div className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-600/20 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-4">Lead Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#A0A0A0]">Name:</span>
                      <span className="text-white">{leadName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A0A0A0]">Email:</span>
                      <span className="text-white">{leadEmail}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A0A0A0]">Status:</span>
                      <span className="text-white capitalize">{leadStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-[#3A3A3A]">
            <div className="text-sm text-[#A0A0A0]">
              {sequence ?
                `${emails.filter(e => e.status === 'sent').length} emails sent • ${emails.filter(e => e.status === 'scheduled').length} pending` :
                'No active sequence'
              }
            </div>
            <div className="flex gap-3">
              {sequence && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/agents/followup`)}
                  className="border-violet-600/30 text-violet-400 hover:bg-violet-600/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Sequences
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onCloseAction}
                className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
