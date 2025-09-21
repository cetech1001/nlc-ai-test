import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import {
  UserType,
  PostType,
  MemberStatus,
  CommunityEvent,
  COMMUNITY_ROUTING_KEYS,
  CreatePostRequest,
  UpdatePostRequest,
  PostFilters,
  CommentFilters,
  CreateCommentRequest,
  ReactToPostRequest,
  Post,
  PostComment,
  AuthUser
} from '@nlc-ai/api-types';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
    private readonly configService: ConfigService
  ) {}

  async createPost(
    communityID: string,
    createRequest: CreatePostRequest,
    user: AuthUser
  ) {
    const member = await this.checkCommunityMembership(communityID, user);

    const maxLength = this.configService.get<number>('community.features.maxPostLength', 5000);
    if (createRequest.content.length > maxLength) {
      throw new ForbiddenException(`Post content exceeds maximum length of ${maxLength} characters`);
    }

    const post = await this.prisma.post.create({
      data: {
        communityID,
        communityMemberID: member.id,
        type: createRequest.type || PostType.TEXT,
        content: createRequest.content,
        mediaUrls: createRequest.mediaUrls || [],
        linkUrl: createRequest.linkUrl,
        linkPreview: createRequest.linkPreview || {},
        pollOptions: createRequest.pollOptions || [],
        eventData: createRequest.eventData || {},
      },
      include: {
        community: {
          select: { name: true },
        },
        communityMember: {
          select: { userName: true },
        },
      },
    });

    await this.prisma.community.update({
      where: { id: communityID },
      data: { postCount: { increment: 1 } },
    });

    await this.outboxService.saveAndPublishEvent<CommunityEvent>({
      eventType: 'community.post.created',
      schemaVersion: 1,
      payload: {
        postID: post.id,
        communityID: post.communityID,
        communityName: post.community.name,
        authorID: user.id,
        authorType: user.type,
        authorName: post.communityMember.userName,
        type: post.type as PostType,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
      },
    }, COMMUNITY_ROUTING_KEYS.POST_CREATED);

    this.logger.log(`Post created: ${post.id} in community ${communityID} by ${user.type} ${user.id}`);

    return post;
  }

  async getPosts(filters: PostFilters, user: AuthUser) {
    if (filters.communityID) {
      await this.checkCommunityMembership(filters.communityID, user);
    }

    const where: any = {};

    if (filters.communityID) {
      where.communityID = filters.communityID;
    }

    if (filters.communityMemberID) {
      where.communityMemberID = filters.communityMemberID;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isPinned !== undefined) {
      where.isPinned = filters.isPinned;
    }

    if (filters.search) {
      where.content = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    const orderBy: any = [];

    orderBy.push({ isPinned: 'desc' });

    orderBy.push({ createdAt: filters.sortOrder || 'desc' });

    const result = await this.prisma.paginate<Post>(this.prisma.post, {
      page: filters.page || 1,
      limit: filters.limit || 10,
      where,
      include: {
        community: {
          select: { name: true, type: true },
        },
        communityMember: {
          select: { userName: true, userAvatarUrl: true, role: true, userID: true },
        },
        reactions: {
          where: { userID: user.id, userType: user.type },
          select: { type: true },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy,
    });

    return {
      ...result,
      data: result.data.map(post => ({
        ...post,
        userReaction: post.reactions?.[0]?.type || null,
        reactions: undefined,
      })),
    };
  }

  async getPost(id: string, user: AuthUser) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        community: {
          select: { name: true, type: true },
        },
        communityMember: {
          select: { userName: true, userAvatarUrl: true, role: true },
        },
        comments: {
          where: { parentCommentID: null },
          include: {
            communityMember: {
              select: { userName: true, userAvatarUrl: true, role: true },
            },
            reactions: {
              where: { userID: user.id, userType: user.type },
              select: { type: true },
            },
            replies: {
              take: 3,
              include: {
                communityMember: {
                  select: { userName: true, userAvatarUrl: true, role: true },
                },
                reactions: {
                  where: { userID: user.id, userType: user.type },
                  select: { type: true },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
            _count: {
              select: { replies: true, reactions: true },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 20,
        },
        reactions: {
          where: { userID: user.id, userType: user.type },
          select: { type: true },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.checkCommunityMembership(post.communityID, user);

    return {
      ...post,
      userReaction: post.reactions[0]?.type || null,
      comments: post.comments.map(comment => ({
        ...comment,
        userReaction: comment.reactions[0]?.type || null,
        replies: comment.replies.map(reply => ({
          ...reply,
          userReaction: reply.reactions[0]?.type || null,
          reactions: undefined,
        })),
        reactions: undefined,
      })),
      reactions: undefined,
    };
  }

  async updatePost(id: string, updateRequest: UpdatePostRequest, user: AuthUser) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        communityMember: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.communityMember.userID !== user.id || post.communityMember.userType !== user.type) {
      await this.checkCommunityPermission(post.communityID, user, 'moderate_posts');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        ...updateRequest,
        isEdited: true,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Post ${id} updated by ${user.type} ${user.id}`);

    return updatedPost;
  }

  async deletePost(id: string, user: AuthUser) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        communityMember: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.communityMember.userID !== user.id || post.communityMember.userType !== user.type) {
      await this.checkCommunityPermission(post.communityID, user, 'moderate_posts');
    }

    await this.prisma.post.delete({
      where: { id },
    });

    await this.prisma.community.update({
      where: { id: post.communityID },
      data: { postCount: { decrement: 1 } },
    });

    this.logger.log(`Post ${id} deleted by ${user.type} ${user.id}`);

    return { message: 'Post deleted successfully' };
  }

  async reactToPost(postID: string, reactionRequest: ReactToPostRequest, user: AuthUser) {
    const post = await this.prisma.post.findUnique({
      where: { id: postID },
      include: {
        community: { select: { name: true } },
        communityMember: { select: { userID: true, userType: true, userName: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.checkCommunityMembership(post.communityID, user);

    const existingReaction = await this.prisma.postReaction.findUnique({
      where: {
        postID_userID_userType: {
          postID,
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
          postID,
          userID: user.id,
          userType: user.type,
          type: reactionRequest.type,
        },
      });
      reactionChange = 1;
    }

    if (reactionChange !== 0) {
      await this.prisma.post.update({
        where: { id: postID },
        data: { likeCount: { increment: reactionChange } },
      });
    }

    if (!existingReaction && reactionChange > 0) {
      const userName = await this.getUserName(user);

      await this.outboxService.saveAndPublishEvent<CommunityEvent>({
        eventType: 'community.post.liked',
        schemaVersion: 1,
        payload: {
          postID,
          communityID: post.communityID,
          communityName: post.community.name,
          postAuthorID: post.communityMember.userID,
          postAuthorType: post.communityMember.userType as UserType,
          likedByID: user.id,
          likedByType: user.type,
          likedByName: userName,
          reactionType: reactionRequest.type,
          likedAt: new Date().toISOString(),
        },
      }, COMMUNITY_ROUTING_KEYS.POST_LIKED);
    }

    this.logger.log(`Post ${postID} reacted to by ${user.type} ${user.id} with ${reactionRequest.type}`);

    return { message: 'Reaction updated successfully' };
  }

  async createComment(postID: string, createRequest: CreateCommentRequest, user: AuthUser) {
    const post = await this.prisma.post.findUnique({
      where: { id: postID },
      include: {
        community: { select: { name: true } },
        communityMember: { select: { userID: true, userType: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const commenterMember = await this.checkCommunityMembership(post.communityID, user);

    const comment = await this.prisma.postComment.create({
      data: {
        postID,
        communityMemberID: commenterMember.id,
        content: createRequest.content,
        mediaUrls: createRequest.mediaUrls || [],
        parentCommentID: createRequest.parentCommentID,
      },
    });

    await this.prisma.post.update({
      where: { id: postID },
      data: { commentCount: { increment: 1 } },
    });

    if (createRequest.parentCommentID) {
      await this.prisma.postComment.update({
        where: { id: createRequest.parentCommentID },
        data: { replyCount: { increment: 1 } },
      });
    }

    await this.outboxService.saveAndPublishEvent<CommunityEvent>({
      eventType: 'community.post.commented',
      schemaVersion: 1,
      payload: {
        commentID: comment.id,
        postID,
        communityID: post.communityID,
        communityName: post.community.name,
        postAuthorID: post.communityMember.userID,
        postAuthorType: post.communityMember.userType as UserType,
        commentAuthorID: commenterMember.userID,
        commentAuthorType: commenterMember.userType as UserType,
        commentAuthorName: commenterMember.userName,
        content: comment.content,
        commentedAt: comment.createdAt.toISOString(),
      },
    }, COMMUNITY_ROUTING_KEYS.POST_COMMENTED);

    this.logger.log(`Comment created: ${comment.id} on post ${postID} by ${user.type} ${user.id}`);

    return comment;
  }

  async getComments(postID: string, filters: CommentFilters, user: AuthUser) {
    const post = await this.prisma.post.findUnique({
      where: { id: postID },
      select: { communityID: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.checkCommunityMembership(post.communityID, user);

    const where: any = {
      postID,
    };

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

    const result = await this.prisma.paginate<PostComment>(this.prisma.postComment, {
      page: filters.page || 1,
      limit: filters.limit || 20,
      where,
      include: {
        communityMember: {
          select: { userName: true, userAvatarUrl: true, role: true },
        },
        reactions: {
          where: { userID: user.id, userType: user.type },
          select: { type: true },
        },
        replies: {
          take: 3,
          include: {
            communityMember: {
              select: { userName: true, userAvatarUrl: true, role: true },
            },
            reactions: {
              where: { userID: user.id, userType: user.type },
              select: { type: true },
            },
          },
          orderBy: { createdAt: 'asc' },
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
        replies: comment.replies?.map(reply => ({
          ...reply,
          userReaction: reply.reactions?.[0]?.type || null,
          reactions: undefined,
        })),
        reactions: undefined,
      })),
    };
  }

  async reactToComment(commentID: string, reactionRequest: ReactToPostRequest, user: AuthUser) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentID },
      include: {
        post: {
          include: {
            community: { select: { name: true } },
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
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

    console.log("Member: ", member);

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
}
