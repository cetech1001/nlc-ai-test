import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';

interface ChatbotCustomizationData {
  name: string;
  avatarUrl?: string;
  logoUrl?: string;
  primaryColor: string;
  gradientStart: string;
  gradientEnd: string;
  assistantTextColor: string;
  assistantBubbleColor: string;
  userTextColor: string;
  userBubbleColor: string;
  backgroundColor: string;
  glowColor: string;
  position: string;
  greeting?: string;
  requireUserInfo?: boolean;
  requireName?: boolean;
  requireEmail?: boolean;
  requirePhone?: boolean;
}

@Injectable()
export class ChatbotCustomizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomization(coachID: string) {
    const customization = await this.prisma.chatbotCustomization.findUnique({
      where: { coachID }
    });

    if (!customization) {
      return this.createDefaultCustomization(coachID);
    }

    return customization;
  }

  async createDefaultCustomization(coachID: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { firstName: true, lastName: true }
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    return this.prisma.chatbotCustomization.create({
      data: {
        coachID,
        name: `${coach.firstName} ${coach.lastName}`,
        primaryColor: '#DF69FF',
        gradientStart: '#B339D4',
        gradientEnd: '#7B21BA',
        assistantTextColor: '#C5C5C5',
        assistantBubbleColor: '#1A1A1A',
        userTextColor: '#C5C5C5',
        userBubbleColor: 'rgba(223,105,255,0.08)',
        backgroundColor: '#0A0A0A',
        glowColor: '#7B21BA',
        position: 'bottom-right',
        greeting: "Hey! How's everything going with your program?\nLet me know if you need any help today!",
        requireUserInfo: false,
        requireName: false,
        requireEmail: false,
        requirePhone: false
      }
    });
  }

  async updateCustomization(coachID: string, data: ChatbotCustomizationData) {
    const existing = await this.prisma.chatbotCustomization.findUnique({
      where: { coachID }
    });

    if (!existing) {
      return this.prisma.chatbotCustomization.create({
        data: {
          coachID,
          ...data
        }
      });
    }

    return this.prisma.chatbotCustomization.update({
      where: { coachID },
      data
    });
  }

  async getPublicCustomization(coachID: string) {
    const customization = await this.prisma.chatbotCustomization.findUnique({
      where: { coachID }
    });

    if (!customization) {
      return {
        name: 'AI Coach',
        primaryColor: '#DF69FF',
        gradientStart: '#B339D4',
        gradientEnd: '#7B21BA',
        assistantTextColor: '#C5C5C5',
        assistantBubbleColor: '#1A1A1A',
        userTextColor: '#C5C5C5',
        userBubbleColor: 'rgba(223,105,255,0.08)',
        backgroundColor: '#0A0A0A',
        glowColor: '#7B21BA',
        position: 'bottom-right',
        greeting: "Hi! How can I help you today?",
        requireUserInfo: false,
        requireName: false,
        requireEmail: false,
        requirePhone: false
      };
    }

    return {
      name: customization.name,
      avatarUrl: customization.avatarUrl,
      logoUrl: customization.logoUrl,
      primaryColor: customization.primaryColor,
      gradientStart: customization.gradientStart,
      gradientEnd: customization.gradientEnd,
      assistantTextColor: customization.assistantTextColor,
      assistantBubbleColor: customization.assistantBubbleColor,
      userTextColor: customization.userTextColor,
      userBubbleColor: customization.userBubbleColor,
      backgroundColor: customization.backgroundColor,
      glowColor: customization.glowColor,
      position: customization.position,
      greeting: customization.greeting,
      requireUserInfo: customization.requireUserInfo || false,
      requireName: customization.requireName || false,
      requireEmail: customization.requireEmail || false,
      requirePhone: customization.requirePhone || false
    };
  }
}
