'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Sparkles, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@nlc-ai/ui';
import { aiAgentsAPI } from '@nlc-ai/api-client';

interface EmailAutomationModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  leadName: string;
  leadEmail: string;
  leadStatus: string;
  leadID: string;
}

interface EmailHistoryItem {
  id: string;
  subject: string;
  body: string;
  scheduledFor: string;
  sentAt?: string;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  sequenceOrder: number;
}

export const EmailAutomationModal = ({
 isOpen,
 onCloseAction,
 leadName,
 leadEmail,
 leadStatus,
 leadID,
}: EmailAutomationModalProps) => {
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'preview'>('history');

  useEffect(() => {
    if (isOpen) {
      fetchEmailHistory();
    }
  }, [isOpen, leadID]);

  const fetchEmailHistory = async () => {
    try {
      setIsLoading(true);
      const history = await aiAgentsAPI.getEmailHistory(leadID);
      setEmailHistory(history);
    } catch (error) {
      console.error('Failed to fetch email history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSequence = async () => {
    try {
      setIsGenerating(true);
      await aiAgentsAPI.generateFollowupSequence(leadID);
      await fetchEmailHistory(); // Refresh history
    } catch (error) {
      console.error('Failed to generate sequence:', error);
    } finally {
      setIsGenerating(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative group max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

        <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#3A3A3A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Email Automation</h2>
                <p className="text-sm text-[#A0A0A0]">{leadName} ({leadEmail})</p>
              </div>
            </div>
            <button
              onClick={onCloseAction}
              className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center text-[#A0A0A0] hover:text-white hover:border-[#555] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#3A3A3A]">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'history'
                  ? 'text-violet-400 bg-violet-600/10'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Email History
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'preview'
                  ? 'text-violet-400 bg-violet-600/10'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Sequence Preview
              {activeTab === 'preview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"></div>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'history' && (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#A0A0A0]">Loading email history...</p>
                  </div>
                ) : emailHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-[#666] mx-auto mb-4" />
                    <p className="text-[#A0A0A0] mb-4">No email automation sequence found for this lead.</p>
                    <Button
                      onClick={handleGenerateSequence}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Generating AI Sequence...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Generate AI Email Sequence
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  emailHistory.map((email, index) => (
                    <div
                      key={email.id}
                      className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-violet-400">
                              {email.sequenceOrder + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{email.subject}</h4>
                            <p className="text-sm text-[#A0A0A0]">
                              {email.status === 'sent'
                                ? `Sent ${formatDate(email.sentAt || email.scheduledFor)}`
                                : `Scheduled for ${formatDate(email.scheduledFor)}`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(email.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(email.status)}`}>
                            {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-[#1A1A1A] rounded-lg p-3">
                        <p className="text-sm text-[#D0D0D0] whitespace-pre-wrap">
                          {email.body.substring(0, 200)}
                          {email.body.length > 200 && '...'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Current Lead Status: {leadStatus}</h3>
                  <p className="text-[#A0A0A0] text-sm">
                    Email sequences are automatically generated based on the lead's current status.
                    When the status changes, a new personalized sequence will be created.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['contacted', 'scheduled', 'converted', 'unresponsive'].map((status) => (
                    <div
                      key={status}
                      className={`border rounded-xl p-4 ${
                        status === leadStatus
                          ? 'border-violet-600 bg-violet-600/10'
                          : 'border-[#3A3A3A] bg-[#2A2A2A]'
                      }`}
                    >
                      <h4 className="text-white font-medium mb-2 capitalize">
                        {status === 'contacted' ? 'Not Converted' :
                          status === 'unresponsive' ? 'No Show' : status}
                      </h4>
                      <p className="text-[#A0A0A0] text-sm mb-3">
                        {status === 'contacted' && 'Welcome & nurture sequence with value content'}
                        {status === 'scheduled' && 'Meeting preparation and reminder sequence'}
                        {status === 'converted' && 'Onboarding and success sequence'}
                        {status === 'unresponsive' && 'Re-engagement and recovery sequence'}
                      </p>
                      <div className="text-xs text-[#666]">
                        4 emails • AI-generated • Personalized
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-[#3A3A3A]">
            <div className="text-sm text-[#A0A0A0]">
              AI-powered email sequences adapt based on lead behavior
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCloseAction}
                className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
              >
                Close
              </Button>
              {emailHistory.length === 0 && (
                <Button
                  onClick={handleGenerateSequence}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate Sequence
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
