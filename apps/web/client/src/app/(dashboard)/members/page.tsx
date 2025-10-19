'use client'

import { useState, useEffect } from "react";
import {CommunityHero, MembersGrid, MembersTabNav, sdkClient, useCommunityStore} from "@/lib";
import { ExtendedCommunityMember, CommunityResponse } from "@nlc-ai/sdk-communities";

const MembersPage = () => {
  const communityID = useCommunityStore(state => state.selectedCommunityID);

  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [members, setMembers] = useState<ExtendedCommunityMember[]>([]);
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    owners: 0,
    admins: 0,
    moderators: 0,
    regularMembers: 0,
    suspendedMembers: 0,
    pendingMembers: 0,
  });

  // Fetch community details
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const data = await sdkClient.communities.getCommunity(communityID!);
        setCommunity(data);
      } catch (error) {
        console.error('Error fetching community:', error);
      }
    };

    if (communityID) {
      fetchCommunity();
    }
  }, [communityID]);

  // Fetch member statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await sdkClient.communities.members.getCommunityMemberStats(communityID!);
        setStats(data);
      } catch (error) {
        console.error('Error fetching member stats:', error);
      }
    };

    if (communityID) {
      fetchStats();
    }
  }, [communityID]);

  // Fetch members based on active tab
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        let filters: any = {};

        switch (activeTab) {
          case 'admins':
            filters.role = 'admin,owner,moderator';
            break;
          case 'online':
            // Note: You may need to implement online status filtering on the backend
            // For now, we'll fetch all and filter client-side
            break;
          case 'members':
          default:
            // Fetch all members
            break;
        }

        const response = await sdkClient.communities.members.getCommunityMembers(
          communityID!,
          { page: 1, limit: 50 },
          filters
        );

        let filteredMembers = response.data;

        // Client-side filtering for online status if needed
        if (activeTab === 'online') {
          filteredMembers = filteredMembers.filter(member => member.isOnline);
        }

        setMembers(filteredMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    if (communityID) {
      fetchMembers();
    }
  }, [communityID, activeTab]);

  // Calculate tab stats
  const tabStats = {
    members: stats.totalMembers.toLocaleString(),
    admins: (stats.owners + stats.admins + stats.moderators).toString(),
    online: members.filter(m => m.isOnline).length.toString(),
  };

  // Transform community data for hero component
  const communityHeroData = community ? {
    name: community.name,
    url: `skool.com/${community.slug}`,
    description: community.description || '',
    image: community.bannerUrl || community.avatarUrl || '',
    stats: {
      members: community._count?.members || 0,
      online: members.filter(m => m.isOnline).length,
      admins: stats.owners + stats.admins + stats.moderators,
    }
  } : null;

  // Transform members data for grid component
  const transformedMembers = members.map(member => ({
    memberID: member.id,
    name: member.userName,
    username: `@${member.userName.toLowerCase().replace(/\s+/g, '-')}`,
    joinDate: `Joined ${new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    status: member.isOnline ? 'online' : 'offline',
    avatar: member.userAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userName}`,
    bio: member.customTitle || `${member.role.charAt(0).toUpperCase() + member.role.slice(1)} • ${member._count.posts} posts • ${member._count.comments} comments`,
    role: member.role,
  }));

  if (loading && !community) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1573px] mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1573px] mx-auto space-y-8 sm:space-y-10">
      {communityHeroData && <CommunityHero community={communityHeroData} />}

      <div className="space-y-6">
        <MembersTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={tabStats}
        />

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
          </div>
        ) : (
          <MembersGrid members={transformedMembers} />
        )}
      </div>
    </div>
  );
};

export default MembersPage;
