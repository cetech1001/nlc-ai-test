import { tableRenderers } from "@nlc-ai/web-shared";
import { TableColumn } from "@nlc-ai/types";
import {Edit3, Eye, Trash} from "lucide-react";
import {ExtendedClient} from "@nlc-ai/sdk-users";
import {formatDate} from "@nlc-ai/sdk-core";
import {EmailAgentIcon} from "@/lib";

const colWidth = 100 / 6;

export const clientColumns: TableColumn<ExtendedClient>[] = [
  {
    key: 'name',
    header: 'Name',
    width: `${colWidth}%`,
    render: (_, client: ExtendedClient) =>
      `${client.firstName} ${client.lastName}`,
    mobile: {
      show: true,
      priority: 'primary',
      label: 'Client Name',
      render: (_, client: ExtendedClient) =>
        `${client.firstName} ${client.lastName}`
    }
  },
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
    header: 'Date Joined',
    width: `${colWidth}%`,
    render: (value: string) => formatDate(value),
    mobile: {
      show: true,
      priority: 'detail',
      label: 'Joined Date',
      render: (value: string) => formatDate(value)
    }
  },
  {
    key: 'coursesBought',
    header: 'Courses Bought',
    width: `${colWidth * 0.6}%`,
    render: (_, client: ExtendedClient) =>
      tableRenderers.basicText(client.coursesBought.toString()),
    mobile: {
      show: true,
      priority: 'detail',
      label: 'Courses Purchased',
      render: (_, client: ExtendedClient) =>
        `${client.coursesBought} course${client.coursesBought !== 1 ? 's' : ''}`
    }
  },
  {
    key: 'coursesCompleted',
    header: 'Completed',
    width: `${colWidth * 0.6}%`,
    render: (_, client: ExtendedClient) =>
      tableRenderers.basicText(client.coursesCompleted.toString()),
    mobile: {
      show: true,
      priority: 'detail',
      label: 'Courses Completed',
      render: (_, client: ExtendedClient) => {
        const percentage = client.coursesBought > 0
          ? Math.round((client.coursesCompleted / client.coursesBought) * 100)
          : 0;
        return `${client.coursesCompleted} (${percentage}%)`;
      }
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
    render: (_, client: ExtendedClient, onRowAction?: (action: string, row: any) => void) => {
      return (
        <div className="flex gap-3">
          <button
            onClick={() => onRowAction?.('edit', client)}
            className="p-1.5 rounded text-sm hover:bg-purple-600/30 transition-colors text-[#A0A0A0]"
            title="Edit Client"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRowAction?.('view-emails', client)}
            className="p-1.5 rounded text-sm hover:bg-purple-600/30 transition-colors"
            title="View Emails"
          >
            <EmailAgentIcon className="w-4 h-4"/>
          </button>
          <button
            onClick={() => onRowAction?.('view-details', client)}
            className="p-1.5 rounded text-sm hover:bg-purple-600/30 transition-colors text-[#A0A0A0]"
          >
            <Eye className="w-4 h-4"/>
          </button>
          <button
            onClick={() => onRowAction?.('delete', client)}
            className="p-1.5 rounded text-sm hover:bg-purple-600/30 transition-colors text-[#A0A0A0]"
          >
            <Trash className="w-4 h-4"/>
          </button>
        </div>
      );
    },
  }
];

export const clientMobileConfig = {
  primaryField: 'name',
  secondaryField: 'email',
  detailFields: ['createdAt', 'coursesBought', 'coursesCompleted'],
  maxDetailFields: 3
};
