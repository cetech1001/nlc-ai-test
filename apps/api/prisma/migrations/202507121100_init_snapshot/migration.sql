-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'annual');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'sent', 'paid', 'overdue', 'canceled', 'refunded');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('coach_lead', 'admin_lead');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'stripe', 'manual');

-- CreateEnum
CREATE TYPE "Providers" AS ENUM ('google');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'expired', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'canceled', 'refunded', 'partially_refunded');

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "userType" VARCHAR(20) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(50),
    "entityID" UUID,
    "metadata" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50) DEFAULT 'admin',
    "isActive" BOOLEAN DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "avatarUrl" TEXT,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_agents" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "defaultConfig" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interactions" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "agentID" UUID NOT NULL,
    "clientID" UUID,
    "interactionType" VARCHAR(50) NOT NULL,
    "inputData" JSONB NOT NULL,
    "outputData" JSONB NOT NULL,
    "tokensUsed" INTEGER DEFAULT 0,
    "processingTimeMs" INTEGER,
    "confidenceScore" DECIMAL(3,2),
    "status" VARCHAR(50) DEFAULT 'completed',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "avatarUrl" TEXT,
    "status" VARCHAR(50) DEFAULT 'active',
    "source" VARCHAR(100),
    "tags" TEXT[],
    "lastInteractionAt" TIMESTAMPTZ(6),
    "totalInteractions" INTEGER DEFAULT 0,
    "engagementScore" DECIMAL(3,2) DEFAULT 0.00,
    "customFields" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_ai_agents" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "agentID" UUID NOT NULL,
    "isEnabled" BOOLEAN DEFAULT true,
    "customConfig" JSONB DEFAULT '{}',
    "fineTunedModelID" VARCHAR(255),
    "totalRequests" INTEGER DEFAULT 0,
    "totalTokensUsed" BIGINT DEFAULT 0,
    "lastUsedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaches" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "businessName" VARCHAR(255),
    "phone" VARCHAR(20),
    "avatarUrl" TEXT,
    "bio" TEXT,
    "websiteUrl" TEXT,
    "timezone" VARCHAR(50) DEFAULT 'UTC',
    "subscriptionStatus" VARCHAR(50) DEFAULT 'trial',
    "subscriptionPlan" VARCHAR(50),
    "subscriptionEndsAt" TIMESTAMPTZ(6),
    "stripeCustomerID" VARCHAR(255),
    "isActive" BOOLEAN DEFAULT true,
    "isVerified" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "deletedAt" TIMESTAMPTZ(6),
    "lastLoginAt" TIMESTAMPTZ(6),
    "onboardingCompleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "provider" "Providers",
    "providerID" TEXT,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "coachID" UUID,

    CONSTRAINT "content_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_pieces" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "contentType" VARCHAR(50) NOT NULL,
    "platform" VARCHAR(50),
    "platformID" VARCHAR(255),
    "url" TEXT,
    "description" TEXT,
    "tags" TEXT[],
    "thumbnailUrl" TEXT,
    "durationSeconds" INTEGER,
    "views" INTEGER DEFAULT 0,
    "likes" INTEGER DEFAULT 0,
    "comments" INTEGER DEFAULT 0,
    "shares" INTEGER DEFAULT 0,
    "engagementRate" DECIMAL(5,2) DEFAULT 0.00,
    "aiAnalyzed" BOOLEAN DEFAULT false,
    "performancePrediction" DECIMAL(3,2),
    "topicCategories" TEXT[],
    "suggestedImprovements" JSONB DEFAULT '[]',
    "status" VARCHAR(50) DEFAULT 'draft',
    "publishedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "categoryID" UUID NOT NULL,

    CONSTRAINT "content_pieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_suggestions" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "contentType" VARCHAR(50) NOT NULL,
    "platform" VARCHAR(50),
    "description" TEXT,
    "reasoning" TEXT,
    "promptUsed" TEXT,
    "confidenceScore" DECIMAL(3,2),
    "trendData" JSONB DEFAULT '{}',
    "status" VARCHAR(50) DEFAULT 'pending',
    "feedback" TEXT,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" UUID NOT NULL,
    "courseID" UUID NOT NULL,
    "clientID" UUID NOT NULL,
    "enrolledAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "progressPercentage" DECIMAL(5,2) DEFAULT 0.00,
    "currentModule" INTEGER DEFAULT 1,
    "modulesCompleted" INTEGER DEFAULT 0,
    "lastActivityAt" TIMESTAMPTZ(6),
    "totalTimeSpentMinutes" INTEGER DEFAULT 0,
    "loginCount" INTEGER DEFAULT 0,
    "daysSinceLastLogin" INTEGER DEFAULT 0,
    "status" VARCHAR(50) DEFAULT 'active',
    "dropoutRiskScore" DECIMAL(3,2) DEFAULT 0.00,
    "recommendedActions" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "difficultyLevel" VARCHAR(50),
    "platform" VARCHAR(50),
    "platformCourseID" VARCHAR(255),
    "platformUrl" TEXT,
    "totalModules" INTEGER DEFAULT 0,
    "estimatedDurationHours" INTEGER,
    "totalEnrollments" INTEGER DEFAULT 0,
    "activeEnrollments" INTEGER DEFAULT 0,
    "completionRate" DECIMAL(5,2) DEFAULT 0.00,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "thumbnailUrl" TEXT NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_kpis" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "date" DATE NOT NULL,
    "totalClients" INTEGER DEFAULT 0,
    "newClients" INTEGER DEFAULT 0,
    "churnedClients" INTEGER DEFAULT 0,
    "activeClients" INTEGER DEFAULT 0,
    "totalInteractions" INTEGER DEFAULT 0,
    "avgEngagementScore" DECIMAL(5,2) DEFAULT 0.00,
    "contentPiecesPublished" INTEGER DEFAULT 0,
    "totalContentViews" INTEGER DEFAULT 0,
    "avgContentEngagement" DECIMAL(5,2) DEFAULT 0.00,
    "newEnrollments" INTEGER DEFAULT 0,
    "courseCompletions" INTEGER DEFAULT 0,
    "avgCourseProgress" DECIMAL(5,2) DEFAULT 0.00,
    "aiRequests" INTEGER DEFAULT 0,
    "aiTokensUsed" INTEGER DEFAULT 0,
    "emailsSent" INTEGER DEFAULT 0,
    "emailsOpened" INTEGER DEFAULT 0,
    "emailsClicked" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_accounts" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "emailAddress" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMPTZ(6),
    "isPrimary" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "syncEnabled" BOOLEAN DEFAULT true,
    "lastSyncAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_messages" (
    "id" UUID NOT NULL,
    "threadID" UUID NOT NULL,
    "messageID" VARCHAR(255) NOT NULL,
    "senderEmail" VARCHAR(255) NOT NULL,
    "recipientEmails" TEXT[],
    "ccEmails" TEXT[],
    "bccEmails" TEXT[],
    "subject" VARCHAR(500),
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "attachments" JSONB DEFAULT '[]',
    "aiProcessed" BOOLEAN DEFAULT false,
    "sentimentScore" DECIMAL(3,2),
    "intentCategory" VARCHAR(100),
    "suggestedActions" JSONB DEFAULT '[]',
    "sentAt" TIMESTAMPTZ(6) NOT NULL,
    "receivedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_sequences" (
    "id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "sequence" JSONB NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "coachID" UUID,
    "leadID" UUID NOT NULL,

    CONSTRAINT "email_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "subjectTemplate" VARCHAR(500),
    "bodyTemplate" TEXT NOT NULL,
    "isAiGenerated" BOOLEAN DEFAULT false,
    "generationPrompt" TEXT,
    "usageCount" INTEGER DEFAULT 0,
    "lastUsedAt" TIMESTAMPTZ(6),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_threads" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "clientID" UUID,
    "emailAccountID" UUID NOT NULL,
    "threadID" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500),
    "participants" TEXT[],
    "status" VARCHAR(50) DEFAULT 'active',
    "isRead" BOOLEAN DEFAULT false,
    "priority" VARCHAR(20) DEFAULT 'normal',
    "messageCount" INTEGER DEFAULT 0,
    "lastMessageAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "integrationType" VARCHAR(50) NOT NULL,
    "platformName" VARCHAR(100) NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMPTZ(6),
    "apiKey" TEXT,
    "webhookSecret" VARCHAR(255),
    "config" JSONB DEFAULT '{}',
    "syncSettings" JSONB DEFAULT '{}',
    "isActive" BOOLEAN DEFAULT true,
    "lastSyncAt" TIMESTAMPTZ(6),
    "syncError" TEXT,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "subscriptionID" UUID,
    "transactionID" UUID,
    "invoiceNumber" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "lineItems" JSONB NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "taxRate" DOUBLE PRECISION,
    "taxAmount" INTEGER,
    "discountAmount" INTEGER,
    "total" INTEGER NOT NULL,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "coachID" UUID,
    "leadType" "LeadType" NOT NULL DEFAULT 'coach_lead',
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "source" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'contacted',
    "meetingDate" TIMESTAMPTZ(6),
    "meetingTime" VARCHAR(20),
    "notes" TEXT,
    "lastContactedAt" TIMESTAMPTZ(6),
    "convertedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "answers" JSONB,
    "qualified" BOOLEAN DEFAULT false,
    "submittedAt" TIMESTAMPTZ(6),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "coachID" UUID,
    "adminID" UUID,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "isRead" BOOLEAN DEFAULT false,
    "readAt" TIMESTAMPTZ(6),
    "priority" VARCHAR(20) DEFAULT 'normal',
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_links" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "planID" UUID NOT NULL,
    "stripePaymentLinkID" TEXT NOT NULL,
    "paymentLinkUrl" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "paymentsReceived" INTEGER NOT NULL DEFAULT 0,
    "totalAmountReceived" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cardLast4" TEXT,
    "cardBrand" TEXT,
    "cardExpMonth" INTEGER,
    "cardExpYear" INTEGER,
    "stripePaymentMethodID" TEXT,
    "paypalEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPrice" INTEGER NOT NULL,
    "annualPrice" INTEGER NOT NULL,
    "maxClients" INTEGER,
    "maxAiAgents" INTEGER,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "color" VARCHAR(50) DEFAULT '#7B21BA',

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_analytics" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "totalCoaches" INTEGER DEFAULT 0,
    "activeCoaches" INTEGER DEFAULT 0,
    "newCoaches" INTEGER DEFAULT 0,
    "churnedCoaches" INTEGER DEFAULT 0,
    "totalRevenue" DECIMAL(12,2) DEFAULT 0.00,
    "monthlyRecurringRevenue" DECIMAL(12,2) DEFAULT 0.00,
    "churnRate" DECIMAL(5,2) DEFAULT 0.00,
    "totalAiRequests" INTEGER DEFAULT 0,
    "totalAiTokens" INTEGER DEFAULT 0,
    "totalEmailsProcessed" INTEGER DEFAULT 0,
    "avgResponseTimeMs" INTEGER DEFAULT 0,
    "uptimePercentage" DECIMAL(5,2) DEFAULT 100.00,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_emails" (
    "id" UUID NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "body" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "scheduledFor" TIMESTAMPTZ(6) NOT NULL,
    "sentAt" TIMESTAMPTZ(6),
    "status" VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    "emailProvider" VARCHAR(50),
    "openedAt" TIMESTAMPTZ(6),
    "clickedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "coachID" UUID,
    "emailSequenceID" UUID,
    "leadID" UUID,
    "errorMessage" JSONB,
    "providerMessageID" TEXT,
    "metadata" JSONB,
    "clientID" UUID,

    CONSTRAINT "scheduled_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "planID" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'monthly',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "subscriptionID" UUID,
    "planID" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "stripePaymentID" TEXT,
    "paypalOrderID" TEXT,
    "invoiceNumber" TEXT,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "description" TEXT,
    "metadata" JSONB,
    "failureReason" TEXT,
    "refundReason" TEXT,
    "refundedAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentMethod" "PaymentMethodType" NOT NULL DEFAULT 'stripe',

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL,
    "integrationID" UUID,
    "eventType" VARCHAR(100) NOT NULL,
    "eventData" JSONB NOT NULL,
    "sourcePlatform" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending',
    "processedAt" TIMESTAMPTZ(6),
    "errorMessage" TEXT,
    "retryCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "activity_logs_userID_userType_idx" ON "activity_logs"("userID" ASC, "userType" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ai_agents_name_key" ON "ai_agents"("name" ASC);

-- CreateIndex
CREATE INDEX "idx_ai_interactions_agent_id" ON "ai_interactions"("agentID" ASC);

-- CreateIndex
CREATE INDEX "idx_ai_interactions_coach_id" ON "ai_interactions"("coachID" ASC);

-- CreateIndex
CREATE INDEX "idx_ai_interactions_created_at" ON "ai_interactions"("createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "clients_coachID_email_key" ON "clients"("coachID" ASC, "email" ASC);

-- CreateIndex
CREATE INDEX "idx_clients_coach_id" ON "clients"("coachID" ASC);

-- CreateIndex
CREATE INDEX "idx_clients_email" ON "clients"("email" ASC);

-- CreateIndex
CREATE INDEX "idx_clients_last_interaction" ON "clients"("lastInteractionAt" ASC);

-- CreateIndex
CREATE INDEX "idx_clients_status" ON "clients"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "coach_ai_agents_coachID_agentID_key" ON "coach_ai_agents"("coachID" ASC, "agentID" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "coaches_email_key" ON "coaches"("email" ASC);

-- CreateIndex
CREATE INDEX "idx_coaches_created_at" ON "coaches"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "idx_coaches_email" ON "coaches"("email" ASC);

-- CreateIndex
CREATE INDEX "idx_coaches_subscription_status" ON "coaches"("subscriptionStatus" ASC);

-- CreateIndex
CREATE INDEX "content_categories_coachID_idx" ON "content_categories"("coachID" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "content_categories_name_coachID_key" ON "content_categories"("name" ASC, "coachID" ASC);

-- CreateIndex
CREATE INDEX "idx_content_pieces_coach_id" ON "content_pieces"("coachID" ASC);

-- CreateIndex
CREATE INDEX "idx_content_pieces_content_type" ON "content_pieces"("contentType" ASC);

-- CreateIndex
CREATE INDEX "idx_content_pieces_published_at" ON "content_pieces"("publishedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_courseID_clientID_key" ON "course_enrollments"("courseID" ASC, "clientID" ASC);

-- CreateIndex
CREATE INDEX "idx_course_enrollments_client_id" ON "course_enrollments"("clientID" ASC);

-- CreateIndex
CREATE INDEX "idx_course_enrollments_course_id" ON "course_enrollments"("courseID" ASC);

-- CreateIndex
CREATE INDEX "idx_course_enrollments_status" ON "course_enrollments"("status" ASC);

-- CreateIndex
CREATE INDEX "idx_courses_coach_id" ON "courses"("coachID" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "daily_kpis_coachID_date_key" ON "daily_kpis"("coachID" ASC, "date" ASC);

-- CreateIndex
CREATE INDEX "idx_daily_kpis_coach_id_date" ON "daily_kpis"("coachID" ASC, "date" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "email_accounts_coachID_emailAddress_key" ON "email_accounts"("coachID" ASC, "emailAddress" ASC);

-- CreateIndex
CREATE INDEX "idx_email_messages_sent_at" ON "email_messages"("sentAt" ASC);

-- CreateIndex
CREATE INDEX "idx_email_messages_thread_id" ON "email_messages"("threadID" ASC);

-- CreateIndex
CREATE INDEX "idx_email_threads_client_id" ON "email_threads"("clientID" ASC);

-- CreateIndex
CREATE INDEX "idx_email_threads_coach_id" ON "email_threads"("coachID" ASC);

-- CreateIndex
CREATE INDEX "idx_integrations_coach_id" ON "integrations"("coachID" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber" ASC);

-- CreateIndex
CREATE INDEX "idx_notifications_admin_id" ON "notifications"("adminID" ASC);

-- CreateIndex
CREATE INDEX "idx_notifications_coach_id" ON "notifications"("coachID" ASC);

-- CreateIndex
CREATE INDEX "idx_notifications_is_read" ON "notifications"("isRead" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_stripePaymentLinkID_key" ON "payment_links"("stripePaymentLinkID" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name" ASC);

-- CreateIndex
CREATE INDEX "idx_platform_analytics_date" ON "platform_analytics"("date" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "platform_analytics_date_key" ON "platform_analytics"("date" ASC);

-- CreateIndex
CREATE INDEX "scheduled_emails_coachID_idx" ON "scheduled_emails"("coachID" ASC);

-- CreateIndex
CREATE INDEX "scheduled_emails_emailSequenceID_idx" ON "scheduled_emails"("emailSequenceID" ASC);

-- CreateIndex
CREATE INDEX "scheduled_emails_leadID_idx" ON "scheduled_emails"("leadID" ASC);

-- CreateIndex
CREATE INDEX "scheduled_emails_scheduledFor_status_idx" ON "scheduled_emails"("scheduledFor" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_category_key_key" ON "system_settings"("category" ASC, "key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_invoiceNumber_key" ON "transactions"("invoiceNumber" ASC);

-- CreateIndex
CREATE INDEX "idx_webhook_events_integration_id" ON "webhook_events"("integrationID" ASC);

-- CreateIndex
CREATE INDEX "idx_webhook_events_status" ON "webhook_events"("status" ASC);

-- AddForeignKey
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_agentID_fkey" FOREIGN KEY ("agentID") REFERENCES "ai_agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "coach_ai_agents" ADD CONSTRAINT "coach_ai_agents_agentID_fkey" FOREIGN KEY ("agentID") REFERENCES "ai_agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "coach_ai_agents" ADD CONSTRAINT "coach_ai_agents_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "content_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "content_suggestions" ADD CONSTRAINT "content_suggestions_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_kpis" ADD CONSTRAINT "daily_kpis_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_threadID_fkey" FOREIGN KEY ("threadID") REFERENCES "email_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "email_sequences" ADD CONSTRAINT "email_sequences_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_sequences" ADD CONSTRAINT "email_sequences_leadID_fkey" FOREIGN KEY ("leadID") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "email_threads" ADD CONSTRAINT "email_threads_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "email_threads" ADD CONSTRAINT "email_threads_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "email_threads" ADD CONSTRAINT "email_threads_emailAccountID_fkey" FOREIGN KEY ("emailAccountID") REFERENCES "email_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionID_fkey" FOREIGN KEY ("subscriptionID") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_transactionID_fkey" FOREIGN KEY ("transactionID") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_planID_fkey" FOREIGN KEY ("planID") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_emails" ADD CONSTRAINT "scheduled_emails_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_emails" ADD CONSTRAINT "scheduled_emails_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_emails" ADD CONSTRAINT "scheduled_emails_emailSequenceID_fkey" FOREIGN KEY ("emailSequenceID") REFERENCES "email_sequences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_emails" ADD CONSTRAINT "scheduled_emails_leadID_fkey" FOREIGN KEY ("leadID") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planID_fkey" FOREIGN KEY ("planID") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_planID_fkey" FOREIGN KEY ("planID") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subscriptionID_fkey" FOREIGN KEY ("subscriptionID") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_integrationID_fkey" FOREIGN KEY ("integrationID") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

