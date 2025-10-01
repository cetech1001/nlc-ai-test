import {BaseClient} from "@nlc-ai/sdk-core";
import {UpdateProfileRequest, UserProfile, UserStats, UserType} from "@nlc-ai/types";

export class ProfilesClient extends BaseClient{
  async uploadAvatar(avatarUrl: string) {
    const response = await this.request<{ message: string; avatarUrl: string }>('POST', '/me/upload-avatar', {
      body: { avatarUrl }
    });
    return response.data!;
  }

  async updateProfile(data: UpdateProfileRequest) {
    const response = await this.request<{
      message: string;
      user: UserProfile;
    }>('PATCH', '/me', { body: data });
    return response.data!;
  }

  async updatePassword(data: { newPassword: string }) {
    const response = await this.request<{ message: string }>('PATCH', '/me/password', { body: data });
    return response.data!;
  }

  async lookupUserProfile(userID: string, userType: UserType) {
    const response = await this.request<UserProfile>('GET', `/lookup/${userType}/${userID}`);
    return response.data!;
  }

  async getMyProfile(): Promise<UserProfile> {
    const response = await this.request<UserProfile>('GET', `/me`);
    return response.data!;
  }

  async getUserStats(userID: string, userType: UserType): Promise<UserStats> {
    const response = await this.request<UserStats>('GET', `/stats/${userID}/${userType}`);
    return response.data!;
  }

  async followCoach(coachID: string) {
    const response = await this.request<{ message: string; isFollowing: boolean }>(
      'POST',
      '/follow',
      { body: { coachID } }
    );
    return response.data!;
  }

  async unfollowCoach(coachID: string) {
    const response = await this.request<{ message: string; isFollowing: boolean }>(
      'DELETE',
      `/follow/${coachID}`
    );
    return response.data!;
  }

  async checkFollowStatus(coachID: string) {
    const response = await this.request<{ isFollowing: boolean }>(
      'GET',
      `/follow-status/${coachID}`
    );
    return response.data!;
  }

  async getFollowCounts(coachID: string) {
    const response = await this.request<{ followersCount: number; followingCount: number }>(
      'GET',
      `/follow-counts/${coachID}`
    );
    return response.data!;
  }
}
