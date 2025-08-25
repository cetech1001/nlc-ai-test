import {Calendar, CheckCircle, Clock, FileText, MessageSquare, TrendingUp, User} from "lucide-react";
import {Lead} from "@nlc-ai/sdk-leads";
import {FC} from "react";

interface IProps {
  lead: Lead;
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

export const LeadTimeline: FC<IProps> = ({ lead }) => {
  return (
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
  );
}
