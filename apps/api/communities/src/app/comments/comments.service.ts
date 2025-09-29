import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import {
  UserType,
  MemberStatus,
  CommunityEvent,
  COMMUNITY_ROUTING_KEYS,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentFilters,
  ReactToPostRequest,
  PostComment,
  AuthUser
} from '@nlc-ai/api-types';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
    private readonly configService: ConfigService
  ) {}

  async createComment(
    communityID: string,
    createRequest: CreateCommentRequest,
    user: AuthUser
  ) {
    const member = await this.checkCommunityMembership(communityID, user);

    // If postID is provided, verify the post exists and is in the same community
    if (createRequest.postID) {
      const post = await this.prisma.post.findUnique({
        where: { id: createRequest.postID },
        select: { communityID: true }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.communityID !== communityID) {
        throw new ForbiddenException('Post does not belong to this community');
      }
    }

    // If parentCommentID is provided, verify it exists and is not deleted
    if (createRequest.parentCommentID) {
      const parentComment = await this.prisma.postComment.findUnique({
        where: { id: createRequest.parentCommentID },
        include: { post: { select: { communityID: true } } }
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.isDeleted) {
        throw new BadRequestException('Cannot reply to deleted comment');
      }

      if (parentComment.post.communityID !== communityID) {
        throw new ForbiddenException('Parent comment does not belong to this community');
      }
    }

    const maxLength = this.configService.get<number>('community.features.maxCommentLength', 2000);
    if (createRequest.content.length > maxLength) {
      throw new ForbiddenException(`Comment content exceeds maximum length of ${maxLength} characters`);
    }

    const comment = await this.prisma.postComment.create({
      data: {
        postID: createRequest.postID!,
        communityMemberID: member.id,
        content: createRequest.content,
        mediaUrls: createRequest.mediaUrls || [],
        parentCommentID: createRequest.parentCommentID,
      },
      include: {
        communityMember: {
          select: { userName: true, userAvatarUrl: true, role: true, userType: true, userID: true },
        },
        reactions: {
          where: { userID: user.id, userType: user.type },
          select: { type: true },
        },
        _count: {
          select: {
            reactions: true,
            replies: true,
          },
        },
      },
    });

    // Update post comment count if this is a direct comment
    if (createRequest.postID && !createRequest.parentCommentID) {
      await this.prisma.post.update({
        where: { id: createRequest.postID },
        data: { commentCount: { increment: 1 } },
      });
    }

    // Update parent comment reply count
    if (createRequest.parentCommentID) {
      await this.prisma.postComment.update({
        where: { id: createRequest.parentCommentID },
        data: { replyCount: { increment: 1 } },
      });
    }

    if (createRequest.postID) {
      const post = await this.prisma.post.findUnique({
        where: { id: createRequest.postID },
        include: {
          community: { select: { name: true } },
          communityMember: { select: { userID: true, userType: true } },
        }
      });

      await this.outboxService.saveAndPublishEvent<CommunityEvent>({
        eventType: 'community.post.commented',
        schemaVersion: 1,
        payload: {
          commentID: comment.id,
          postID: createRequest.postID,
          communityID,
          communityName: post!.community.name,
          postAuthorID: post!.communityMember.userID,
          postAuthorType: post!.communityMember.userType as UserType,
          commentAuthorID: member.userID,
          commentAuthorType: member.userType as UserType,
          commentAuthorName: member.userName,
          content: comment.content,
          commentedAt: comment.createdAt.toISOString(),
        },
      }, COMMUNITY_ROUTING_KEYS.POST_COMMENTED);
    }

    this.logger.log(`Comment created: ${comment.id} in community ${communityID} by ${user.type} ${user.id}`);

    return {
      ...comment,
      userReaction: comment.reactions[0]?.type || null,
      reactions: undefined,
      replies: [],
    };
  }

  async getComments(communityID: string, filters: CommentFilters, user: AuthUser) {
    await this.checkCommunityMembership(communityID, user);

    const where: any = {};

    if (filters.postID) {
      where.postID = filters.postID;
    }

    if (filters.parentCommentID !== undefined) {
      where.parentCommentID = filters.parentCommentID;
    } else {
      where.parentCommentID = null;
    }

    if (filters.search) {
      where.content = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (!filters.postID) {
      where.post = {
        communityID: communityID
      };
    }

    const result = await this.prisma.paginate<PostComment>(this.prisma.postComment, {
      page: filters.page || 1,
      limit: filters.limit || 20,
      where,
      include: {
        communityMember: {
          select: { userName: true, userID: true, userType: true, userAvatarUrl: true, role: true },
        },
        reactions: {
          where: { userID: user.id, userType: user.type },
          select: { type: true },
        },
        _count: {
          select: { replies: true, reactions: true },
        },
      },
      orderBy: { createdAt: filters.sortOrder || 'asc' },
    });

    return {
      ...result,
      data: result.data.map(comment => ({
        ...comment,
        userReaction: comment.reactions?.[0]?.type || null,
        reactions: undefined,
        replies: [],
      })),
    };
  }

  async getComment(id: string, user: AuthUser) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id },
      include: {
        post: {
          select: { communityID: true }
        },
        communityMember: {
          select: { userName: true, userID: true, userType: true, userAvatarUrl: true, role: true },
        },
        reactions: {
          where: { userID: user.id, userType: user.type },
          select: { type: true },
        },
        _count: {
          select: { replies: true, reactions: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.checkCommunityMembership(comment.post.communityID, user);

    return {
      ...comment,
      userReaction: comment.reactions[0]?.type || null,
      reactions: undefined,
      replies: [],
    };
  }

  async updateComment(id: string, updateRequest: UpdateCommentRequest, user: AuthUser) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id },
      include: {
        post: { select: { communityID: true } },
        communityMember: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.isDeleted) {
      throw new BadRequestException('Cannot edit deleted comment');
    }

    await this.checkCommunityMembership(comment.post.communityID, user);

    if (comment.communityMember.userID !== user.id || comment.communityMember.userType !== user.type) {
      await this.checkCommunityPermission(comment.post.communityID, user, 'moderate_posts');
    }

    const updatedComment = await this.prisma.postComment.update({
      where: { id },
      data: {
        ...updateRequest,
        isEdited: true,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Comment ${id} updated by ${user.type} ${user.id}`);

    return updatedComment;
  }

  async deleteComment(id: string, user: AuthUser) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id },
      include: {
        post: { select: { communityID: true } },
        communityMember: true,
        _count: {
          select: { replies: true }
        }
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.checkCommunityMembership(comment.post.communityID, user);

    if (comment.communityMember.userID !== user.id || comment.communityMember.userType !== user.type) {
      await this.checkCommunityPermission(comment.post.communityID, user, 'moderate_posts');
    }

    const hasReplies = comment._count.replies > 0;

    if (hasReplies) {
      // Soft delete - mark as deleted but keep in DB
      await this.prisma.postComment.update({
        where: { id },
        data: {
          isDeleted: true,
          content: '',
          mediaUrls: [],
          updatedAt: new Date()
        },
      });

      this.logger.log(`Comment ${id} soft deleted (has replies) by ${user.type} ${user.id}`);
    } else {
      // Hard delete - actually remove from DB
      await this.prisma.postComment.delete({
        where: { id },
      });

      this.logger.log(`Comment ${id} hard deleted (no replies) by ${user.type} ${user.id}`);
    }

    // Update post comment count if this was a direct comment
    if (comment.postID && !comment.parentCommentID) {
      await this.prisma.post.update({
        where: { id: comment.postID },
        data: { commentCount: { decrement: 1 } },
      });
    }

    // Update parent comment reply count
    if (comment.parentCommentID) {
      await this.prisma.postComment.update({
        where: { id: comment.parentCommentID },
        data: { replyCount: { decrement: 1 } },
      });
    }

    return { message: 'Comment deleted successfully' };
  }

  async reactToComment(commentID: string, reactionRequest: ReactToPostRequest, user: AuthUser) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentID },
      include: {
        post: {
          select: { communityID: true }
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.isDeleted) {
      throw new BadRequestException('Cannot react to deleted comment');
    }

    await this.checkCommunityMembership(comment.post.communityID, user);

    const existingReaction = await this.prisma.postReaction.findUnique({
      where: {
        commentID_userID_userType: {
          commentID,
          userID: user.id,
          userType: user.type,
        },
      },
    });

    let reactionChange = 0;

    if (existingReaction) {
      if (existingReaction.type === reactionRequest.type) {
        await this.prisma.postReaction.delete({
          where: { id: existingReaction.id },
        });
        reactionChange = -1;
      } else {
        await this.prisma.postReaction.update({
          where: { id: existingReaction.id },
          data: { type: reactionRequest.type },
        });
      }
    } else {
      await this.prisma.postReaction.create({
        data: {
          commentID,
          userID: user.id,
          userType: user.type,
          type: reactionRequest.type,
        },
      });
      reactionChange = 1;
    }

    if (reactionChange !== 0) {
      await this.prisma.postComment.update({
        where: { id: commentID },
        data: { likeCount: { increment: reactionChange } },
      });
    }

    this.logger.log(`Comment ${commentID} reacted to by ${user.type} ${user.id} with ${reactionRequest.type}`);

    return { message: 'Reaction updated successfully' };
  }

  async getReplies(commentID: string, filters: CommentFilters, user: AuthUser) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentID },
      include: {
        post: { select: { communityID: true } }
      }
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.checkCommunityMembership(comment.post.communityID, user);

    return this.getComments(comment.post.communityID, {
      ...filters,
      parentCommentID: commentID
    }, user);
  }

  private async checkCommunityMembership(communityID: string, user: AuthUser) {
    const member = await this.prisma.communityMember.findUnique({
      where: {
        communityID_userID_userType: {
          communityID,
          userID: user.id,
          userType: user.type,
        },
      },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenException('Access denied to this community');
    }

    return member;
  }

  private async checkCommunityPermission(communityID: string, user: AuthUser, permission: string) {
    const member = await this.checkCommunityMembership(communityID, user);

    if (!member.permissions.includes(permission) && !member.permissions.includes('all')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
