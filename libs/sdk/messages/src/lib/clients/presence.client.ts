import { BaseClient } from '@nlc-ai/sdk-core';
import { UserType } from '@nlc-ai/types';

export interface OnlineStatusResponse {
  userID: string;
  userType: UserType;
  isOnline: boolean;
  lastSeen: string | null;
}

export interface BatchOnlineStatusResponse {
  users: Array<{
    userID: string;
    userType: UserType;
    isOnline: boolean;
  }>;
}

export class PresenceClient extends BaseClient {
  /**
   * Check if a single user is online
   */
  async checkOnlineStatus(userID: string, userType: UserType): Promise<OnlineStatusResponse> {
    const response = await this.request<OnlineStatusResponse>(
      'GET',
      `/${userType}/${userID}`
    );
    return response.data!;
  }

  /**
   * Check online status for multiple users
   */
  async checkBatchOnlineStatus(
    users: Array<{ userID: string; userType: UserType }>
  ): Promise<BatchOnlineStatusResponse> {
    const userIDs = users.map(u => u.userID).join(',');
    const userTypes = users.map(u => u.userType).join(',');

    const response = await this.request<BatchOnlineStatusResponse>(
      'GET',
      `/batch?userIDs=${userIDs}&userTypes=${userTypes}`
    );
    return response.data!;
  }
}
