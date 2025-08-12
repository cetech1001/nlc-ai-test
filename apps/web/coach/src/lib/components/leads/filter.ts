import { FilterConfig, FilterValues } from "@nlc-ai/types";

export const leadFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All Statuses',
    options: [
      { label: 'Not Converted', value: 'contacted' },
      { label: 'Scheduled', value: 'scheduled' },
      { label: 'Converted', value: 'converted' },
      { label: 'No Show', value: 'unresponsive' },
    ],
    defaultValue: '',
  },
  {
    key: 'source',
    label: 'Source',
    type: 'multi-select',
    options: [
      { label: 'Website', value: 'website' },
      { label: 'Referral', value: 'referral' },
      { label: 'Social Media', value: 'social_media' },
      { label: 'Email Campaign', value: 'email_campaign' },
      { label: 'Cold Outreach', value: 'cold_outreach' },
      { label: 'Networking', value: 'networking' },
      { label: 'Advertisement', value: 'advertisement' },
      { label: 'Other', value: 'other' },
    ],
    defaultValue: [],
  },
  {
    key: 'dateRange',
    label: 'Created Date',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
  {
    key: 'meetingDateRange',
    label: 'Meeting Date',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
];

export const emptyLeadsFilterValues: FilterValues = {
  status: '',
  source: [],
  dateRange: { start: null, end: null },
  meetingDateRange: { start: null, end: null },
};
