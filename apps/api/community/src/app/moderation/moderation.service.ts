import {BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException,} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
// import {OutboxService} from '@nlc-ai/api-messaging';
import {
  AuthUser,
  ModerationActionType,
  ModerationPriority,
  ModerationStatus,
  UserType,
  ViolationType,
} from '@nlc-ai/api-types';
import {
  CreateModerationRuleDto,
  ModerationActionDto,
  ModerationFiltersDto,
  ReportContentDto,
  UpdateModerationRuleDto,
} from './dto';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    // private readonly outboxService: OutboxService,
  ) {}

  async getModerationStats(communityID: string, user: AuthUser) {
    await this.checkModerationPermission(communityID, user);

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Get current stats
    const [pendingReports, totalFlags, recentActions, autoResolved] = await Promise.all([
      this.prisma.flaggedContent.count({
        where: { communityID, status: ModerationStatus.PENDING },
      }),
      this.prisma.flaggedContent.count({
        where: { communityID },
      }),
      this.prisma.moderationAction.count({
        where: {
          communityID,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.flaggedContent.count({
        where: {
          communityID,
          aiScore: { gte: 0.8 },
          status: { in: [ModerationStatus.APPROVED, ModerationStatus.DISMISSED] },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // Calculate trends (comparing to previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const [prevFlags, prevActions] = await Promise.all([
      this.prisma.flaggedContent.count({
        where: {
          communityID,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      this.prisma.moderationAction.count({
        where: {
          communityID,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
    ]);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      pendingReports,
      totalFlags,
      actionsTaken: recentActions,
      autoResolved,
      pendingReportsTrend: 0, // Current pending doesn't have a trend
      totalFlagsTrend: calculateTrend(totalFlags, prevFlags),
      actionsTakenTrend: calculateTrend(recentActions, prevActions),
      autoResolvedTrend: calculateTrend(autoResolved, 0), // Previous auto-resolved calculation
    };
  }

  async getFlaggedContent(
    communityID: string,
    filters: ModerationFiltersDto,
    user: AuthUser,
  ) {
    await this.checkModerationPermission(communityID, user);

    const where: any = { communityID };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.contentType) {
      where.contentType = filters.contentType;
    }

    if (filters.violationType) {
      where.reasons = {
        hasSome: Array.isArray(filters.violationType)
          ? filters.violationType
          : [filters.violationType],
      };
    }

    if (filters.flagCountMin || filters.flagCountMax) {
      where.flagCount = {};
      if (filters.flagCountMin) where.flagCount.gte = filters.flagCountMin;
      if (filters.flagCountMax) where.flagCount.lte = filters.flagCountMax;
    }

    if (filters.dateRangeStart || filters.dateRangeEnd) {
      where.reportedAt = {};
      if (filters.dateRangeStart) {
        where.reportedAt.gte = new Date(filters.dateRangeStart);
      }
      if (filters.dateRangeEnd) {
        where.reportedAt.lte = new Date(filters.dateRangeEnd);
      }
    }

    if (filters.search) {
      where.OR = [
        { content: { contains: filters.search, mode: 'insensitive' } },
        { authorName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.paginate(this.prisma.flaggedContent, {
      page: filters.page || 1,
      limit: filters.limit || 10,
      where,
      include: {
        reports: {
          select: {
            reason: true,
            details: true,
            reporterName: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            reports: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { reportedAt: 'desc' },
      ],
    });
  }

  async getModerationActions(
    communityID: string,
    filters: ModerationFiltersDto,
    user: AuthUser,
  ) {
    await this.checkModerationPermission(communityID, user);

    const where: any = { communityID };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.targetType) {
      where.targetType = filters.targetType;
    }

    if (filters.moderatorID) {
      where.moderatorID = filters.moderatorID;
    }

    if (filters.dateRangeStart || filters.dateRangeEnd) {
      where.createdAt = {};
      if (filters.dateRangeStart) {
        where.createdAt.gte = new Date(filters.dateRangeStart);
      }
      if (filters.dateRangeEnd) {
        where.createdAt.lte = new Date(filters.dateRangeEnd);
      }
    }

    return this.prisma.paginate(this.prisma.moderationAction, {
      page: filters.page || 1,
      limit: filters.limit || 10,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async moderateContent(
    communityID: string,
    contentID: string,
    action: ModerationActionDto,
    user: AuthUser,
  ) {
    await this.checkModerationPermission(communityID, user);

    const flaggedContent = await this.prisma.flaggedContent.findFirst({
      where: { id: contentID, communityID },
    });

    if (!flaggedContent) {
      throw new NotFoundException('Flagged content not found');
    }

    // Update flagged content status
    const newStatus = this.getStatusFromAction(action.action);
    await this.prisma.flaggedContent.update({
      where: { id: contentID },
      data: {
        status: newStatus,
        resolvedAt: new Date(),
        resolvedBy: user.id,
        resolvedByType: user.type,
      },
    });

    // Create moderation action record
    await this.prisma.moderationAction.create({
      data: {
        communityID,
        flaggedContentID: contentID,
        type: this.getActionType(action.action),
        targetType: flaggedContent.contentType,
        targetID: flaggedContent.contentID,
        targetUser: flaggedContent.authorID,
        targetUserType: flaggedContent.authorType,
        targetInfo: {
          content: flaggedContent.content,
          authorName: flaggedContent.authorName,
        },
        moderatorID: user.id,
        moderatorName: await this.getUserName(user),
        moderatorType: user.type,
        reason: action.reason,
        metadata: action.metadata || {},
      },
    });

    // Handle the actual content based on action
    if (action.action === 'remove') {
      await this.removeContent(flaggedContent.contentType, flaggedContent.contentID);
    }

    this.logger.log(
      `Content ${action.action}d: ${contentID} by ${user.type} ${user.id}`
    );

    return {
      success: true,
      message: `Content ${action.action}d successfully`,
    };
  }

  async moderateMember(
    communityID: string,
    memberID: string,
    action: ModerationActionDto,
    user: AuthUser,
  ) {
    await this.checkModerationPermission(communityID, user);

    const member = await this.prisma.communityMember.findFirst({
      where: { id: memberID, communityID },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Create moderation action record
    await this.prisma.moderationAction.create({
      data: {
        communityID,
        type: this.getActionType(action.action),
        targetType: 'member',
        targetID: memberID,
        targetUser: member.userID,
        targetUserType: member.userType,
        targetInfo: {
          memberName: member.userName,
          memberRole: member.role,
        },
        moderatorID: user.id,
        moderatorName: await this.getUserName(user),
        moderatorType: user.type,
        reason: action.reason,
        metadata: action.metadata || {},
        expiresAt: action.duration
          ? new Date(Date.now() + action.duration * 1000)
          : null,
      },
    });

    // Handle member action
    if (action.action === 'suspend' || action.action === 'ban') {
      await this.prisma.communityMember.update({
        where: { id: memberID },
        data: {
          status: action.action === 'ban' ? 'suspended' : 'inactive',
        },
      });
    }

    this.logger.log(
      `Member ${action.action}: ${memberID} by ${user.type} ${user.id}`
    );

    return {
      success: true,
      message: `Member ${action.action} completed successfully`,
    };
  }

  async reportContent(
    communityID: string,
    report: ReportContentDto,
    user: AuthUser,
  ) {
    // Check if content exists (this would depend on content type)
    const contentExists = await this.checkContentExists(
      report.contentType,
      report.contentID
    );

    if (!contentExists) {
      throw new NotFoundException('Content not found');
    }

    // Find or create flagged content record
    let flaggedContent = await this.prisma.flaggedContent.findFirst({
      where: {
        contentID: report.contentID,
        contentType: report.contentType,
        communityID,
      },
    });

    if (!flaggedContent) {
      // Get content details for the flagged content record
      const contentDetails = await this.getContentDetails(
        report.contentType,
        report.contentID
      );

      flaggedContent = await this.prisma.flaggedContent.create({
        data: {
          contentID: report.contentID,
          contentType: report.contentType,
          communityID,
          content: contentDetails.content,
          authorID: contentDetails.authorID,
          authorName: contentDetails.authorName,
          authorType: contentDetails.authorType,
          flagCount: 1,
          reasons: [report.reason as ViolationType],
          priority: this.calculatePriority([report.reason as ViolationType]),
        },
      });
    } else {
      const updatedReasons = Array.from(
        new Set([...flaggedContent.reasons as ViolationType[], report.reason as ViolationType])
      );

      await this.prisma.flaggedContent.update({
        where: { id: flaggedContent.id },
        data: {
          flagCount: { increment: 1 },
          reasons: updatedReasons,
          priority: this.calculatePriority(updatedReasons),
        },
      });
    }

    // Create content report record
    await this.prisma.contentReport.create({
      data: {
        flaggedContentID: flaggedContent.id,
        communityID,
        reporterID: user.id,
        reporterType: user.type,
        reporterName: await this.getUserName(user),
        reason: report.reason as ViolationType,
        details: report.details,
      },
    });

    return {
      success: true,
      reportID: flaggedContent.id,
    };
  }

  async getModerationRules(communityID: string, user: AuthUser) {
    await this.checkModerationPermission(communityID, user);

    return this.prisma.moderationRule.findMany({
      where: { communityID },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createModerationRule(
    communityID: string,
    rule: CreateModerationRuleDto,
    user: AuthUser,
  ) {
    await this.checkModerationPermission(communityID, user);

    return this.prisma.moderationRule.create({
      data: {
        communityID,
        name: rule.name,
        description: rule.description,
        type: rule.type,
        conditions: rule.conditions,
        actions: rule.actions,
        isEnabled: rule.isEnabled ?? true,
      },
    });
  }

  async updateModerationRule(
    communityID: string,
    ruleID: string,
    updates: UpdateModerationRuleDto,
    user: AuthUser,
  ) {
    await this.checkModerationPermission(communityID, user);

    const rule = await this.prisma.moderationRule.findFirst({
      where: { id: ruleID, communityID },
    });

    if (!rule) {
      throw new NotFoundException('Moderation rule not found');
    }

    return this.prisma.moderationRule.update({
      where: { id: ruleID },
      data: updates,
    });
  }

  async deleteModerationRule(
    communityID: string,
    ruleID: string,
    user: AuthUser,
  ) {
    await this.checkModerationPermission(communityID, user);

    const rule = await this.prisma.moderationRule.findFirst({
      where: { id: ruleID, communityID },
    });

    if (!rule) {
      throw new NotFoundException('Moderation rule not found');
    }

    await this.prisma.moderationRule.delete({
      where: { id: ruleID },
    });

    return {
      success: true,
      message: 'Moderation rule deleted successfully',
    };
  }

  async getAIModerationInsights(
    communityID: string,
    period: '7d' | '30d' | '90d',
    user: AuthUser,
  ) {
    await this.checkModerationPermission(communityID, user);

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalScanned, autoResolved, commonViolations] = await Promise.all([
      this.prisma.flaggedContent.count({
        where: {
          communityID,
          aiScore: { not: null },
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.flaggedContent.count({
        where: {
          communityID,
          aiScore: { gte: 0.8 },
          status: { in: [ModerationStatus.APPROVED, ModerationStatus.DISMISSED] },
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.$queryRaw`
        SELECT reason as type, COUNT(*) as count
        FROM content_reports cr
        JOIN flagged_content fc ON cr.flagged_content_id = fc.id
        WHERE fc.community_id = ${communityID}
        AND fc.created_at >= ${startDate}
        GROUP BY reason
        ORDER BY count DESC
        LIMIT 5
      `,
    ]);

    // Calculate accuracy rate (this would need more sophisticated logic)
    const accuracyRate = totalScanned > 0 ? (autoResolved / totalScanned) * 100 : 0;

    return {
      totalScanned,
      autoResolved,
      accuracyRate: Math.round(accuracyRate * 100) / 100,
      commonViolations: commonViolations as Array<{ type: string; count: number }>,
      trendData: [], // This would require more complex aggregation
    };
  }

  // Helper methods
  private async checkModerationPermission(communityID: string, user: AuthUser) {
    if (user.type === UserType.admin) {
      return true;
    }

    if (user.type === UserType.coach) {
      // Check if coach owns the community or has moderation permissions
      const membership = await this.prisma.communityMember.findFirst({
        where: {
          communityID,
          userID: user.id,
          userType: user.type,
          status: 'active',
          OR: [
            { role: 'owner' },
            { role: 'admin' },
            { permissions: { hasSome: ['moderate', 'all'] } },
          ],
        },
      });

      if (!membership) {
        throw new ForbiddenException('Insufficient permissions for moderation');
      }
    }

    return true;
  }

  private getStatusFromAction(action: string): ModerationStatus {
    switch (action) {
      case 'approve':
        return ModerationStatus.APPROVED;
      case 'remove':
        return ModerationStatus.REMOVED;
      case 'dismiss':
        return ModerationStatus.DISMISSED;
      default:
        return ModerationStatus.PENDING;
    }
  }

  private getActionType(action: string): ModerationActionType {
    switch (action) {
      case 'approve':
        return ModerationActionType.CONTENT_APPROVED;
      case 'remove':
        return ModerationActionType.CONTENT_REMOVED;
      case 'dismiss':
        return ModerationActionType.CONTENT_DISMISSED;
      case 'warn':
        return ModerationActionType.MEMBER_WARNED;
      case 'suspend':
        return ModerationActionType.MEMBER_SUSPENDED;
      case 'ban':
        return ModerationActionType.MEMBER_BANNED;
      default:
        return ModerationActionType.USER_REPORTED;
    }
  }

  private calculatePriority(reasons: ViolationType[]): ModerationPriority {
    if (reasons.includes(ViolationType.HATE_SPEECH)) {
      return ModerationPriority.CRITICAL;
    }
    if (reasons.includes(ViolationType.HARASSMENT)) {
      return ModerationPriority.HIGH;
    }
    if (reasons.includes(ViolationType.INAPPROPRIATE) || reasons.includes(ViolationType.MISINFORMATION)) {
      return ModerationPriority.MEDIUM;
    }
    return ModerationPriority.LOW;
  }

  private async getUserName(user: AuthUser): Promise<string> {
    try {
      switch (user.type) {
        case UserType.coach:
          const coach = await this.prisma.coach.findUnique({
            where: { id: user.id },
            select: { firstName: true, lastName: true, businessName: true },
          });
          return coach?.businessName || `${coach?.firstName} ${coach?.lastName}` || 'Unknown Coach';

        case UserType.client:
          const client = await this.prisma.client.findUnique({
            where: { id: user.id },
            select: { firstName: true, lastName: true },
          });
          return `${client?.firstName} ${client?.lastName}` || 'Unknown Client';

        case UserType.admin:
          const admin = await this.prisma.admin.findUnique({
            where: { id: user.id },
            select: { firstName: true, lastName: true },
          });
          return `${admin?.firstName} ${admin?.lastName}` || 'Admin';

        default:
          return 'Unknown User';
      }
    } catch (error) {
      this.logger.warn(`Failed to get user name for ${user.type} ${user.id}`, error);
      return 'Unknown User';
    }
  }

  private async checkContentExists(contentType: string, contentID: string): Promise<boolean> {
    try {
      switch (contentType) {
        case 'post':
          const post = await this.prisma.post.findUnique({
            where: { id: contentID },
          });
          return !!post;

        case 'comment':
          const comment = await this.prisma.postComment.findUnique({
            where: { id: contentID },
          });
          return !!comment;

        case 'message':
          const message = await this.prisma.directMessage.findUnique({
            where: { id: contentID },
          });
          return !!message;

        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  private async getContentDetails(contentType: string, contentID: string) {
    switch (contentType) {
      case 'post':
        const post = await this.prisma.post.findUnique({
          where: { id: contentID },
          include: {
            communityMember: {
              select: {
                userName: true,
                userID: true,
                userType: true,
              },
            },
          },
        });
        return {
          content: post?.content || '',
          authorID: post?.communityMember?.userID || '',
          authorName: post?.communityMember?.userName || 'Unknown',
          authorType: post?.communityMember?.userType || 'client',
        };

      case 'comment':
        const comment = await this.prisma.postComment.findUnique({
          where: { id: contentID },
          include: {
            communityMember: {
              select: {
                userName: true,
                userID: true,
                userType: true,
              },
            },
          },
        });
        return {
          content: comment?.content || '',
          authorID: comment?.communityMember?.userID || '',
          authorName: comment?.communityMember?.userName || 'Unknown',
          authorType: comment?.communityMember?.userType || 'client',
        };

      case 'message':
        const message = await this.prisma.directMessage.findUnique({
          where: { id: contentID },
        });
        return {
          content: message?.content || '',
          authorID: message?.senderID || '',
          authorName: message?.senderName || 'Unknown',
          authorType: message?.senderType || 'client',
        };

      default:
        throw new BadRequestException('Invalid content type');
    }
  }

  private async removeContent(contentType: string, contentID: string) {
    switch (contentType) {
      case 'post':
        // Soft delete the post by updating a status field or setting isDeleted
        await this.prisma.post.update({
          where: { id: contentID },
          data: {
            // Assuming you add an isDeleted field to the Post model
            // isDeleted: true,
            // For now, we'll just update the content
            content: '[This content has been removed by moderation]',
          },
        });
        break;

      case 'comment':
        await this.prisma.postComment.update({
          where: { id: contentID },
          data: {
            content: '[This comment has been removed by moderation]',
          },
        });
        break;

      case 'message':
        await this.prisma.directMessage.update({
          where: { id: contentID },
          data: {
            content: '[This message has been removed by moderation]',
          },
        });
        break;
    }
  }
}
