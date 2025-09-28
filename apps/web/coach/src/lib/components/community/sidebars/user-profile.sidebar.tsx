'use client'

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Calendar, MapPin, Globe, Award, Users, Star, TrendingUp } from 'lucide-react';
import { sdkClient } from '@/lib';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@nlc-ai/web-auth';
import {UserProfile, UserStats, UserType} from '@nlc-ai/types';
import { Skeleton } from '@nlc-ai/web-ui';
import { formatTimeAgo, getInitials } from '@nlc-ai/web-utils';

interface UserProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userID: string;
  userType: UserType;
  isMobile?: boolean;
}

const UserProfileSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center gap-4">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>

    {/* Bio */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton className="h-6 w-8 mx-auto mb-1" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
      ))}
    </div>

    {/* Contact Info */}
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  </div>
);

export const UserProfileSidebar: React.FC<UserProfileSidebarProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        userID,
                                                                        userType,
                                                                        isMobile = false
                                                                      }) => {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    if (isOpen && userID) {
      loadUserProfile();
    }
  }, [isOpen, userID, userType]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);

      const [profileResponse, statsResponse] = await Promise.all([
        sdkClient.users.profiles.lookupUserProfile(userID, userType),
        sdkClient.users.profiles.getUserStats(userID, userType)
      ]);

      setProfile(profileResponse);
      setStats(statsResponse);
    } catch (error: any) {
      toast.error('Failed to load user profile');
      console.error('Failed to load user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = async () => {
    if (!profile || isStartingChat) return;

    try {
      setIsStartingChat(true);

      const conversation = await sdkClient.messages.createConversation({
        type: 'direct',
        participantIDs: [user?.id || '', profile.id],
        participantTypes: [user?.type || UserType.COACH, userType]
      });

      router.push(`/messages?conversationID=${conversation.id}`);
      onClose();
    } catch (error: any) {
      toast.error('Failed to start conversation');
    } finally {
      setIsStartingChat(false);
    }
  };

  const renderUserType = () => {
    if (userType === UserType.COACH) {
      return (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm font-medium">Coach</span>
          {profile?.subscriptionPlan && (
            <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs capitalize">
              {profile.subscriptionPlan}
            </span>
          )}
        </div>
      );
    } else if (userType === UserType.CLIENT) {
      return (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm font-medium">Client</span>
          {profile?.engagementScore && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 text-xs">{Number(profile.engagementScore).toFixed(1)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-700">
        <h2 className="text-white text-xl font-semibold">Profile</h2>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <UserProfileSkeleton />
        ) : profile ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-full h-full rounded-full object-cover border-2 border-neutral-600"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {getInitials(`${profile.firstName} ${profile.lastName}`)}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="text-white text-xl font-bold mb-1">
                {profile.businessName || `${profile.firstName} ${profile.lastName}`}
              </h3>

              {profile.businessName && (
                <p className="text-stone-300 text-sm mb-2">
                  {profile.firstName} {profile.lastName}
                </p>
              )}

              {renderUserType()}

              <div className="flex items-center justify-center gap-2 mt-2">
                {profile.isVerified && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Verified" />
                )}
                <span className={`text-xs ${profile.isActive ? 'text-green-400' : 'text-stone-500'}`}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h4 className="text-white text-sm font-medium mb-2">About</h4>
                <p className="text-stone-300 text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div>
                <h4 className="text-white text-sm font-medium mb-3">Community Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-white text-lg font-bold">{stats.totalPosts}</div>
                    <div className="text-stone-400 text-xs">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-lg font-bold">{stats.totalComments}</div>
                    <div className="text-stone-400 text-xs">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-lg font-bold">{stats.totalLikes}</div>
                    <div className="text-stone-400 text-xs">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-lg font-bold">{stats.communitiesJoined}</div>
                    <div className="text-stone-400 text-xs">Communities</div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div>
              <h4 className="text-white text-sm font-medium mb-3">Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-300 text-sm">
                    Joined {formatTimeAgo(profile.createdAt)}
                  </span>
                </div>

                {profile.lastLoginAt && (
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-300 text-sm">
                      Last active {formatTimeAgo(profile.lastLoginAt)}
                    </span>
                  </div>
                )}

                {profile.websiteUrl && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-stone-400" />
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fuchsia-400 hover:text-fuchsia-300 text-sm transition-colors truncate"
                    >
                      {profile.websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {profile.timezone && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-300 text-sm">{profile.timezone}</span>
                  </div>
                )}

                {userType === UserType.CLIENT && profile.totalInteractions && (
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-300 text-sm">
                      {profile.totalInteractions} interaction{profile.totalInteractions !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags for clients */}
            {userType === UserType.CLIENT && profile.tags && profile.tags.length > 0 && (
              <div>
                <h4 className="text-white text-sm font-medium mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-neutral-700/50 text-stone-300 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-stone-400">Profile not found</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {profile && profile.id !== user?.id && (
        <div className="p-6 border-t border-neutral-700">
          <button
            onClick={handleStartConversation}
            disabled={isStartingChat}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isStartingChat ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Start Conversation
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className={`absolute right-0 top-0 h-full w-full bg-gradient-to-b from-neutral-800 to-neutral-900 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
          </div>
          <div className="relative z-10 h-full">
            <SidebarContent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-96 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden h-fit transform transition-all duration-300 ease-out ${
      isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>
      <div className="relative z-10 h-full">
        <SidebarContent />
      </div>
    </div>
  );
};
