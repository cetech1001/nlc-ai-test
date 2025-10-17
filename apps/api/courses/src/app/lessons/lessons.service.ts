import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {OutboxService} from '@nlc-ai/api-messaging';
import {CourseEvent, CreateCourseLesson, UpdateCourseLesson} from "@nlc-ai/types";

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

  async findAll(chapterID: string) {
    return this.prisma.courseLesson.findMany({
      where: { chapterID: chapterID },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(chapterID: string, id: string) {
    const lesson = await this.prisma.courseLesson.findFirst({
      where: { id, chapterID: chapterID },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async update(courseID: string, id: string, updateLessonDto: UpdateCourseLesson, coachID: string) {
    await this.verifyCourseOwnership(courseID, coachID);

    return await this.prisma.courseLesson.update({
      where: {id},
      data: updateLessonDto,
    });
  }

  async remove(courseID: string, id: string, coachID: string) {
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
  }

  async reorder(courseID: string, chapterID: string, lessonIDs: string[], coachID: string) {
    await this.verifyCourseOwnership(courseID, coachID);

    return this.prisma.$transaction(async (tx) => {
      await tx.courseLesson.updateMany({
        where: { chapterID },
        data: { orderIndex: { increment: 1000 } }, // any big offset
      });

      for (let i = 0; i < lessonIDs.length; i++) {
        tx.courseLesson.update({
          where: { id: lessonIDs[i] },
          data: { orderIndex: i },
        })
      }
    });
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
