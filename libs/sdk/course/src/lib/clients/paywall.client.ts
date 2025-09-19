import { BaseClient } from '@nlc-ai/sdk-core';

export interface PreviewContent {
  freeChapterIds: string[];
  freeLessonIds: string[];
  previewMessage?: string;
}

export interface PaymentOption {
  type: 'one_time' | 'recurring' | 'installment';
  price: number;
  label?: string;
  discount?: number;
  installmentCount?: number;
}

export interface UpdatePaywallSettingsRequest {
  isEnabled: boolean;
  previewContent?: PreviewContent;
  paymentOptions?: PaymentOption[];
  paywallMessage?: string;
  successRedirectUrl?: string;
}

export interface CreatePaymentLinkRequest {
  paymentType: 'one_time' | 'recurring' | 'installment';
  customAmount?: number;
  expiryDate?: string;
  successUrl?: string;
}

export interface PaywallSettings {
  courseID: string;
  isEnabled: boolean;
  pricingType: string;
  price?: number;
  currency: string;
  allowInstallments: boolean;
  allowSubscriptions: boolean;
  monthlyPrice?: number;
  annualPrice?: number;
  installmentCount?: number;
  installmentAmount?: number;
  previewContent: PreviewContent;
}

export interface PaymentLinkResponse {
  paymentRequestID: string;
  paymentLink: string;
  amount: number;
  currency: string;
  expiresAt?: Date;
}

export interface CourseAccessResponse {
  hasAccess: boolean;
  isPreview: boolean;
  enrollment?: any;
}

export interface PaywallAnalytics {
  courseID: string;
  totalEnrollments: number;
  totalRevenue: number;
  currency: string;
  recentTransactions: any[];
  conversionRate: number;
}

export class PaywallClient extends BaseClient {
  async getPaywallSettings(courseID: string): Promise<PaywallSettings> {
    const response = await this.request<PaywallSettings>(
      'GET',
      `/${courseID}/paywall/settings`
    );
    return response.data!;
  }

  async updatePaywallSettings(courseID: string, data: UpdatePaywallSettingsRequest): Promise<{
    courseID: string;
    settings: UpdatePaywallSettingsRequest;
    message: string;
  }> {
    const response = await this.request<{
      courseID: string;
      settings: UpdatePaywallSettingsRequest;
      message: string;
    }>('PUT', `/${courseID}/paywall/settings`, { body: data });
    return response.data!;
  }

  async createPaymentLink(courseID: string, data: CreatePaymentLinkRequest): Promise<PaymentLinkResponse> {
    const response = await this.request<PaymentLinkResponse>(
      'POST',
      `/${courseID}/paywall/payment-link`,
      { body: data }
    );
    return response.data!;
  }

  async checkCourseAccess(courseID: string, userID: string): Promise<CourseAccessResponse> {
    const response = await this.request<CourseAccessResponse>(
      'GET',
      `/${courseID}/paywall/access/${userID}`
    );
    return response.data!;
  }

  async getPaywallAnalytics(courseID: string): Promise<PaywallAnalytics> {
    const response = await this.request<PaywallAnalytics>(
      'GET',
      `/${courseID}/paywall/analytics`
    );
    return response.data!;
  }
}
