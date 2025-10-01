import { Users, Crown, Shield } from 'lucide-react';
import { formatDate, getInitials } from '@nlc-ai/web-utils';
import { ExtendedCommunityMember } from '@nlc-ai/sdk-communities';

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'owner':
      return <Crown className="w-4 h-4" />;
    case 'admin':
      return <Shield className="w-4 h-4" />;
    case 'moderator':
      return <Users className="w-4 h-4" />;
    default:
      return null;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'owner':
      return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'admin':
      return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
    case 'moderator':
      return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'member':
      return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    default:
      return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'inactive':
      return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    case 'suspended':
      return 'bg-red-600/20 text-red-400 border-red-600/30';
    case 'pending':
      return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    default:
      return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
  }
};

const getUserTypeColor = (userType: string) => {
  switch (userType) {
    case 'coach':
      return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
    case 'client':
      return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'admin':
      return 'bg-red-600/20 text-red-400 border-red-600/30';
    default:
      return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
  }
};

const colWidth = 100 / 9;
export const memberColumns = [
  {
    key: 'userName',
    header: 'Member',
    width: `${colWidth * 2}%`,
    render: (value: string, row: ExtendedCommunityMember) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {row.userAvatarUrl ? (
            <img
              src={row.userAvatarUrl}
              alt={value}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(value)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-stone-200 font-medium truncate">{value}</div>
          <div className="text-stone-400 text-sm truncate">{row.userEmail}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'userType',
    header: 'Type',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUserTypeColor(value)}`}>
        {value}
      </span>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => (
      <div className="flex items-center gap-2">
        {getRoleIcon(value)}
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(value)}`}>
          {value}
        </span>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
        {value}
      </span>
    ),
  },
  {
    key: 'posts',
    header: 'Posts',
    width: `${colWidth * (2 / 3)}%`,
    sortable: true,
    render: (_: string, row: ExtendedCommunityMember) => (
      <span className="text-stone-300 font-medium">{row._count.posts}</span>
    ),
  },
  {
    key: 'comments',
    header: 'Comments',
    width: `${colWidth * (2 / 3)}%`,
    sortable: true,
    render: (_: string, row: ExtendedCommunityMember) => (
      <span className="text-stone-300 font-medium">{row._count.comments}</span>
    ),
  },
  {
    key: 'joinedAt',
    header: 'Joined',
    width: `${colWidth * (2 / 3)}%`,
    sortable: true,
    render: (value: string) => (
      <span className="text-stone-400 text-sm">{formatDate(value)}</span>
    ),
  },
  {
    key: 'lastActiveAt',
    header: 'Last Active',
    width: `${colWidth * (2 / 3)}%`,
    sortable: true,
    render: (value?: string) => (
      <span className="text-stone-400 text-sm">
        {value ? formatDate(value) : 'Never'}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    width: 'auto',
    render: (_: any, member: ExtendedCommunityMember, onRowAction?: (action: string, row: any) => void) => (
      <div className="flex gap-1">
        <button
          onClick={() => onRowAction?.('view-profile', member)}
          className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded text-white"
        >
          View
        </button>
        <button
          onClick={() => onRowAction?.('change-role', member)}
          className="px-2 py-1 text-xs bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded text-purple-400"
        >
          Role
        </button>
        {member.status === 'active' ? (
          <button
            onClick={() => onRowAction?.('suspend', member)}
            className="px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded text-red-400"
          >
            Suspend
          </button>
        ) : (
          <button
            onClick={() => onRowAction?.('activate', member)}
            className="px-2 py-1 text-xs bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded text-green-400"
          >
            Activate
          </button>
        )}
      </div>
    ),
  },
];

interface MembersMobileCardProps {
  members: ExtendedCommunityMember[];
  onRowAction?: (action: string, member: ExtendedCommunityMember) => void;
  emptyMessage?: string;
}

export const MembersMobileCard = ({ members, onRowAction, emptyMessage }: MembersMobileCardProps) => {
  if (members.length === 0) {
    return (
      <div className="sm:hidden">
        <div className="text-center py-8 text-stone-400">
          {emptyMessage || 'No members found'}
        </div>
      </div>
    );
  }

  return (
    <div className="sm:hidden">
      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-4 space-y-3"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {member.userAvatarUrl ? (
                    <img
                      src={member.userAvatarUrl}
                      alt={member.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(member.userName)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{member.userName}</div>
                  <div className="text-stone-400 text-sm truncate">{member.userEmail}</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUserTypeColor(member.userType)}`}>
                  {member.userType}
                </span>
                <div className="flex items-center gap-1">
                  {getRoleIcon(member.role)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                  {member.status}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-stone-400">Activity</div>
                  {/*<div className="text-white">{member.postCount} posts • {member.commentCount} comments</div>*/}
                </div>
                <div>
                  <div className="text-stone-400">Joined</div>
                  <div className="text-white">{formatDate(member.joinedAt)}</div>
                </div>
              </div>

              {/* Last Active */}
              <div className="text-sm">
                <div className="text-stone-400">Last Active</div>
                <div className="text-white">
                  {member.lastActiveAt ? formatDate(member.lastActiveAt) : 'Never'}
                </div>
              </div>

              {/* Actions */}
              {onRowAction && (
                <div className="flex gap-2 pt-2 border-t border-neutral-700">
                  <button
                    onClick={() => onRowAction('view-profile', member)}
                    className="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white text-sm transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onRowAction('change-role', member)}
                    className="flex-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-lg text-purple-400 text-sm transition-colors"
                  >
                    Change Role
                  </button>
                  {member.status === 'active' ? (
                    <button
                      onClick={() => onRowAction('suspend', member)}
                      className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg text-red-400 text-sm transition-colors"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => onRowAction('activate', member)}
                      className="flex-1 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-lg text-green-400 text-sm transition-colors"
                    >
                      Activate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
