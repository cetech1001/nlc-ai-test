import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class SendService {
  constructor(
    @InjectQueue('email-delivery') private deliveryQueue: Queue,
  ) {}

  async sendThreadReply(messageID: string): Promise<void> {
    await this.deliveryQueue.add('send-thread-reply', { messageID });
  }

  async sendCoachEmail(messageID: string): Promise<void> {
    await this.deliveryQueue.add('send-coach-email', { messageID });
  }

  async sendSystemEmail(messageID: string): Promise<void> {
    await this.deliveryQueue.add('send-system-email', { messageID });
  }

  async sendAdminEmail(messageID: string): Promise<void> {
    await this.deliveryQueue.add('send-admin-email', { messageID });
  }
}
