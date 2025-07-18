import {FileText, Lightbulb, MessageCircle, Play, Users} from "lucide-react";
import {ContentCategory, ContentPiece} from "@nlc-ai/types";
import {ComponentType} from "react";

export const mockCategories: (ContentCategory & { icon: ComponentType<any>; color: string; })[] = [
  {
    id: '1',
    name: 'Controversial',
    description: 'Content that challenges traditional ideas and sparks debate, encouraging viewers to think critically and engage in discussions.',
    icon: MessageCircle,
    videosCount: 16,
    lastUpdated: 'Apr 14, 2025 | 10:30 AM',
    color: 'from-red-500 to-orange-500',
    totalViews: 125000,
    avgEngagement: 8.5,
    createdAt: new Date('2025-04-14')
  },
  {
    id: '2',
    name: 'Informative',
    description: 'Educational content designed to deliver valuable knowledge and practical insights in a clear and easy-to-understand way.',
    icon: Lightbulb,
    videosCount: 16,
    lastUpdated: 'Apr 14, 2025 | 10:30 AM',
    color: 'from-blue-500 to-cyan-500',
    totalViews: 98000,
    avgEngagement: 7.2,
    createdAt: new Date('2025-04-14')
  },
  {
    id: '3',
    name: 'Entertainment',
    description: 'Fun and engaging videos meant to entertain and captivate the audience, offering light-hearted content to create emotional connections.',
    icon: Play,
    videosCount: 16,
    lastUpdated: 'Apr 14, 2025 | 10:30 AM',
    color: 'from-purple-500 to-pink-500',
    totalViews: 87000,
    avgEngagement: 9.1,
    createdAt: new Date('2025-04-14')
  },
  {
    id: '4',
    name: 'Conversational',
    description: 'Content that challenges traditional ideas and sparks debate, encouraging viewers to think critically and engage in discussions.',
    icon: Users,
    videosCount: 16,
    lastUpdated: 'Apr 14, 2025 | 10:30 AM',
    color: 'from-green-500 to-teal-500',
    totalViews: 76000,
    avgEngagement: 6.8,
    createdAt: new Date('2025-04-14')
  },
  {
    id: '5',
    name: 'Case Studies',
    description: 'Content that build social proof using testimonials and feedbacks from your clients.',
    icon: FileText,
    videosCount: 16,
    lastUpdated: 'Apr 14, 2025 | 10:30 AM',
    color: 'from-indigo-500 to-purple-500',
    totalViews: 54000,
    avgEngagement: 7.9,
    createdAt: new Date('2025-04-14')
  }
];

export const mockVideos: ContentPiece[] = [
  {
    id: '1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    durationSeconds: 80,
    createdAt: new Date('14 Apr 2025 08:57 PM'),
    views: 12500,
    engagementRate: 8.2,
    coachID: '',
    tags: [],
    contentType: '',
    title: '',
    topicCategories: [],
  },
  {
    id: '2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    durationSeconds: 80,
    createdAt: new Date('14 Apr 2025 08:57 PM'),
    views: 9800,
    engagementRate: 7.5,
    coachID: '',
    tags: [],
    contentType: '',
    title: '',
    topicCategories: [],
  },
  {
    id: '3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    durationSeconds: 80,
    createdAt: new Date('14 Apr 2025 08:57 PM'),
    views: 15200,
    engagementRate: 9.1,
    coachID: '',
    tags: [],
    contentType: '',
    title: '',
    topicCategories: [],
  },
  {
    id: '4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    durationSeconds: 80,
    createdAt: new Date('14 Apr 2025 08:57 PM'),
    views: 8900,
    engagementRate: 6.8,
    coachID: '',
    tags: [],
    contentType: '',
    title: '',
    topicCategories: [],
  },
  {
    id: '5',
    thumbnailUrl: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=400',
    durationSeconds: 80,
    createdAt: new Date('14 Apr 2025 08:57 PM'),
    views: 11300,
    engagementRate: 7.9,
    coachID: '',
    tags: [],
    contentType: '',
    title: '',
    topicCategories: [],
  },
  {
    id: '7',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    durationSeconds: 80,
    createdAt: new Date('14 Apr 2025 08:57 PM'),
    views: 7800,
    engagementRate: 6.2,
    coachID: '',
    tags: [],
    contentType: '',
    title: '',
    topicCategories: [],
  },
  {
    id: '8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=400',
    durationSeconds: 80,
    createdAt: new Date('14 Apr 2025 08:57 PM'),
    views: 16400,
    engagementRate: 9.5,
    coachID: '',
    tags: [],
    contentType: '',
    title: '',
    topicCategories: [],
  },
  {
    id: '9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400',
    durationSeconds: 80,
    createdAt: new Date('14 Apr 2025 08:57 PM'),
    views: 5600,
    engagementRate: 5.8,
    coachID: '',
    tags: [],
    contentType: '',
    title: '',
    topicCategories: [],
  },
  {
    id: '10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    durationSeconds: 80,
    createdAt: new Date('14 Apr 2025 08:57 PM'),
    views: 10200,
    engagementRate: 7.3,
    coachID: '',
    tags: [],
    contentType: '',
    title: '',
    topicCategories: [],
  },
  {
    id: '11',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    durationSeconds: 80,
    createdAt: new Date('14 Apr 2025 08:57 PM'),
    views: 14800,
    engagementRate: 8.7,
    coachID: '',
    tags: [],
    contentType: '',
    title: '',
    topicCategories: [],
  },
];
