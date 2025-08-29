import {BaseClient} from "@nlc-ai/sdk-core";
import {Admin, ExtendedClient, ExtendedCoach, UserType} from "../types";

export class ProfileClient extends BaseClient{
  async lookupProfile(userType: UserType, userID: string) {
    const response = await this.request<ExtendedCoach | ExtendedClient | Admin>('GET', `/lookup/${userType}/${userID}`);
    return response.data!;
  }
}
