import {CheckCircle, Sparkles} from "lucide-react";
import {Lead, LeadStatus} from "@nlc-ai/sdk-leads";
import {FC, useMemo} from "react";

interface IProps {
  status: LeadStatus;
  showStatusChange?: boolean;
  lead?: Lead
}

const automations = {
  contacted: {
    title: 'Welcome & Nurture Sequence',
    description: 'Sends welcome email, value content, and gentle follow-ups to build trust',
    emails: ['Welcome email', 'Value guide', '3-day follow-up', 'Case study'],
    triggerNote: 'Will restart nurture sequence from beginning'
  },
  scheduled: {
    title: 'Meeting Preparation Sequence',
    description: 'Confirms meeting, sends preparation materials, and reminder notifications',
    emails: ['Meeting confirmation', 'Prep materials', '24h reminder', '1h reminder'],
    triggerNote: 'Will send meeting confirmation immediately'
  },
  converted: {
    title: 'Onboarding & Success Sequence',
    description: 'Celebrates conversion, provides onboarding, and ensures successful start',
    emails: ['Welcome aboard', 'Onboarding guide', 'First week check-in', 'Success tips'],
    triggerNote: 'Will send congratulations and onboarding sequence'
  },
  unresponsive: {
    title: 'Re-engagement & Recovery Sequence',
    description: 'Attempts to re-engage with value offers and alternative communication',
    emails: ['Check-in email', 'Value offer', 'Different approach', 'Final attempt'],
    triggerNote: 'Will attempt re-engagement over 2-week period'
  }
};

export const getStatusAutomation = (status: string) => {
  return automations[status as keyof typeof automations] || automations.contacted;
};

export const AutomationPreview: FC<IProps> = ({ status, showStatusChange, lead }) => {
  const currentAutomation = useMemo(() => {
    return getStatusAutomation(status);
  }, [status]);

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Current Automation */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

        <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Active Automation</h3>
              <p className="text-[#A0A0A0] text-sm">Current email sequence</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
              <h4 className="text-white font-medium mb-2">{currentAutomation.title}</h4>
              <p className="text-[#A0A0A0] text-sm mb-4">{currentAutomation.description}</p>

              <div className="space-y-2">
                <div className="text-[#A0A0A0] text-xs font-medium mb-2">AUTOMATED EMAILS:</div>
                {currentAutomation.emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-[#0A0A0A] rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-full flex items-center justify-center text-xs text-violet-400 font-medium">
                      {index + 1}
                    </div>
                    <span className="text-white text-sm">{email}</span>
                  </div>
                ))}
              </div>
              {!lead && (
                <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-400 text-sm font-medium">Auto-Trigger Enabled</span>
                  </div>
                  <p className="text-[#A0A0A0] text-xs">
                    Email sequence will automatically start when this lead is created with the selected status.
                  </p>
                </div>
              )}
            </div>

            {lead && (
              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 text-sm font-medium">
                      {showStatusChange ? 'Will Update on Save' : 'Currently Active'}
                    </span>
                </div>
                <p className="text-[#A0A0A0] text-xs">
                  {showStatusChange
                    ? 'Email sequence will change when you save these updates.'
                    : 'This email sequence is currently running for this lead.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {lead && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>

          <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Lead Timeline</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <div>
                  <div className="text-white text-sm">Lead Created</div>
                  <div className="text-[#A0A0A0] text-xs">
                    {lead && new Date(lead.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {lead?.lastContactedAt && (
                <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-white text-sm">Last Contacted</div>
                    <div className="text-[#A0A0A0] text-xs">
                      {new Date(lead.lastContactedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {lead?.convertedAt && (
                <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-white text-sm">Converted</div>
                    <div className="text-[#A0A0A0] text-xs">
                      {new Date(lead.convertedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
