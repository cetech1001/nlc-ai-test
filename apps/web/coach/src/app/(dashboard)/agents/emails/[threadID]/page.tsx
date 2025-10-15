'use client'

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  User,
  Calendar,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Star,
  Sparkles,
  MessageSquare,
  Bot
} from "lucide-react";
import { BackTo } from "@nlc-ai/web-shared";
import { AlertBanner, Button, Skeleton } from '@nlc-ai/web-ui';
import { sdkClient } from '@/lib';
import type { EmailThreadDetail, GeneratedEmailResponse } from '@nlc-ai/sdk-email';

export default function EmailThreadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const threadID = params.threadID as string;

  const [threadData, setThreadData] = useState<EmailThreadDetail | null>(null);
  const [responses, setResponses] = useState<GeneratedEmailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [customInstructions, setCustomInstructions] = useState("");

  // Streaming state
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingSubject, setStreamingSubject] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (threadID) {
      loadThreadData();
    }
  }, [threadID]);

  const loadThreadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [thread, threadResponses] = await Promise.all([
        sdkClient.email.threads.getEmailThread(threadID),
        sdkClient.email.threads.getThreadResponses(threadID)
      ]);

      setThreadData(thread);
      setResponses(threadResponses);

      // Mark as read if it's unread
      if (!thread.isRead) {
        await sdkClient.email.threads.markThreadRead(threadID, true);
        setThreadData((prev) => prev ? { ...prev, isRead: true } : null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load thread data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push('/agents/emails');
  };

  const handleGenerateResponse = async () => {
    if (!threadData) return;

    try {
      setIsGenerating(true);
      setIsStreaming(true);
      setError("");
      setStreamingContent("");
      setStreamingSubject("");

      let savedResponseID: string | undefined;

      // Use the async generator for streaming
      const stream = sdkClient.agents.clientEmail.streamEmailResponse(
        threadID,
        customInstructions || undefined
      );

      for await (const chunk of stream) {
        if (chunk.type === 'content') {
          // Append streaming content in real-time
          setStreamingContent((prev) => prev + (chunk.content || ''));
        } else if (chunk.type === 'done') {
          // Final response received
          setStreamingSubject(chunk.subject || '');
          setStreamingContent(chunk.body || '');
          savedResponseID = chunk.responseID;
        }
      }

      // Clear streaming state
      setIsStreaming(false);
      setStreamingContent("");
      setStreamingSubject("");
      setCustomInstructions("");

      // Reload responses to show the saved one
      const updatedResponses = await sdkClient.email.threads.getThreadResponses(threadID);
      setResponses(updatedResponses);

      setSuccessMessage("AI response generated successfully!");

      // Navigate to the response review page
      if (savedResponseID) {
        setTimeout(() => {
          router.push(`/agents/emails/${threadID}/response/${savedResponseID}`);
        }, 1000);
      }
    } catch (err: any) {
      console.error('Stream error:', err);
      setError(err.message || "Failed to generate response");
      setIsStreaming(false);
      setStreamingContent("");
      setStreamingSubject("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewResponse = (responseID: string) => {
    router.push(`/agents/emails/${threadID}/response/${responseID}`);
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
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'normal': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 py-4 sm:py-6 lg:py-8 space-y-6 animate-pulse px-4">
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

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-neutral-800/50 rounded-[20px] p-6">
              <Skeleton className="h-6 bg-neutral-700 rounded w-32 mb-4"/>
              <div className="space-y-2">
                <Skeleton className="h-4 bg-neutral-700 rounded w-full"/>
                <Skeleton className="h-4 bg-neutral-700 rounded w-3/4"/>
                <Skeleton className="h-4 bg-neutral-700 rounded w-1/2"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!threadData) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message={error || "Thread not found"} onDismiss={clearMessages} />
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden px-4">
      <BackTo onClick={handleBackClick} title="Email Thread" />

      {successMessage && (
        <AlertBanner type="success" message={successMessage} onDismiss={clearMessages} />
      )}

      {error && (
        <AlertBanner type="error" message={error} onDismiss={clearMessages} />
      )}

      {/* Thread Header */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed">
              {threadData.subject}
            </h2>

            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(threadData.status)}`}>
                <span className="capitalize">{threadData.status}</span>
              </div>

              <div className={`flex items-center gap-1 px-2 py-1 ${getPriorityColor(threadData.priority)}`}>
                {getPriorityIcon(threadData.priority)}
                <span className="text-sm capitalize">{threadData.priority}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Client</div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-fuchsia-400" />
                <div className="text-stone-50 text-base font-medium">
                  {threadData.participantName || 'Unknown Client'}
                </div>
              </div>
              <div className="text-stone-400 text-sm">{threadData.participantEmail}</div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Messages</div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <div className="text-stone-50 text-base font-medium">{threadData.messageCount}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Last Message</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                <div className="text-stone-50 text-base font-medium">
                  {formatTimeAgo(threadData.lastMessageAt)}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">AI Responses</div>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-pink-400" />
                <div className="text-stone-50 text-base font-medium">{responses.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Response Generation */}
      <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-fuchsia-400" />
          Generate AI Response
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Custom Instructions (Optional)
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Add any specific instructions for the AI response..."
              className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder:text-stone-400 focus:border-fuchsia-500 focus:outline-none resize-none"
              rows={3}
              disabled={isGenerating}
            />
          </div>

          <Button
            onClick={handleGenerateResponse}
            disabled={isGenerating}
            className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors"
          >
            <Sparkles className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
            {isGenerating ? 'Generating Response...' : 'Generate AI Response'}
          </Button>

          {/* Live Streaming Preview */}
          {isStreaming && streamingContent && (
            <div className="relative mt-4 bg-gradient-to-b from-purple-900/20 to-fuchsia-900/20 rounded-[20px] border border-purple-500/30 p-6 overflow-hidden">
              <div className="absolute w-32 h-32 -right-8 -top-8 opacity-30 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[80px] animate-pulse" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                  <span className="text-fuchsia-400 text-sm font-medium">AI is generating your response...</span>
                </div>

                {streamingSubject && (
                  <div className="mb-3">
                    <div className="text-stone-400 text-xs mb-1">Subject:</div>
                    <div className="text-stone-200 font-medium">{streamingSubject}</div>
                  </div>
                )}

                <div className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {streamingContent}
                  <span className="inline-block w-2 h-4 bg-fuchsia-400 animate-pulse ml-1" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated Responses */}
      {responses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-400" />
            Generated Responses ({responses.length})
          </h3>

          <div className="space-y-4">
            {responses.map((response) => (
              <div
                key={response.id}
                className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-stone-50 text-lg font-medium">{response.subject}</h4>

                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        response.status === 'generated' ? 'text-blue-400 bg-blue-500/20 border border-blue-500/30' :
                          response.status === 'sent' ? 'text-green-400 bg-green-500/20 border border-green-500/30' :
                            response.status === 'scheduled' ? 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30' :
                              'text-gray-400 bg-gray-500/20 border border-gray-500/30'
                      }`}>
                        {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                      </div>
                    </div>

                    <div className="text-stone-300 text-sm leading-relaxed line-clamp-3 mb-3">
                      {response.body.substring(0, 200)}...
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-400">
                      <span>Confidence: {Math.round(response.confidence * 100)}%</span>
                      <span>Generated: {formatTimeAgo(response.createdAt)}</span>
                      {response.deliverabilityScore && (
                        <span>Deliverability: {response.deliverabilityScore}/100</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      onClick={() => handleViewResponse(response.id)}
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      Review & Send
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Messages */}
      <div className="space-y-4">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-400" />
          Email Thread ({threadData.messages.length} messages)
        </h3>

        <div className="space-y-4">
          {threadData.messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-[20px] border p-6 ${
                message.from === threadData.participantEmail
                  ? 'bg-blue-500/10 border-blue-500/30 ml-0 mr-8'
                  : 'bg-purple-500/10 border-purple-500/30 ml-8 mr-0'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-300 text-sm font-medium">
                    {message.from === threadData.participantEmail
                      ? `${threadData.participantName}`
                      : 'You'
                    }
                  </span>
                  <span className="text-stone-500 text-xs">({message.from})</span>
                </div>
                <div className="flex items-center gap-2 text-stone-500 text-xs">
                  <Calendar className="w-3 h-3" />
                  {formatTimeAgo(message.sentAt)}
                </div>
              </div>

              {message.subject && message.subject !== threadData.subject && (
                <div className="text-stone-200 font-medium text-sm mb-3">
                  {message.subject}
                </div>
              )}

              {message.text ? (
                <div className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: message.html || '' }}
                  className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
