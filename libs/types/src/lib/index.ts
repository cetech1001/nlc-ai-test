export * from './auth';
export * from './coach';
export * from './dashboard';
export * from './transaction';
export * from './plan';
export * from './calendar';
export * from './calendly';
export * from './payment';
export * from './filters';
export * from './data-table';
export * from './menu';
export * from './admin';
export * from './agent';
export * from './client';
export * from './coach-ai-agent';
export * from './content';
export * from './course';
export * from './notification';
export * from './system-setting';

// types.ts

// Enums
export enum LeadType {
  coach_lead = 'coach_lead',
  admin_lead = 'admin_lead',
}

export enum TransactionStatus {
  pending = 'pending',
  processing = 'processing',
  completed = 'completed',
  failed = 'failed',
  canceled = 'canceled',
  refunded = 'refunded',
  partially_refunded = 'partially_refunded',
}

export enum PaymentMethod {
  credit_card = 'credit_card',
  debit_card = 'debit_card',
  paypal = 'paypal',
  bank_transfer = 'bank_transfer',
  stripe = 'stripe',
  manual = 'manual',
}

export enum InvoiceStatus {
  draft = 'draft',
  sent = 'sent',
  paid = 'paid',
  overdue = 'overdue',
  canceled = 'canceled',
  refunded = 'refunded',
}

export enum SubscriptionStatus {
  active = 'active',
  canceled = 'canceled',
  expired = 'expired',
  past_due = 'past_due',
  trialing = 'trialing',
  incomplete = 'incomplete',
  incomplete_expired = 'incomplete_expired',
  unpaid = 'unpaid',
}

export enum BillingCycle {
  monthly = 'monthly',
  annual = 'annual',
}

export interface DailyKpis {
  id: string;
  coachId: string;
  date: Date;
  totalClients?: number | null;
  newClients?: number | null;
  churnedClients?: number | null;
  activeClients?: number | null;
  totalInteractions?: number | null;
  avgEngagementScore?: number | null;
  contentPiecesPublished?: number | null;
  totalContentViews?: number | null;
  avgContentEngagement?: number | null;
  newEnrollments?: number | null;
  courseCompletions?: number | null;
  avgCourseProgress?: number | null;
  aiRequests?: number | null;
  aiTokensUsed?: number | null;
  emailsSent?: number | null;
  emailsOpened?: number | null;
  emailsClicked?: number | null;
  createdAt?: Date | null;
  coaches: Coaches;
}

export interface EmailAccounts {
  id: string;
  coachId: string;
  emailAddress: string;
  provider: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  isPrimary?: boolean | null;
  isActive?: boolean | null;
  syncEnabled?: boolean | null;
  lastSyncAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  coaches: Coaches;
  emailThreads: EmailThreads[];
}

export interface EmailMessages {
  id: string;
  threadId: string;
  messageId: string;
  senderEmail: string;
  recipientEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  subject?: string | null;
  bodyText?: string | null;
  bodyHtml?: string | null;
  attachments?: any;
  aiProcessed?: boolean | null;
  sentimentScore?: number | null;
  intentCategory?: string | null;
  suggestedActions?: any;
  sentAt: Date;
  receivedAt?: Date | null;
  createdAt?: Date | null;
  emailThreads: EmailThreads;
}

export interface EmailTemplates {
  id: string;
  coachId: string;
  name: string;
  category?: string | null;
  subjectTemplate?: string | null;
  bodyTemplate: string;
  isAiGenerated?: boolean | null;
  generationPrompt?: string | null;
  usageCount?: number | null;
  lastUsedAt?: Date | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  coaches: Coaches;
}

export interface EmailThreads {
  id: string;
  coachId: string;
  clientId?: string | null;
  emailAccountId: string;
  threadId: string;
  subject?: string | null;
  participants: string[];
  status?: string | null;
  isRead?: boolean | null;
  priority?: string | null;
  messageCount?: number | null;
  lastMessageAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  emailMessages: EmailMessages[];
  clients?: Clients;
  coaches: Coaches;
  emailAccounts: EmailAccounts;
}

