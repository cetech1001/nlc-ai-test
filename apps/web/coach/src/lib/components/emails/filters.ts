import {FilterConfig, FilterValues} from "@nlc-ai/sdk-core";

export const emailFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Thread Status',
    type: 'select' as const,
    placeholder: 'All Statuses',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Archived', value: 'archived' },
      { label: 'Closed', value: 'closed' },
    ],
    defaultValue: '',
  },
  {
    key: 'isRead',
    label: 'Read Status',
    type: 'select' as const,
    placeholder: 'All',
    options: [
      { label: 'Unread', value: 'false' },
      { label: 'Read', value: 'true' },
    ],
    defaultValue: '',
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select' as const,
    placeholder: 'All Priorities',
    options: [
      { label: 'High', value: 'high' },
      { label: 'Normal', value: 'normal' },
      { label: 'Low', value: 'low' },
    ],
    defaultValue: '',
  },
  {
    key: 'hasResponse',
    label: 'AI Response',
    type: 'select' as const,
    placeholder: 'All',
    options: [
      { label: 'Has Generated Response', value: 'true' },
      { label: 'No Response Yet', value: 'false' },
    ],
    defaultValue: '',
  },
  {
    key: 'dateRange',
    label: 'Last Message Date',
    type: 'date-range' as const,
    defaultValue: { start: null, end: null },
  },
];

export const emptyEmailFilterValues: FilterValues = {
  status: '',
  isRead: '',
  priority: '',
  hasResponse: '',
  dateRange: { start: null, end: null },
};
