import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FineTuningRepository } from '../repositories/fine-tuning.repository';
import { EmailCacheRepository } from '../repositories/email-cache.repository';
import { S3EmailService } from './s3-email.service';
import { groupBy, orderBy } from 'lodash';
import { FineTuningJobStatus } from '@prisma/client';
import {PrismaService} from "@nlc-ai/api-database";
import {AgentType} from "@nlc-ai/types";

interface CoachEmail {
  id: string;
  threadID: string;
  messageID: string;
  s3Key: string;
  from: string;
  to: string;
  subject?: string | null;
  isFromCoach: boolean;
  sentAt: Date;
}

interface TrainingExample {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

@Injectable()
export class EmailFineTuningService {
  private readonly logger = new Logger(EmailFineTuningService.name);
  private readonly openai: OpenAI;
  private readonly minEmailsForTraining = 50;
  private readonly maxEmailsPerJob = 1000;

  constructor(
    private readonly configService: ConfigService,
    private readonly fineTuningRepo: FineTuningRepository,
    private readonly emailCacheRepo: EmailCacheRepository,
    private readonly s3Service: S3EmailService,
    private readonly prisma: PrismaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('agents.openai.apiKey'),
    });
  }

  /**
   * Queue an email for future fine-tuning
   * Called from sync service when coach's sent email is detected
   */
  async queueEmailForFineTuning(
    coachID: string,
    email: {
      threadID: string;
      messageID: string;
      s3Key: string;
      from: string;
      to: string;
      subject?: string;
      sentAt: Date;
      isFromCoach: boolean;
      isToClientOrLead: boolean;
    }
  ): Promise<void> {
    try {
      // Check if already exists
      const exists = await this.emailCacheRepo.emailExists(coachID, email.messageID);
      if (exists) {
        return;
      }

      await this.emailCacheRepo.createEmailCache({
        coachID,
        threadID: email.threadID,
        messageID: email.messageID,
        s3Key: email.s3Key,
        from: email.from,
        to: email.to,
        subject: email.subject,
        isFromCoach: email.isFromCoach,
        isToClientOrLead: email.isToClientOrLead,
        sentAt: email.sentAt,
      });

      this.logger.log(`Queued email ${email.messageID} for fine-tuning`);
    } catch (error: any) {
      this.logger.error(`Failed to queue email for fine-tuning: ${error.message}`, error);
    }
  }

  /**
   * Check all coaches and trigger fine-tuning if they have enough data
   * Runs monthly
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async processFineTuningJobs(): Promise<void> {
    this.logger.log('Starting monthly fine-tuning job processing...');

    try {
      const coaches = await this.prisma.coachAiAgent.findMany({
        where: {
          aiAgent: {
            type: AgentType.COACH_REPLICA,
          },
        },
        select: {
          coachID: true,
          agentID: true,
          assistantID: true,
        },
      });

      this.logger.log(`Found ${coaches.length} coaches with replica agents`);

      for (const coach of coaches) {
        try {
          await this.createFineTuningJobIfReady(
            coach.coachID,
            coach.agentID,
            coach.assistantID!
          );
        } catch (error: any) {
          this.logger.error(
            `Failed to process fine-tuning for coach ${coach.coachID}: ${error.message}`,
            error
          );
        }
      }

      this.logger.log('Completed monthly fine-tuning job processing');
    } catch (error: any) {
      this.logger.error(`Fine-tuning job processing failed: ${error.message}`, error);
    }
  }

  /**
   * Create a fine-tuning job for a coach if they have enough new data
   */
  async createFineTuningJobIfReady(
    coachID: string,
    agentID: string,
    assistantID: string
  ): Promise<boolean> {
    // Check if coach has enough unprocessed emails
    const emails = await this.emailCacheRepo.getUnprocessedEmails(
      coachID,
      this.minEmailsForTraining
    );

    if (!emails || emails.length < this.minEmailsForTraining) {
      this.logger.log(
        `Coach ${coachID} has only ${emails?.length || 0} unprocessed emails. Need ${this.minEmailsForTraining}.`
      );
      return false;
    }

    this.logger.log(
      `Coach ${coachID} has ${emails.length} unprocessed emails. Creating fine-tuning job...`
    );

    // Limit to max emails per job
    const emailsToProcess = emails.slice(0, this.maxEmailsPerJob);

    // Format training data
    const trainingData = await this.formatForFineTuning(coachID, emailsToProcess);

    // Upload to S3
    const s3Key = await this.s3Service.uploadFineTuningData(coachID, trainingData);

    // Create job record
    const job = await this.fineTuningRepo.createFineTuningJob({
      coachID,
      assistantID,
      s3DatasetKey: s3Key,
      emailCount: emailsToProcess.length,
      dateFrom: emailsToProcess[0].sentAt,
      dateTo: emailsToProcess[emailsToProcess.length - 1].sentAt,
    });

    // Mark emails as processed
    await this.emailCacheRepo.markEmailsAsProcessed(
      emailsToProcess.map(e => e.id),
      job.id
    );

    // Start OpenAI fine-tuning
    await this.startOpenAIFineTuning(job.id);

    return true;
  }

  /**
   * Format coach's emails into OpenAI fine-tuning format
   */
  private async formatForFineTuning(
    coachID: string,
    emails: CoachEmail[]
  ): Promise<string> {
    const trainingExamples: TrainingExample[] = [];

    // Group emails by thread
    const threadGroups = groupBy(emails, 'threadID');

    for (const [threadID] of Object.entries(threadGroups)) {
      // Get all emails in thread from S3 (including client emails)
      const allThreadMessages = await this.s3Service.getThreadMessages(coachID, threadID);

      if (allThreadMessages.length < 2) {
        continue; // Need context + response
      }

      // Sort by date
      const sorted = orderBy(allThreadMessages, 'sentAt', 'asc');

      // Create training examples from coach responses
      for (let i = 1; i < sorted.length; i++) {
        const currentMessage = sorted[i];

        // Only create training example if current message is from coach
        if (!currentMessage.isFromCoach) {
          continue;
        }

        // Get previous messages as context
        const previousMessages = sorted.slice(Math.max(0, i - 5), i); // Last 5 messages as context

        trainingExamples.push({
          messages: [
            {
              role: 'system',
              content: 'You are a professional coach responding to client emails. Match the coach\'s communication style, tone, and approach.',
            },
            ...previousMessages.map(msg => ({
              role: msg.isFromCoach ? 'assistant' as const : 'user' as const,
              content: `Subject: ${msg.subject || 'Re: Previous conversation'}\n\n${msg.text}`,
            })),
            {
              role: 'assistant',
              content: `Subject: ${currentMessage.subject || 'Re: Previous conversation'}\n\n${currentMessage.text}`,
            },
          ],
        });
      }
    }

    this.logger.log(
      `Generated ${trainingExamples.length} training examples from ${emails.length} emails`
    );

    // Convert to JSONL format
    return trainingExamples.map(example => JSON.stringify(example)).join('\n');
  }

  /**
   * Start OpenAI fine-tuning job
   */
  private async startOpenAIFineTuning(jobID: string): Promise<void> {
    try {
      const job = await this.fineTuningRepo.getFineTuningJob(jobID);
      if (!job) {
        throw new Error(`Job ${jobID} not found`);
      }

      // Get training data from S3
      const trainingData = await this.s3Service.getFineTuningData(job.s3DatasetKey);

      // Upload to OpenAI
      this.logger.log(`Uploading training data to OpenAI for job ${jobID}...`);

      const file = await this.openai.files.create({
        file: new File([trainingData], `coach-${job.coachID}-training.jsonl`, {
          type: 'application/jsonl',
        }),
        purpose: 'fine-tune',
      });

      await this.fineTuningRepo.updateFineTuningJob(jobID, {
        openaiFileID: file.id,
        status: FineTuningJobStatus.preparing_data,
      });

      this.logger.log(`Training file uploaded: ${file.id}`);

      // Create fine-tuning job
      this.logger.log(`Creating OpenAI fine-tuning job for ${jobID}...`);

      const fineTuneJob = await this.openai.fineTuning.jobs.create({
        training_file: file.id,
        model: 'gpt-4o-mini-2024-07-18', // Base model
        suffix: `coach-${job.coachID.slice(0, 8)}`,
        hyperparameters: {
          n_epochs: 3,
        },
      });

      await this.fineTuningRepo.updateFineTuningJob(jobID, {
        openaiJobID: fineTuneJob.id,
        status: FineTuningJobStatus.running,
        startedAt: new Date(),
      });

      this.logger.log(`OpenAI fine-tuning job started: ${fineTuneJob.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to start OpenAI fine-tuning: ${error.message}`, error);
      await this.fineTuningRepo.markJobAsFailed(jobID, error.message);
      throw error;
    }
  }

  /**
   * Check status of running fine-tuning jobs
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkRunningJobs(): Promise<void> {
    this.logger.log('Checking status of running fine-tuning jobs...');

    try {
      const runningJobs = await this.fineTuningRepo.getRunningJobs();

      for (const job of runningJobs) {
        if (!job.openaiJobID) continue;

        try {
          const openaiJob = await this.openai.fineTuning.jobs.retrieve(job.openaiJobID);

          if (openaiJob.status === 'succeeded') {
            await this.handleJobCompletion(job.id, openaiJob.fine_tuned_model!);
          } else if (openaiJob.status === 'failed') {
            await this.fineTuningRepo.markJobAsFailed(
              job.id,
              openaiJob.error?.message || 'Unknown error'
            );
          } else if (openaiJob.status === 'cancelled') {
            await this.fineTuningRepo.updateFineTuningJob(job.id, {
              status: FineTuningJobStatus.cancelled,
              completedAt: new Date(),
            });
          }
        } catch (error: any) {
          this.logger.error(
            `Failed to check job ${job.id}: ${error.message}`,
            error
          );
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to check running jobs: ${error.message}`, error);
    }
  }

  /**
   * Handle successful completion of fine-tuning job
   */
  private async handleJobCompletion(jobID: string, fineTunedModelID: string): Promise<void> {
    const job = await this.fineTuningRepo.getFineTuningJob(jobID);
    if (!job) return;

    // Mark job as completed
    await this.fineTuningRepo.markJobAsCompleted(jobID, fineTunedModelID);

    // Get agent info
    const agent = await this.prisma.aiAgent.findFirst({
      where: { type: AgentType.COACH_REPLICA },
    });

    if (!agent) {
      this.logger.error('Coach replica agent not found');
      return;
    }

    // Update coach's agent with new model
    await this.fineTuningRepo.updateCoachFineTunedModel(
      job.coachID,
      agent.id,
      fineTunedModelID,
      job.emailCount
    );

    // Update assistant to use new model
    await this.openai.beta.assistants.update(job.assistantID, {
      model: fineTunedModelID,
    });

    this.logger.log(
      `Fine-tuning completed for coach ${job.coachID}. Model: ${fineTunedModelID}`
    );
  }

  /**
   * Get fine-tuning status for a coach
   */
  async getCoachFineTuningStatus(coachID: string) {
    const [stats, emailStats, latestJob] = await Promise.all([
      this.fineTuningRepo.getFineTuningStats(coachID),
      this.emailCacheRepo.getEmailCacheStats(coachID),
      this.fineTuningRepo.getLatestCompletedJob(coachID),
    ]);

    return {
      ...stats,
      ...emailStats,
      currentModel: latestJob?.fineTunedModelID,
      lastTrainedAt: latestJob?.completedAt,
      canTriggerTraining: emailStats.readyForTraining >= this.minEmailsForTraining,
    };
  }

  /**
   * Manually trigger fine-tuning for a coach
   */
  async triggerFineTuning(coachID: string): Promise<{ success: boolean; message: string }> {
    try {
      const agent = await this.prisma.coachAiAgent.findFirst({
        where: {
          coachID,
          aiAgent: { type: AgentType.COACH_REPLICA },
        },
      });

      if (!agent) {
        return {
          success: false,
          message: 'Coach replica agent not configured',
        };
      }

      const created = await this.createFineTuningJobIfReady(
        coachID,
        agent.agentID,
        agent.assistantID!
      );

      if (!created) {
        const stats = await this.emailCacheRepo.getEmailCacheStats(coachID);
        return {
          success: false,
          message: `Not enough emails for training. Have ${stats.readyForTraining}, need ${this.minEmailsForTraining}`,
        };
      }

      return {
        success: true,
        message: 'Fine-tuning job started successfully',
      };
    } catch (error: any) {
      this.logger.error(`Failed to trigger fine-tuning: ${error.message}`, error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
