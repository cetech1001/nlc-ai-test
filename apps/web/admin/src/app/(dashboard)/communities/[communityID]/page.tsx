'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, MessageSquare, Calendar, Settings, Shield, Eye } from 'lucide-react';
import { BackTo } from "@nlc-ai/web-shared";
import { Button, Skeleton } from '@nlc-ai/web-ui';
import { formatDate } from "@nlc-ai/web-utils";
import { sdkClient } from "@/lib";

interface CommunityDetail {
  id: string;
  name: string;
  description?: string;
  type: string;
  visibility: string;
  ownerID: string;
  ownerType: string;
  memberCount: number;
  postCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  coachID?: string;
  courseID?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  settings: Record<string, any>;
  members: Array<{
    id: string;
    userID: string;
    userType: string;
    role: string;
    status: string;
    joinedAt: Date;
  }>;
  recentPosts: Array<{
    id: string;
    content: string;
    authorName: string;
    createdAt: Date;
    likeCount: number;
    commentCount: number;
  }>;
}

const AdminCommunityDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const communityID = params.communityID as string;

  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCommunityDetails();
  }, [communityID]);

  const fetchCommunityDetails = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await sdkClient.community.communities.getCommunity(communityID);

      // Mock additional data that would come from the API
      const mockDetail: CommunityDetail = {
        ...response,
        members: [
          {
            id: '1',
            userID: 'user1',
            userType: 'coach',
            role: 'owner',
            status: 'active',
            joinedAt: new Date('2024-01-15'),
          },
          // Add more mock members...
        ],
        recentPosts: [
          {
            id: '1',
            content: 'Welcome to our community! Let\'s share knowledge and grow together.',
            authorName: 'Coach Sarah',
            createdAt: new Date('2024-01-20'),
            likeCount: 15,
            commentCount: 8,
          },
          // Add more mock posts...
        ],
      };

      setCommunity(mockDetail);
    } catch (error: any) {
      setError(error.message || 'Failed to load community details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    // Implement toggle status
    console.log('Toggle status');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'coach_to_coach':
        return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'coach_client':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'course':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'private':
        return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'private':
        return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'invite_only':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!community) return null;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <BackTo title="Community Details" onClick={router.back} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Community Header */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-56 h-56 -right-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
            </div>

            <div className="relative z-10 p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {community.name}
                  </h1>
                  {community.description && (
                    <p className="text-stone-300 text-lg leading-relaxed mb-4">
                      {community.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(community.type)}`}>
                      {community.type.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getVisibilityColor(community.visibility)}`}>
                      {community.visibility.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      community.isActive
                        ? 'bg-green-600/20 text-green-400 border-green-600/30'
                        : 'bg-red-600/20 text-red-400 border-red-600/30'
                    }`}>
                      {community.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/communities/${communityID}/moderate`)}
                    variant="outline"
                    size="sm"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Moderate
                  </Button>
                  <Button
                    onClick={handleToggleStatus}
                    variant="outline"
                    size="sm"
                  >
                    {community.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{community.memberCount}</div>
                  <div className="text-stone-400 text-sm">Members</div>
                </div>
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{community.postCount}</div>
                  <div className="text-stone-400 text-sm">Posts</div>
                </div>
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{formatDate(community.createdAt)}</div>
                  <div className="text-stone-400 text-sm">Created</div>
                </div>
                <div className="text-center">
                  <Eye className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{formatDate(community.updatedAt)}</div>
                  <div className="text-stone-400 text-sm">Updated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Recent Posts</h2>

            <div className="space-y-4">
              {community.recentPosts.map((post) => (
                <div key={post.id} className="border-b border-neutral-700 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-stone-300 font-medium">{post.authorName}</span>
                    <span className="text-stone-400 text-sm">{formatDate(post.createdAt)}</span>
                  </div>
                  <p className="text-stone-200 mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex gap-4 text-stone-400 text-sm">
                    <span>{post.likeCount} likes</span>
                    <span>{post.commentCount} comments</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Member List */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Members</h3>

            <div className="space-y-3">
              {community.members.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-stone-200 font-medium">{member.userType} {member.userID}</div>
                    <div className="text-stone-400 text-sm">{member.role}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    member.status === 'active'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {member.status}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => router.push(`/communities/${communityID}/members`)}
              variant="outline"
              size="sm"
              className="w-full mt-4"
            >
              View All Members
            </Button>
          </div>

          {/* Community Settings */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Settings</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-400">Owner Type:</span>
                <span className="text-stone-200">{community.ownerType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Owner ID:</span>
                <span className="text-stone-200 truncate ml-2">{community.ownerID}</span>
              </div>
              {community.coachID && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Coach ID:</span>
                  <span className="text-stone-200 truncate ml-2">{community.coachID}</span>
                </div>
              )}
              {community.courseID && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Course ID:</span>
                  <span className="text-stone-200 truncate ml-2">{community.courseID}</span>
                </div>
              )}
            </div>

            <Button
              onClick={() => router.push(`/communities/${communityID}/settings`)}
              variant="outline"
              size="sm"
              className="w-full mt-4"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunityDetailPage;
