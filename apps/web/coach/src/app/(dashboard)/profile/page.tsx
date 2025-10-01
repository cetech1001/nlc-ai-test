'use client'

import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {useAuth} from "@nlc-ai/web-auth";
import {CommunityResponse, ExtendedCourse, UserProfile, UserType} from "@nlc-ai/types";
import {ProfileHeader, sdkClient} from "@/lib";
import {toast} from "sonner";
import {CommunityMemberships, CourseCarousel} from "@/lib/components/profile";

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

const ProfilePage = () => {
  const { user } = useAuth(UserType.COACH);

  const params = useParams();
  const userID = params.userID as string;

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [isMembershipsLoading, setIsMembershipsLoading] = useState(false);
  const [_, setIsSocialIntegrationsLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [communities, setCommunities] = useState<CommunityResponse[]>([]);
  const [socialIntegrations, setSocialIntegrations] = useState<SocialIntegration[]>([]);

  // Update the useEffect hook:
  useEffect(() => {
    if (userID) {
      fetchUserProfile();
      fetchUserCourses();
      fetchUserMemberships();
      fetchSocialIntegrations(userID, UserType.COACH);
    } else if (user) {
      setProfile(user);
      fetchUserCourses();
      fetchUserMemberships();
      fetchSocialIntegrations(user.id, user.type);
    }
  }, [userID, user]);

  const fetchUserProfile = async () => {
    setIsProfileLoading(true);
    try {
      const result = await sdkClient.users.profiles.lookupUserProfile(userID, UserType.COACH);
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

  // Update fetchUserMemberships:
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
      // Don't show error toast for social integrations as it's not critical
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
        />

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

export default ProfilePage;
