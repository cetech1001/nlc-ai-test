import { FilterValues } from "@nlc-ai/sdk-core";

export const memberFilters = [
  {
    key: 'role',
    label: 'Role',
    type: 'select' as const,
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
    type: 'select' as const,
    options: [
      { label: 'All Statuses', value: '' },
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Suspended', value: 'suspended' },
      { label: 'Pending', value: 'pending' },
    ],
  },
  {
    key: 'userType',
    label: 'User Type',
    type: 'select' as const,
    options: [
      { label: 'All Types', value: '' },
      { label: 'Coach', value: 'coach' },
      { label: 'Client', value: 'client' },
    ],
  },
  {
    key: 'dateRange',
    label: 'Join Date',
    type: 'date-range' as const,
  },
];

export const emptyMemberFilterValues: FilterValues = {
  role: '',
  status: '',
  userType: '',
  dateRange: null,
};
