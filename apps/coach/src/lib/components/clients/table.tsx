import { tableRenderers } from "@nlc-ai/shared";
import {ClientWithDetails, DataTableClient, TableColumn} from "@nlc-ai/types";

export const transformClientData = (clients: ClientWithDetails[]): DataTableClient[] => {
  return clients.map(client => ({
    id: `#${client.id.slice(-4)}`,
    name: `${client.firstName} ${client.lastName}`,
    email: client.email,
    firstCourseBoughtOn: client.courseEnrollments?.[0]?.enrolledAt
      ? new Date(client.courseEnrollments[0].enrolledAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      : 'No courses',
    coursesBought: client.coursesBought,
    coursesCompleted: client.coursesCompleted,
    originalID: client.id,
  }));
};

const colWidth = 100 / 6;

export const clientColumns: TableColumn<DataTableClient>[] = [
  {
    key: 'name',
    header: 'Name',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => tableRenderers.truncateText(value, 18)
  },
  {
    key: 'email',
    header: 'Email',
    width: `${colWidth * (5 / 3)}%`,
    render: (value: string) => tableRenderers.truncateText(value, 25)
  },
  {
    key: 'firstCourseBoughtOn',
    header: 'First Course Bought On',
    width: `${colWidth}%`,
    render: tableRenderers.dateText
  },
  {
    key: 'coursesBought',
    header: 'Courses Bought',
    width: `${colWidth * 0.8}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'coursesCompleted',
    header: 'Courses Completed',
    width: `${colWidth * 0.8}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'actions',
    header: 'Actions',
    width: 'auto',
    render: (_: string, client: DataTableClient, onRowAction?: (action: string, row: any) => void) => {
      return (
        <button
          onClick={() => onRowAction?.('view-details', client)}
          className="text-fuchsia-400 text-sm font-normal underline leading-relaxed hover:text-fuchsia-300 transition-colors whitespace-nowrap"
        >
          View Details
        </button>
      );
    },
  }
];
