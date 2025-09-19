import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { addDays, addWeeks, addMonths } from 'date-fns';
import {DripInterval, UpdateDripSchedule} from "@nlc-ai/types";

@Injectable()
export class DripScheduleService {
  constructor(private readonly prisma: PrismaService) {}

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
    };
  }

  async updateDripSchedule(courseID: string, updateDto: UpdateDripSchedule, coachID: string) {
    // Verify ownership
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

    // Update chapter and lesson drip delays if provided
    if (updateDto.isDripEnabled) {
      await this.recalculateDripDelays(courseID, updateDto);
    }

    return {
      courseID: updatedCourse.id,
      isDripEnabled: updatedCourse.isDripEnabled,
      dripInterval: updatedCourse.dripInterval,
      dripCount: updatedCourse.dripCount,
      schedule: this.calculateDripSchedule(updatedCourse),
    };
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
    let releaseCount = 0;

    course.chapters.forEach((chapter: any) => {
      chapter.lessons.forEach((lesson: any) => {
        schedule.push({
          lessonID: lesson.id,
          lessonTitle: lesson.title,
          chapterTitle: chapter.title,
          releaseDate: this.calculateReleaseDate(currentDate, releaseCount, course.dripInterval, course.dripCount),
          orderIndex: lesson.orderIndex,
        });
        releaseCount++;
      });
    });

    return schedule;
  }

  private calculateDripScheduleForEnrollment(course: any, enrollmentDate: Date) {
    const schedule: any[] = [];
    let releaseCount = 0;

    course.chapters.forEach((chapter: any) => {
      chapter.lessons.forEach((lesson: any) => {
        schedule.push({
          lessonID: lesson.id,
          lessonTitle: lesson.title,
          chapterTitle: chapter.title,
          releaseDate: this.calculateReleaseDate(enrollmentDate, releaseCount, course.dripInterval, course.dripCount),
          isAvailable: this.isLessonAvailable(enrollmentDate, releaseCount, course.dripInterval, course.dripCount),
          orderIndex: lesson.orderIndex,
        });
        releaseCount++;
      });
    });

    return schedule;
  }

  private calculateReleaseDate(startDate: Date, releaseCount: number, interval: string, count: number) {
    const intervalCount = Math.floor(releaseCount / (count || 1));

    switch (interval) {
      case DripInterval.DAILY:
        return addDays(startDate, intervalCount);
      case DripInterval.WEEKLY:
        return addWeeks(startDate, intervalCount);
      case DripInterval.MONTHLY:
        return addMonths(startDate, intervalCount);
      default:
        return startDate;
    }
  }

  private isLessonAvailable(enrollmentDate: Date, releaseCount: number, interval: string, count: number) {
    const releaseDate = this.calculateReleaseDate(enrollmentDate, releaseCount, interval, count);
    return new Date() >= releaseDate;
  }

  private async recalculateDripDelays(courseID: string, settings: UpdateDripSchedule) {
    // Implementation for recalculating drip delays based on new settings
    // This would update the dripDelay field on chapters and lessons
  }
}
