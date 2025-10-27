import {Button} from "@nlc-ai/web-ui";
import {DataTableLead, Lead} from "@nlc-ai/sdk-leads";
import {Trash, Edit, Eye, Send} from "lucide-react";

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
    answers: lead.answers,
    qualified: lead.qualified,
    originalID: lead.id,
    marketingOptIn: lead.marketingOptIn,
  }));
};

const colWidth = 100 / 8;
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
  },
  {
    key: 'source',
    header: 'Source',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => value
  },
  {
    key: 'qualified',
    header: 'Qualified?',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string, row: DataTableLead) => {
      return row.answers ? (value ? 'Yes' : 'No') : 'N/A';
    },
  },
  {
    key: 'marketingOptIn',
    header: 'Opted-in?',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => {
      return value ? 'Yes' : 'No';
    },
  },
  {
    key: 'status',
    header: 'Status',
    width: `${colWidth * (2 / 3)}%`,
    render: (_: string, row: any) => {
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
    render: (_: any, row: any, onRowAction?: (action: string, row: any) => void) => (
      <div className="flex gap-2">
        <button
          onClick={() => onRowAction?.('edit', row)}
          className="px-3 py-1 rounded text-sm bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
        >
          <Edit className="w-3 h-3" />
        </button>
        <button
          onClick={() => onRowAction?.('send-email', row)}
          className="px-3 py-1 rounded text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
          title="Send Marketing Email"
        >
          <Send className="w-3 h-3" />
        </button>
        {/*<button
          onClick={() => onRowAction?.('email', row)}
          className="px-3 py-1 rounded text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
          title="Send Email"
        >
          <Mail className="w-3 h-3" />
        </button>*/}
        <button
          onClick={() => onRowAction?.('delete', row)}
          className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
        >
          <Trash className="w-3 h-3" />
        </button>
        <Button
          onClick={() => onRowAction?.('view-details', row)}
          variant="outline"
          className="text-fuchsia-400 border-fuchsia-400/30 hover:bg-fuchsia-400/10"
        >
          <Eye className="w-3 h-3" />
        </Button>
      </div>
    ),
  },
];
