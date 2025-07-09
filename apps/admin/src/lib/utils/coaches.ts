import {
  FilterConfig,
  FilterValues,
  TableColumn,
  tableRenderers
} from "@nlc-ai/shared";
import {Coach} from "@nlc-ai/types";


export interface DataTableCoach {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  plan: string;
  status: string;
  rawStatus: string;
  originalId: string;
}

export const transformCoachData = (coaches: Coach[]): DataTableCoach[] => {
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
  /*{
    key: 'id',
    header: 'User ID',
    width: `${colWidth * (1 / 2)}%`,
    render: tableRenderers.basicText
  },*/
  {
    key: 'name',
    header: 'Name',
    width: `${colWidth}%`,
    render: (value: string) => tableRenderers.truncateText(value, 18)
  },
  {
    key: 'email',
    header: 'Email',
    width: `${colWidth * (4 / 3)}%`,
    render: (value: string) => tableRenderers.truncateText(value, 20)
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
    render: tableRenderers.status,
  },
  {
    key: 'actions',
    header: 'Actions',
    width: `auto`,
    render: tableRenderers.coachActions,
  }
];

export const coachFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Coach Status',
    type: 'select',
    placeholder: 'All Statuses',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Blocked', value: 'blocked' },
    ],
    defaultValue: '',
  },
  {
    key: 'subscriptionPlan',
    label: 'Subscription Plan',
    type: 'multi-select',
    options: [
      { label: 'Solo Agent', value: 'Solo Agent' },
      { label: 'Starter Pack', value: 'Starter Pack' },
      { label: 'Growth Pro', value: 'Growth Pro' },
      { label: 'Scale Elite', value: 'Scale Elite' },
      { label: 'No Plan', value: 'No Plan' },
    ],
    defaultValue: [],
  },
  {
    key: 'dateJoined',
    label: 'Date Joined',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
  {
    key: 'lastActive',
    label: 'Last Active',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
  {
    key: 'isVerified',
    label: 'Email Verified',
    type: 'select',
    placeholder: 'All',
    options: [
      { label: 'Verified', value: 'true' },
      { label: 'Not Verified', value: 'false' },
    ],
    defaultValue: '',
  },
  {
    key: 'includeDeleted',
    label: 'Include Deleted',
    type: 'select',
    placeholder: 'Exclude Deleted',
    options: [
      { label: 'Include Deleted', value: 'true' },
      { label: 'Exclude Deleted', value: 'false' },
    ],
    defaultValue: 'false',
  },
];

export const emptyFilterValues: FilterValues = {
  status: '',
  subscriptionPlan: [],
  dateJoined: { start: null, end: null },
  lastActive: { start: null, end: null },
  isVerified: '',
};
