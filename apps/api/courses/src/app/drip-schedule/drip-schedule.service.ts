import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { addDays } from 'date-fns';
import { UpdateDripSchedule } from "@nlc-ai/types";

export interface LessonDripSettings {
  lessonID: string;
  days: number;
  type: 'course_start' | 'previous_lesson';
}

export interface UpdateLessonDripScheduleDto {
  lessonSettings: LessonDripSettings[];
}

@Injectable()
export class DripScheduleService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDripSchedule(courseID: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseID },
      include: {
        chapters: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      courseID: course.id,
      isDripEnabled: course.isDripEnabled,
      dripInterval: course.dripInterval,
      dripCount: course.dripCount,
      schedule: this.calculateDripSchedule(course),
      lessons: this.getLessonDripSettings(course),
    };
  }

  async updateDripSchedule(courseID: string, updateDto: UpdateDripSchedule, coachID: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseID, coachID: coachID },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id: courseID },
      data: {
        isDripEnabled: updateDto.isDripEnabled,
        dripInterval: updateDto.dripInterval,
        dripCount: updateDto.dripCount,
      },
      include: {
        chapters: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return {
      courseID: updatedCourse.id,
      isDripEnabled: updatedCourse.isDripEnabled,
      dripInterval: updatedCourse.dripInterval,
      dripCount: updatedCourse.dripCount,
      schedule: this.calculateDripSchedule(updatedCourse),
    };
  }

  async updateLessonDripSchedule(courseID: string, updateDto: UpdateLessonDripScheduleDto, coachID: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseID, coachID },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    // Update individual lesson drip delays
    await this.prisma.$transaction(async (tx) => {
      for (const lessonSetting of updateDto.lessonSettings) {
        await tx.courseLesson.update({
          where: { id: lessonSetting.lessonID },
          data: {
            dripDelay: lessonSetting.days,
            dripType: lessonSetting.type,
          },
        });
      }
    });

    return { success: true, message: 'Lesson drip schedule updated successfully' };
  }

  async previewDripSchedule(courseID: string, enrollmentID: string, coachID: string) {
    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: {
        id: enrollmentID,
        courseID: courseID,
        course: { coachID: coachID },
      },
      include: {
        course: {
          include: {
            chapters: {
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found or access denied');
    }

    const enrollmentDate = enrollment.enrolledAt;
    const schedule = this.calculateDripScheduleForEnrollment(enrollment.course, enrollmentDate);

    return {
      enrollmentID,
      enrollmentDate,
      schedule,
    };
  }

  private calculateDripSchedule(course: any) {
    if (!course.isDripEnabled) {
      return { message: 'Drip scheduling is disabled for this course' };
    }

    const schedule: any[] = [];
    let currentDate = new Date();

    course.chapters.forEach((chapter: any) => {
      chapter.lessons.forEach((lesson: any) => {
        const releaseDate = this.calculateLessonReleaseDate(
          currentDate,
          lesson.dripDelay || 0,
          'course_start' // Default to course start for now
        );

        schedule.push({
          lessonID: lesson.id,
          lessonTitle: lesson.title,
          chapterTitle: chapter.title,
          releaseDate,
          dripDelay: lesson.dripDelay || 0,
          orderIndex: lesson.orderIndex,
        });
      });
    });

    return schedule;
  }

  private calculateDripScheduleForEnrollment(course: any, enrollmentDate: Date) {
    const schedule: any[] = [];

    course.chapters.forEach((chapter: any) => {
      chapter.lessons.forEach((lesson: any) => {
        const releaseDate = this.calculateLessonReleaseDate(
          enrollmentDate,
          lesson.dripDelay || 0,
          'course_start'
        );

        schedule.push({
          lessonID: lesson.id,
          lessonTitle: lesson.title,
          chapterTitle: chapter.title,
          releaseDate,
          dripDelay: lesson.dripDelay || 0,
          isAvailable: new Date() >= releaseDate,
          orderIndex: lesson.orderIndex,
        });
      });
    });

    return schedule;
  }

  private calculateLessonReleaseDate(startDate: Date, dripDelay: number, type: string) {
    return addDays(startDate, dripDelay);
  }

  private getLessonDripSettings(course: any) {
    const settings: any[] = [];

    course.chapters.forEach((chapter: any) => {
      chapter.lessons.forEach((lesson: any, index: number) => {
        settings.push({
          lessonID: lesson.id,
          lessonTitle: lesson.title,
          chapterTitle: chapter.title,
          dripDelay: lesson.dripDelay || 0,
          dripType: index === 0 ? 'course_start' : 'previous_lesson',
        });
      });
    });

    return settings;
  }
}
