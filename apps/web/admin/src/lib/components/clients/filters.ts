import {FilterConfig, FilterValues} from "@nlc-ai/types";

export const clientFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Client Status',
    type: 'select' as const,
    placeholder: 'All',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
    defaultValue: '',
  },
  {
    key: 'coursesBought',
    label: 'Minimum Courses',
    type: 'select' as const,
    placeholder: 'Any',
    options: [
      { label: '1+', value: '1' },
      { label: '3+', value: '3' },
      { label: '5+', value: '5' },
      { label: '10+', value: '10' },
    ],
    defaultValue: '',
  },
  {
    key: 'dateJoined',
    label: 'Date Joined',
    type: 'date-range' as const,
    defaultValue: { start: null, end: null },
  },
  {
    key: 'lastInteraction',
    label: 'Last Interaction',
    type: 'date-range' as const,
    defaultValue: { start: null, end: null },
  },
];

export const emptyClientFilterValues: FilterValues = {
  status: '',
  coursesBought: '',
  dateJoined: { start: null, end: null },
  lastInteraction: { start: null, end: null },
};

export const emailFilters: FilterConfig[] = [
  {
    key: 'dateRange',
    label: 'Email Date',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
];

export const emptyEmailFilterValues: FilterValues = {
  dateRange: { start: null, end: null },
};
