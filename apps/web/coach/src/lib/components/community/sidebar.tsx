import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  // MoreHorizontal,
  Search,
  Menu,
  X,
  User,
  Crown,
  Shield
} from 'lucide-react';

interface CommunityMember {
  id: string;
  userID: string;
  userType: 'coach' | 'client' | 'admin';
  name: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  isOnline: boolean;
  lastActiveAt?: Date;
  joinedAt: Date;
}

interface CommunitySidebarProps {
  communityID: string;
  showMobileSidebar: boolean;
  setShowMobileSidebar: (show: boolean) => void;
}

export const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
                                                                    communityID,
                                                                    showMobileSidebar,
                                                                    setShowMobileSidebar
                                                                  }) => {
  const router = useRouter();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockMembers: CommunityMember[] = [
      {
        id: '1',
        userID: 'coach-1',
        userType: 'coach',
        name: 'Sarah Johnson',
        avatarUrl: '/api/placeholder/40/40',
        role: 'owner',
        status: 'active',
        isOnline: true,
        joinedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        userID: 'coach-2',
        userType: 'coach',
        name: 'Michael Chen',
        avatarUrl: '/api/placeholder/40/40',
        role: 'admin',
        status: 'active',
        isOnline: true,
        lastActiveAt: new Date(),
        joinedAt: new Date('2024-01-05')
      },
      {
        id: '3',
        userID: 'coach-3',
        userType: 'coach',
        name: 'Emily Rodriguez',
        avatarUrl: '/api/placeholder/40/40',
        role: 'moderator',
        status: 'active',
        isOnline: false,
        lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        joinedAt: new Date('2024-01-10')
      },
      {
        id: '4',
        userID: 'coach-4',
        userType: 'coach',
        name: 'David Thompson',
        avatarUrl: '/api/placeholder/40/40',
        role: 'member',
        status: 'active',
        isOnline: true,
        lastActiveAt: new Date(),
        joinedAt: new Date('2024-01-15')
      },
      {
        id: '5',
        userID: 'coach-5',
        userType: 'coach',
        name: 'Lisa Wang',
        avatarUrl: '/api/placeholder/40/40',
        role: 'member',
        status: 'active',
        isOnline: false,
        lastActiveAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        joinedAt: new Date('2024-01-20')
      }
    ];

    setTimeout(() => {
      setMembers(mockMembers);
      setIsLoading(false);
    }, 1000);
  }, [communityID]);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group members by role for better organization
  const groupedMembers = filteredMembers.reduce((groups, member) => {
    const role = member.role;
    if (!groups[role]) {
      groups[role] = [];
    }
    groups[role].push(member);
    return groups;
  }, {} as Record<string, CommunityMember[]>);

  const handleMemberClick = (member: CommunityMember) => {
    // Create or find direct conversation with this member
    router.push(`/messages?userID=${member.userID}&userType=${member.userType}`);
    setShowMobileSidebar(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'admin':
        return <Shield className="w-3 h-3 text-red-400" />;
      case 'moderator':
        return <Shield className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatLastActive = (lastActiveAt?: Date) => {
    if (!lastActiveAt) return '';

    const now = new Date();
    const diff = now.getTime() - lastActiveAt.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>

      <div className="relative z-10 p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">Community</h2>
          {showMobileSidebar && (
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="lg:hidden text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
          />
        </div>

        {/* Members List */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fuchsia-500"></div>
            </div>
          ) : Object.keys(groupedMembers).length > 0 ? (
            Object.entries(groupedMembers).map(([role, roleMembers]) => (
              <div key={role} className="space-y-2">
                <h3 className="text-stone-400 text-xs font-semibold uppercase tracking-wider px-2">
                  {getRoleLabel(role)}s ({roleMembers.length})
                </h3>
                <div className="space-y-1">
                  {roleMembers.map(member => (
                    <div
                      key={member.id}
                      onClick={() => handleMemberClick(member)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                    >
                      <div className="relative">
                        <img
                          src={member.avatarUrl || '/api/placeholder/40/40'}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                          member.isOnline ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white text-sm font-medium truncate">{member.name}</h3>
                          {getRoleIcon(member.role)}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-stone-400 text-xs">
                            {member.isOnline ? 'Online' : formatLastActive(member.lastActiveAt)}
                          </p>
                          <MessageCircle className="w-3 h-3 text-stone-500 group-hover:text-fuchsia-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <p className="text-stone-400 text-sm">No members found</p>
              {searchQuery && (
                <p className="text-stone-500 text-xs mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-700 pt-4 mt-4">
          <p className="text-stone-500 text-xs text-center">
            Click any member to start a conversation
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-96 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden h-fit">
        <SidebarContent />
      </div>

      {/* Mobile Toggle Button */}
      {!showMobileSidebar && (
        <div className="lg:hidden fixed top-24 right-4 z-50">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-full shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-neutral-800 to-neutral-900 border-l border-neutral-700 overflow-hidden">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};
