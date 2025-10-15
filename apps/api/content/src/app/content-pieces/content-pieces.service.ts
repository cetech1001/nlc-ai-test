import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { UserType } from '@nlc-ai/api-types';
import {
  CreateContentPieceDto,
  UpdateContentPieceDto,
  ContentPieceQueryDto,
  ContentAnalyticsDto
} from './dto';

@Injectable()
export class ContentPiecesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userID: string, userType: UserType, createContentPieceDto: CreateContentPieceDto) {
    // Verify category belongs to user
    const category = await this.prisma.contentCategory.findFirst({
      where: {
        id: createContentPieceDto.categoryID,
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.contentPiece.create({
      data: {
        ...createContentPieceDto,
        coachID: userID,
        publishedAt: createContentPieceDto.publishedAt ? new Date(createContentPieceDto.publishedAt) : null
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async findAll(userID: string, userType: UserType, query: ContentPieceQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryID,
      contentType,
      platform,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      publishedAfter,
      publishedBefore
    } = query;

    const where = {
      coachID: userID,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { tags: { hasSome: [search] } }
        ]
      }),
      ...(categoryID && { categoryID }),
      ...(contentType && { contentType }),
      ...(platform && { platform }),
      ...(status && { status }),
      ...(publishedAfter || publishedBefore) && {
        publishedAt: {
          ...(publishedAfter && { gte: new Date(publishedAfter) }),
          ...(publishedBefore && { lte: new Date(publishedBefore) })
        }
      }
    };

    return this.prisma.paginate(this.prisma.contentPiece, {
      where,
      page,
      limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async findOne(userID: string, userType: UserType, contentPieceID: string) {
    const contentPiece = await this.prisma.contentPiece.findFirst({
      where: {
        id: contentPieceID,
        coachID: userID
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    if (!contentPiece) {
      throw new NotFoundException('Content piece not found');
    }

    return contentPiece;
  }

  async update(userID: string, userType: UserType, contentPieceID: string, updateContentPieceDto: UpdateContentPieceDto) {
    // Check if content piece exists and belongs to user
    await this.findOne(userID, userType, contentPieceID);

    // If updating category, verify it belongs to user
    if (updateContentPieceDto.categoryID) {
      const category = await this.prisma.contentCategory.findFirst({
        where: {
          id: updateContentPieceDto.categoryID,
        }
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.contentPiece.update({
      where: { id: contentPieceID },
      data: {
        ...updateContentPieceDto,
        publishedAt: updateContentPieceDto.publishedAt ? new Date(updateContentPieceDto.publishedAt) : undefined
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async remove(userID: string, userType: UserType, contentPieceID: string) {
    // Check if content piece exists and belongs to user
    await this.findOne(userID, userType, contentPieceID);

    await this.prisma.contentPiece.delete({
      where: { id: contentPieceID }
    });

    return { message: 'Content piece deleted successfully' };
  }

  async getAnalytics(userID: string, _: UserType, query: ContentAnalyticsDto) {
    const { categoryID, contentType } = query;

    const where = {
      coachID: userID,
      ...(categoryID && { categoryID }),
      ...(contentType && { contentType }),
      status: 'published'
    };

    // Get basic stats
    const [
      totalContent,
      totalViews,
      totalLikes,
      totalComments,
      contentByCategory,
      contentByType,
      topPerforming
    ] = await Promise.all([
      this.prisma.contentPiece.count({ where }),

      this.prisma.contentPiece.aggregate({
        where,
        _sum: { views: true }
      }),

      this.prisma.contentPiece.aggregate({
        where,
        _sum: { likes: true }
      }),

      this.prisma.contentPiece.aggregate({
        where,
        _sum: { comments: true }
      }),

      this.prisma.contentPiece.groupBy({
        by: ['categoryID'],
        where,
        _count: true,
        _sum: { views: true },
        orderBy: { _count: { categoryID: 'desc' } }
      }),

      this.prisma.contentPiece.groupBy({
        by: ['contentType'],
        where,
        _count: true,
        _sum: { views: true },
        orderBy: { _count: { contentType: 'desc' } }
      }),

      this.prisma.contentPiece.findMany({
        where,
        orderBy: { views: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          views: true,
          likes: true,
          comments: true,
          engagementRate: true,
          category: { select: { name: true } }
        }
      })
    ]);

    // Get category names for groupBy results
    const categoryIDs = contentByCategory.map(item => item.categoryID);
    const categories = await this.prisma.contentCategory.findMany({
      where: { id: { in: categoryIDs } },
      select: { id: true, name: true }
    });

    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

    return {
      overview: {
        totalContent,
        totalViews: totalViews._sum.views || 0,
        totalLikes: totalLikes._sum.likes || 0,
        totalComments: totalComments._sum.comments || 0,
        averageViews: totalContent > 0 ? Math.round((totalViews._sum.views || 0) / totalContent) : 0
      },
      byCategory: contentByCategory.map(item => ({
        categoryID: item.categoryID,
        categoryName: categoryMap.get(item.categoryID) || 'Unknown',
        count: item._count,
        totalViews: item._sum.views || 0
      })),
      byType: contentByType.map(item => ({
        contentType: item.contentType,
        count: item._count,
        totalViews: item._sum.views || 0
      })),
      topPerforming
    };
  }

  async bulkUpdateStatus(userID: string, userType: UserType, contentPieceIDs: string[], status: string) {
    // Verify all content pieces belong to user
    const count = await this.prisma.contentPiece.count({
      where: {
        id: { in: contentPieceIDs },
        coachID: userID
      }
    });

    if (count !== contentPieceIDs.length) {
      throw new ForbiddenException('Some content pieces do not belong to you');
    }

    return this.prisma.contentPiece.updateMany({
      where: {
        id: { in: contentPieceIDs },
        coachID: userID
      },
      data: { status }
    });
  }

  async duplicateContentPiece(userID: string, userType: UserType, contentPieceID: string) {
    const originalContent = await this.findOne(userID, userType, contentPieceID);

    const { id, createdAt, updatedAt, platformID, ...contentData } = originalContent;

    return this.prisma.contentPiece.create({
      // @ts-ignore
      data: {
        ...contentData,
        title: `${contentData.title} (Copy)`,
        status: 'draft',
        platformID: null, // Remove platform reference for duplicated content
        url: null
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });
  }
}
