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
  CreateCommentRequest,
  ReactToPostRequest
} from '@nlc-ai/api-types';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
    private readonly configService: ConfigService
  ) {}

  async createPost(createRequest: CreatePostRequest, authorID: string, authorType: UserType) {
    // Check if user is a member of the community
    await this.checkCommunityMembership(createRequest.communityID, authorID, authorType);

    const maxLength = this.configService.get<number>('community.features.maxPostLength', 5000);
    if (createRequest.content.length > maxLength) {
      throw new ForbiddenException(`Post content exceeds maximum length of ${maxLength} characters`);
    }

    const post = await this.prisma.post.create({
      data: {
        communityID: createRequest.communityID,
        authorID,
        authorType,
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
      },
    });

    // Update community post count
    await this.prisma.community.update({
      where: { id: createRequest.communityID },
      data: { postCount: { increment: 1 } },
    });

    // Get author name
    const authorName = await this.getUserName(authorID, authorType);

    // Publish event
    await this.outboxService.saveAndPublishEvent<CommunityEvent>({
      eventType: 'community.post.created',
      schemaVersion: 1,
      payload: {
        postID: post.id,
        communityID: post.communityID,
        communityName: post.community.name,
        authorID,
        authorType,
        authorName,
        type: post.type as PostType,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
      },
    }, COMMUNITY_ROUTING_KEYS.POST_CREATED);

    this.logger.log(`Post created: ${post.id} in community ${createRequest.communityID} by ${authorType} ${authorID}`);

    return post;
  }

  async getPosts(filters: PostFilters, userID: string, userType: UserType) {
    // Check if user has access to the community
    if (filters.communityID) {
      await this.checkCommunityMembership(filters.communityID, userID, userType);
    }

    const where: any = {};

    if (filters.communityID) {
      where.communityID = filters.communityID;
    }

    if (filters.authorID) {
      where.authorID = filters.authorID;
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

    // Pinned posts first
    orderBy.push({ isPinned: 'desc' });

    // Then by creation date
    orderBy.push({ createdAt: filters.sortOrder || 'desc' });

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          community: {
            select: { name: true, type: true },
          },
          reactions: {
            where: { userID, userType },
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
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      posts: posts.map(post => ({
        ...post,
        userReaction: post.reactions[0]?.type || null,
        reactions: undefined, // Remove detailed reactions from response
      })),
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
    };
  }

  async getPost(id: string, userID: string, userType: UserType) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        community: {
          select: { name: true, type: true },
        },
        comments: {
          where: { parentCommentID: null }, // Top-level comments only
          include: {
            reactions: {
              where: { userID, userType },
              select: { type: true },
            },
            replies: {
              take: 3, // Limited replies
              include: {
                reactions: {
                  where: { userID, userType },
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
          take: 20, // Limit comments for performance
        },
        reactions: {
          where: { userID, userType },
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

    // Check if user has access to the community
    await this.checkCommunityMembership(post.communityID, userID, userType);

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

  async updatePost(id: string, updateRequest: UpdatePostRequest, userID: string, userType: UserType) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user is the author or has moderator permissions
    if (post.authorID !== userID || post.authorType !== userType) {
      await this.checkCommunityPermission(post.communityID, userID, userType, 'moderate_posts');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        ...updateRequest,
        isEdited: true,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Post ${id} updated by ${userType} ${userID}`);

    return updatedPost;
  }

  async deletePost(id: string, userID: string, userType: UserType) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user is the author or has moderator permissions
    if (post.authorID !== userID || post.authorType !== userType) {
      await this.checkCommunityPermission(post.communityID, userID, userType, 'moderate_posts');
    }

    await this.prisma.post.delete({
      where: { id },
    });

    // Update community post count
    await this.prisma.community.update({
      where: { id: post.communityID },
      data: { postCount: { decrement: 1 } },
    });

    this.logger.log(`Post ${id} deleted by ${userType} ${userID}`);

    return { message: 'Post deleted successfully' };
  }

  async reactToPost(postID: string, reactionRequest: ReactToPostRequest, userID: string, userType: UserType) {
    const post = await this.prisma.post.findUnique({
      where: { id: postID },
      include: {
        community: { select: { name: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user has access to the community
    await this.checkCommunityMembership(post.communityID, userID, userType);

    const existingReaction = await this.prisma.postReaction.findUnique({
      where: {
        postID_userID_userType: {
          postID,
          userID,
          userType,
        },
      },
    });

    let reactionChange = 0;

    if (existingReaction) {
      if (existingReaction.type === reactionRequest.type) {
        // Remove reaction
        await this.prisma.postReaction.delete({
          where: { id: existingReaction.id },
        });
        reactionChange = -1;
      } else {
        // Update reaction type
        await this.prisma.postReaction.update({
          where: { id: existingReaction.id },
          data: { type: reactionRequest.type },
        });
      }
    } else {
      // Create new reaction
      await this.prisma.postReaction.create({
        data: {
          postID,
          userID,
          userType,
          type: reactionRequest.type,
        },
      });
      reactionChange = 1;
    }

    // Update post like count
    if (reactionChange !== 0) {
      await this.prisma.post.update({
        where: { id: postID },
        data: { likeCount: { increment: reactionChange } },
      });
    }

    // Only publish event for new reactions (not updates or removals)
    if (!existingReaction && reactionChange > 0) {
      const userName = await this.getUserName(userID, userType);

      await this.outboxService.saveAndPublishEvent<CommunityEvent>({
        eventType: 'community.post.liked',
        schemaVersion: 1,
        payload: {
          postID,
          communityID: post.communityID,
          communityName: post.community.name,
          postAuthorID: post.authorID,
          postAuthorType: post.authorType as UserType,
          likedByID: userID,
          likedByType: userType,
          likedByName: userName,
          reactionType: reactionRequest.type,
          likedAt: new Date().toISOString(),
        },
      }, COMMUNITY_ROUTING_KEYS.POST_LIKED);
    }

    this.logger.log(`Post ${postID} reacted to by ${userType} ${userID} with ${reactionRequest.type}`);

    return { message: 'Reaction updated successfully' };
  }

  async createComment(postID: string, createRequest: CreateCommentRequest, authorID: string, authorType: UserType) {
    const post = await this.prisma.post.findUnique({
      where: { id: postID },
      include: {
        community: { select: { name: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user has access to the community
    await this.checkCommunityMembership(post.communityID, authorID, authorType);

    const comment = await this.prisma.postComment.create({
      data: {
        postID,
        authorID,
        authorType,
        content: createRequest.content,
        mediaUrls: createRequest.mediaUrls || [],
        parentCommentID: createRequest.parentCommentID,
      },
    });

    // Update post comment count
    await this.prisma.post.update({
      where: { id: postID },
      data: { commentCount: { increment: 1 } },
    });

    // Update parent comment reply count if this is a reply
    if (createRequest.parentCommentID) {
      await this.prisma.postComment.update({
        where: { id: createRequest.parentCommentID },
        data: { replyCount: { increment: 1 } },
      });
    }

    // Get author name
    const authorName = await this.getUserName(authorID, authorType);

    // Publish event
    await this.outboxService.saveAndPublishEvent<CommunityEvent>({
      eventType: 'community.post.commented',
      schemaVersion: 1,
      payload: {
        commentID: comment.id,
        postID,
        communityID: post.communityID,
        communityName: post.community.name,
        postAuthorID: post.authorID,
        postAuthorType: post.authorType as UserType,
        commentAuthorID: authorID,
        commentAuthorType: authorType,
        commentAuthorName: authorName,
        content: comment.content,
        commentedAt: comment.createdAt.toISOString(),
      },
    }, COMMUNITY_ROUTING_KEYS.POST_COMMENTED);

    this.logger.log(`Comment created: ${comment.id} on post ${postID} by ${authorType} ${authorID}`);

    return comment;
  }

  async getComments(postID: string, page = 1, limit = 20, userID: string, userType: UserType) {
    const post = await this.prisma.post.findUnique({
      where: { id: postID },
      select: { communityID: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user has access to the community
    await this.checkCommunityMembership(post.communityID, userID, userType);

    const [comments, total] = await Promise.all([
      this.prisma.postComment.findMany({
        where: {
          postID,
          parentCommentID: null, // Top-level comments only
        },
        include: {
          reactions: {
            where: { userID, userType },
            select: { type: true },
          },
          replies: {
            take: 3, // Limited replies per comment
            include: {
              reactions: {
                where: { userID, userType },
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.postComment.count({
        where: {
          postID,
          parentCommentID: null,
        },
      }),
    ]);

    return {
      comments: comments.map(comment => ({
        ...comment,
        userReaction: comment.reactions[0]?.type || null,
        replies: comment.replies.map(reply => ({
          ...reply,
          userReaction: reply.reactions[0]?.type || null,
          reactions: undefined,
        })),
        reactions: undefined,
      })),
      total,
      page,
      limit,
    };
  }

  async reactToComment(commentID: string, reactionRequest: ReactToPostRequest, userID: string, userType: UserType) {
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

    // Check if user has access to the community
    await this.checkCommunityMembership(comment.post.communityID, userID, userType);

    const existingReaction = await this.prisma.postReaction.findUnique({
      where: {
        commentID_userID_userType: {
          commentID,
          userID,
          userType,
        },
      },
    });

    let reactionChange = 0;

    if (existingReaction) {
      if (existingReaction.type === reactionRequest.type) {
        // Remove reaction
        await this.prisma.postReaction.delete({
          where: { id: existingReaction.id },
        });
        reactionChange = -1;
      } else {
        // Update reaction type
        await this.prisma.postReaction.update({
          where: { id: existingReaction.id },
          data: { type: reactionRequest.type },
        });
      }
    } else {
      // Create new reaction
      await this.prisma.postReaction.create({
        data: {
          commentID,
          userID,
          userType,
          type: reactionRequest.type,
        },
      });
      reactionChange = 1;
    }

    // Update comment like count
    if (reactionChange !== 0) {
      await this.prisma.postComment.update({
        where: { id: commentID },
        data: { likeCount: { increment: reactionChange } },
      });
    }

    this.logger.log(`Comment ${commentID} reacted to by ${userType} ${userID} with ${reactionRequest.type}`);

    return { message: 'Reaction updated successfully' };
  }

  private async checkCommunityMembership(communityID: string, userID: string, userType: UserType) {
    const member = await this.prisma.communityMember.findUnique({
      where: {
        communityID_userID_userType: {
          communityID,
          userID,
          userType,
        },
      },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenException('Access denied to this community');
    }

    return member;
  }

  private async checkCommunityPermission(communityID: string, userID: string, userType: UserType, permission: string) {
    const member = await this.checkCommunityMembership(communityID, userID, userType);

    if (!member.permissions.includes(permission) && !member.permissions.includes('all')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private async getUserName(userID: string, userType: UserType): Promise<string> {
    try {
      switch (userType) {
        case UserType.coach:
          const coach = await this.prisma.coach.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true, businessName: true },
          });
          return coach?.businessName || `${coach?.firstName} ${coach?.lastName}` || 'Unknown Coach';

        case UserType.client:
          const client = await this.prisma.client.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true },
          });
          return `${client?.firstName} ${client?.lastName}` || 'Unknown Client';

        case UserType.admin:
          const admin = await this.prisma.admin.findUnique({
            where: { id: userID },
            select: { firstName: true, lastName: true },
          });
          return `${admin?.firstName} ${admin?.lastName}` || 'Admin';

        default:
          return 'Unknown User';
      }
    } catch (error) {
      this.logger.warn(`Failed to get user name for ${userType} ${userID}`, error);
      return 'Unknown User';
    }
  }
}
