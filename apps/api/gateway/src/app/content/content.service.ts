import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { CreateCategoryDto, UpdateCategoryDto, ContentQueryDto } from './dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getCategories(coachID?: string) {
    const where = coachID ? { coachID } : {};

    return this.prisma.contentCategory.findMany({
      where,
      include: {
        _count: {
          select: { contentPieces: true }
        },
        contentPieces: {
          select: {
            views: true,
            engagementRate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCategory(id: string, coachID?: string) {
    const where: any = { id };
    if (coachID) {
      where.coachID = coachID;
    }

    const category = await this.prisma.contentCategory.findFirst({
      where,
      include: {
        _count: {
          select: { contentPieces: true }
        },
        contentPieces: {
          select: {
            views: true,
            engagementRate: true
          }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createCategory(createCategoryDto: CreateCategoryDto, coachID?: string) {
    // Check if category name already exists for this coach
    const existingCategory = await this.prisma.contentCategory.findFirst({
      where: {
        name: createCategoryDto.name,
        ...(coachID && { coachID })
      }
    });

    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists');
    }

    return this.prisma.contentCategory.create({
      data: {
        ...createCategoryDto,
        ...(coachID && { coachID })
      }
    });
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto, coachID?: string) {
    await this.getCategory(id, coachID);

    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.contentCategory.findFirst({
        where: {
          name: updateCategoryDto.name,
          id: { not: id },
          ...(coachID && { coachID })
        }
      });

      if (existingCategory) {
        throw new BadRequestException('Category with this name already exists');
      }
    }

    return this.prisma.contentCategory.update({
      where: { id },
      data: updateCategoryDto
    });
  }

  async deleteCategory(id: string, coachID?: string) {
    await this.getCategory(id, coachID);

    const contentCount = await this.prisma.contentPiece.count({
      where: { categoryID: id }
    });

    if (contentCount > 0) {
      throw new BadRequestException('Cannot delete category that contains content. Please move or delete all content first.');
    }

    return this.prisma.contentCategory.delete({
      where: { id }
    });
  }

  async getVideos(query: ContentQueryDto, coachID: string) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryID,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      coachID,
      contentType: 'video'
    };

    if (categoryID) {
      where.categoryID = categoryID;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [videos, total] = await Promise.all([
      this.prisma.contentPiece.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true
        }
      }),
      this.prisma.contentPiece.count({ where })
    ]);

    return {
      data: videos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getVideo(id: string, coachID: string) {
    const video = await this.prisma.contentPiece.findFirst({
      where: {
        id,
        coachID,
        contentType: 'video'
      },
      include: {
        category: true
      }
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  async uploadVideo(file: Express.Multer.File, body: any, coachID: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('File must be a video');
    }

    if (body.categoryID) {
      await this.getCategory(body.categoryID, coachID);
    }

    try {
      const uploadResult = await this.cloudinaryService.uploadAsset(file, {
        folder: `coaches/${coachID}/videos`,
        resource_type: 'video',
        public_id: `video_${Date.now()}`,
        overwrite: false
      });

      const thumbnailUrl = this.cloudinaryService.getOptimizedUrl(
        uploadResult.public_id,
        [{ width: 640, height: 360, crop: 'fill', format: 'jpg' }]
      );

      const duration = uploadResult.duration || 0;

      const videoData = {
        coachID,
        categoryID: body.categoryID,
        title: body.title || file.originalname.split('.')[0],
        description: body.description || null,
        contentType: 'video',
        platform: 'cloudinary',
        platformID: uploadResult.public_id,
        url: uploadResult.secure_url,
        thumbnailUrl,
        durationSeconds: Math.round(duration),
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagementRate: 0,
        tags: body.tags ? (Array.isArray(body.tags) ? body.tags : [body.tags]) : [],
        topicCategories: [],
        status: 'published'
      };

      return this.prisma.contentPiece.create({
        data: videoData,
        include: {
          category: true
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException('Failed to upload video');
    }
  }

  async updateVideo(id: string, updateData: any, coachID: string) {
    const video = await this.getVideo(id, coachID);

    if (updateData.categoryID && updateData.categoryID !== video.categoryID) {
      await this.getCategory(updateData.categoryID, coachID);
    }

    if (updateData.tags && !Array.isArray(updateData.tags)) {
      updateData.tags = [updateData.tags];
    }

    return this.prisma.contentPiece.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        category: true
      }
    });
  }

  async deleteVideo(id: string, coachID: string) {
    const video = await this.getVideo(id, coachID);

    try {
      if (video.platformID && video.platform === 'cloudinary') {
        await this.cloudinaryService.deleteAsset(video.platformID, true);
      }
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error);
    }

    return this.prisma.contentPiece.delete({
      where: { id }
    });
  }

  async incrementViews(id: string, coachID: string) {
    await this.getVideo(id, coachID);

    return this.prisma.contentPiece.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    });
  }

  async getStats(coachID: string) {
    const [
      totalCategories,
      totalVideos,
      viewsAggregate,
      engagementAggregate
    ] = await Promise.all([
      this.prisma.contentCategory.count({
        where: { coachID }
      }),
      this.prisma.contentPiece.count({
        where: { coachID, contentType: 'video' }
      }),
      this.prisma.contentPiece.aggregate({
        where: { coachID, contentType: 'video' },
        _sum: { views: true }
      }),
      this.prisma.contentPiece.aggregate({
        where: { coachID, contentType: 'video' },
        _avg: { engagementRate: true }
      })
    ]);

    return {
      totalCategories,
      totalVideos,
      totalViews: viewsAggregate._sum.views || 0,
      avgEngagement: Number(engagementAggregate._avg.engagementRate) || 0
    };
  }

  async getCategoryStats(categoryID: string, coachID: string) {
    await this.getCategory(categoryID, coachID);

    const [
      totalVideos,
      viewsAggregate,
      engagementAggregate,
      durationAggregate
    ] = await Promise.all([
      this.prisma.contentPiece.count({
        where: { categoryID, contentType: 'video' }
      }),
      this.prisma.contentPiece.aggregate({
        where: { categoryID, contentType: 'video' },
        _sum: { views: true }
      }),
      this.prisma.contentPiece.aggregate({
        where: { categoryID, contentType: 'video' },
        _avg: { engagementRate: true }
      }),
      this.prisma.contentPiece.aggregate({
        where: { categoryID, contentType: 'video' },
        _sum: { durationSeconds: true }
      })
    ]);

    return {
      totalVideos,
      totalViews: viewsAggregate._sum.views || 0,
      avgEngagement: Number(engagementAggregate._avg.engagementRate) || 0,
      totalDuration: durationAggregate._sum.durationSeconds || 0
    };
  }
}
