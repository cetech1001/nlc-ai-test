import { tableRenderers } from "@nlc-ai/shared";
import {DataTableLead, Lead} from "@nlc-ai/types";
import {Mail} from "lucide-react";

export const transformLeadData = (leads: Lead[]): DataTableLead[] => {
  return leads.map(lead => ({
    id: `#${lead.id.slice(-4)}`,
    name: lead.name,
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

const colWidth = 100 / 7;
export const leadColumns = [
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
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => value
  },
  {
    key: 'source',
    header: 'Source',
    width: `${colWidth}%`,
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
    key: 'meetingDate',
    header: 'Meeting Date',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => value
  },
  {
    key: 'actions',
    header: 'Actions',
    width: 'auto',
    render: (value: any, row: any, onRowAction?: (action: string, row: any) => void) => (
      <div className="flex gap-2">
        <button
          onClick={() => onRowAction?.('edit', row)}
          className="px-3 py-1 rounded text-sm bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onRowAction?.('email', row)}
          className="px-3 py-1 rounded text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
          title="Send Email"
        >
          <Mail className="w-3 h-3" />
        </button>
        <button
          onClick={() => onRowAction?.('delete', row)}
          className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
        >
          Delete
        </button>
      </div>
    ),
  },
];
