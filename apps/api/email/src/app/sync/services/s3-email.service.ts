import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import {StoredEmailContent, SyncedEmail, ThreadMessage} from '@nlc-ai/types';

@Injectable()
export class S3EmailService {
  private readonly logger = new Logger(S3EmailService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('email.aws.s3.region')!,
      credentials: {
        accessKeyId: this.configService.get<string>('email.aws.s3.accessKeyID')!,
        secretAccessKey: this.configService.get<string>('email.aws.s3.secretAccessKey')!,
      },
    });
    this.bucketName = this.configService.get<string>('email.aws.s3.bucketName')!;
  }

  /**
   * Store email content in S3
   */
  async storeEmailContent(
    coachID: string,
    threadID: string,
    messageID: string,
    email: Partial<SyncedEmail> & { isFromCoach: boolean }
  ): Promise<string> {
    const date = new Date(email.sentAt!);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const key = `email-training-data/${coachID}/raw-emails/${year}-${month}/${messageID}.json`;

    const content: StoredEmailContent = {
      messageID,
      threadID,
      from: email.from!,
      to: email.to!,
      subject: email.subject || '',
      text: email.text || '',
      html: email.html,
      sentAt: email.sentAt!,
      isFromCoach: email.isFromCoach,
      attachments: email.attachments,
    };

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: JSON.stringify(content),
          ContentType: 'application/json',
          Metadata: {
            coachID,
            threadID,
            messageID,
            isFromCoach: String(email.isFromCoach),
          },
        })
      );

      this.logger.log(`Stored email content: ${key}`);
      return key;
    } catch (error: any) {
      this.logger.error(`Failed to store email content in S3: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get full thread messages from S3
   */
  async getThreadMessages(coachID: string, threadID: string): Promise<ThreadMessage[]> {
    try {
      const prefix = `email-threads/${coachID}/${threadID}/`;

      const listResponse = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: prefix,
        })
      );

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        return [];
      }

      const messages: ThreadMessage[] = [];

      for (const object of listResponse.Contents) {
        if (!object.Key) continue;

        const getResponse = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: object.Key,
          })
        );

        const body = await getResponse.Body?.transformToString();
        if (body) {
          const message = JSON.parse(body);
          messages.push(message);
        }
      }

      return messages.sort((a, b) =>
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
    } catch (error: any) {
      this.logger.error(`Failed to get thread messages from S3: ${error.message}`, error);
      return [];
    }
  }

  /**
   * Upload fine-tuning dataset to S3
   */
  async uploadFineTuningData(coachID: string, data: string): Promise<string> {
    const timestamp = Date.now();
    const key = `email-training-data/${coachID}/fine-tuning-batches/batch-${timestamp}.jsonl`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: data,
          ContentType: 'application/jsonl',
          Metadata: {
            coachID,
            timestamp: String(timestamp),
          },
        })
      );

      this.logger.log(`Uploaded fine-tuning data: ${key}`);
      return key;
    } catch (error: any) {
      this.logger.error(`Failed to upload fine-tuning data: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get fine-tuning data from S3
   */
  async getFineTuningData(s3Key: string): Promise<string> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        })
      );

      const body = await response.Body?.transformToString();
      if (!body) {
        throw new Error('No data found');
      }

      return body;
    } catch (error: any) {
      this.logger.error(`Failed to get fine-tuning data from S3: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get email content from S3
   */
  async getEmailContent(s3Key: string): Promise<StoredEmailContent> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        })
      );

      const body = await response.Body?.transformToString();
      if (!body) {
        throw new Error('No email content found');
      }

      return JSON.parse(body);
    } catch (error: any) {
      this.logger.error(`Failed to get email content from S3: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * List all emails for a coach within a date range
   */
  async listCoachEmails(
    coachID: string,
    startDate: Date,
    endDate: Date
  ): Promise<string[]> {
    try {
      const keys: string[] = [];
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endMonth = endDate.getMonth() + 1;

      for (let year = startYear; year <= endYear; year++) {
        const monthStart = year === startYear ? startMonth : 1;
        const monthEnd = year === endYear ? endMonth : 12;

        for (let month = monthStart; month <= monthEnd; month++) {
          const monthStr = String(month).padStart(2, '0');
          const prefix = `email-training-data/${coachID}/raw-emails/${year}-${monthStr}/`;

          const response = await this.s3Client.send(
            new ListObjectsV2Command({
              Bucket: this.bucketName,
              Prefix: prefix,
            })
          );

          if (response.Contents) {
            keys.push(...response.Contents.map(obj => obj.Key!).filter(Boolean));
          }
        }
      }

      return keys;
    } catch (error: any) {
      this.logger.error(`Failed to list coach emails: ${error.message}`, error);
      return [];
    }
  }
}
