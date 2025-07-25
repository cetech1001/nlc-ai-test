'use client'

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Edit,
  Mail,
  User,
  Calendar,
  TrendingUp
} from "lucide-react";
import { BackTo } from "@nlc-ai/shared";
import { EmailEditor } from "@nlc-ai/shared";
import { AlertBanner } from '@nlc-ai/ui';
import { aiAgentsAPI } from '@nlc-ai/api-client';
import { ClientEmailResponse, EmailThreadDetail } from '@nlc-ai/types';

export default function ClientEmailDetails() {
  const router = useRouter();
  const params = useParams();

  const emailID = params.emailID as string;
  const clientID = params.clientID as string;

  const [emailData, setEmailData] = useState<ClientEmailResponse | null>(null);
  const [threadData, setThreadData] = useState<EmailThreadDetail | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [hasModifications, setHasModifications] = useState(false);

  useEffect(() => {
    if (emailID) {
      loadEmailData();
    }
  }, [emailID]);

  const loadEmailData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Get pending responses to find our email
      const pendingResponses = await aiAgentsAPI.getPendingClientResponses();
      const email = pendingResponses.find(e => e.id === emailID);

      if (!email) {
        setError("Email not found or no longer pending approval");
        return;
      }

      setEmailData(email);
      setEmailSubject(email.subject);
      setEmailContent(email.body);

      // Load thread data if available
      if (email.threadID) {
        const thread = await aiAgentsAPI.getClientEmailThread(email.threadID);
        setThreadData(thread);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load email data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push(`/clients/${clientID}/emails`);
  };

  const handleApproveEmail = async () => {
    if (!emailData) return;

    try {
      setIsApproving(true);
      setError("");

      const modifications = hasModifications ? {
        subject: emailSubject,
        body: emailContent
      } : undefined;

      const result = await aiAgentsAPI.approveClientResponse(emailData.id, modifications);

      if (result.success) {
        setSuccessMessage(`Email sent successfully to ${emailData.client?.email}`);

        // Redirect back to list after a delay
        setTimeout(() => {
          router.push(`/clients/${clientID}/emails`);
        }, 2000);
      } else {
        setError(result.message || "Failed to send email");
      }
    } catch (err: any) {
      setError(err.message || "Failed to approve email");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectEmail = async () => {
    if (!emailData) return;

    const confirmed = confirm("Are you sure you want to reject this response? This action cannot be undone.");
    if (!confirmed) return;

    try {
      setError("");

      const result = await aiAgentsAPI.rejectClientResponse(emailData.id);

      if (result.success) {
        setSuccessMessage("Response rejected successfully");

        // Redirect back to list
        setTimeout(() => {
          router.push(`/clients/${clientID}/emails`);
        }, 1500);
      } else {
        setError(result.message || "Failed to reject response");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reject response");
    }
  };

  const handleRegenerateResponse = async () => {
    if (!emailData?.threadID) return;

    try {
      setIsRegenerating(true);
      setError("");

      const newResponse = await aiAgentsAPI.regenerateClientResponse(emailData.threadID);

      // Update local state with new response
      setEmailData(newResponse);
      setEmailSubject(newResponse.subject);
      setEmailContent(newResponse.body);
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
      <div className="py-4 sm:py-6 lg:py-8 space-y-6 animate-pulse">
        <div className="h-6 bg-neutral-700 rounded w-48"></div>

        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
          <div className="space-y-4">
            <div className="h-8 bg-neutral-700 rounded w-64"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-neutral-700 rounded w-20"></div>
                  <div className="h-5 bg-neutral-700 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-neutral-800/50 rounded-[20px] p-6 space-y-4">
          <div className="h-6 bg-neutral-700 rounded w-32"></div>
          <div className="h-10 bg-neutral-700 rounded w-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!emailData) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message={error || "Email not found"} onDismiss={clearMessages} />
      </div>
    );
  }

  const recipientInfo = emailData.client ? {
    name: `${emailData.client.firstName} ${emailData.client.lastName}`,
    email: emailData.client.email,
    userId: emailData.client.id,
    plan: emailData.client.status || 'Unknown',
    dateJoined: "N/A",
    lastActive: "N/A"
  } : {
    name: "Unknown Client",
    email: "unknown@email.com",
    userId: "unknown",
    plan: "Unknown",
    dateJoined: "N/A",
    lastActive: "N/A"
  };

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <BackTo onClick={handleBackClick} title="AI-Generated Response" />

      {successMessage && (
        <AlertBanner type="success" message={successMessage} onDismiss={clearMessages} />
      )}

      {error && (
        <AlertBanner type="error" message={error} onDismiss={clearMessages} />
      )}

      {/* Client & Email Info */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed">
              Response for {emailData.client?.firstName} {emailData.client?.lastName}
            </h2>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">Pending Approval</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Client Email</div>
              <div className="text-stone-50 text-base font-medium">{emailData.client?.email}</div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Generated</div>
              <div className="text-stone-50 text-base font-medium">
                {formatTimeAgo(emailData.generatedAt)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">AI Confidence</div>
              <div className="text-stone-50 text-base font-medium">
                {Math.round(emailData.aiConfidence * 100)}%
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Deliverability Score</div>
              <div className={`text-base font-medium ${getDeliverabilityColor(emailData.deliverabilityScore)}`}>
                {emailData.deliverabilityScore}/100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Email Context (if available) */}
      {threadData && threadData.messages.length > 0 && (
        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Original Email Thread
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {threadData.messages.slice(0, 3).map((message, index) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${
                  message.senderEmail === emailData.client?.email
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-neutral-800/50 border-neutral-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-300 text-sm font-medium">
                      {message.senderEmail === emailData.client?.email ? 'Client' : 'You'}
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
                  {message.bodyText?.substring(0, 300)}
                  {message.bodyText && message.bodyText.length > 300 && '...'}
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
                <Edit className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-medium">Modified</span>
              </div>
            )}

            <button
              onClick={handleRegenerateResponse}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-3 py-1.5 border border-neutral-700 text-stone-300 hover:text-white hover:border-blue-500 transition-colors rounded-lg text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        </div>

        <EmailEditor
          initialSubject={emailSubject}
          initialContent={emailContent}
          onSubjectChange={handleSubjectChange}
          onContentChange={handleContentChange}
          onSend={handleApproveEmail}
          onDiscard={handleRejectEmail}
          recipientInfo={recipientInfo}
          templateActions={false}
          sendButtonText={isApproving ? 'Sending...' : 'Approve & Send'}
          discardButtonText="Reject Response"
          isLoading={isApproving}
          showDeliverabilityScore={true}
          deliverabilityScore={emailData.deliverabilityScore}
        />
      </div>

      {/* AI Analysis */}
      <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          AI Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-stone-300 text-sm">Response Quality</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${emailData.aiConfidence * 100}%` }}
                />
              </div>
              <span className="text-white text-sm font-medium">
                {Math.round(emailData.aiConfidence * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-stone-300 text-sm">Deliverability</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neutral-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    emailData.deliverabilityScore >= 80
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : emailData.deliverabilityScore >= 60
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${emailData.deliverabilityScore}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${getDeliverabilityColor(emailData.deliverabilityScore)}`}>
                {emailData.deliverabilityScore}/100
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
