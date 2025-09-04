import { FilterConfig } from "@nlc-ai/types";

export const notificationFilters: FilterConfig[] = [
  {
    key: 'type',
    label: 'Type',
    type: 'select' as const,
    placeholder: 'All Types',
    options: [
      { label: 'New Posts', value: 'post_created' },
      { label: 'Post Likes', value: 'post_liked' },
      { label: 'Comments', value: 'post_commented' },
      { label: 'New Members', value: 'member_joined' },
      { label: 'Invitations', value: 'member_invited' },
      { label: 'Messages', value: 'message_received' },
      { label: 'Conversations', value: 'conversation_created' },
      { label: 'System', value: 'system' },
      { label: 'Test', value: 'test' },
    ],
    defaultValue: 'all',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    placeholder: 'All',
    options: [
      { label: 'Unread', value: 'unread' },
      { label: 'Read', value: 'read' },
    ],
    defaultValue: 'all',
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select' as const,
    placeholder: 'All Priorities',
    options: [
      { label: 'Urgent', value: 'urgent' },
      { label: 'High', value: 'high' },
      { label: 'Normal', value: 'normal' },
      { label: 'Low', value: 'low' },
    ],
    defaultValue: 'all',
  },
];
