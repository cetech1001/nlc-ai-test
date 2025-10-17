import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import {CourseEvent, CreateCourseChapter, UpdateCourseChapter} from '@nlc-ai/types';

@Injectable()
export class ChaptersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async create(courseID: string, createChapterDto: CreateCourseChapter, coachID: string) {
    await this.verifyCourseOwnership(courseID, coachID);

    const chapter = await this.prisma.courseChapter.create({
      // @ts-ignore
      data: {
        ...createChapterDto,
        courseID: courseID,
      },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    await this.prisma.course.update({
      where: { id: courseID },
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
          courseID: courseID,
          coachID: coachID,
          title: chapter.title,
          orderIndex: chapter.orderIndex,
          createdAt: chapter.createdAt.toISOString(),
        },
      },
      'course.chapter.created',
    );

    return chapter;
  }

  async findAll(courseID: string) {
    return this.prisma.courseChapter.findMany({
      where: { courseID: courseID },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(courseID: string, id: string) {
    const chapter = await this.prisma.courseChapter.findFirst({
      where: { id, courseID: courseID },
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

  async update(courseID: string, id: string, updateChapterDto: UpdateCourseChapter, coachID: string) {
    await this.verifyCourseOwnership(courseID, coachID);

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
          courseID: courseID,
          coachID: coachID,
          changes: updateChapterDto,
          updatedAt: chapter.updatedAt.toISOString(),
        },
      },
      'course.chapter.updated',
    );

    return chapter;
  }

  async remove(courseID: string, id: string, coachID: string) {
    await this.verifyCourseOwnership(courseID, coachID);

    const chapter = await this.prisma.courseChapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.courseChapter.delete({
        where: { id },
      });

      const lessonsCount = await tx.courseLesson.count({
        where: { chapterID: id },
      });

      await tx.course.update({
        where: { id: courseID },
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
          courseID: courseID,
          coachID: coachID,
          title: chapter.title,
          deletedAt: new Date().toISOString(),
        },
      },
      'course.chapter.deleted',
    );
  }

  async reorder(courseID: string, chapterIDs: string[], coachID: string) {
    await this.verifyCourseOwnership(courseID, coachID);

    await this.prisma.$transaction(async (tx) => {
      await tx.courseChapter.updateMany({
        where: { courseID },
        data: { orderIndex: { increment: 1000 } },
      });

      for (let i = 0; i < chapterIDs.length; i++) {
        await tx.courseChapter.update({
          where: { id: chapterIDs[i] },
          data: { orderIndex: i },
        });
      }
    });

    return { success: true };
  }

  private async verifyCourseOwnership(courseID: string, coachID: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseID, coachID },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }
  }
}
