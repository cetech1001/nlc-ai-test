'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, MessageSquare, Calendar, Shield, TrendingUp } from 'lucide-react';
import { BackTo } from "@nlc-ai/web-shared";
import { Button, Skeleton } from '@nlc-ai/web-ui';
import { formatDate } from "@nlc-ai/web-utils";
import {
  CommunityDetailsInfo, CommunityDetailsQuickActions, CommunityDetailsRecentActivity, CommunityDetailsRecentMembers,
  CommunityDetailsSettingsPreview, sdkClient
} from "@/lib";
import {CommunityActivity, CommunityResponse} from '@nlc-ai/sdk-community';

const AdminCommunityDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const communityID = params.communityID as string;

  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCommunityDetails();
  }, [communityID]);

  const fetchCommunityDetails = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [communityResponse, activitiesResponse] = await Promise.all([
        sdkClient.community.communities.getCommunity(communityID),
        sdkClient.community.communities.getCommunityActivity(communityID, 6)
      ]);

      setCommunity(communityResponse);
      setActivities(activitiesResponse);
    } catch (error: any) {
      setError(error.message || 'Failed to load community details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!community) return;

    try {
      await sdkClient.community.communities.updateCommunity(community.id, {
        isActive: !community.isActive
      });

      setCommunity(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
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
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-6">
              <Skeleton className="h-80 rounded-2xl" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-64 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
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
      <BackTo title="Community Details" onClick={() => router.push('/communities')} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="relative bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute w-96 h-96 -right-24 -top-32 bg-gradient-to-l from-fuchsia-400 via-purple-500 to-violet-600 rounded-full blur-3xl" />
            </div>

            {community.bannerUrl && (
              <div className="relative h-32 sm:h-72">
                <img
                  src={community.bannerUrl}
                  alt={`${community.name} banner`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            )}

            <div className="relative z-10 p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <div className="flex-shrink-0">
                  {community.avatarUrl ? (
                    <img
                      src={community.avatarUrl}
                      alt={community.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-neutral-600"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                        {community.name}
                      </h1>
                      {community.description && (
                        <p className="text-stone-300 text-base leading-relaxed max-w-2xl">
                          {community.description}
                        </p>
                      )}
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

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getTypeColor(community.type)}`}>
                      {community.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getVisibilityColor(community.visibility)}`}>
                      {community.visibility.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      community.isActive
                        ? 'bg-green-600/20 text-green-400 border-green-600/30'
                        : 'bg-red-600/20 text-red-400 border-red-600/30'
                    }`}>
                      {community.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/50">
                      <Users className="w-6 h-6 text-blue-400 mb-2" />
                      <div className="text-xl font-bold text-white">{community.memberCount}</div>
                      <div className="text-stone-400 text-sm">Members</div>
                    </div>
                    <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/50">
                      <MessageSquare className="w-6 h-6 text-green-400 mb-2" />
                      <div className="text-xl font-bold text-white">{community.postCount}</div>
                      <div className="text-stone-400 text-sm">Posts</div>
                    </div>
                    <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/50">
                      <Calendar className="w-6 h-6 text-purple-400 mb-2" />
                      <div className="text-xl font-bold text-white">{formatDate(community.createdAt)}</div>
                      <div className="text-stone-400 text-sm">Created</div>
                    </div>
                    <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/50">
                      <TrendingUp className="w-6 h-6 text-orange-400 mb-2" />
                      <div className="text-xl font-bold text-white">{formatDate(community.updatedAt)}</div>
                      <div className="text-stone-400 text-sm">Updated</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CommunityDetailsRecentActivity communityID={communityID} activities={activities}/>
            <CommunityDetailsSettingsPreview community={community}/>
          </div>
        </div>

        <div className="space-y-6">
          <CommunityDetailsQuickActions communityID={communityID}/>
          <CommunityDetailsInfo community={community}/>
          <CommunityDetailsRecentMembers community={community}/>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunityDetailPage;
