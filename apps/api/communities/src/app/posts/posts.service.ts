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
  ReactToPostRequest,
  Post,
  AuthUser
} from '@nlc-ai/api-types';
import {ActivityHelperService} from "../helpers/activity-helper.service";

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly config: ConfigService,
    private readonly activityHelper: ActivityHelperService,
  ) {}

  async createPost(
    communityID: string,
    createRequest: CreatePostRequest,
    user: AuthUser
  ) {
    const member = await this.checkCommunityMembership(communityID, user);

    const maxLength = this.config.get<number>('community.features.maxPostLength', 5000);
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
          select: { name: true, type: true, slug: true },
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
    });

    this.activityHelper.updateLastActivity(communityID, user.id, user.type);

    await this.prisma.community.update({
      where: { id: communityID },
      data: { postCount: { increment: 1 } },
    });

    await this.outbox.saveAndPublishEvent<CommunityEvent>({
      eventType: 'community.post.created',
      schemaVersion: 1,
      payload: {
        postID: post.id,
        communityID: post.communityID,
        communityName: post.community.name,
        slug: post.community.slug,
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

  async getPosts(communityID: string, filters: PostFilters, user: AuthUser) {
    await this.checkCommunityMembership(communityID, user);

    const where: any = {};

    if (communityID) {
      where.communityID = communityID;
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
          select: { name: true, type: true, slug: true },
        },
        communityMember: {
          select: { userName: true, userAvatarUrl: true, role: true, userID: true, userType: true },
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
          select: { name: true, type: true, slug: true },
        },
        communityMember: {
          select: { userName: true, userID: true, userType: true, userAvatarUrl: true, role: true },
        },
        comments: {
          where: { parentCommentID: null },
          include: {
            communityMember: {
              select: { userName: true, userID: true, userType: true, userAvatarUrl: true, role: true },
            },
            reactions: {
              where: { userID: user.id, userType: user.type },
              select: { type: true },
            },
            replies: {
              take: 3,
              include: {
                communityMember: {
                  select: { userName: true, userID: true, userType: true, userAvatarUrl: true, role: true },
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

    this.activityHelper.updateLastActivity(post.communityID, user.id, user.type);

    this.logger.log(`Post ${id} updated by ${user.type} ${user.id}`);

    return updatedPost;
  }

  async togglePinPost(communityID: string, id: string, user: AuthUser) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.communityID !== communityID) {
      throw new ForbiddenException('Post does not belong to this community');
    }

    // Check if user is community owner or has moderate_posts permission
    await this.checkCommunityPermission(communityID, user, 'moderate_posts');

    // If pinning this post, unpin all other posts in the community first
    if (!post.isPinned) {
      await this.prisma.post.updateMany({
        where: {
          communityID,
          isPinned: true,
          id: { not: id },
        },
        data: {
          isPinned: false,
          updatedAt: new Date(),
        },
      });
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        isPinned: !post.isPinned,
        updatedAt: new Date(),
      },
      include: {
        community: {
          select: { name: true, type: true, slug: true },
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
    });

    this.activityHelper.updateLastActivity(communityID, user.id, user.type);

    this.logger.log(`Post ${id} pin status toggled to ${updatedPost.isPinned} by ${user.type} ${user.id}`);

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

    this.activityHelper.updateLastActivity(post.communityID, user.id, user.type);

    this.logger.log(`Post ${id} deleted by ${user.type} ${user.id}`);

    return { message: 'Post deleted successfully' };
  }

  async reactToPost(postID: string, reactionRequest: ReactToPostRequest, user: AuthUser) {
    const post = await this.prisma.post.findUnique({
      where: { id: postID },
      include: {
        community: { select: { name: true, slug: true }, },
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

    this.activityHelper.updateLastActivity(post.communityID, user.id, user.type);

    if (!existingReaction && reactionChange > 0) {
      const userName = await this.getUserName(user);

      await this.outbox.saveAndPublishEvent<CommunityEvent>({
        eventType: 'community.post.liked',
        schemaVersion: 1,
        payload: {
          postID,
          communityID: post.communityID,
          communityName: post.community.name,
          slug: post.community.slug,
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

  private async getUserName(authUser: AuthUser): Promise<string> {
    try {
      let user: any;
      switch (authUser.type) {
        case UserType.coach:
          user = await this.prisma.coach.findUnique({
            where: { id: authUser.id },
            select: { firstName: true, lastName: true, businessName: true },
          });
          return user?.businessName || `${user?.firstName} ${user?.lastName}`;

        case UserType.client:
          user = await this.prisma.client.findUnique({
            where: { id: authUser.id },
            select: { firstName: true, lastName: true },
          });
          return `${user?.firstName} ${user?.lastName}`;

        case UserType.admin:
          user = await this.prisma.admin.findUnique({
            where: { id: authUser.id },
            select: { firstName: true, lastName: true },
          });
          return `${user?.firstName} ${user?.lastName}`;

        default:
          return 'Unknown User';
      }
    } catch (error) {
      this.logger.warn(`Failed to get user name for ${authUser.type} ${authUser.id}`, error);
      return 'Unknown User';
    }
  }
}
