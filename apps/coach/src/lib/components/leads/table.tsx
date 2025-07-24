import { tableRenderers } from "@nlc-ai/shared";
import { EmailSequenceWithEmails } from "@nlc-ai/types";
import {
  Mail,
  Pause,
  X,
  Loader2,
  Settings,
  Play,
  Edit3,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

export const coachLeadColumns = (
  getSequenceForLead: (leadID: string) => EmailSequenceWithEmails | undefined,
  isGeneratingSequence: string
) => [
  {
    key: 'name',
    header: 'Name',
    width: '15%',
    render: (value: string) => (
      <div className="font-medium text-white">{value}</div>
    )
  },
  {
    key: 'email',
    header: 'Email',
    width: '20%',
    render: (value: string) => (
      <div className="text-[#A0A0A0]">{tableRenderers.truncateText(value, 25)}</div>
    )
  },
  {
    key: 'source',
    header: 'Source',
    width: '10%',
    render: (value: string) => (
      <span className="px-2 py-1 rounded-full text-xs bg-gray-600/20 text-gray-300">
        {value}
      </span>
    )
  },
  {
    key: 'status',
    header: 'Status',
    width: '12%',
    render: (value: string, row: any) => {
      const statusConfig = {
        contacted: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', label: 'Not Converted' },
        scheduled: { bg: 'bg-blue-600/20', text: 'text-blue-400', label: 'Scheduled' },
        converted: { bg: 'bg-green-600/20', text: 'text-green-400', label: 'Converted' },
        unresponsive: { bg: 'bg-red-600/20', text: 'text-red-400', label: 'No Show' }
      };
      const config = statusConfig[row.rawStatus as keyof typeof statusConfig] || statusConfig.contacted;

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      );
    }
  },
  {
    key: 'aiSequence',
    header: 'AI Sequence',
    width: '20%',
    render: (value: any, row: any) => {
      const sequence = getSequenceForLead(row.originalID);

      if (isGeneratingSequence === row.originalID) {
        return (
          <div className="flex items-center gap-2 text-purple-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs">Generating...</span>
          </div>
        );
      }

      if (!sequence) {
        return (
          <div className="flex flex-col gap-1">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-400 w-fit">
              No Sequence
            </span>
            <span className="text-xs text-gray-500">Ready to create</span>
          </div>
        );
      }

      const sentEmails = sequence.emails?.filter(email => email.status === 'sent').length || 0;
      const scheduledEmails = sequence.emails?.filter(email => email.status === 'scheduled').length || 0;
      const failedEmails = sequence.emails?.filter(email => email.status === 'failed').length || 0;

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              sequence.isActive ?
                'bg-purple-600/20 text-purple-400' :
                'bg-gray-600/20 text-gray-400'
            }`}>
              {sequence.isActive ? 'Active' : 'Paused'}
            </span>

            {failedEmails > 0 && (
              <AlertTriangle className="w-3 h-3 text-red-400" title={`${failedEmails} failed emails`} />
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>{sentEmails}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <Clock className="w-3 h-3" />
              <span>{scheduledEmails}</span>
            </div>
            <span className="text-gray-500">/{sequence.totalEmails}</span>
          </div>
        </div>
      );
    }
  },
  {
    key: 'meetingDate',
    header: 'Meeting Date',
    width: '12%',
    render: (value: string) => (
      <div className="text-sm text-[#A0A0A0]">{value}</div>
    )
  },
  {
    key: 'actions',
    header: 'Actions',
    width: '15%',
    render: (value: any, row: any, onRowAction?: (action: string, row: any) => void) => {
      const sequence = getSequenceForLead(row.originalID);
      const hasActiveSequence = !!sequence;
      const isSequencePaused = sequence && !sequence.isActive;

      return (
        <div className="flex gap-1 flex-wrap">
          {/* Edit Lead */}
          <button
            onClick={() => onRowAction?.('edit', row)}
            className="p-1.5 rounded text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
            title="Edit Lead"
          >
            <Edit3 className="w-3 h-3" />
          </button>

          {/* Sequence Actions */}
          {!hasActiveSequence ? (
            <button
              onClick={() => onRowAction?.('create-sequence', row)}
              className="p-1.5 rounded text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors flex items-center gap-1"
              disabled={isGeneratingSequence === row.originalID}
              title="Create AI Sequence"
            >
              {isGeneratingSequence === row.originalID ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="flex gap-1">
              {/* Sequence Settings */}
              <button
                onClick={() => onRowAction?.('email', row)}
                className="p-1.5 rounded text-xs bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors"
                title="Manage Sequence"
              >
                <Settings className="w-3 h-3" />
              </button>

              {/* Pause/Resume */}
              {isSequencePaused ? (
                <button
                  onClick={() => onRowAction?.('resume-sequence', row)}
                  className="p-1.5 rounded text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                  title="Resume Sequence"
                >
                  <Play className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => onRowAction?.('pause-sequence', row)}
                  className="p-1.5 rounded text-xs bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 transition-colors"
                  title="Pause Sequence"
                >
                  <Pause className="w-3 h-3" />
                </button>
              )}

              {/* Cancel */}
              <button
                onClick={() => onRowAction?.('cancel-sequence', row)}
                className="p-1.5 rounded text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                title="Cancel Sequence"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Send Manual Email */}
          <button
            onClick={() => onRowAction?.('email', row)}
            className="p-1.5 rounded text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
            title="Send Manual Email"
          >
            <Mail className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onRowAction?.('delete', row)}
            className="p-1.5 rounded text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
            title="Delete Lead"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    },
  },
];
