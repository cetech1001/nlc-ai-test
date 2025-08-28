import { FilterConfig, FilterValues } from "@nlc-ai/sdk-core";

export const communityFilters: FilterConfig[] = [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    options: [
      { label: 'All Types', value: '' },
      { label: 'Coach-to-Coach', value: 'coach_to_coach' },
      { label: 'Coach-Client', value: 'coach_client' },
      { label: 'Course', value: 'course' },
      { label: 'Private', value: 'private' },
    ],
  },
  {
    key: 'visibility',
    label: 'Visibility',
    type: 'select',
    options: [
      { label: 'All', value: '' },
      { label: 'Public', value: 'public' },
      { label: 'Private', value: 'private' },
      { label: 'Invite Only', value: 'invite_only' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'All', value: '' },
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  {
    key: 'memberCount',
    label: 'Member Count',
    type: 'number-range',
    placeholder: 'Min - Max members',
  },
  {
    key: 'dateRange',
    label: 'Created Date',
    type: 'date-range',
  },
];

export const emptyCommunityFilterValues: FilterValues = {
  type: '',
  visibility: '',
  status: '',
  memberCount: null,
  dateRange: null,
};
