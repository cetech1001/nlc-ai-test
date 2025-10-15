'use client'

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  RefreshCw,
  CheckCircle,
  Mail,
  User,
  Calendar,
  TrendingUp,
  Send,
  X
} from "lucide-react";
import { BackTo, RichTextEditor } from "@nlc-ai/web-shared";
import { AlertBanner, Button, Skeleton } from '@nlc-ai/web-ui';
import { sdkClient } from '@/lib';
import type { GeneratedEmailResponse, EmailThreadDetail } from '@nlc-ai/sdk-email';

export default function ResponseReviewPage() {
  const router = useRouter();
  const params = useParams();

  const threadID = params.threadID as string;
  const responseID = params.responseID as string;

  const [responseData, setResponseData] = useState<GeneratedEmailResponse | null>(null);
  const [threadData, setThreadData] = useState<EmailThreadDetail | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [hasModifications, setHasModifications] = useState(false);

  useEffect(() => {
    if (threadID && responseID) {
      loadResponseData();
    }
  }, [threadID, responseID]);

  const loadResponseData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [responses, thread] = await Promise.all([
        sdkClient.email.threads.getThreadResponses(threadID),
        sdkClient.email.threads.getEmailThread(threadID)
      ]);

      const response = responses.find(r => r.id === responseID);
      if (!response) {
        setError("Response not found");
        return;
      }

      setResponseData(response);
      setThreadData(thread);
      setEmailSubject(response.subject);
      setEmailContent(response.body);

    } catch (err: any) {
      setError(err.message || "Failed to load response data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push(`/agents/emails/${threadID}`);
  };

  const handleSendEmail = async () => {
    if (!responseData) return;

    try {
      setIsSending(true);
      setError("");

      const replyData = {
        subject: emailSubject,
        html: emailContent
      };

      const result = await sdkClient.email.threads.replyToThread(threadID, replyData);

      if (result.success) {
        // Update the response record with what was actually sent
        if (hasModifications) {
          await sdkClient.agents.clientEmail.updateGeneratedResponse(responseID, {
            actualSubject: emailSubject,
            actualBody: emailContent,
          });
        }

        setSuccessMessage(`Email sent successfully to ${threadData?.participantEmail}`);

        // Redirect back to thread after a delay
        setTimeout(() => {
          router.push(`/agents/emails/${threadID}`);
        }, 2000);
      } else {
        setError(result.error?.message || "Failed to send email");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  const handleRejectResponse = async () => {
    if (!responseData) return;

    const confirmed = confirm("Are you sure you want to discard this response? This action cannot be undone.");
    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("Response discarded");

      setTimeout(() => {
        router.push(`/agents/emails/${threadID}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to discard response");
    }
  };

  const handleRegenerateResponse = async () => {
    if (!responseData) return;

    try {
      setIsRegenerating(true);
      setError("");

      // Use streaming to regenerate response
      const stream = await sdkClient.agents.clientEmail.streamEmailResponse(threadID);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let subject = '';
      let body = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'content') {
                fullContent += data.content;
              } else if (data.type === 'done') {
                subject = data.subject;
                body = data.body;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Update local state with new response
      setEmailSubject(subject);
      setEmailContent(body);
      setHasModifications(false);

      setSuccessMessage("Response regenerated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to regenerate response");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSubjectChange = (subject: string) => {
    setEmailSubject(subject);
    setHasModifications(true);
  };

  const handleContentChange = (content: string) => {
    setEmailContent(content);
    setHasModifications(true);
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
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

  const getDeliverabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 py-4 sm:py-6 lg:py-8 space-y-6 animate-pulse">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
        </div>
        <Skeleton className="h-6 bg-neutral-700 rounded w-48"/>

        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 bg-neutral-700 rounded w-64"/>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 bg-neutral-700 rounded w-20"/>
                  <Skeleton className="h-5 bg-neutral-700 rounded w-24"/>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-neutral-800/50 rounded-[20px] p-6 space-y-4">
          <Skeleton className="h-6 bg-neutral-700 rounded w-32"/>
          <Skeleton className="h-10 bg-neutral-700 rounded w-full"/>
          <div className="space-y-2">
            <Skeleton className="h-4 bg-neutral-700 rounded w-full"/>
            <Skeleton className="h-4 bg-neutral-700 rounded w-3/4"/>
            <Skeleton className="h-4 bg-neutral-700 rounded w-1/2"/>
          </div>
        </div>
      </div>
    );
  }

  if (!responseData || !threadData) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message={error || "Response not found"} onDismiss={clearMessages} />
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <BackTo onClick={handleBackClick} title="Review AI Response" />

      {successMessage && (
        <AlertBanner type="success" message={successMessage} onDismiss={clearMessages} />
      )}

      {error && (
        <AlertBanner type="error" message={error} onDismiss={clearMessages} />
      )}

      {/* Response Info */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed">
              Response for {threadData.participantName}
            </h2>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">Ready to Send</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Deliverability Score</div>
              <div className={`text-base font-medium ${getDeliverabilityColor(responseData.deliverabilityScore || 85)}`}>
                {responseData.deliverabilityScore || 85}/100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Email Context */}
      {threadData.messages.length > 0 && (
        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            Original Email Context
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {threadData.messages.slice(0, 3).map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${
                  message.from === threadData.participantEmail
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-neutral-800/50 border-neutral-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-300 text-sm font-medium">
                      {message.from === threadData.participantEmail ? 'Client' : 'You'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500 text-xs">
                    <Calendar className="w-3 h-3" />
                    {formatTimeAgo(message.sentAt)}
                  </div>
                </div>

                {message.subject && (
                  <div className="text-stone-200 font-medium text-sm mb-2">
                    {message.subject}
                  </div>
                )}

                <div className="text-stone-300 text-sm leading-relaxed">
                  {message.text?.substring(0, 300)}
                  {message.text && message.text.length > 300 && '...'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg font-semibold">AI-Generated Response</h3>

          <div className="flex items-center gap-2">
            {hasModifications && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                <span className="text-yellow-400 text-xs font-medium">Modified</span>
              </div>
            )}

            <Button
              onClick={handleRegenerateResponse}
              disabled={isRegenerating}
              variant="outline"
              className="border-neutral-700 text-stone-300 hover:text-white hover:border-purple-500"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6">
          {/* Subject Line */}
          <div className="mb-4">
            <label className="block text-stone-300 text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder:text-stone-400 focus:border-fuchsia-500 focus:outline-none"
            />
          </div>

          {/* Email Body */}
          <div className="mb-12 h-56">
            <label className="block text-stone-300 text-sm font-medium mb-2">Email Content</label>
            <RichTextEditor
              view={'desktop'}
              content={emailContent}
              updateContent={handleContentChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handleRejectResponse}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-2" />
              Discard Response
            </Button>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSendEmail}
                disabled={isSending}
                className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : 'Send Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-fuchsia-400" />
          AI Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-stone-300 text-sm">Response Quality</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${responseData.confidence * 100}%` }}
                />
              </div>
              <span className="text-white text-sm font-medium">
                {Math.round(responseData.confidence * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-stone-300 text-sm">Deliverability</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neutral-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (responseData.deliverabilityScore || 85) >= 80
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : (responseData.deliverabilityScore || 85) >= 60
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${responseData.deliverabilityScore || 85}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${getDeliverabilityColor(responseData.deliverabilityScore || 85)}`}>
                {responseData.deliverabilityScore || 85}/100
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-stone-300 text-sm">Personalization</div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">High</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg">
          <div className="text-stone-300 text-sm mb-2">Key Strengths:</div>
          <ul className="text-stone-400 text-sm space-y-1">
            <li>• Addresses client by name and references their specific situation</li>
            <li>• Maintains coach's authentic communication style</li>
            <li>• Provides actionable next steps</li>
            <li>• Professional tone appropriate for client relationship</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
