import type {Coach} from "@/lib/api/coaches";
import { TableColumn, tableRenderers } from "@nlc-ai/shared";

export const transformCoachData = (coaches: Coach[]) => {
  return coaches.map(coach => ({
    id: `#${coach.id.slice(-4)}`,
    name: `${coach.firstName} ${coach.lastName}`,
    email: coach.email,
    dateJoined: new Date(coach.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    plan: coach.currentPlan || 'No Plan',
    status: coach.status.charAt(0).toUpperCase() + coach.status.slice(1),
    rawStatus: coach.status,
    originalId: coach.id,
  }));
};

const colWidth = 100 / 7;
export const coachColumns: TableColumn<any>[] = [
  {
    key: 'id',
    header: 'User ID',
    width: `${colWidth * (1 / 2)}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'name',
    header: 'Name',
    width: `${colWidth}%`,
    render: (value: string) => tableRenderers.truncateText(value, 18)
  },
  {
    key: 'email',
    header: 'Email',
    width: `${colWidth * (5 / 3)}%`,
    render: (value: string) => tableRenderers.truncateText(value, 25)
  },
  {
    key: 'dateJoined',
    header: 'Date Joined',
    width: `${colWidth}%`,
    render: tableRenderers.dateText
  },
  {
    key: 'plan',
    header: 'Plan',
    width: `${colWidth * (2 / 3)}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'status',
    header: 'Status',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => {
      return tableRenderers.status(value);
    }
  },
  {
    key: 'actions',
    header: 'Actions',
    width: `auto`,
    render: (_: string, row: Coach, onAction?: (action: string, row: Coach) => void) => {
      return tableRenderers.actions('Make Payment', row, 'make-payment', onAction);
    }
  }
];
