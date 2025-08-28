import { FilterConfig, FilterValues } from "@nlc-ai/sdk-core";

export const memberFilters: FilterConfig[] = [
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'All Roles', value: '' },
      { label: 'Owner', value: 'owner' },
      { label: 'Admin', value: 'admin' },
      { label: 'Moderator', value: 'moderator' },
      { label: 'Member', value: 'member' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'All Status', value: '' },
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Suspended', value: 'suspended' },
      { label: 'Pending', value: 'pending' },
    ],
  },
  {
    key: 'userType',
    label: 'User Type',
    type: 'select',
    options: [
      { label: 'All Types', value: '' },
      { label: 'Coach', value: 'coach' },
      { label: 'Client', value: 'client' },
      { label: 'Admin', value: 'admin' },
    ],
  },
  {
    key: 'joinedDate',
    label: 'Joined Date',
    type: 'date-range',
  },
  {
    key: 'lastActiveDate',
    label: 'Last Active',
    type: 'date-range',
  },
];

export const emptyMemberFilterValues: FilterValues = {
  role: '',
  status: '',
  userType: '',
  joinedDate: null,
  lastActiveDate: null,
};
