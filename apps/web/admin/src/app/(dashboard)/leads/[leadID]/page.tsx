'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackTo } from "@nlc-ai/web-shared";
import { AlertBanner, Button } from '@nlc-ai/web-ui';
import { Lead } from "@nlc-ai/sdk-leads";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Edit3,
  Send
} from "lucide-react";

interface LeadDetailsProps {
  leadID: string;
  isAdminView?: boolean;
  backUrl: string;
  backTitle: string;
  apiEndpoint: string; // e.g., '/api/admin/leads' or '/api/leads'
}

const LeadDetailsSkeleton = () => (
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-neutral-800/30 rounded-[20px] p-6 space-y-4">
          <div className="h-6 bg-neutral-700 rounded w-32"></div>
          <div className="h-20 bg-neutral-700 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    contacted: {
      bg: 'bg-yellow-600/20',
      text: 'text-yellow-400',
      border: 'border-yellow-600/30',
      label: 'Not Converted',
      icon: MessageSquare
    },
    scheduled: {
      bg: 'bg-blue-600/20',
      text: 'text-blue-400',
      border: 'border-blue-600/30',
      label: 'Scheduled',
      icon: Calendar
    },
    converted: {
      bg: 'bg-green-600/20',
      text: 'text-green-400',
      border: 'border-green-600/30',
      label: 'Converted',
      icon: CheckCircle
    },
    unresponsive: {
      bg: 'bg-red-600/20',
      text: 'text-red-400',
      border: 'border-red-600/30',
      label: 'No Show',
      icon: AlertCircle
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.contacted;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} border ${config.border}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const LeadDetails: React.FC<LeadDetailsProps> = ({
                                                   leadID,
                                                   isAdminView = false,
                                                   backUrl,
                                                   backTitle,
                                                   apiEndpoint
                                                 }) => {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (leadID) {
      loadLead();
    }
  }, [leadID]);

  const loadLead = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`${apiEndpoint}/${leadID}`);
      if (!response.ok) {
        throw new Error('Failed to load lead');
      }

      const data = await response.json();
      setLead(data.data || data);
    } catch (err: any) {
      setError(err.message || "Failed to load lead data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push(backUrl);
  };

  const handleEdit = () => {
    const editUrl = isAdminView ? `/leads/edit?leadID=${leadID}` : `/leads/edit?leadID=${leadID}`;
    router.push(editUrl);
  };

  const handleSendEmail = () => {
    // This would open an email composition modal or navigate to email page
    console.log('Send email to lead:', leadID);
  };

  if (isLoading) {
    return <LeadDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message={error} onDismiss={() => setError('')} />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message="Lead not found" onDismiss={() => setError('')} />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'text-green-400';
      case 'scheduled': return 'text-blue-400';
      case 'contacted': return 'text-yellow-400';
      case 'unresponsive': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <BackTo onClick={handleBackClick} title={backTitle} />

      {/* Lead Header Card */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>

              <div>
                <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed">
                  {lead.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={lead.status} />
                  {lead.qualified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Qualified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleEdit}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Lead
              </Button>
              <Button
                onClick={handleSendEmail}
                className="px-4 py-2 border border-neutral-600 text-stone-300 rounded-lg hover:border-fuchsia-400 hover:text-white transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-300 text-sm">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <div className="text-stone-50 text-base font-medium">{lead.email}</div>
            </div>

            {lead.phone && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-stone-300 text-sm">
                  <Phone className="w-4 h-4" />
                  Phone
                </div>
                <div className="text-stone-50 text-base font-medium">{lead.phone}</div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-300 text-sm">
                <Calendar className="w-4 h-4" />
                Created Date
              </div>
              <div className="text-stone-50 text-base font-medium">
                {new Date(lead.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>

            {lead.source && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-stone-300 text-sm">
                  <MapPin className="w-4 h-4" />
                  Source
                </div>
                <div className="text-stone-50 text-base font-medium capitalize">
                  {lead.source.replace('_', ' ')}
                </div>
              </div>
            )}
          </div>

          {/* Meeting Information */}
          {lead.meetingDate && (
            <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">Scheduled Meeting</div>
                  <div className="text-blue-300 text-sm">
                    {new Date(lead.meetingDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    {lead.meetingTime && ` at ${lead.meetingTime}`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes Section */}
        {lead.notes && (
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-stone-50 text-lg font-medium">Notes</h3>
              </div>

              <div className="bg-neutral-800/50 rounded-lg p-4">
                <p className="text-stone-300 leading-relaxed">{lead.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Answers Section */}
        {lead.answers && Object.keys(lead.answers).length > 0 && (
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-emerald-200 via-emerald-600 to-blue-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-stone-50 text-lg font-medium">Form Responses</h3>
              </div>

              <div className="space-y-3">
                {Object.entries(lead.answers).map(([question, answer], index) => (
                  <div key={index} className="bg-neutral-800/50 rounded-lg p-4">
                    <div className="text-emerald-400 text-sm font-medium mb-2 capitalize">
                      {question.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className="text-stone-300">
                      {typeof answer === 'string' ? answer : JSON.stringify(answer)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden lg:col-span-2">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-48 h-48 -left-6 -top-10 bg-gradient-to-l from-violet-200 via-violet-600 to-purple-600 rounded-full blur-[56px]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-stone-50 text-lg font-medium">Lead Timeline</h3>
            </div>

            <div className="space-y-4">
              {/* Created */}
              <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Lead Created</div>
                  <div className="text-stone-400 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(lead.status).replace('text-', 'bg-')}`} />
              </div>

              {/* Submitted */}
              {lead.submittedAt && (
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">Form Submitted</div>
                    <div className="text-stone-400 text-xs">
                      {new Date(lead.submittedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Last Contacted */}
              {lead.lastContactedAt && (
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">Last Contacted</div>
                    <div className="text-stone-400 text-xs">
                      {new Date(lead.lastContactedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Meeting Scheduled */}
              {lead.meetingDate && (
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">Meeting Scheduled</div>
                    <div className="text-stone-400 text-xs">
                      {new Date(lead.meetingDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {lead.meetingTime && ` at ${lead.meetingTime}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Converted */}
              {lead.convertedAt && (
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">Successfully Converted</div>
                    <div className="text-stone-400 text-xs">
                      {new Date(lead.convertedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              )}

              {/* Current Status Indicator */}
              {!lead.convertedAt && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-fuchsia-600/10 to-violet-600/10 border border-fuchsia-600/20 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    lead.status === 'scheduled' ? 'bg-blue-500/20' :
                      lead.status === 'contacted' ? 'bg-yellow-500/20' :
                        'bg-red-500/20'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${getStatusColor(lead.status)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">Current Status</div>
                    <div className="text-stone-400 text-xs">
                      Awaiting {lead.status === 'scheduled' ? 'meeting' :
                      lead.status === 'contacted' ? 'response' :
                        'follow-up'}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(lead.status).replace('text-', 'bg-')}`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6">
        <h3 className="text-stone-50 text-lg font-medium mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => console.log('Mark as contacted')}
            className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 hover:bg-yellow-600/30"
          >
            Mark as Contacted
          </Button>
          <Button
            onClick={() => console.log('Schedule meeting')}
            className="bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30"
          >
            Schedule Meeting
          </Button>
          <Button
            onClick={() => console.log('Mark as converted')}
            className="bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30"
          >
            Mark as Converted
          </Button>
          <Button
            onClick={() => console.log('Mark unresponsive')}
            className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
          >
            Mark as Unresponsive
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
