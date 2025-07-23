import { tableRenderers } from "@nlc-ai/shared";
import { DataTableLead, Lead } from "@nlc-ai/types";
import { Mail, Sparkles, Pause, X, Loader2 } from "lucide-react";

export const transformLeadData = (leads: Lead[]): DataTableLead[] => {
  return leads.map(lead => ({
    id: `#${lead.id.slice(-4)}`,
    name: `${lead.firstName} ${lead.lastName}`,
    email: lead.email,
    phone: lead.phone || 'N/A',
    source: lead.source || 'Unknown',
    status: lead.status.charAt(0).toUpperCase() + lead.status.slice(1),
    meetingDate: lead.meetingDate ? new Date(lead.meetingDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Not scheduled',
    lastContacted: lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) : 'Never',
    rawStatus: lead.status,
    originalID: lead.id,
  }));
};

const colWidth = 100 / 8;

export const coachLeadColumns = (
  getSequenceForLead: (leadID: string) => any,
  isGeneratingSequence: string
) => [
  {
    key: 'name',
    header: 'Name',
    width: `${colWidth}%`,
    render: (value: string) => value
  },
  {
    key: 'email',
    header: 'Email',
    width: `${colWidth * (4 / 3)}%`,
    render: (value: string) => tableRenderers.truncateText(value, 22)
  },
  {
    key: 'phone',
    header: 'Phone',
    width: `${colWidth}%`,
    render: (value: string) => value
  },
  {
    key: 'source',
    header: 'Source',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => value
  },
  {
    key: 'status',
    header: 'Status',
    width: `${colWidth * (2 / 3)}%`,
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
    width: `${colWidth}%`,
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
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-400">
            No Sequence
          </span>
        );
      }

      const scheduledCount = sequence.scheduledEmails?.filter(
        (email: any) => email.status === 'scheduled'
      ).length || 0;

      console.log("Scheduled count", scheduledCount);

      const sentCount = sequence.scheduledEmails?.filter(
        (email: any) => email.status === 'sent'
      ).length || 0;

      console.log("Sent count", sentCount);

      return (
        <div className="flex flex-col gap-1">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-600/20 text-purple-400">
            Active
          </span>
          <span className="text-xs text-gray-400">
            {sentCount} sent, {scheduledCount} pending
          </span>
        </div>
      );
    }
  },
  {
    key: 'meetingDate',
    header: 'Meeting Date',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => value
  },
  {
    key: 'actions',
    header: 'Actions',
    width: `${colWidth}%`,
    render: (value: any, row: any, onRowAction?: (action: string, row: any) => void) => {
      const sequence = getSequenceForLead(row.originalID);
      const hasActiveSequence = !!sequence;

      return (
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => onRowAction?.('edit', row)}
            className="px-2 py-1 rounded text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
          >
            Edit
          </button>

          {!hasActiveSequence ? (
            <button
              onClick={() => onRowAction?.('generate-sequence', row)}
              className="px-2 py-1 rounded text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors flex items-center gap-1"
              disabled={isGeneratingSequence === row.originalID}
              title="Generate AI Sequence"
            >
              <Sparkles className="w-3 h-3" />
              {isGeneratingSequence === row.originalID ? 'Gen...' : 'AI'}
            </button>
          ) : (
            <>
              <button
                onClick={() => onRowAction?.('pause-sequence', row)}
                className="px-2 py-1 rounded text-xs bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 transition-colors"
                title="Pause Sequence"
              >
                <Pause className="w-3 h-3" />
              </button>
              <button
                onClick={() => onRowAction?.('cancel-sequence', row)}
                className="px-2 py-1 rounded text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                title="Cancel Sequence"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}

          <button
            onClick={() => onRowAction?.('email', row)}
            className="px-2 py-1 rounded text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
            title="Send Email"
          >
            <Mail className="w-3 h-3" />
          </button>

          <button
            onClick={() => onRowAction?.('delete', row)}
            className="px-2 py-1 rounded text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
          >
            Del
          </button>
        </div>
      );
    },
  },
];
