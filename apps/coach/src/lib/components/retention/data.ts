import {EmailTemplate} from "@nlc-ai/types";

export const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    coachID: '',
    name: 'Feedback Survey 01',
    category: 'feedback',
    isActive: true,
    createdAt: new Date('Apr 14, 2025 10:30 AM'),
    bodyTemplate: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 234,
    lastUsedAt: new Date('Mar 15, 2025')
  },
  {
    id: '2',
    coachID: '',
    name: 'User Drop-Off at 25%',
    category: 'retention',
    isActive: true,
    createdAt: new Date('Apr 14, 2025 10:30 AM'),
    bodyTemplate: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 156,
    lastUsedAt: new Date('Mar 20, 2025')
  },
  {
    id: '3',
    coachID: '',
    name: 'User Drop-Off at 50%',
    category: 'retention',
    isActive: true,
    createdAt: new Date('Apr 14, 2025 10:30 AM'),
    bodyTemplate: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 89,
    lastUsedAt: new Date('Mar 18, 2025')
  },
  {
    id: '4',
    coachID: '',
    name: 'Client Didn\'t Show Up On Call',
    category: 'followup',
    isActive: true,
    createdAt: new Date('Apr 14, 2025 10:30 AM'),
    bodyTemplate: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 45,
    lastUsedAt: new Date('Mar 10, 2025')
  },
  {
    id: '5',
    coachID: '',
    name: 'Feedback Survey 02',
    category: 'feedback',
    isActive: false,
    createdAt: new Date('Apr 14, 2025 10:30 AM'),
    bodyTemplate: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 123,
    lastUsedAt: new Date('Mar 25, 2025')
  },
  {
    id: '6',
    coachID: '',
    name: 'User Drop-Off at 75%',
    category: 'retention',
    isActive: false,
    createdAt: new Date('Apr 14, 2025 10:30 AM'),
    bodyTemplate: 'Hi Maria,\nThank you for reaching out! I\'m thrilled to hear that you\'re enjoying the course so far...',
    usageCount: 67,
    lastUsedAt: new Date('Mar 12, 2025')
  }
];
