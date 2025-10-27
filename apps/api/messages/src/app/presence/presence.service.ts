import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { UserType } from '@nlc-ai/types';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly redis: Redis;
  private readonly ONLINE_TTL = 30; // seconds

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async setOnline(userID: string, userType: UserType, socketID: string): Promise<void> {
    const userKey = this.getUserKey(userID, userType);

    await Promise.all([
      this.redis.setex(`presence:${userKey}:online`, this.ONLINE_TTL, socketID),
      this.redis.set(`presence:${userKey}:last_seen`, Date.now()),
    ]);

    this.logger.log(`✅ User ${userKey} is now online`);
  }

  async setOffline(userID: string, userType: UserType): Promise<void> {
    const userKey = this.getUserKey(userID, userType);

    await Promise.all([
      this.redis.del(`presence:${userKey}:online`),
      this.redis.set(`presence:${userKey}:last_seen`, Date.now()),
    ]);

    this.logger.log(`❌ User ${userKey} is now offline`);
  }

  async refreshPresence(userID: string, userType: UserType, socketID: string): Promise<void> {
    const userKey = this.getUserKey(userID, userType);
    await this.redis.setex(`presence:${userKey}:online`, this.ONLINE_TTL, socketID);
  }

  async isOnline(userID: string, userType: UserType): Promise<boolean> {
    const userKey = this.getUserKey(userID, userType);
    const exists = await this.redis.exists(`presence:${userKey}:online`);
    return exists === 1;
  }

  async getLastSeen(userID: string, userType: UserType): Promise<number | null> {
    const userKey = this.getUserKey(userID, userType);
    const timestamp = await this.redis.get(`presence:${userKey}:last_seen`);
    return timestamp ? parseInt(timestamp) : null;
  }

  async getOnlineUsers(userIDs: string[], userTypes: UserType[]): Promise<Set<string>> {
    const pipeline = this.redis.pipeline();
    const userKeys: string[] = [];

    for (let i = 0; i < userIDs.length; i++) {
      const userKey = this.getUserKey(userIDs[i], userTypes[i]);
      userKeys.push(userKey);
      pipeline.exists(`presence:${userKey}:online`);
    }

    const results = await pipeline.exec();
    const onlineUsers = new Set<string>();

    results?.forEach((result, index) => {
      if (result && result[1] === 1) {
        onlineUsers.add(userKeys[index]);
      }
    });

    return onlineUsers;
  }

  private getUserKey(userID: string, userType: UserType): string {
    return `${userType}:${userID}`;
  }

  async cleanup(): Promise<void> {
    await this.redis.quit();
  }
}
