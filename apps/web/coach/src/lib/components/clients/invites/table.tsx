import { TableColumn } from "@nlc-ai/types";
import {RotateCcw, Trash2} from "lucide-react";
import {formatDate} from "@nlc-ai/sdk-core";
import { tableRenderers } from "@nlc-ai/web-shared";

const colWidth = 100 / 5;

export const clientInviteColumns: TableColumn<any>[] = [
  {
    key: 'email',
    header: 'Email',
    width: `${colWidth * (5 / 3)}%`,
    render: (value: string) => value,
    mobile: {
      show: true,
      priority: 'secondary',
      label: 'Email Address',
      render: (value: string) => value,
    }
  },
  {
    key: 'createdAt',
    header: 'Sent On',
    width: `${colWidth}%`,
    render: (value: string) => formatDate(value),
    mobile: {
      show: true,
      priority: 'detail',
      label: 'Sent On',
      render: (value: string) => formatDate(value)
    }
  },
  {
    key: 'status',
    header: 'Status',
    width: `${colWidth * 0.6}%`,
    render: tableRenderers.status,
    mobile: {
      show: true,
      priority: 'detail',
      label: 'Status',
      render: tableRenderers.status,
    }
  },
  {
    key: 'expiresAt',
    header: 'Expires On',
    width: `${colWidth}%`,
    render: (value: string) => formatDate(value),
    mobile: {
      show: true,
      priority: 'detail',
      label: 'Expires On',
      render: (value: string) => formatDate(value)
    }
  },
  {
    key: 'actions',
    header: 'Actions',
    width: 'auto',
    mobile: {
      show: true,
      priority: 'detail'
    },
    render: (_, clientInvite: any, onRowAction?: (action: string, row: any) => void) => {
      return (
        <div className="flex gap-3">
          <button
            onClick={() => onRowAction?.('resend', clientInvite.id)}
            className="p-1.5 rounded text-sm hover:bg-purple-600/30 transition-colors text-[#A0A0A0]"
            title="Edit Client"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRowAction?.('delete', clientInvite.id)}
            className="p-1.5 rounded text-sm hover:bg-purple-600/30 transition-colors text-[#A0A0A0]"
          >
            <Trash2 className="w-4 h-4"/>
          </button>
        </div>
      );
    },
  }
];

export const clientInviteMobileConfig = {
  primaryField: 'email',
  secondaryField: 'status',
  detailFields: ['createdAt', 'expiresAt'],
  maxDetailFields: 3
};
