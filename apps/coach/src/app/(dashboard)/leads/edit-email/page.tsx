'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  RotateCcw,
  TrendingUp,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@nlc-ai/ui';
import { aiAgentsAPI } from '@nlc-ai/api-client';
import { EmailInSequence, DeliverabilityAnalysis, TIMING_OPTIONS } from '@nlc-ai/types';
import dynamic from 'next/dynamic';
import { Skeleton } from '@nlc-ai/ui';
import {AiImprovements, DeliverabilityAnalysisStats, EmailStats, getScoreBg, getScoreColor} from "@/lib";

const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-96 rounded-lg" />
});

declare global {
  interface Window {
    tinymce: any;
  }
}

interface TinyMCEConfig {
  apiKey: string;
}

const EditEmailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // URL params
  const emailID = searchParams.get('emailID');
  const leadName = searchParams.get('leadName');
  const leadEmail = searchParams.get('leadEmail');
  const sequenceID = searchParams.get('sequenceID');
  const returnUrl = searchParams.get('returnUrl');

  const [tinyMCEConfig, setTinyMCEConfig] = useState<TinyMCEConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Email data
  const [email, setEmail] = useState<EmailInSequence | null>(null);
  const [subject, setSubject] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [selectedTiming, setSelectedTiming] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [emailContent, setEmailContent] = useState('');

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

    const fetchTinyMCEConfig = async () => {
      try {
        const response = await fetch('/api/tinymce/config');
        if (response.ok) {
          const config = await response.json();
          setTinyMCEConfig(config);
        }
      } catch (error) {
        console.error('Failed to load TinyMCE config:', error);
      } finally {
        setConfigLoading(false);
      }
    };

    Promise.all([
      fetchTinyMCEConfig(),
      loadEmail()
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [emailID]);

  const loadEmail = async () => {
    try {
      const emailData = await aiAgentsAPI.getEmailByID(emailID!);
      setEmail(emailData.email);
      setSubject(emailData.email.subject);
      setScheduledFor(new Date(emailData.email.scheduledFor || '').toISOString().slice(0, 16));
      setSelectedTiming(emailData.email.timing);
      setEmailContent(emailData.email.body);

      // Get initial deliverability analysis
      await analyzeDeliverability(emailData.email.subject, emailData.email.body);
    } catch (error) {
      console.error('Failed to load email:', error);
      toast.error('Failed to load email');
      router.push(returnUrl || '/leads');
    }
  };

  const debounceQuickCheck = (() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const result = await aiAgentsAPI.quickDeliverabilityCheck(subject, emailContent);
        setQuickScore(result.score);
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
    if (!email) return;

    try {
      setIsSaving(true);

      await aiAgentsAPI.updateEmail(emailID!, {
        subject,
        body: emailContent,
        scheduledFor,
        timing: selectedTiming
      });

      setHasChanges(false);
      toast.success('Email updated successfully!');

      // Update local state
      setEmail(prev => prev ? {
        ...prev,
        subject,
        body: emailContent,
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
        setEmailContent(newEmail.body);
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
    await analyzeDeliverability(subject, emailContent);
  };

  const handleEditorChange = (content: string) => {
    setEmailContent(content);
    setHasChanges(true);
    debounceQuickCheck();
  };

  if (isLoading || configLoading || !tinyMCEConfig) {
    return (
      <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32" />
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-40" />
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      {/* Absolute background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-1/4 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-1/4 -top-20 opacity-30 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
        <div className="absolute w-56 h-56 right-12 bottom-1/4 opacity-25 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full blur-[112px]" />
      </div>

      {/* Header - Buttons first */}
      <div className="flex items-center justify-between relative z-10">
        <Button
          variant="outline"
          onClick={() => router.push(returnUrl || '/leads')}
          className="border-neutral-700 text-stone-300 hover:text-stone-50 hover:border-neutral-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sequence
        </Button>

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
            className="border-neutral-700 text-stone-300 hover:text-stone-50 hover:border-neutral-600"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-purple-700 text-white disabled:opacity-50"
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

      {/* Page Title and Description */}
      <div className="relative z-10">
        <h1 className="text-stone-50 text-2xl sm:text-3xl font-semibold leading-relaxed">Edit Email</h1>
        <p className="text-stone-300 text-base">
          Email {email?.sequenceOrder} for {leadName} ({leadEmail})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Settings */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute w-56 h-56 -left-12 -top-20 opacity-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
            <div className="relative z-10">
              <h2 className="text-stone-50 text-lg font-semibold mb-4">Email Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
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
                    className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-stone-50 placeholder:text-stone-400 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Enter email subject..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Send Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => {
                        setScheduledFor(e.target.value);
                        setHasChanges(true);
                      }}
                      className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-stone-50 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Timing Description
                    </label>
                    <select
                      value={selectedTiming}
                      onChange={(e) => {
                        setSelectedTiming(e.target.value);
                        setHasChanges(true);
                      }}
                      className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-stone-50 focus:border-purple-500 focus:outline-none transition-colors"
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
          </div>

          {/* Email Content */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute w-56 h-56 right-12 -top-20 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-stone-50 text-lg font-semibold">Email Content</h2>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateContent}
                    disabled={isRegenerating}
                    className="border-neutral-600 text-stone-300 hover:text-stone-50 hover:border-fuchsia-500"
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
                <div className="bg-neutral-800/50 border border-neutral-600 rounded-lg p-4 min-h-[400px]">
                  <div className="border-b border-neutral-600 pb-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-stone-400">
                      <Mail className="w-4 h-4" />
                      <span>To: {leadEmail}</span>
                    </div>
                    <h3 className="text-stone-50 font-medium mt-2">{subject}</h3>
                  </div>
                  <div
                    className="text-stone-200 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: emailContent || ''
                    }}
                  />
                </div>
              ) : (
                <div className="tinymce-wrapper">
                  <Editor
                    apiKey={tinyMCEConfig.apiKey}
                    value={emailContent}
                    onEditorChange={handleEditorChange}
                    init={{
                      height: 400,
                      menubar: false,
                      elementpath: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link | forecolor backcolor | outdent indent',
                      content_style: `
                        body {
                          font-family: Inter, sans-serif;
                          font-size: 14px;
                          color: #d6d3d1;
                          background: rgb(0 0 0 / 1);
                          line-height: 1.6;
                          margin: 0;
                          padding: 12px;
                        }
                        a { color: #9333ea; text-decoration: underline; }
                        strong { color: #f5f5f4; }
                      `,
                      skin: 'oxide-dark',
                      content_css: 'dark',
                      resize: false,
                      branding: false,
                      setup: (editor: any) => {
                        editor.on('init', () => {
                          const container = editor.getContainer();
                          if (container) {
                            container.style.border = '1px solid rgb(64, 64, 64)';
                            container.style.borderRadius = '8px';
                            container.style.backgroundColor = 'rgba(23, 23, 23, 0.5)';
                          }
                        });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <EmailStats email={email} />

          <DeliverabilityAnalysisStats
            isAnalyzing={isAnalyzing}
            quickScore={quickScore}
            deliverabilityAnalysis={deliverabilityAnalysis}
            handleFullAnalysis={handleFullAnalysis} />

          {deliverabilityAnalysis?.improvements
            && deliverabilityAnalysis.improvements.length > 0
            && (
            <AiImprovements
              improvements={deliverabilityAnalysis.improvements}
              isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* TinyMCE Styles */}
      <style jsx global>{`
        .tox .tox-editor-header {
          background-color: rgba(23, 23, 23, 0.8) !important;
          border: 1px solid rgb(64, 64, 64) !important;
          border-bottom: none !important;
          border-radius: 8px 8px 0 0 !important;
        }

        .tox .tox-edit-area {
          border: 1px solid rgb(64, 64, 64) !important;
          border-top: none !important;
          border-radius: 0 0 8px 8px !important;
        }

        .tox .tox-statusbar {
          background-color: rgba(23, 23, 23, 0.8) !important;
          border: 1px solid rgb(64, 64, 64) !important;
          border-top: none !important;
        }

        .tox .tox-toolbar {
          background-color: rgba(23, 23, 23, 0.8) !important;
        }

        .tox .tox-tbtn {
          color: #d6d3d1 !important;
        }

        .tox .tox-tbtn:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }

        .tox .tox-tbtn--enabled {
          background-color: rgba(147, 51, 234, 0.3) !important;
          color: white !important;
        }

        .tox .tox-menubar {
          background-color: rgba(23, 23, 23, 0.8) !important;
        }

        .tinymce-wrapper {
          border-radius: 8px !important;
        }

        .tinymce-wrapper .tox-tinymce {
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default EditEmailPage;
