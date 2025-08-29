// Add to apps/web/admin/src/lib/components/communities/filters/index.ts
export * from './moderation.filter';

// Update apps/web/admin/src/lib/components/communities/filters/moderation.filter.ts

import { FilterConfig, FilterValues } from "@nlc-ai/sdk-core";

export const moderationFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'All Status', value: '' },
      { label: 'Pending Review', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Removed', value: 'removed' },
      { label: 'Dismissed', value: 'dismissed' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { label: 'All Priorities', value: '' },
      { label: 'Critical', value: 'critical' },
      { label: 'High', value: 'high' },
      { label: 'Medium', value: 'medium' },
      { label: 'Low', value: 'low' },
    ],
  },
  {
    key: 'contentType',
    label: 'Content Type',
    type: 'select',
    options: [
      { label: 'All Types', value: '' },
      { label: 'Posts', value: 'post' },
      { label: 'Comments', value: 'comment' },
      { label: 'Messages', value: 'message' },
    ],
  },
  {
    key: 'violationType',
    label: 'Violation Type',
    type: 'multi-select',
    options: [
      { label: 'Spam', value: 'spam' },
      { label: 'Harassment', value: 'harassment' },
      { label: 'Inappropriate Content', value: 'inappropriate' },
      { label: 'Hate Speech', value: 'hate_speech' },
      { label: 'Misinformation', value: 'misinformation' },
      { label: 'Copyright', value: 'copyright' },
    ],
  },
  {
    key: 'flagCount',
    label: 'Report Count',
    type: 'number-range',
    placeholder: 'Min - Max reports',
  },
  {
    key: 'dateRange',
    label: 'Reported Date',
    type: 'date-range',
  },
];

export const emptyModerationFilterValues: FilterValues = {
  status: '',
  priority: '',
  contentType: '',
  violationType: [],
  flagCount: null,
  dateRange: null,
};
