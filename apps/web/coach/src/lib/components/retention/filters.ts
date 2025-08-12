import {FilterConfig, FilterValues} from "@nlc-ai/types";

export const templateFilters: FilterConfig[] = [
  {
    key: 'type',
    label: 'Template Type',
    type: 'multi-select',
    options: [
      { label: 'Feedback', value: 'feedback' },
      { label: 'Retention', value: 'retention' },
      { label: 'Survey', value: 'survey' },
      { label: 'Follow-up', value: 'followup' },
    ],
    defaultValue: [],
  },
  {
    key: 'usageRange',
    label: 'Usage Count',
    type: 'amount-range',
    defaultValue: { min: '', max: '' },
  },
  {
    key: 'dateRange',
    label: 'Date Created',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
];

export const emptyTemplateFilterValues: FilterValues = {
  type: [],
  usageRange: { min: '', max: '' },
  dateRange: { start: null, end: null },
};
