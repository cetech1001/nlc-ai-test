import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { FineTuningJobStatus } from '@prisma/client';

interface CreateFineTuningJobParams {
  coachID: string;
  assistantID: string;
  s3DatasetKey: string;
  emailCount: number;
  dateFrom: Date;
  dateTo: Date;
}

interface UpdateFineTuningJobParams {
  openaiJobID?: string;
  openaiFileID?: string;
  fineTunedModelID?: string;
  status?: FineTuningJobStatus;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  trainingMetrics?: any;
}

@Injectable()
export class FineTuningRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createFineTuningJob(params: CreateFineTuningJobParams) {
    return this.prisma.fineTuningJob.create({
      data: {
        ...params,
        trainedOn: new Date(),
        status: FineTuningJobStatus.pending,
      },
    });
  }

  async updateFineTuningJob(jobID: string, updates: UpdateFineTuningJobParams) {
    return this.prisma.fineTuningJob.update({
      where: { id: jobID },
      data: updates,
    });
  }

  async getFineTuningJob(jobID: string) {
    return this.prisma.fineTuningJob.findUnique({
      where: { id: jobID },
    });
  }

  async getJobByOpenAIJobID(openaiJobID: string) {
    return this.prisma.fineTuningJob.findFirst({
      where: { openaiJobID },
    });
  }

  async getPendingJobs() {
    return this.prisma.fineTuningJob.findMany({
      where: {
        status: FineTuningJobStatus.pending,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getRunningJobs() {
    return this.prisma.fineTuningJob.findMany({
      where: {
        status: {
          in: [FineTuningJobStatus.preparing_data, FineTuningJobStatus.running],
        },
      },
    });
  }

  async getCoachFineTuningJobs(coachID: string) {
    return this.prisma.fineTuningJob.findMany({
      where: { coachID },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLatestCompletedJob(coachID: string) {
    return this.prisma.fineTuningJob.findFirst({
      where: {
        coachID,
        status: FineTuningJobStatus.completed,
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  async updateCoachFineTunedModel(
    coachID: string,
    agentID: string,
    fineTunedModelID: string,
    emailCount: number
  ) {
    return this.prisma.coachAiAgent.update({
      where: {
        coachID_agentID: {
          coachID,
          agentID,
        },
      },
      data: {
        fineTunedModelID,
        lastFineTuningAt: new Date(),
        fineTuningEmailCount: emailCount,
      },
    });
  }

  async getCoachAgent(coachID: string, agentID: string) {
    return this.prisma.coachAiAgent.findUnique({
      where: {
        coachID_agentID: {
          coachID,
          agentID,
        },
      },
    });
  }

  async getFineTuningStats(coachID: string) {
    const [totalJobs, completedJobs, failedJobs, latestJob] = await Promise.all([
      this.prisma.fineTuningJob.count({
        where: { coachID },
      }),
      this.prisma.fineTuningJob.count({
        where: { coachID, status: FineTuningJobStatus.completed },
      }),
      this.prisma.fineTuningJob.count({
        where: { coachID, status: FineTuningJobStatus.failed },
      }),
      this.prisma.fineTuningJob.findFirst({
        where: { coachID },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      latestJob,
      hasActiveModel: latestJob?.status === FineTuningJobStatus.completed,
    };
  }

  async markJobAsFailed(jobID: string, errorMessage: string) {
    return this.updateFineTuningJob(jobID, {
      status: FineTuningJobStatus.failed,
      errorMessage,
      completedAt: new Date(),
    });
  }

  async markJobAsCompleted(
    jobID: string,
    fineTunedModelID: string,
    metrics?: any
  ) {
    return this.updateFineTuningJob(jobID, {
      status: FineTuningJobStatus.completed,
      fineTunedModelID,
      trainingMetrics: metrics,
      completedAt: new Date(),
    });
  }
}
