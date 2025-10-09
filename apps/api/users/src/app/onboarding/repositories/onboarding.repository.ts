import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import {CoachMetadata, OnboardingData, OnboardingRequest, ScenarioAnswer} from '@nlc-ai/types';

@Injectable()
export class OnboardingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveOnboardingData(coachID: string, data: OnboardingRequest) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { metadata: true },
    });

    const metadata = (coach?.metadata as CoachMetadata) || {};

    metadata.onboarding = {
      ...metadata.onboarding,
      scenarios: data.scenarios,
      scenariosCompleted: data.scenarios.length,
    };

    await this.prisma.coach.update({
      where: { id: coachID },
      data: { metadata },
    });

    if (data.documents.length > 0) {
      await this.updateDocumentCategories(coachID, data.documents);
    }
  }

  private async updateDocumentCategories(coachID: string, documents: any[]) {
    const operations = documents
      .filter(doc => doc.openaiFileID)
      .map(doc =>
        this.prisma.coachKnowledgeFile.updateMany({
          where: {
            coachID,
            openaiFileID: doc.openaiFileID,
          },
          data: {
            category: doc.category,
          },
        })
      );

    await Promise.all(operations);
  }

  async markComplete(coachID: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { metadata: true },
    });

    const metadata = (coach?.metadata as CoachMetadata) || {};

    if (!metadata.onboarding) {
      metadata.onboarding = {};
    }

    metadata.onboarding.completedAt = new Date().toISOString();

    await this.prisma.coach.update({
      where: { id: coachID },
      data: {
        metadata,
        onboardingCompleted: true,
      },
    });
  }

  async getOnboardingData(coachID: string): Promise<OnboardingData> {
    const [coach, documents, connections] = await Promise.all([
      this.prisma.coach.findUnique({
        where: { id: coachID },
        select: { metadata: true },
      }),
      this.prisma.coachKnowledgeFile.findMany({
        where: { coachID },
        select: {
          id: true,
          openaiFileID: true,
          filename: true,
          category: true,
        },
      }),
      this.prisma.integration.findMany({
        where: { userID: coachID }
      })
    ]);

    const metadata = (coach?.metadata as CoachMetadata) || {};
    const onboarding = metadata.onboarding || {};

    return {
      scenarios: onboarding.scenarios || [],
      documents: documents.map(d => ({
        id: d.id,
        name: d.filename,
        openaiFileID: d.openaiFileID,
        category: d.category || 'general',
      })),
      // @ts-ignore
      connections: connections || [],
    };
  }

  async getScenarios(coachID: string): Promise<ScenarioAnswer[]> {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { metadata: true },
    });

    const metadata = (coach?.metadata as CoachMetadata) || {};
    return metadata.onboarding?.scenarios || [];
  }

  async getStatus(coachID: string) {
    const [coach, documents, connections] = await Promise.all([
      this.prisma.coach.findUnique({
        where: { id: coachID },
        select: {
          metadata: true,
          onboardingCompleted: true,
        },
      }),
      this.prisma.coachKnowledgeFile.count({
        where: { coachID },
      }),
      this.prisma.integration.count({
        where: { userID: coachID },
      })
    ]);

    const metadata = (coach?.metadata as CoachMetadata) || {};
    const onboarding = metadata.onboarding || {};

    return {
      isComplete: coach?.onboardingCompleted || false,
      completedAt: onboarding.completedAt ? new Date(onboarding.completedAt) : null,
      scenariosCompleted: onboarding.scenarios?.length || 0,
      documentsUploaded: documents,
      connectionsLinked: connections,
    };
  }

  async getCoach(coachID: string) {
    return this.prisma.coach.findUnique({
      where: { id: coachID },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  async calculateCompletionScore(coachID: string): Promise<number> {
    const status = await this.getStatus(coachID);

    const scenarioScore = Math.min(status.scenariosCompleted / 12, 1) * 40;
    const documentScore = Math.min(status.documentsUploaded / 10, 1) * 30;
    const connectionScore = status.connectionsLinked >= 1 ? 20 : 0;
    const socialScore = status.connectionsLinked > 1 ? 10 : 0;

    return Math.round(scenarioScore + documentScore + connectionScore + socialScore);
  }
}
