import {FilterConfig, FilterValues} from "@nlc-ai/types";

export const planFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Plan Status',
    type: 'select',
    placeholder: 'All',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Deleted', value: 'deleted' },
    ],
    defaultValue: '',
  },
];

export const emptyPlanFilterValues: FilterValues = {
  status: '',
};
