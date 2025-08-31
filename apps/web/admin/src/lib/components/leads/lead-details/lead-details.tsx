'use client'

import {FC, useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { BackTo } from "@nlc-ai/web-shared";
import { AlertBanner, Button } from '@nlc-ai/web-ui';
import {Lead} from "@nlc-ai/sdk-leads";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit3,
  Send,
} from "lucide-react";
import {sdkClient, LeadDetailsSkeleton} from "@/lib";
import {QualificationSummary} from "./qualification-summary";
import {QualificationBadge} from "@/lib";
import {StatusBadge} from "./status-badge";
import {QuickActions} from "@/lib/components/leads/lead-details/quick-actions";
import {FormResponses} from "@/lib/components/leads/lead-details/form-responses";
import {Notes} from "@/lib/components/leads/lead-details/notes";
import {LeadTimeline} from "@/lib/components/leads/lead-details/lead-timeline";

interface IProps {
  leadID: string;
  isAdminView?: boolean;
  backUrl: string;
  backTitle: string;
}

export const LeadDetails: FC<IProps> = ({
  leadID,
  isAdminView = false,
  backUrl,
  backTitle,
}) => {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (leadID) {
      (() => loadLead())();
    }
  }, [leadID]);

  const loadLead = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await sdkClient.leads.getLead(leadID);
      setLead(response);
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
    router.push(`/leads/${leadID}/edit`);
  };

  const handleSendEmail = () => {
    router.push(`/leads/${leadID}/send-mail`);
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
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge status={lead.status} />
                  <QualificationBadge qualified={lead.qualified} />
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

      {lead.answers && <QualificationSummary lead={lead}/>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lead.answers && Object.keys(lead.answers).length > 0 && (
          <FormResponses lead={lead}/>
        )}

        {lead.notes && <Notes notes={lead.notes}/>}

        <LeadTimeline lead={lead}/>
      </div>

      <QuickActions leadID={leadID}/>
    </div>
  );
};
