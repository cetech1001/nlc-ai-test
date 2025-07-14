import {FilterConfig, FilterValues} from "@nlc-ai/types";

export const coachFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Coach Status',
    type: 'select',
    placeholder: 'All',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Blocked', value: 'blocked' },
      { label: 'Deleted', value: 'deleted' },
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
];

export const emptyCoachFilterValues: FilterValues = {
  status: '',
  subscriptionPlan: [],
  dateJoined: { start: null, end: null },
  lastActive: { start: null, end: null },
};
