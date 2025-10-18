import {Calendar, Clock, Instagram, Link, MapPin, X, Youtube, Facebook, UserPlus, UserCheck} from "lucide-react";
import {formatDate, formatTimeAgo} from "@nlc-ai/sdk-core";
import {UserProfile} from "@nlc-ai/types";
import {FC, ReactNode, useEffect, useState} from "react";
import {ProfileHeaderSkeleton} from "./skeletons";
import {toast} from "sonner";
import {EnvelopeIcon} from "@heroicons/react/16/solid";
import {NLCClient} from "@nlc-ai/sdk-main";

interface SocialIntegration {
  id: string;
  platformName: string;
  config: {
    username?: string;
    name?: string;
    displayName?: string;
    profileUrl?: string;
    followerCount?: number;
  };
}

interface IProps {
  isLoading: boolean;
  profile: UserProfile | null;
  user?: UserProfile | null;
  sdkClient: NLCClient;
  socialIntegrations?: SocialIntegration[];
}

const getSocialIcon = (platformName: string) => {
  const iconMap: Record<string, ReactNode> = {
    facebook: <Facebook className="w-6 h-6 text-foreground/40 hover:text-blue-500 transition-colors cursor-pointer" />,
    instagram: <Instagram className="w-6 h-6 text-foreground/40 hover:text-pink-500 transition-colors cursor-pointer" />,
    youtube: <Youtube className="w-6 h-6 text-foreground/40 hover:text-red-500 transition-colors cursor-pointer" />,
    twitter: <X className="w-6 h-6 text-foreground/40 hover:text-white transition-colors cursor-pointer" />,
    tiktok: (
      <svg className="w-6 h-6 text-foreground/40 hover:text-white transition-colors cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
  };

  return iconMap[platformName.toLowerCase()] || <Link className="w-6 h-6 text-foreground/40" />;
};

export const ProfileHeader: FC<IProps> = ({ isLoading, profile, socialIntegrations = [], user, sdkClient }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [countsLoading, setCountsLoading] = useState(false);

  const isOwnProfile = user?.id === profile?.id;
  const canFollow = !isOwnProfile && profile?.id;

  useEffect(() => {
    if (profile?.id) {
      fetchFollowStatus();
      fetchFollowCounts();
    }
  }, [profile?.id]);

  const fetchFollowStatus = async () => {
    if (!profile?.id || !user) return;

    try {
      const result = await sdkClient.users.profiles.checkFollowStatus(profile.id);
      setIsFollowing(result.isFollowing);
    } catch (error) {
      console.error('Failed to fetch follow status:', error);
    }
  };

  const fetchFollowCounts = async () => {
    if (!profile?.id) return;

    setCountsLoading(true);
    try {
      const counts = await sdkClient.users.profiles.getFollowCounts(profile.id);
      setFollowersCount(counts.followersCount);
      setFollowingCount(counts.followingCount);
    } catch (error) {
      console.error('Failed to fetch follow counts:', error);
    } finally {
      setCountsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile?.id) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await sdkClient.users.profiles.unfollowCoach(profile.id);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success('Unfollowed successfully');
      } else {
        await sdkClient.users.profiles.followCoach(profile.id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success('Followed successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return <ProfileHeaderSkeleton/>
  }

  const handleSocialClick = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="glass-card rounded-[30px] p-8 mb-10 relative overflow-hidden">
      <div className="absolute -left-7 -bottom-32 w-[267px] h-[267px] bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 opacity-40 blur-[112.55px] rounded-full" />
      <div className="absolute -right-7 -top-20 w-[200px] h-[200px] bg-gradient-to-r from-purple-400 via-purple-600 to-fuchsia-500 opacity-30 blur-[100px] rounded-full" />

      <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
        {profile?.avatarUrl && (
          <img
            src={profile?.avatarUrl || ''}
            alt={profile?.firstName + ' ' + profile?.lastName}
            className="w-[124px] h-[124px] rounded-full border-4 border-purple-primary/20"
          />
        )}

        <div className="flex-1">
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              {canFollow && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    isFollowing
                      ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                      : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isFollowLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-foreground text-xl font-semibold">
                {profile?.firstName} {profile?.lastName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-foreground/40" />
                <span className="text-foreground">
                  Active: {profile?.lastLoginAt && formatTimeAgo(profile.lastLoginAt)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-foreground/40" />
                <span className="text-foreground">
                  Joined {profile?.createdAt && formatDate(profile.createdAt)}
                </span>
              </div>
              {profile?.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-foreground/40" />
                  <span className="text-foreground">
                    {profile?.location}
                  </span>
                </div>
              )}
            </div>

            {profile?.bio && (
              <p className="text-foreground leading-relaxed">
                {profile?.bio}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-foreground text-xl font-semibold">
                  {countsLoading ? (
                    <div className="animate-pulse h-6 w-12 bg-purple-500/20 rounded" />
                  ) : (
                    followersCount.toLocaleString()
                  )}
                </div>
                <div className="text-foreground/70 text-sm">Followers</div>
                <div className="w-8 h-px bg-white/20 mt-3"></div>
              </div>
              <div className="text-center">
                <div className="text-foreground text-xl font-semibold">
                  {countsLoading ? (
                    <div className="animate-pulse h-6 w-12 bg-purple-500/20 rounded" />
                  ) : (
                    followingCount.toLocaleString()
                  )}
                </div>
                <div className="text-foreground/70 text-sm">Following</div>
                <div className="w-8 h-px bg-white/20 mt-3"></div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <a href={`mailto:${profile?.email}`}>
                <EnvelopeIcon
                  className="w-6 h-6 text-foreground/40 hover:text-fuchsia-600 cursor-pointer"
                />
              </a>
              {profile?.websiteUrl ? (
                <Link
                  className="w-6 h-6 text-foreground/40 hover:text-fuchsia-600 cursor-pointer"
                  onClick={() => {
                    let url = profile?.websiteUrl || '';
                    if (url && !/^https?:\/\//i.test(url)) {
                      url = 'https://' + url;
                    }
                    handleSocialClick(url);
                  }}
                />
              ) : (
                <Link className="w-6 h-6 text-foreground/40" />
              )}
              {socialIntegrations.length > 0 && socialIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  onClick={() => handleSocialClick(integration.config.profileUrl)}
                  title={`${integration.platformName}: ${integration.config.username || integration.config.name || integration.config.displayName || ''}`}
                >
                  {getSocialIcon(integration.platformName)}
                </div>
              ))}
              {socialIntegrations.length === 0 && (
                <>
                  <Facebook className="w-6 h-6 text-foreground/40" />
                  <Youtube className="w-6 h-6 text-foreground/40" />
                  <svg className="w-6 h-6 text-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  <Instagram className="w-6 h-6 text-foreground/40" />
                  <X className="w-6 h-6 text-foreground/40" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
