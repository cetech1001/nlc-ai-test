import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {CloudinaryService} from "../cloudinary/cloudinary.service";

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getCategories(coachID: string) {
    return this.prisma.contentCategory.findMany({
      where: { coachID },
      include: {
        _count: {
          select: { videos: true }
        },
        videos: {
          select: {
            views: true,
            engagement: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async uploadVideo(file: Express.Multer.File, body: any, coachID: string) {
    // Upload to S3
    const uploadResult = await this.cloudinaryService.uploadFile(file, 'videos');

    // Generate thumbnail
    const thumbnailUrl = await this.generateThumbnail(uploadResult.url);

    // Get video duration
    const duration = await this.getVideoDuration(file.buffer);

    // Save to database
    return this.prisma.contentPiece.create({
      data: {
        coachID,
        categoryID: body.categoryID,
        title: body.title,
        description: body.description,
        fileName: file.originalname,
        fileUrl: uploadResult.url,
        thumbnailUrl,
        duration,
        fileSize: file.size,
        mimeType: file.mimetype,
        views: 0,
        likes: 0,
        shares: 0,
        engagement: 0,
      }
    });
  }

  async deleteVideo(id: string, coachID: string) {
    const video = await this.prisma.contentPiece.findFirst({
      where: { id, coachID }
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Delete from S3
    await this.cloudinaryService.deleteFile(video.fileUrl);
    if (video.thumbnailUrl) {
      await this.cloudinaryService.deleteFile(video.thumbnailUrl);
    }

    // Delete from database
    return this.prisma.contentPiece.delete({
      where: { id }
    });
  }

  private async generateThumbnail(videoUrl: string): Promise<string> {
    // Implementation for generating video thumbnail
    // Could use FFmpeg or video processing service
    return '';
  }

  private async getVideoDuration(buffer: Buffer): Promise<number> {
    // Implementation for getting video duration
    // Could use FFprobe or video processing library
    return 0;
  }
}
