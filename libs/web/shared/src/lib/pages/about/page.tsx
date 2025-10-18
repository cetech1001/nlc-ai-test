'use client'

import {FC, useEffect, useState} from "react";
import {CommunityResponse, ExtendedCourse, UserProfile, UserType} from "@nlc-ai/types";
import {toast} from "sonner";
import {CommunityMemberships, CourseCarousel, ActivityHeatmap, ProfileHeader} from "./partials";
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
  sdkClient: NLCClient;
  user?: UserProfile | null;
  userID: string;
  userType: UserType;
}

export const AboutPage: FC<IProps> = ({ sdkClient, user, userID, userType }) => {
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [isMembershipsLoading, setIsMembershipsLoading] = useState(false);
  const [_, setIsSocialIntegrationsLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [communities, setCommunities] = useState<CommunityResponse[]>([]);
  const [socialIntegrations, setSocialIntegrations] = useState<SocialIntegration[]>([]);

  useEffect(() => {
    if (userID) {
      fetchUserProfile();
      if (userType === UserType.COACH) {
        fetchUserCourses();
      }
      fetchUserMemberships();
      fetchSocialIntegrations(userID, userType);
    } else if (user) {
      setProfile(user);
      if (userType === UserType.COACH) {
        fetchUserCourses();
      }
      fetchUserMemberships();
      fetchSocialIntegrations(user.id, user.type);
    }
  }, [userID, user]);

  const fetchUserProfile = async () => {
    setIsProfileLoading(true);
    try {
      const result = await sdkClient.users.profiles.lookupUserProfile(userID, userType);
      setProfile(result);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsProfileLoading(false);
    }
  }

  const fetchUserCourses = async (page = 1, limit = 10) => {
    setIsCoursesLoading(true);
    try {
      const targetUserID = userID || user?.id;
      const result = await sdkClient.courses.getCourses(
        { page, limit },
        { coachID: targetUserID }
      );

      if (page === 1) {
        setCourses(result.data);
      }

      return result.data;
    } catch (e: any) {
      toast.error(e.message);
      return [];
    } finally {
      setIsCoursesLoading(false);
    }
  };

  const fetchUserMemberships = async () => {
    setIsMembershipsLoading(true);
    try {
      const result = await sdkClient.communities.getCommunities({
        memberOf: true,
        limit: 100
      });
      setCommunities(result.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsMembershipsLoading(false);
    }
  };

  const fetchSocialIntegrations = async (targetUserID: string, targetUserType: string) => {
    setIsSocialIntegrationsLoading(true);
    try {
      const result = await sdkClient.integrations.getPublicSocialIntegrations(
        targetUserID,
        targetUserType
      );
      setSocialIntegrations(result);
    } catch (e: any) {
      console.error('Failed to fetch social integrations:', e);
      setSocialIntegrations([]);
    } finally {
      setIsSocialIntegrationsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 py-8">
      <div className="flex-1">
        <ProfileHeader
          isLoading={isProfileLoading}
          profile={profile}
          socialIntegrations={socialIntegrations}
          user={user}
          sdkClient={sdkClient}
        />

        <div className="mb-10">
          <ActivityHeatmap sdkClient={sdkClient} userID={userID || user?.id} />
        </div>

        <div className="mb-10">
          <h2 className="text-foreground text-lg font-medium mb-5">
            {userID ? 'Courses Offered' : 'My Courses'}
          </h2>

          <CourseCarousel
            userID={userID || user?.id || ''}
            initialCourses={courses}
            onLoadMore={fetchUserCourses}
            isLoading={isCoursesLoading && courses.length === 0}
          />
        </div>

        <div>
          <h2 className="text-foreground text-lg font-medium mb-5">
            Memberships
          </h2>

          <CommunityMemberships
            communities={communities}
            isLoading={isMembershipsLoading}
          />
        </div>
      </div>
    </div>
  );
}