export interface Integrations {
  id: string;
  coachId: string;
  integrationType: string;
  platformName: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  apiKey?: string | null;
  webhookSecret?: string | null;
  config?: any;
  syncSettings?: any;
  isActive?: boolean | null;
  lastSyncAt?: Date | null;
  syncError?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  coaches: Coaches;
  webhookEvents: WebhookEvents[];
}

export interface PlatformAnalytics {
  id: string;
  date: Date;
  totalCoaches?: number | null;
  activeCoaches?: number | null;
  newCoaches?: number | null;
  churnedCoaches?: number | null;
  totalRevenue?: number | null;
  monthlyRecurringRevenue?: number | null;
  churnRate?: number | null;
  totalAiRequests?: number | null;
  totalAiTokens?: number | null;
  totalEmailsProcessed?: number | null;
  avgResponseTimeMs?: number | null;
  uptimePercentage?: number | null;
  createdAt?: Date | null;
}

export interface WebhookEvents {
  id: string;
  integrationId?: string | null;
  eventType: string;
  eventData: any;
  sourcePlatform: string;
  status?: string | null;
  processedAt?: Date | null;
  errorMessage?: string | null;
  retryCount?: number | null;
  createdAt?: Date | null;
  integrations?: Integrations;
}

export interface Transactions {
  id: string;
  coachId: string;
  subscriptionId?: string | null;
  planId: string;
  amount: number;
  currency?: string | null;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  stripePaymentId?: string | null;
  paypalOrderId?: string | null;
  invoiceNumber?: string | null;
  invoiceDate: Date;
  dueDate?: Date | null;
  paidAt?: Date | null;
  description?: string | null;
  metadata?: any;
  failureReason?: string | null;
  refundReason?: string | null;
  refundedAmount?: number | null;
  createdAt: Date;
  updatedAt: Date;
  coach: Coaches;
  subscription?: Subscriptions;
  plan: Plans;
  Invoices: Invoices[];
}

export interface PaymentMethods {
  id: string;
  coachId: string;
  type: PaymentMethod;
  isDefault?: boolean | null;
  isActive?: boolean | null;
  cardLast4?: string | null;
  cardBrand?: string | null;
  cardExpMonth?: number | null;
  cardExpYear?: number | null;
  stripePaymentMethodId?: string | null;
  paypalEmail?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  coach: Coaches;
}

export interface Invoices {
  id: string;
  coachId: string;
  subscriptionId?: string | null;
  transactionId?: string | null;
  invoiceNumber: string;
  amount: number;
  currency?: string | null;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date | null;
  lineItems: any;
  subtotal: number;
  taxRate?: number | null;
  taxAmount?: number | null;
  discountAmount?: number | null;
  total: number;
  notes?: string | null;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  coach: Coaches;
  subscription?: Subscriptions;
  transaction?: Transactions;
}

export interface Plans {
  id: string;
  name: string;
  description?: string | null;
  monthlyPrice: number;
  annualPrice: number;
  maxClients?: number | null;
  maxAiAgents?: number | null;
  features?: any;
  isActive?: boolean | null;
  isDeleted?: boolean | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptions: Subscriptions[];
  transactions: Transactions[];
  PaymentLinks: PaymentLinks[];
}

export interface Subscriptions {
  id: string;
  coachId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date | null;
  cancelReason?: string | null;
  trialStart?: Date | null;
  trialEnd?: Date | null;
  nextBillingDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  coach: Coaches;
  plan: Plans;
  transactions: Transactions[];
  invoices: Invoices[];
}

export interface Leads {
  id: string;
  coachId?: string | null;
  leadType: LeadType;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  status: string;
  meetingDate?: Date | null;
  meetingTime?: string | null;
  notes?: string | null;
  lastContactedAt?: Date | null;
  convertedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  coach?: Coaches;
}

export interface ActivityLogs {
  id: string;
  userId: string;
  userType: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface PaymentLinks {
  id: string;
  coachId: string;
  planId: string;
  stripePaymentLinkId: string;
  paymentLinkUrl: string;
  amount: number;
  currency?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  paymentsReceived?: number | null;
  totalAmountReceived?: number | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  coach: Coaches;
  plan: Plans;
}
