import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { CreateLessonDto, UpdateLessonDto } from './dto';
import { CourseEvent } from '@nlc-ai/api-types';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async create(courseId: string, chapterId: string, createLessonDto: CreateLessonDto, coachId: string) {
    // Verify course ownership and chapter exists
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
      include: {
        chapters: {
          where: { id: chapterId },
        },
      },
    });

    if (!course || course.chapters.length === 0) {
      throw new NotFoundException('Course or chapter not found or access denied');
    }

    const lesson = await this.prisma.courseLesson.create({
      data: {
        ...createLessonDto,
        chapterID: chapterId,
      },
    });

    // Update course total lessons count
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        totalLessons: { increment: 1 },
      },
    });

    await this.outboxService.saveAndPublishEvent<CourseEvent>(
      {
        eventType: 'course.lesson.created',
        schemaVersion: 1,
        payload: {
          lessonID: lesson.id,
          chapterID: chapterId,
          courseID: courseId,
          coachID: coachId,
          title: lesson.title,
          lessonType: lesson.lessonType,
          orderIndex: lesson.orderIndex,
          createdAt: lesson.createdAt.toISOString(),
        },
      },
      'course.lesson.created',
    );

    return lesson;
  }

  async findAll(courseId: string, chapterId: string) {
    return this.prisma.courseLesson.findMany({
      where: { chapterID: chapterId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(courseId: string, chapterId: string, id: string) {
    const lesson = await this.prisma.courseLesson.findFirst({
      where: { id, chapterID: chapterId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async update(courseId: string, chapterId: string, id: string, updateLessonDto: UpdateLessonDto, coachId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    const lesson = await this.prisma.courseLesson.update({
      where: { id },
      data: updateLessonDto,
    });

    await this.outboxService.saveAndPublishEvent<CourseEvent>(
      {
        eventType: 'course.lesson.updated',
        schemaVersion: 1,
        payload: {
          lessonID: id,
          chapterID: chapterId,
          courseID: courseId,
          coachID: coachId,
          changes: updateLessonDto,
          updatedAt: lesson.updatedAt.toISOString(),
        },
      },
      'course.lesson.updated',
    );

    return lesson;
  }

  async remove(courseId: string, chapterId: string, id: string, coachId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    const lesson = await this.prisma.courseLesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.courseLesson.delete({
        where: { id },
      });

      await tx.course.update({
        where: { id: courseId },
        data: {
          totalLessons: { decrement: 1 },
        },
      });
    });

    await this.outboxService.saveAndPublishEvent<CourseEvent>(
      {
        eventType: 'course.lesson.deleted',
        schemaVersion: 1,
        payload: {
          lessonID: id,
          chapterID: chapterId,
          courseID: courseId,
          coachID: coachId,
          title: lesson.title,
          deletedAt: new Date().toISOString(),
        },
      },
      'course.lesson.deleted',
    );
  }

  async reorder(courseId: string, chapterId: string, lessonIDs: string[], coachId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    // Update order indices in a transaction
    await this.prisma.$transaction(
      lessonIDs.map((lessonId, index) =>
        this.prisma.courseLesson.update({
          where: { id: lessonId },
          data: { orderIndex: index },
        })
      )
    );

    return { success: true };
  }
}
