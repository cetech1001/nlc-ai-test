import {Flag, MessageSquare, Users} from "lucide-react";
import {FlaggedContent, ModerationAction} from "@nlc-ai/sdk-community";
import { formatDate } from "@nlc-ai/web-utils";
import { Badge } from "@nlc-ai/web-ui";

const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'critical') => {
  switch (priority) {
    case 'critical': return 'bg-red-600/20 text-red-400 border-red-600/30';
    case 'high': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
    case 'medium': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'low': return 'bg-green-600/20 text-green-400 border-green-600/30';
    default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
  }
};

const getStatusColor = (status: 'pending' | 'approved' | 'removed' | 'dismissed') => {
  switch (status) {
    case 'pending': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'approved': return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'removed': return 'bg-red-600/20 text-red-400 border-red-600/30';
    case 'dismissed': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
  }
};

export const moderationContentColumns = [
  {
    key: 'type',
    header: 'Type',
    width: '8%',
    render: (value: string) => (
      <div className="flex items-center gap-2">
        {value === 'post' ? <MessageSquare className="w-4 h-4 text-blue-400" /> : <Flag className="w-4 h-4 text-purple-400" />}
        <Badge variant={value === 'post' ? 'default' : 'secondary'} className="capitalize">
          {value}
        </Badge>
      </div>
    ),
  },
  {
    key: 'content',
    header: 'Content',
    width: '30%',
    render: (value: string, row: FlaggedContent) => (
      <div className="space-y-1">
        <div className="text-stone-200 text-sm line-clamp-2">{value}</div>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <span>by {row.authorName}</span>
          <span>•</span>
          <span className="capitalize">{row.authorType}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'priority',
    header: 'Priority',
    width: '10%',
    render: (value: string) => (
      <Badge className={`border ${getPriorityColor(value as any)} capitalize`}>
        {value}
      </Badge>
    ),
  },
  {
    key: 'flagCount',
    header: 'Reports',
    width: '8%',
    render: (value: number) => (
      <div className="flex items-center gap-2">
        <Flag className="w-3 h-3 text-red-400" />
        <span className="text-stone-200 font-medium">{value}</span>
      </div>
    ),
  },
  {
    key: 'reasons',
    header: 'Violations',
    width: '20%',
    render: (value: string[]) => (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 2).map((reason, index) => (
          <Badge key={index} variant="outline" className="text-xs border-neutral-600 text-stone-300">
            {reason}
          </Badge>
        ))}
        {value.length > 2 && (
          <Badge variant="outline" className="text-xs border-neutral-600 text-stone-400">
            +{value.length - 2} more
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: '10%',
    render: (value: string) => (
      <Badge className={`border ${getStatusColor(value as any)} capitalize`}>
        {value}
      </Badge>
    ),
  },
  {
    key: 'createdAt',
    header: 'Reported',
    width: '12%',
    render: (value: Date) => (
      <div className="text-stone-400 text-sm">{formatDate(value)}</div>
    ),
  },
];

export const moderationActionColumns = [
  {
    key: 'type',
    header: 'Action',
    width: '15%',
    render: (value: string) => (
      <Badge variant="outline" className="capitalize border-neutral-600 text-stone-300">
        {value.replace('_', ' ')}
      </Badge>
    ),
  },
  {
    key: 'targetType',
    header: 'Target',
    width: '10%',
    render: (value: string) => (
      <div className="flex items-center gap-2">
        {value === 'post' ? <MessageSquare className="w-4 h-4 text-blue-400" /> :
          value === 'comment' ? <Flag className="w-4 h-4 text-purple-400" /> :
            <Users className="w-4 h-4 text-green-400" />}
        <span className="capitalize text-stone-200">{value}</span>
      </div>
    ),
  },
  {
    key: 'targetInfo',
    header: 'Details',
    width: '25%',
    render: (value: any, row: ModerationAction) => (
      <div className="space-y-1">
        <div className="text-stone-200 text-sm">{value?.title || value?.name || 'Content'}</div>
        <div className="text-stone-400 text-xs">
          by {value?.authorName || row.targetUser}
        </div>
      </div>
    ),
  },
  {
    key: 'reason',
    header: 'Reason',
    width: '20%',
    render: (value: string) => (
      <div className="text-stone-300 text-sm line-clamp-2">{value}</div>
    ),
  },
  {
    key: 'moderator',
    header: 'Moderator',
    width: '15%',
    render: (value: any) => (
      <div className="space-y-1">
        <div className="text-stone-200 text-sm">{value.name}</div>
        <div className="text-stone-400 text-xs capitalize">{value.type}</div>
      </div>
    ),
  },
  {
    key: 'createdAt',
    header: 'Date',
    width: '15%',
    render: (value: Date) => (
      <div className="text-stone-400 text-sm">{formatDate(value)}</div>
    ),
  },
];
