import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { UpdatePaywallSettingsDto, CreatePaymentLinkDto } from './dto/paywall.dto';

@Injectable()
export class PaywallService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaywallSettings(courseId: string) {
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
      isEnabled: course.price !== null && course.price > 0,
      pricingType: course.pricingType,
      price: course.price,
      currency: course.currency,
      allowInstallments: course.allowInstallments,
      allowSubscriptions: course.allowSubscriptions,
      monthlyPrice: course.monthlyPrice,
      annualPrice: course.annualPrice,
      installmentCount: course.installmentCount,
      installmentAmount: course.installmentAmount,
      previewContent: this.getPreviewContent(course),
    };
  }

  async updatePaywallSettings(courseId: string, updateDto: UpdatePaywallSettingsDto, coachId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    // Update course pricing settings
    const updatedCourse = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        // Update pricing based on payment options
        ...(updateDto.paymentOptions && updateDto.paymentOptions.length > 0 && {
          price: updateDto.paymentOptions[0].price,
          pricingType: updateDto.paymentOptions[0].type,
          allowInstallments: updateDto.paymentOptions.some(option => option.type === 'installment'),
          allowSubscriptions: updateDto.paymentOptions.some(option => option.type === 'recurring'),
        }),
      },
    });

    // Update preview content settings
    if (updateDto.previewContent) {
      await this.updatePreviewContent(courseId, updateDto.previewContent);
    }

    return {
      courseId: updatedCourse.id,
      settings: updateDto,
      message: 'Paywall settings updated successfully',
    };
  }

  async createPaymentLink(courseId: string, createDto: CreatePaymentLinkDto, coachId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    // Create payment request
    const paymentRequest = await this.prisma.paymentRequest.create({
      data: {
        createdByID: coachId,
        createdByType: 'coach',
        payerID: coachId, // Temporary - will be updated when actual user pays
        payerType: 'client',
        type: 'course_payment',
        courseID: courseId,
        amount: createDto.customAmount || course.price || 0,
        currency: course.currency || 'USD',
        description: `Access to course: ${course.title}`,
        expiresAt: createDto.expiryDate ? new Date(createDto.expiryDate) : undefined,
      },
    });

    // Generate payment link URL (this would integrate with Stripe or other payment processor)
    const paymentLinkUrl = `${process.env.APP_URL}/payment/${paymentRequest.id}`;

    // Update payment request with the generated link
    await this.prisma.paymentRequest.update({
      where: { id: paymentRequest.id },
      data: { paymentLinkUrl },
    });

    return {
      paymentRequestId: paymentRequest.id,
      paymentLink: paymentLinkUrl,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      expiresAt: paymentRequest.expiresAt,
    };
  }

  async checkCourseAccess(courseId: string, userId: string) {
    // Check if user has enrollment or payment for this course
    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: {
        courseID: courseId,
        clientID: userId,
        status: 'active',
      },
    });

    const hasAccess = !!enrollment;
    const isPreview = !hasAccess;

    return {
      hasAccess,
      isPreview,
      enrollment: enrollment || null,
    };
  }

  async getPaywallAnalytics(courseId: string, coachId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, coachID: coachId },
    });

    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }

    // Get payment and enrollment analytics
    const totalEnrollments = await this.prisma.courseEnrollment.count({
      where: { courseID: courseId },
    });

    const totalRevenue = await this.prisma.transaction.aggregate({
      where: {
        courseID: courseId,
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    });

    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        courseID: courseId,
        status: 'completed',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      courseId,
      totalEnrollments,
      totalRevenue: totalRevenue._sum.amount || 0,
      currency: course.currency,
      recentTransactions,
      conversionRate: totalEnrollments > 0 ? (totalEnrollments / (totalEnrollments * 1.2)) * 100 : 0, // Simplified calculation
    };
  }

  private getPreviewContent(course: any) {
    const freeChapters = course.chapters.filter((chapter: any, index: number) => index < 1); // First chapter free by default
    const freeLessons = course.chapters.flatMap((chapter: any) =>
      chapter.lessons.filter((lesson: any) => lesson.isPreview)
    );

    return {
      freeChapterIds: freeChapters.map((chapter: any) => chapter.id),
      freeLessonIds: freeLessons.map((lesson: any) => lesson.id),
    };
  }

  private async updatePreviewContent(courseId: string, previewContent: any) {
    // Mark lessons as preview or not based on settings
    if (previewContent.freeLessonIds) {
      // First, set all lessons to not preview
      await this.prisma.courseLesson.updateMany({
        where: {
          chapter: { courseID: courseId },
        },
        data: { isLocked: true },
      });

      // Then set specified lessons as preview
      await this.prisma.courseLesson.updateMany({
        where: {
          id: { in: previewContent.freeLessonIds },
        },
        data: { isLocked: false },
      });
    }
  }
}
