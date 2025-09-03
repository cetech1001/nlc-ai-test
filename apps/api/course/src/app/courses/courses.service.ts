import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import {
  CourseEvent,
  CourseQueryParams, CourseStats,
  CreateCourse,
  ExtendedCourse,
  Paginated, UpdateCourse
} from "@nlc-ai/api-types";
import {Course} from "@prisma/client";

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async create(createCourseDto: CreateCourse): Promise<ExtendedCourse> {
    const { chapters, ...courseData } = createCourseDto;

    const course = await this.prisma.$transaction(async (tx) => {
      const newCourse = await tx.course.create({
        // @ts-ignore
        data: {
          ...courseData,
          totalChapters: chapters?.length || 0,
          totalLessons: chapters?.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0) || 0,
        },
        include: {
          chapters: {
            include: {
              lessons: true,
            },
            orderBy: { orderIndex: 'asc' },
          }
        },
      });

      if (chapters && chapters.length > 0) {
        for (const chapterDto of chapters) {
          const { lessons, ...chapterData } = chapterDto;

          const chapter = await tx.courseChapter.create({
            data: {
              ...chapterData,
              courseID: newCourse.id,
            },
          });

          if (lessons && lessons.length > 0) {
            await tx.courseLesson.createMany({
              data: lessons.map((lesson) => ({
                ...lesson,
                chapterID: chapter.id,
              })),
            });
          }
        }

        return tx.course.findUnique({
          where: { id: newCourse.id },
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
      }

      return newCourse;
    });

    if (course) {
      await this.outboxService.saveAndPublishEvent<CourseEvent>(
        {
          eventType: 'course.created',
          schemaVersion: 1,
          payload: {
            courseID: course.id,
            coachID: course.coachID,
            title: course.title,
            pricingType: course.pricingType,
            price: course.price,
            createdAt: course.createdAt.toISOString(),
          },
        },
        'course.created',
      );
    }

    return this.mapToResponseDto(course);
  }

  async findAll(query: CourseQueryParams): Promise<Paginated<ExtendedCourse>> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      difficultyLevel,
      pricingType,
      isActive,
      isPublished,
      coachID,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      createdAfter,
      createdBefore,
    } = query;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (difficultyLevel) where.difficultyLevel = difficultyLevel;
    if (pricingType) where.pricingType = pricingType;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (typeof isPublished === 'boolean') where.isPublished = isPublished;
    if (coachID) where.coachID = coachID;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) where.createdAt.gte = new Date(createdAfter);
      if (createdBefore) where.createdAt.lte = new Date(createdBefore);
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const response = await this.prisma.paginate<Course>(this.prisma.course, {
      where,
      page,
      limit,
      orderBy,
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
    })

    return {
      ...response,
      data: response.data.map((course) =>
        this.mapToResponseDto(course)),
    };
  }

  async findOne(id: string): Promise<ExtendedCourse> {
    const course = await this.prisma.course.findUnique({
      where: { id },
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
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return this.mapToResponseDto(course);
  }

  async update(id: string, updateCourseDto: UpdateCourse): Promise<ExtendedCourse> {
    const existingCourse = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
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

    await this.outboxService.saveAndPublishEvent<CourseEvent>(
      {
        eventType: 'course.updated',
        schemaVersion: 1,
        payload: {
          title: updatedCourse.title,
          courseID: id,
          coachID: updatedCourse.coachID,
          changes: updateCourseDto,
          updatedAt: updatedCourse.updatedAt.toISOString(),
        },
      },
      'course.updated',
    );

    return this.mapToResponseDto(updatedCourse);
  }

  async remove(id: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    await this.prisma.course.delete({
      where: { id },
    });

    await this.outboxService.saveAndPublishEvent<CourseEvent>(
      {
        eventType: 'course.deleted',
        schemaVersion: 1,
        payload: {
          courseID: id,
          coachID: course.coachID,
          title: course.title,
          deletedAt: new Date().toISOString(),
        },
      },
      'course.deleted',
    );
  }

  async publish(id: string): Promise<ExtendedCourse> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (course.isPublished) {
      throw new BadRequestException('Course is already published');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: { isPublished: true },
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

    await this.outboxService.saveAndPublishEvent<CourseEvent>(
      {
        eventType: 'course.published',
        schemaVersion: 1,
        payload: {
          courseID: id,
          coachID: course.coachID,
          title: course.title,
          publishedAt: new Date().toISOString(),
        },
      },
      'course.published',
    );

    return this.mapToResponseDto(updatedCourse);
  }

  async unpublish(id: string): Promise<ExtendedCourse> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (!course.isPublished) {
      throw new BadRequestException('Course is not published');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: { isPublished: false },
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

    await this.outboxService.saveAndPublishEvent<CourseEvent>(
      {
        eventType: 'course.unpublished',
        schemaVersion: 1,
        payload: {
          courseID: id,
          coachID: course.coachID,
          title: course.title,
          unpublishedAt: new Date().toISOString(),
        },
      },
      'course.unpublished',
    );

    return this.mapToResponseDto(updatedCourse);
  }

  async getStats(id: string): Promise<CourseStats> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            lessonProgress: true,
          },
        },
        chapters: {
          include: {
            lessons: true,
          },
        },
        transactions: {
          where: { status: 'completed' },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const totalRevenue = course.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalEnrollments = course.enrollments.length;
    const activeEnrollments = course.enrollments.filter((e) => e.status === 'active').length;
    const completedEnrollments = course.enrollments.filter((e) => e.status === 'completed').length;
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

    const averageProgress = totalEnrollments > 0
      ? course.enrollments.reduce((sum, enrollment) => sum + Number(enrollment.progressPercentage), 0) / totalEnrollments
      : 0;

    // Find most popular chapter
    const chapterCompletions = new Map<string, number>();
    course.enrollments.forEach((enrollment) => {
      enrollment.lessonProgress.forEach((progress) => {
        if (progress.isCompleted) {
          const lesson = course.chapters
            .flatMap((c) => c.lessons)
            .find((l) => l.id === progress.lessonID);
          if (lesson) {
            const count = chapterCompletions.get(lesson.chapterID) || 0;
            chapterCompletions.set(lesson.chapterID, count + 1);
          }
        }
      });
    });

    let popularChapter;
    if (chapterCompletions.size > 0) {
      const [chapterID, completionCount] = Array.from(chapterCompletions.entries()).reduce((a, b) =>
        a[1] > b[1] ? a : b,
      );
      const chapter = course.chapters.find((c) => c.id === chapterID);
      if (chapter) {
        popularChapter = {
          id: chapter.id,
          title: chapter.title,
          completionCount,
        };
      }
    }

    // Calculate drop-off points
    const dropoffPoints = course.chapters.map((chapter) => {
      const chapterLessons = chapter.lessons.length;
      const chapterCompletions = course.enrollments.filter((enrollment) => {
        const completedLessonsInChapter = enrollment.lessonProgress.filter(
          (progress) => progress.isCompleted &&
            chapter.lessons.some((lesson) => lesson.id === progress.lessonID)
        ).length;
        return completedLessonsInChapter === chapterLessons;
      }).length;

      const dropoffRate = totalEnrollments > 0
        ? ((totalEnrollments - chapterCompletions) / totalEnrollments) * 100
        : 0;

      return {
        chapterID: chapter.id,
        chapterTitle: chapter.title,
        dropoffRate,
      };
    });

    return {
      courseID: id,
      totalEnrollments,
      activeEnrollments,
      completionRate,
      averageProgress,
      totalRevenue,
      popularChapter,
      dropoffPoints,
    };
  }

  async findByCoach(coachID: string, query: CourseQueryParams): Promise<Paginated<ExtendedCourse>> {
    return this.findAll({ ...query, coachID });
  }

  private mapToResponseDto(course: any): ExtendedCourse {
    return {
      id: course.id,
      coachID: course.coachID,
      title: course.title,
      description: course.description,
      category: course.category,
      difficultyLevel: course.difficultyLevel,
      pricingType: course.pricingType,
      price: course.price,
      currency: course.currency,
      installmentCount: course.installmentCount,
      installmentAmount: course.installmentAmount,
      installmentInterval: course.installmentInterval,
      monthlyPrice: course.monthlyPrice,
      annualPrice: course.annualPrice,
      thumbnailUrl: course.thumbnailUrl,
      estimatedDurationHours: course.estimatedDurationHours,
      totalChapters: course.totalChapters,
      totalLessons: course.totalLessons,
      totalEnrollments: course.totalEnrollments,
      activeEnrollments: course.activeEnrollments,
      completionRate: Number(course.completionRate),
      isActive: course.isActive,
      isPublished: course.isPublished,
      allowInstallments: course.allowInstallments,
      allowSubscriptions: course.allowSubscriptions,
      isDripEnabled: course.isDripEnabled,
      dripInterval: course.dripInterval,
      dripCount: course.dripCount,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      chapters: course.chapters?.map((chapter: any) => ({
        id: chapter.id,
        courseID: chapter.courseID,
        title: chapter.title,
        description: chapter.description,
        orderIndex: chapter.orderIndex,
        dripDelay: chapter.dripDelay,
        isLocked: chapter.isLocked,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
        lessons: chapter.lessons?.map((lesson: any) => ({
          id: lesson.id,
          chapterID: lesson.chapterID,
          title: lesson.title,
          description: lesson.description,
          orderIndex: lesson.orderIndex,
          lessonType: lesson.lessonType,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          videoDuration: lesson.videoDuration,
          pdfUrl: lesson.pdfUrl,
          dripDelay: lesson.dripDelay,
          isLocked: lesson.isLocked,
          estimatedMinutes: lesson.estimatedMinutes,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
        })),
      })),
    };
  }
}
