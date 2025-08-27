import {BaseClient} from "@nlc-ai/sdk-core";
import {ExtendedCoach, UserType} from "../types";

export class ProfileClient extends BaseClient{
  async lookupProfile(userType: UserType, userID: string): Promise<ExtendedCoach> {
    const response = await this.request<ExtendedCoach>('GET', `/lookup/${userType}/${userID}`);
    return response.data!;
  }
}
