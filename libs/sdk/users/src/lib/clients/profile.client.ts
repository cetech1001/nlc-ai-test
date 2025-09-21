import {BaseClient} from "@nlc-ai/sdk-core";
import {UserProfile, UserStats, UserType} from "@nlc-ai/types";
import {Admin, ExtendedClient, ExtendedCoach} from "../types";

export class ProfileClient extends BaseClient{
  async lookupProfile(userType: UserType, userID: string) {
    const response = await this.request<ExtendedCoach | ExtendedClient | Admin>('GET', `/lookup/${userType}/${userID}`);
    return response.data!;
  }

  async getUserProfile(userID: string, userType: UserType): Promise<UserProfile> {
    const response = await this.request<UserProfile>('GET', `/profile/${userID}/${userType}`);
    return response.data!;
  }

  async getUserStats(userID: string, userType: UserType): Promise<UserStats> {
    const response = await this.request<UserStats>('GET', `/stats/${userID}/${userType}`);
    return response.data!;
  }
}
