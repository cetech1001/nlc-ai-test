import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { UpdateDripScheduleDto, DripInterval } from './dto/drip-schedule.dto';
import { addDays, addWeeks, addMonths } from 'date-fns';

@Injectable()
export class DripScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async getDripSchedule(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
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
      courseId: course.id,
      isDripEnabled: course.isDripEnabled,
      dripInterval: course.dripInterval,
      dripCount: course.dripCount,
      schedule: this.calculateDripSchedule(course),
    };
  }

  async updateDripSchedule(courseId: string, updateDto: UpdateDripScheduleDto, coachId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id: courseId },
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
      await this.recalculateDripDelays(courseId, updateDto);
    }

    return {
      courseId: updatedCourse.id,
      isDripEnabled: updatedCourse.isDripEnabled,
      dripInterval: updatedCourse.dripInterval,
      dripCount: updatedCourse.dripCount,
      schedule: this.calculateDripSchedule(updatedCourse),
    };
  }

  async previewDripSchedule(courseId: string, enrollmentId: string, coachId: string) {
    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: {
        id: enrollmentId,
        courseID: courseId,
        course: { coachID: coachId },
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
      enrollmentId,
      enrollmentDate,
      schedule,
    };
  }

  private calculateDripSchedule(course: any) {
    if (!course.isDripEnabled) {
      return { message: 'Drip scheduling is disabled for this course' };
    }

    const schedule = [];
    let currentDate = new Date();
    let releaseCount = 0;

    course.chapters.forEach((chapter: any) => {
      chapter.lessons.forEach((lesson: any) => {
        schedule.push({
          lessonId: lesson.id,
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
    const schedule = [];
    let releaseCount = 0;

    course.chapters.forEach((chapter: any) => {
      chapter.lessons.forEach((lesson: any) => {
        schedule.push({
          lessonId: lesson.id,
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

  private async recalculateDripDelays(courseId: string, settings: UpdateDripScheduleDto) {
    // Implementation for recalculating drip delays based on new settings
    // This would update the dripDelay field on chapters and lessons
  }
}
