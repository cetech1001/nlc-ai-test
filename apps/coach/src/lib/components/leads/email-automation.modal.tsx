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
  Plus,
  RotateCcw,
  Play,
  Pause,
  StopCircle
} from 'lucide-react';
import { Button } from '@nlc-ai/ui';
import { aiAgentsAPI } from '@nlc-ai/api-client';
import { EmailSequenceWithEmails, SEQUENCE_TEMPLATES } from '@nlc-ai/types';

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
  const [sequence, setSequence] = useState<EmailSequenceWithEmails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'sequence' | 'create' | 'preview'>('sequence');
  const [_, setShowCreateForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create sequence form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [emailCount, setEmailCount] = useState(4);
  const [customInstructions, setCustomInstructions] = useState('');
  const [customTimings, setCustomTimings] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      (() => fetchSequence())();
    }
  }, [isOpen, leadID]);

  const fetchSequence = async () => {
    try {
      setIsLoading(true);
      // Fetch an existing sequence for this lead
      const {sequences} = await aiAgentsAPI.getSequencesForLead(leadID);
      if (sequences.length > 0) {
        setSequence(sequences[0]);
      } else {
        setSequence(null);
        setShowCreateForm(true);
      }
    } catch (error) {
      console.error('Failed to fetch sequence:', error);
      setSequence(null);
      setShowCreateForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSequence = async () => {
    try {
      setIsGenerating(true);
      // const template = SEQUENCE_TEMPLATES.find(t => t.type === selectedTemplate);

      const newSequence = await aiAgentsAPI.generateFollowupSequence({
        leadID,
        sequenceConfig: {
          emailCount,
          sequenceType: selectedTemplate as any,
          customInstructions: customInstructions || undefined,
          timings: customTimings.length > 0 ? customTimings : undefined,
        }
      });

      setSequence(newSequence);
      setShowCreateForm(false);
      setActiveTab('sequence');
    } catch (error) {
      console.error('Failed to create sequence:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditEmail = (emailID: string) => {
    // Navigate to email edit page with all necessary data
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
          await aiAgentsAPI.pauseSequence(sequence.id);
          break;
        case 'resume':
          await aiAgentsAPI.resumeSequence(sequence.id);
          break;
        case 'cancel':
          if (confirm('Are you sure you want to cancel this sequence?')) {
            await aiAgentsAPI.cancelSequence(sequence.id);
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
      await aiAgentsAPI.regenerateEmails({
        sequenceID: sequence.id,
        emailOrders,
        customInstructions: customInstructions || undefined
      });
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
                <h2 className="text-xl font-semibold text-white">AI Email Automation</h2>
                <p className="text-sm text-[#A0A0A0]">{leadName} ({leadEmail})</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {sequence && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSequenceAction('pause')}
                    disabled={isProcessing}
                    className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSequenceAction('resume')}
                    disabled={isProcessing}
                    className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
                  >
                    <Play className="w-4 h-4" />
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
              onClick={() => setActiveTab('sequence')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'sequence'
                  ? 'text-violet-400 bg-violet-600/10'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Email Sequence
              {activeTab === 'sequence' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"></div>
              )}
            </button>
            {!sequence && (
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'create'
                    ? 'text-violet-400 bg-violet-600/10'
                    : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                Create Sequence
                {activeTab === 'create' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"></div>
                )}
              </button>
            )}
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'preview'
                  ? 'text-violet-400 bg-violet-600/10'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              Templates
              {activeTab === 'preview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"></div>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Email Sequence Tab */}
            {activeTab === 'sequence' && (
              <div className="space-y-4">
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
                      onClick={() => setActiveTab('create')}
                      className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create AI Sequence
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Sequence Overview */}
                    <div className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-600/20 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium">{sequence.description}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sequence.isActive ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                          }`}>
                            {sequence.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-[#A0A0A0]">Total Emails:</span>
                          <span className="text-white ml-2">{sequence.totalEmails}</span>
                        </div>
                        <div>
                          <span className="text-[#A0A0A0]">Sent:</span>
                          <span className="text-green-400 ml-2">{sequence.emailsSent}</span>
                        </div>
                        <div>
                          <span className="text-[#A0A0A0]">Pending:</span>
                          <span className="text-blue-400 ml-2">{sequence.emailsPending}</span>
                        </div>
                      </div>
                    </div>

                    {/* Email List */}
                    {sequence.emails.map((email, index) => (
                      <div
                        key={email.id}
                        className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4 hover:border-violet-600/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-violet-400">
                                {email.sequenceOrder}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{email.subject}</h4>
                              <div className="flex items-center gap-3 text-sm text-[#A0A0A0]">
                                <span>
                                  {email.status === 'sent'
                                    ? `Sent ${formatDate(email.sentAt?.toString() || email.scheduledFor.toString())}`
                                    : `Scheduled for ${formatDate(email.scheduledFor.toString())}`
                                  }
                                </span>
                                <span>•</span>
                                <span>Timing: {email.timing}</span>
                                {email.deliverabilityScore && (
                                  <>
                                    <span>•</span>
                                    <span className={`${
                                      email.deliverabilityScore >= 80 ? 'text-green-400' :
                                        email.deliverabilityScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                      {email.deliverabilityScore}% deliverability
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusIcon(email.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(email.status)}`}>
                              {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
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
                                  onClick={() => handleRegenerateEmails([email.sequenceOrder])}
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
                          <p className="text-sm text-[#D0D0D0] whitespace-pre-wrap">
                            {email.body.substring(0, 200)}
                            {email.body.length > 200 && '...'}
                          </p>
                          {email.isEdited && (
                            <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                              <Edit3 className="w-3 h-3" />
                              Manually edited
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Create Sequence Tab */}
            {activeTab === 'create' && (
              <CreateSequenceForm
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                emailCount={emailCount}
                setEmailCount={setEmailCount}
                customInstructions={customInstructions}
                setCustomInstructions={setCustomInstructions}
                customTimings={customTimings}
                setCustomTimings={setCustomTimings}
                onCreateSequence={handleCreateSequence}
                isGenerating={isGenerating}
              />
            )}

            {/* Templates Preview Tab */}
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Current Lead Status: {leadStatus}</h3>
                  <p className="text-[#A0A0A0] text-sm">
                    Choose from pre-built templates or create a custom sequence.
                    Templates are optimized based on proven email marketing strategies.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SEQUENCE_TEMPLATES.map((template) => (
                    <div
                      key={template.type}
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedTemplate === template.type
                          ? 'border-violet-600 bg-violet-600/10'
                          : 'border-[#3A3A3A] bg-[#2A2A2A] hover:border-violet-600/50'
                      }`}
                      onClick={() => setSelectedTemplate(template.type)}
                    >
                      <h4 className="text-white font-medium mb-2">{template.name}</h4>
                      <p className="text-[#A0A0A0] text-sm mb-3">{template.description}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#666]">Recommended emails:</span>
                          <span className="text-violet-400">{template.recommendedEmailCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#666]">Use case:</span>
                          <span className="text-[#A0A0A0] text-right max-w-[60%]">{template.useCase}</span>
                        </div>
                        <div className="text-[#666]">
                          Timings: {template.defaultTimings.slice(0, 3).join(', ')}
                          {template.defaultTimings.length > 3 && '...'}
                        </div>
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
              {sequence ?
                `${sequence.emailsSent} emails sent • ${sequence.emailsPending} pending` :
                'AI-powered sequences adapt to lead behavior'
              }
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCloseAction}
                className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
              >
                Close
              </Button>
              {!sequence && activeTab === 'create' && (
                <Button
                  onClick={handleCreateSequence}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Create Sequence
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

// Create Sequence Form Component
const CreateSequenceForm = ({
  selectedTemplate,
  setSelectedTemplate,
  emailCount,
  setEmailCount,
  customInstructions,
  setCustomInstructions,
  customTimings,
  setCustomTimings,
  onCreateSequence,
  isGenerating
}: any) => {
  const template = SEQUENCE_TEMPLATES.find(t => t.type === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <h3 className="text-white font-medium mb-3">1. Choose Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SEQUENCE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.type}
              onClick={() => {
                setSelectedTemplate(tmpl.type);
                setEmailCount(tmpl.recommendedEmailCount);
              }}
              className={`text-left p-3 rounded-lg border transition-all ${
                selectedTemplate === tmpl.type
                  ? 'border-violet-600 bg-violet-600/10'
                  : 'border-[#3A3A3A] bg-[#2A2A2A] hover:border-violet-600/50'
              }`}
            >
              <div className="font-medium text-white">{tmpl.name}</div>
              <div className="text-sm text-[#A0A0A0] mt-1">{tmpl.description}</div>
              <div className="text-xs text-[#666] mt-2">
                {tmpl.recommendedEmailCount} emails • {tmpl.defaultTimings.slice(0, 2).join(', ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Email Count */}
      <div>
        <h3 className="text-white font-medium mb-3">2. Number of Emails</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={emailCount}
            onChange={(e) => setEmailCount(parseInt(e.target.value))}
            className="flex-1 h-2 bg-[#3A3A3A] rounded-lg appearance-none cursor-pointer"
          />
          <div className="w-12 text-center">
            <span className="text-violet-400 font-medium">{emailCount}</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-[#666] mt-1">
          <span>1 email</span>
          <span>10 emails</span>
        </div>
      </div>

      {/* Custom Instructions */}
      <div>
        <h3 className="text-white font-medium mb-3">3. Custom Instructions (Optional)</h3>
        <textarea
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="e.g., Focus on productivity challenges for entrepreneurs. Mention specific tools and frameworks."
          className="w-full h-20 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white placeholder:text-[#666] focus:border-violet-600/50 focus:outline-none resize-none"
        />
        <p className="text-xs text-[#666] mt-1">
          AI will incorporate these instructions when generating your emails
        </p>
      </div>

      {/* Preview */}
      {template && (
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Preview: {template.name}</h4>
          <div className="text-sm text-[#A0A0A0] mb-3">{template.description}</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#666]">Emails:</span>
              <span className="text-violet-400 ml-2">{emailCount}</span>
            </div>
            <div>
              <span className="text-[#666]">Type:</span>
              <span className="text-white ml-2 capitalize">{template.type}</span>
            </div>
          </div>
          <div className="text-xs text-[#666] mt-2">
            Default timings: {template.defaultTimings.slice(0, emailCount).join(' → ')}
          </div>
        </div>
      )}
    </div>
  );
};
