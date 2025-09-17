import {FilterConfig, FilterValues} from "@nlc-ai/types";

export const clientInviteFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Invite Status',
    type: 'select' as const,
    placeholder: 'All',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Used', value: 'used' },
      { label: 'Expired', value: 'expired' },
    ],
    defaultValue: '',
  },
];

export const emptyClientInviteFilterValues: FilterValues = {
  status: '',
};
