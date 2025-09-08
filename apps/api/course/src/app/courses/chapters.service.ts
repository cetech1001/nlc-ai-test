import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { CreateChapterDto, UpdateChapterDto } from './dto';
import { CourseEvent } from '@nlc-ai/api-types';

@Injectable()
export class ChaptersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async create(courseId: string, createChapterDto: CreateChapterDto, coachId: string) {
    // Verify course ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new NotFoundException('Course not found or access denied');
    }

    const chapter = await this.prisma.courseChapter.create({
      data: {
        ...createChapterDto,
        courseID: courseId,
      },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    // Update course total chapters count
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        totalChapters: { increment: 1 },
      },
    });

    await this.outboxService.saveAndPublishEvent<CourseEvent>(
      {
        eventType: 'course.chapter.created',
        schemaVersion: 1,
        payload: {
          chapterID: chapter.id,
          courseID: courseId,
          coachID: coachId,
          title: chapter.title,
          orderIndex: chapter.orderIndex,
          createdAt: chapter.createdAt.toISOString(),
        },
      },
      'course.chapter.created',
    );

    return chapter;
  }

  async findAll(courseId: string) {
    return this.prisma.courseChapter.findMany({
      where: { courseID: courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(courseId: string, id: string) {
    const chapter = await this.prisma.courseChapter.findFirst({
      where: { id, courseID: courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    return chapter;
  }

  async update(courseId: string, id: string, updateChapterDto: UpdateChapterDto, coachId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    const chapter = await this.prisma.courseChapter.update({
      where: { id },
      data: updateChapterDto,
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    await this.outboxService.saveAndPublishEvent<CourseEvent>(
      {
        eventType: 'course.chapter.updated',
        schemaVersion: 1,
        payload: {
          chapterID: id,
          courseID: courseId,
          coachID: coachId,
          changes: updateChapterDto,
          updatedAt: chapter.updatedAt.toISOString(),
        },
      },
      'course.chapter.updated',
    );

    return chapter;
  }

  async remove(courseId: string, id: string, coachId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    const chapter = await this.prisma.courseChapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // Delete chapter (lessons will be cascade deleted)
      await tx.courseChapter.delete({
        where: { id },
      });

      // Update course totals
      const lessonsCount = await tx.courseLesson.count({
        where: { chapterID: id },
      });

      await tx.course.update({
        where: { id: courseId },
        data: {
          totalChapters: { decrement: 1 },
          totalLessons: { decrement: lessonsCount },
        },
      });
    });

    await this.outboxService.saveAndPublishEvent<CourseEvent>(
      {
        eventType: 'course.chapter.deleted',
        schemaVersion: 1,
        payload: {
          chapterID: id,
          courseID: courseId,
          coachID: coachId,
          title: chapter.title,
          deletedAt: new Date().toISOString(),
        },
      },
      'course.chapter.deleted',
    );
  }

  async reorder(courseId: string, chapterIDs: string[], coachId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    // Update order indices in a transaction
    await this.prisma.$transaction(
      chapterIDs.map((chapterId, index) =>
        this.prisma.courseChapter.update({
          where: { id: chapterId },
          data: { orderIndex: index },
        })
      )
    );

    return { success: true };
  }
}
