// apps/coach/src/app/(dashboard)/leads/edit-email/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Zap,
  TrendingUp,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@nlc-ai/ui';
import { aiAgentsAPI } from '@nlc-ai/api-client';
import { EmailInSequence, DeliverabilityAnalysis, TIMING_OPTIONS } from '@nlc-ai/types';

declare global {
  interface Window {
    tinymce: any;
  }
}

const EditEmailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editorRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // URL params
  const emailID = searchParams.get('emailID');
  const leadID = searchParams.get('leadID');
  const leadName = searchParams.get('leadName');
  const leadEmail = searchParams.get('leadEmail');
  const sequenceID = searchParams.get('sequenceID');
  const returnUrl = searchParams.get('returnUrl');

  // Email data
  const [email, setEmail] = useState<EmailInSequence | null>(null);
  const [subject, setSubject] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [selectedTiming, setSelectedTiming] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Deliverability analysis
  const [deliverabilityAnalysis, setDeliverabilityAnalysis] = useState<DeliverabilityAnalysis | null>(null);
  const [quickScore, setQuickScore] = useState<number | null>(null);

  // Preview mode
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!emailID) {
      router.push('/leads');
      return;
    }

    loadEmail();
    loadTinyMCE();
  }, [emailID]);

  const loadTinyMCE = () => {
    if (window.tinymce) {
      initializeTinyMCE();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.tiny.cloud/1/YOUR_TINY_MCE_API_KEY/tinymce/6/tinymce.min.js';
    script.onload = () => initializeTinyMCE();
    document.head.appendChild(script);
  };

  const initializeTinyMCE = () => {
    window.tinymce.init({
      selector: '#email-editor',
      height: 400,
      menubar: false,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'codesample', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount'
      ],
      toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
      content_style: `
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          background: #fff;
          padding: 20px;
        }
      `,
      skin: 'oxide-dark',
      content_css: 'dark',
      setup: (editor: any) => {
        editorRef.current = editor;
        editor.on('change', () => {
          setHasChanges(true);
          // Trigger quick deliverability check on content change
          debounceQuickCheck();
        });
      },
    });
  };

  const loadEmail = async () => {
    try {
      setIsLoading(true);
      const emailData = await aiAgentsAPI.getEmailById(emailID!);
      setEmail(emailData);
      setSubject(emailData.subject);
      setScheduledFor(new Date(emailData.scheduledFor).toISOString().slice(0, 16));
      setSelectedTiming(emailData.timing);

      // Set initial content in editor when it's ready
      const checkEditor = setInterval(() => {
        if (editorRef.current) {
          editorRef.current.setContent(emailData.body);
          clearInterval(checkEditor);
        }
      }, 100);

      // Get initial deliverability analysis
      await analyzeDeliverability(emailData.subject, emailData.body);

    } catch (error) {
      console.error('Failed to load email:', error);
      toast.error('Failed to load email');
      router.push(returnUrl || '/leads');
    } finally {
      setIsLoading(false);
    }
  };

  const debounceQuickCheck = (() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        if (editorRef.current) {
          const body = editorRef.current.getContent();
          const result = await aiAgentsAPI.quickDeliverabilityCheck(subject, body);
          setQuickScore(result.score);
        }
      }, 1000);
    };
  })();

  const analyzeDeliverability = async (emailSubject: string, emailBody: string) => {
    try {
      setIsAnalyzing(true);
      const analysis = await aiAgentsAPI.analyzeEmailDeliverability({
        subject: emailSubject,
        body: emailBody,
        recipientType: 'lead'
      });
      setDeliverabilityAnalysis(analysis);
      setQuickScore(analysis.overallScore);
    } catch (error) {
      console.error('Failed to analyze deliverability:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!editorRef.current || !email) return;

    try {
      setIsSaving(true);
      const body = editorRef.current.getContent();

      await aiAgentsAPI.updateEmail(emailID!, {
        subject,
        body,
        scheduledFor,
        timing: selectedTiming
      });

      setHasChanges(false);
      toast.success('Email updated successfully!');

      // Update local state
      setEmail(prev => prev ? {
        ...prev,
        subject,
        body,
        scheduledFor: new Date(scheduledFor),
        timing: selectedTiming,
        isEdited: true
      } : null);

    } catch (error) {
      console.error('Failed to save email:', error);
      toast.error('Failed to save email');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateContent = async () => {
    if (!email || !sequenceID) return;

    try {
      setIsRegenerating(true);
      const regeneratedEmails = await aiAgentsAPI.regenerateEmails({
        sequenceID,
        emailOrders: [email.sequenceOrder],
        customInstructions: 'Regenerate with fresh content while maintaining the coach\'s authentic voice'
      });

      if (regeneratedEmails.length > 0) {
        const newEmail = regeneratedEmails[0];
        setSubject(newEmail.subject);
        editorRef.current?.setContent(newEmail.body);
        setHasChanges(true);
        toast.success('Content regenerated successfully!');

        // Re-analyze deliverability
        await analyzeDeliverability(newEmail.subject, newEmail.body);
      }
    } catch (error) {
      console.error('Failed to regenerate content:', error);
      toast.error('Failed to regenerate content');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleFullAnalysis = async () => {
    if (!editorRef.current) return;

    const body = editorRef.current.getContent();
    await analyzeDeliverability(subject, body);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-600/20 border-green-600/30';
    if (score >= 60) return 'bg-yellow-600/20 border-yellow-600/30';
    return 'bg-red-600/20 border-red-600/30';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#A0A0A0]">Loading email editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(returnUrl || '/leads')}
              className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sequence
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-white">Edit Email</h1>
              <p className="text-[#A0A0A0]">
                Email {email?.sequenceOrder} for {leadName} ({leadEmail})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {quickScore !== null && (
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreBg(quickScore)}`}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className={getScoreColor(quickScore)}>{quickScore}% deliverability</span>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Settings */}
            <div className="bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Email Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setHasChanges(true);
                      debounceQuickCheck();
                    }}
                    className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white placeholder:text-[#666] focus:border-violet-600/50 focus:outline-none"
                    placeholder="Enter email subject..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Send Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => {
                        setScheduledFor(e.target.value);
                        setHasChanges(true);
                      }}
                      className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white focus:border-violet-600/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Timing Description
                    </label>
                    <select
                      value={selectedTiming}
                      onChange={(e) => {
                        setSelectedTiming(e.target.value);
                        setHasChanges(true);
                      }}
                      className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white focus:border-violet-600/50 focus:outline-none"
                    >
                      {TIMING_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Email Content</h2>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateContent}
                    disabled={isRegenerating}
                    className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-fuchsia-600/50"
                  >
                    {isRegenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Regenerating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-3 h-3" />
                        Regenerate with AI
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {showPreview ? (
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4 min-h-[400px]">
                  <div className="border-b border-[#3A3A3A] pb-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                      <Mail className="w-4 h-4" />
                      <span>To: {leadEmail}</span>
                    </div>
                    <h3 className="text-white font-medium mt-2">{subject}</h3>
                  </div>
                  <div
                    className="text-[#D0D0D0] prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: editorRef.current?.getContent() || email?.body || ''
                    }}
                  />
                </div>
              ) : (
                <div>
                  <textarea id="email-editor" />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Email Stats</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    email?.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' :
                      email?.status === 'sent' ? 'bg-green-600/20 text-green-400 border-green-600/30' :
                        'bg-gray-600/20 text-gray-400 border-gray-600/30'
                  }`}>
                    {email?.status?.charAt(0).toUpperCase() + email?.status?.slice(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Sequence Position:</span>
                  <span className="text-white">{email?.sequenceOrder}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Manually Edited:</span>
                  <span className={email?.isEdited ? 'text-yellow-400' : 'text-green-400'}>
                    {email?.isEdited ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Deliverability Analysis */}
            <div className="bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Deliverability</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullAnalysis}
                  disabled={isAnalyzing}
                  className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-violet-600/50"
                >
                  {isAnalyzing ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Zap className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {deliverabilityAnalysis ? (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className={`p-3 rounded-lg border ${getScoreBg(deliverabilityAnalysis.overallScore)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Score</span>
                      <span className={`text-lg font-bold ${getScoreColor(deliverabilityAnalysis.overallScore)}`}>
                        {deliverabilityAnalysis.overallScore}%
                      </span>
                    </div>
                  </div>

                  {/* Primary Inbox Probability */}
                  <div className={`p-3 rounded-lg border ${getScoreBg(deliverabilityAnalysis.primaryInboxProbability)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Primary Inbox</span>
                      <span className={`text-lg font-bold ${getScoreColor(deliverabilityAnalysis.primaryInboxProbability)}`}>
                        {deliverabilityAnalysis.primaryInboxProbability}%
                      </span>
                    </div>
                  </div>

                  {/* Top Recommendations */}
                  {deliverabilityAnalysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Top Issues:</h4>
                      <div className="space-y-2">
                        {deliverabilityAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs">
                            <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span className="text-[#A0A0A0]">{rec.suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spam Triggers */}
                  {deliverabilityAnalysis.spamTriggers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Spam Triggers:</h4>
                      <div className="space-y-1">
                        {deliverabilityAnalysis.spamTriggers.slice(0, 2).map((trigger, index) => (
                          <div key={index} className={`px-2 py-1 rounded text-xs ${
                            trigger.severity === 'high' ? 'bg-red-600/20 text-red-400' :
                              trigger.severity === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                                'bg-gray-600/20 text-gray-400'
                          }`}>
                            "{trigger.trigger}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : quickScore !== null ? (
                <div className={`p-3 rounded-lg border ${getScoreBg(quickScore)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quick Score</span>
                    <span className={`text-lg font-bold ${getScoreColor(quickScore)}`}>
                      {quickScore}%
                    </span>
                  </div>
                  <p className="text-xs text-[#666] mt-1">Run full analysis for detailed insights</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-[#666]">Analyzing deliverability...</p>
                </div>
              )}
            </div>

            {/* AI Improvements */}
            {deliverabilityAnalysis?.improvements && deliverabilityAnalysis.improvements.length > 0 && (
              <div className="bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  AI Suggestions
                </h3>

                <div className="space-y-3">
                  {deliverabilityAnalysis.improvements.slice(0, 2).map((improvement, index) => (
                    <div key={index} className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-3">
                      <div className="text-xs text-[#666] mb-1">Suggestion #{index + 1}</div>
                      <div className="text-sm text-[#A0A0A0] mb-2">{improvement.reason}</div>
                      <div className="text-xs">
                        <div className="text-red-400 mb-1">Before: "{improvement.original.substring(0, 50)}..."</div>
                        <div className="text-green-400">After: "{improvement.improved.substring(0, 50)}..."</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmailPage;
