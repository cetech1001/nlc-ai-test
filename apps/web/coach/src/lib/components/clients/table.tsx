import { tableRenderers } from "@nlc-ai/web-shared";
import { TableColumn } from "@nlc-ai/types";
import {ClientWithDetails} from "@nlc-ai/types";
import { Edit3, Mailbox } from "lucide-react";

const colWidth = 100 / 6;

export const clientColumns: TableColumn<ClientWithDetails>[] = [
  {
    key: 'name',
    header: 'Name',
    width: `${colWidth}%`,
    render: (_, client: ClientWithDetails) =>
      tableRenderers.truncateText(`${client.firstName} ${client.lastName}`, 18)
  },
  {
    key: 'email',
    header: 'Email',
    width: `${colWidth * (5 / 3)}%`,
    render: (_, client: ClientWithDetails) =>
      tableRenderers.truncateText(client.email, 25)
  },
  {
    key: 'createdAt',
    header: 'Date Joined',
    width: `${colWidth}%`,
    render: (_, client: ClientWithDetails) =>
      client.createdAt ? tableRenderers.dateText(client.createdAt.toString()) : 'N/A'
  },
  {
    key: 'coursesBought',
    header: 'Courses Bought',
    width: `${colWidth * 0.6}%`,
    render: (_, client: ClientWithDetails) =>
      tableRenderers.basicText(client.coursesBought.toString())
  },
  {
    key: 'coursesCompleted',
    header: 'Completed',
    width: `${colWidth * 0.6}%`,
    render: (_, client: ClientWithDetails) =>
      tableRenderers.basicText(client.coursesCompleted.toString())
  },
  {
    key: 'actions',
    header: 'Actions',
    width: 'auto',
    render: (_, client: ClientWithDetails, onRowAction?: (action: string, row: any) => void) => {
      return (
        <div className="flex gap-3">
          <button
            onClick={() => onRowAction?.('edit', client)}
            className="p-1.5 rounded text-xs bg-purple-600/20 text-fuchsia-400 hover:bg-purple-600/30 transition-colors"
            title="Edit Client"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onRowAction?.('view-emails', client)}
            className="px-3 py-1 rounded text-sm bg-purple-600/20 text-fuchsia-400 hover:bg-purple-600/30 transition-colors"
            title="View Emails"
          >
            <Mailbox className="w-4 h-4"/>
          </button>
          <button
            onClick={() => onRowAction?.('view-details', client)}
            className="text-fuchsia-400 text-sm font-normal underline leading-relaxed hover:text-fuchsia-300 transition-colors whitespace-nowrap"
          >
            View Details
          </button>
        </div>
      );
    },
  }
];
