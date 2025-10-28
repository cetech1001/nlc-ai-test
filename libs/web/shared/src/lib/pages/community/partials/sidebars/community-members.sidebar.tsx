'use client'

import React, {useEffect, useState, useRef} from 'react';
import {Crown, Menu, MessageCircle, Search, Shield, User, X,} from 'lucide-react';
import {MembersSectionSkeleton} from '../skeletons';
import {ExtendedCommunityMember} from '@nlc-ai/sdk-communities';
import {toast} from 'sonner';
import {UserProfile, UserType} from "@nlc-ai/types";
import {NLCClient} from "@nlc-ai/sdk-main";

interface CommunityMembersSidebarProps {
  user: UserProfile | null;
  sdkClient: NLCClient;
  communityID: string;
  handleMessages: (conversationID: string) => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
  onMemberClick?: (memberID: string, memberType: string) => void;
}

interface GroupedMembers {
  [role: string]: ExtendedCommunityMember[];
}

export const CommunityMembersSidebar: React.FC<CommunityMembersSidebarProps> = ({
                                                                                  communityID,
                                                                                  user,
                                                                                  sdkClient,
                                                                                  isMobileOpen = false,
                                                                                  handleMessages,
                                                                                  onMobileToggle,
                                                                                  onMemberClick,
                                                                                }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [members, setMembers] = useState<ExtendedCommunityMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (communityID) {
      loadCommunityMembers();
    }
  }, [communityID]);

  const loadCommunityMembers = async () => {
    try {
      setIsLoading(true);
      const response = await sdkClient.communities.members.getCommunityMembers(communityID);
      setMembers(response.data);
    } catch (error: any) {
      toast.error('Failed to load community members');
      console.error('Failed to load community members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberClick = async (member: ExtendedCommunityMember) => {
    if (member.userID === user?.id) {
      return;
    }

    if (onMemberClick) {
      onMemberClick(member.userID, member.userType);
      return;
    }

    try {
      if (user) {
        const senderID = user?.type === UserType.ADMIN ? UserType.ADMIN : user?.id;
        const conversation = await sdkClient.messages.createConversation({
          type: 'direct',
          participantIDs: [senderID || '', member.userID],
          participantTypes: [user?.type || UserType.COACH, member.userType]
        });

        handleMessages(conversation.id);
        if (onMobileToggle) {
          onMobileToggle();
        }
      }
    } catch (error: any) {
      toast.error('Failed to start conversation');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  const filteredMembers = members.filter(member => {
    const displayName = member.userType === UserType.ADMIN ? 'Admin' : member.userName;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const groupedMembers: GroupedMembers = filteredMembers.reduce((groups, member) => {
    const role = member.role;
    if (!groups[role]) {
      groups[role] = [];
    }
    groups[role].push(member);
    return groups;
  }, {} as GroupedMembers);

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

  const formatLastActive = (lastActiveAt?: string) => {
    if (!lastActiveAt) return '';

    const now = new Date();
    const diff = now.getTime() - (new Date(lastActiveAt)).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getDisplayName = (member: ExtendedCommunityMember) => {
    return member.userType === UserType.ADMIN ? 'Admin' : member.userName;
  };

  const SidebarContent = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold">Community Members</h2>
        {onMobileToggle && (
          <button
            onClick={onMobileToggle}
            className="lg:hidden text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-fuchsia-500"
        />
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            <MembersSectionSkeleton />
            <MembersSectionSkeleton />
            <MembersSectionSkeleton />
          </div>
        ) : Object.keys(groupedMembers).length > 0 ? (
          Object.entries(groupedMembers).map(([role, roleMembers]) => (
            <div key={role} className="space-y-2">
              <h3 className="text-stone-400 text-xs font-semibold uppercase tracking-wider px-2">
                {getRoleLabel(role)}s ({roleMembers.length})
              </h3>
              <div className="space-y-1">
                {roleMembers.map(member => {
                  const displayName = getDisplayName(member);
                  return (
                    <div
                      key={member.id}
                      onClick={() => handleMemberClick(member)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                    >
                      <div className="relative">
                        {member.userAvatarUrl ? (
                          <img
                            src={member.userAvatarUrl}
                            alt={displayName}
                            className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center border border-neutral-600">
                            <span className="text-white font-semibold text-sm">
                              {displayName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                          member.isOnline ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white text-sm font-medium truncate">{displayName}</h3>
                          {getRoleIcon(member.role)}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-stone-400 text-xs">
                            {member.isOnline ? 'Online' : formatLastActive(member.lastActiveAt)}
                          </p>
                          {member.userID !== user?.id && (
                            <MessageCircle className="w-3 h-3 text-stone-500 group-hover:text-fuchsia-400 transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      <div className="border-t border-neutral-700 pt-4 mt-4">
        <p className="text-stone-500 text-xs text-center">
          Click any member to start a conversation
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-96 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden h-fit">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>
        <div className="relative z-10">
          <SidebarContent />
        </div>
      </div>

      {!isMobileOpen && (
        <div className="lg:hidden fixed top-24 right-4 z-50">
          <button
            onClick={onMobileToggle}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-3 rounded-full shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-neutral-800 to-neutral-900 border-l border-neutral-700 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
