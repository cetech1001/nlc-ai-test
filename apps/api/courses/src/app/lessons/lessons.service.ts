import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import {CreateCourseLesson, UpdateCourseLesson, CourseEvent} from "@nlc-ai/types";

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async create(courseID: string, chapterID: string, createLessonDto: CreateCourseLesson, coachID: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseID, coachID: coachID },
      include: {
        chapters: {
          where: { id: chapterID },
        },
      },
    });

    if (!course || course.chapters.length === 0) {
      throw new NotFoundException('Course or chapter not found or access denied');
    }

    const lesson = await this.prisma.courseLesson.create({
      data: {
        ...createLessonDto,
        chapterID: chapterID,
      },
    });

    await this.prisma.course.update({
      where: { id: courseID },
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
          chapterID: chapterID,
          courseID: courseID,
          coachID: coachID,
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

  async findAll(courseID: string, chapterID: string) {
    return this.prisma.courseLesson.findMany({
      where: { chapterID: chapterID },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(courseID: string, chapterID: string, id: string) {
    const lesson = await this.prisma.courseLesson.findFirst({
      where: { id, chapterID: chapterID },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async update(courseID: string, chapterID: string, id: string, updateLessonDto: UpdateCourseLesson, coachID: string) {
    await this.verifyCourseOwnership(courseID, coachID);

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
          chapterID: chapterID,
          courseID: courseID,
          coachID: coachID,
          changes: updateLessonDto,
          updatedAt: lesson.updatedAt.toISOString(),
        },
      },
      'course.lesson.updated',
    );

    return lesson;
  }

  async remove(courseID: string, chapterID: string, id: string, coachID: string) {
    await this.verifyCourseOwnership(courseID, coachID);

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
        where: { id: courseID },
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
          chapterID: chapterID,
          courseID: courseID,
          coachID: coachID,
          title: lesson.title,
          deletedAt: new Date().toISOString(),
        },
      },
      'course.lesson.deleted',
    );
  }

  async reorder(courseID: string, _: string, lessonIDs: string[], coachID: string) {
    await this.verifyCourseOwnership(courseID, coachID);

    await this.prisma.$transaction(
      lessonIDs.map((lessonID, index) =>
        this.prisma.courseLesson.update({
          where: { id: lessonID },
          data: { orderIndex: index },
        })
      )
    );

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
