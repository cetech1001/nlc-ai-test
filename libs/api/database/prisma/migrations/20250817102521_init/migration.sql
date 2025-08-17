-- CreateEnum
CREATE TYPE "public"."EventOutboxStatus" AS ENUM ('pending', 'published', 'failed');

-- CreateEnum
CREATE TYPE "public"."Providers" AS ENUM ('google');

-- CreateEnum
CREATE TYPE "public"."LeadType" AS ENUM ('coach_lead', 'admin_lead');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'canceled', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "public"."PaymentMethodType" AS ENUM ('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'stripe', 'manual');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('draft', 'sent', 'paid', 'overdue', 'canceled', 'refunded');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('active', 'canceled', 'expired', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid');

-- CreateEnum
CREATE TYPE "public"."BillingCycle" AS ENUM ('monthly', 'annual');

-- CreateEnum
CREATE TYPE "public"."ClientCoachStatus" AS ENUM ('active', 'inactive', 'pending');

-- CreateEnum
CREATE TYPE "public"."ClientCoachRole" AS ENUM ('client', 'lead', 'prospect');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('pending', 'scheduled', 'processing', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced', 'simulated');

-- CreateEnum
CREATE TYPE "public"."SequenceStatus" AS ENUM ('active', 'paused', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."IntegrationType" AS ENUM ('course', 'social', 'app');

-- CreateEnum
CREATE TYPE "public"."MediaProvider" AS ENUM ('cloudinary', 'vimeo', 'cloudfront', 'aws_s3');

-- CreateEnum
CREATE TYPE "public"."MediaResourceType" AS ENUM ('image', 'video', 'raw');

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "avatarUrl" TEXT,
    "role" VARCHAR(50) DEFAULT 'admin',
    "isActive" BOOLEAN DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_agents" (
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
CREATE TABLE "public"."ai_interactions" (
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
CREATE TABLE "public"."clients" (
    "id" UUID NOT NULL,
    "passwordHash" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "provider" "public"."Providers",
    "providerID" TEXT,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "avatarUrl" TEXT,
    "source" VARCHAR(100),
    "tags" TEXT[],
    "lastInteractionAt" TIMESTAMPTZ(6),
    "totalInteractions" INTEGER DEFAULT 0,
    "engagementScore" DECIMAL(3,2) DEFAULT 0.00,
    "customFields" JSONB DEFAULT '{}',
    "isActive" BOOLEAN DEFAULT true,
    "isVerified" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "deletedAt" TIMESTAMPTZ(6),
    "lastLoginAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_coaches" (
    "id" UUID NOT NULL,
    "clientID" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "status" "public"."ClientCoachStatus" NOT NULL DEFAULT 'active',
    "role" "public"."ClientCoachRole" DEFAULT 'client',
    "assignedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" UUID,
    "notes" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "client_coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_invites" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) DEFAULT 'client',
    "message" TEXT,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "usedAt" TIMESTAMPTZ(6),
    "usedBy" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coach_ai_agents" (
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
CREATE TABLE "public"."coaches" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255),
    "provider" "public"."Providers",
    "providerID" TEXT,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "businessName" VARCHAR(255),
    "phone" VARCHAR(20),
    "avatarUrl" TEXT,
    "bio" TEXT,
    "websiteUrl" TEXT,
    "customDomain" VARCHAR(255),
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

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "coachID" UUID,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_pieces" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "categoryID" UUID NOT NULL,
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

    CONSTRAINT "content_pieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_suggestions" (
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
CREATE TABLE "public"."course_enrollments" (
    "id" UUID NOT NULL,
    "courseID" UUID NOT NULL,
    "clientID" UUID NOT NULL,
    "enrolledByCoachID" UUID,
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
CREATE TABLE "public"."courses" (
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
    "thumbnailUrl" TEXT NOT NULL,
    "totalEnrollments" INTEGER DEFAULT 0,
    "activeEnrollments" INTEGER DEFAULT 0,
    "completionRate" DECIMAL(5,2) DEFAULT 0.00,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_kpis" (
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
CREATE TABLE "public"."email_accounts" (
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
CREATE TABLE "public"."email_messages" (
    "id" UUID NOT NULL,
    "threadID" UUID NOT NULL,
    "emailTemplateID" UUID,
    "providerMessageID" VARCHAR(255) NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    "from" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500),
    "text" TEXT,
    "html" TEXT,
    "attachments" JSONB DEFAULT '[]',
    "aiProcessed" BOOLEAN DEFAULT false,
    "sentimentScore" DECIMAL(3,2),
    "intentCategory" VARCHAR(100),
    "suggestedActions" JSONB DEFAULT '[]',
    "status" "public"."EmailStatus" NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "openedAt" TIMESTAMPTZ(6),
    "clickedAt" TIMESTAMPTZ(6),
    "sentAt" TIMESTAMPTZ(6) NOT NULL,
    "receivedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_templates" (
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
CREATE TABLE "public"."email_threads" (
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
CREATE TABLE "public"."event_outbox" (
    "id" UUID NOT NULL,
    "eventID" UUID NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "routingKey" VARCHAR(100) NOT NULL,
    "payload" TEXT NOT NULL,
    "status" "public"."EventOutboxStatus" NOT NULL DEFAULT 'pending',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "lastError" TEXT,
    "publishedAt" TIMESTAMPTZ(6),
    "scheduledFor" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."integrations" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "integrationType" "public"."IntegrationType" NOT NULL,
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
CREATE TABLE "public"."media_files" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "publicID" VARCHAR(255) NOT NULL,
    "originalName" VARCHAR(500) NOT NULL,
    "url" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "format" VARCHAR(20) NOT NULL,
    "resourceType" "public"."MediaResourceType" NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "folder" VARCHAR(255),
    "tags" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "provider" "public"."MediaProvider" NOT NULL,
    "providerData" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media_analytics" (
    "id" UUID NOT NULL,
    "mediaFileID" UUID NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "transformations" INTEGER NOT NULL DEFAULT 0,
    "bandwidthBytes" BIGINT NOT NULL DEFAULT 0,
    "uniqueViewers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "media_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media_transformations" (
    "id" UUID NOT NULL,
    "mediaFileID" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "requestedBy" UUID NOT NULL,
    "requestURL" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "resultURL" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(6),

    CONSTRAINT "media_transformations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL,
    "userID" UUID,
    "userType" VARCHAR(20),
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
CREATE TABLE "public"."notification_preferences" (
    "id" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "userType" VARCHAR(20) NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "webhookUrl" VARCHAR(500),
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_deliveries" (
    "id" UUID NOT NULL,
    "notificationID" UUID NOT NULL,
    "channel" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "messageID" VARCHAR(255),
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."platform_analytics" (
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
CREATE TABLE "public"."webhook_events" (
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

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "subscriptionID" UUID,
    "planID" UUID NOT NULL,
    "paymentMethodID" UUID,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'pending',
    "paymentMethodType" "public"."PaymentMethodType" NOT NULL DEFAULT 'stripe',
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

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_methods" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "type" "public"."PaymentMethodType" NOT NULL,
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
CREATE TABLE "public"."invoices" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "subscriptionID" UUID,
    "transactionID" UUID,
    "invoiceNumber" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'draft',
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
CREATE TABLE "public"."plans" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPrice" INTEGER NOT NULL,
    "annualPrice" INTEGER NOT NULL,
    "color" VARCHAR(50) DEFAULT '#7B21BA',
    "maxClients" INTEGER,
    "maxAiAgents" INTEGER,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription" (
    "id" UUID NOT NULL,
    "coachID" UUID NOT NULL,
    "planID" UUID NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'active',
    "billingCycle" "public"."BillingCycle" NOT NULL DEFAULT 'monthly',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leads" (
    "id" UUID NOT NULL,
    "coachID" UUID,
    "leadType" "public"."LeadType" NOT NULL DEFAULT 'coach_lead',
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "source" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'contacted',
    "meetingDate" TIMESTAMPTZ(6),
    "meetingTime" VARCHAR(20),
    "notes" TEXT,
    "answers" JSONB,
    "qualified" BOOLEAN DEFAULT false,
    "submittedAt" TIMESTAMPTZ(6),
    "lastContactedAt" TIMESTAMPTZ(6),
    "convertedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity_logs" (
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
CREATE TABLE "public"."system_settings" (
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
CREATE TABLE "public"."payment_links" (
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
CREATE TABLE "public"."scheduled_emails" (
    "id" UUID NOT NULL,
    "emailSequenceID" UUID,
    "leadID" UUID,
    "coachID" UUID,
    "clientID" UUID,
    "to" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "body" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "scheduledFor" TIMESTAMPTZ(6) NOT NULL,
    "sentAt" TIMESTAMPTZ(6),
    "status" VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    "errorMessage" JSONB,
    "emailProvider" VARCHAR(50),
    "providerMessageID" TEXT,
    "metadata" JSONB,
    "openedAt" TIMESTAMPTZ(6),
    "clickedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "scheduled_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_sequences" (
    "id" UUID NOT NULL,
    "leadID" UUID,
    "coachID" UUID,
    "clientID" UUID,
    "name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "sequence" JSONB NOT NULL,
    "description" TEXT,
    "triggerType" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "email_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ai_agents_name_key" ON "public"."ai_agents"("name");

-- CreateIndex
CREATE INDEX "idx_ai_interactions_agent_id" ON "public"."ai_interactions"("agentID");

-- CreateIndex
CREATE INDEX "idx_ai_interactions_coach_id" ON "public"."ai_interactions"("coachID");

-- CreateIndex
CREATE INDEX "idx_ai_interactions_created_at" ON "public"."ai_interactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "public"."clients"("email");

-- CreateIndex
CREATE INDEX "idx_clients_email" ON "public"."clients"("email");

-- CreateIndex
CREATE INDEX "idx_clients_last_interaction" ON "public"."clients"("lastInteractionAt");

-- CreateIndex
CREATE INDEX "client_coaches_clientID_idx" ON "public"."client_coaches"("clientID");

-- CreateIndex
CREATE INDEX "client_coaches_coachID_idx" ON "public"."client_coaches"("coachID");

-- CreateIndex
CREATE INDEX "client_coaches_status_idx" ON "public"."client_coaches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "client_coaches_clientID_coachID_key" ON "public"."client_coaches"("clientID", "coachID");

-- CreateIndex
CREATE UNIQUE INDEX "client_invites_token_key" ON "public"."client_invites"("token");

-- CreateIndex
CREATE INDEX "client_invites_coachID_idx" ON "public"."client_invites"("coachID");

-- CreateIndex
CREATE INDEX "client_invites_email_idx" ON "public"."client_invites"("email");

-- CreateIndex
CREATE INDEX "client_invites_token_idx" ON "public"."client_invites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "coach_ai_agents_coachID_agentID_key" ON "public"."coach_ai_agents"("coachID", "agentID");

-- CreateIndex
CREATE UNIQUE INDEX "coaches_email_key" ON "public"."coaches"("email");

-- CreateIndex
CREATE INDEX "idx_coaches_created_at" ON "public"."coaches"("createdAt");

-- CreateIndex
CREATE INDEX "idx_coaches_email" ON "public"."coaches"("email");

-- CreateIndex
CREATE INDEX "idx_coaches_subscription_status" ON "public"."coaches"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "content_categories_coachID_idx" ON "public"."content_categories"("coachID");

-- CreateIndex
CREATE UNIQUE INDEX "content_categories_name_coachID_key" ON "public"."content_categories"("name", "coachID");

-- CreateIndex
CREATE INDEX "idx_content_pieces_coach_id" ON "public"."content_pieces"("coachID");

-- CreateIndex
CREATE INDEX "idx_content_pieces_content_type" ON "public"."content_pieces"("contentType");

-- CreateIndex
CREATE INDEX "idx_content_pieces_published_at" ON "public"."content_pieces"("publishedAt");

-- CreateIndex
CREATE INDEX "idx_course_enrollments_client_id" ON "public"."course_enrollments"("clientID");

-- CreateIndex
CREATE INDEX "idx_course_enrollments_course_id" ON "public"."course_enrollments"("courseID");

-- CreateIndex
CREATE INDEX "idx_course_enrollments_status" ON "public"."course_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_courseID_clientID_key" ON "public"."course_enrollments"("courseID", "clientID");

-- CreateIndex
CREATE INDEX "idx_courses_coach_id" ON "public"."courses"("coachID");

-- CreateIndex
CREATE INDEX "idx_daily_kpis_coach_id_date" ON "public"."daily_kpis"("coachID", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_kpis_coachID_date_key" ON "public"."daily_kpis"("coachID", "date");

-- CreateIndex
CREATE UNIQUE INDEX "email_accounts_coachID_emailAddress_key" ON "public"."email_accounts"("coachID", "emailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "email_messages_providerMessageID_key" ON "public"."email_messages"("providerMessageID");

-- CreateIndex
CREATE INDEX "email_messages_status_idx" ON "public"."email_messages"("status");

-- CreateIndex
CREATE INDEX "idx_email_messages_sent_at" ON "public"."email_messages"("sentAt");

-- CreateIndex
CREATE INDEX "idx_email_messages_thread_id" ON "public"."email_messages"("threadID");

-- CreateIndex
CREATE INDEX "idx_email_threads_client_id" ON "public"."email_threads"("clientID");

-- CreateIndex
CREATE INDEX "idx_email_threads_coach_id" ON "public"."email_threads"("coachID");

-- CreateIndex
CREATE UNIQUE INDEX "event_outbox_eventID_key" ON "public"."event_outbox"("eventID");

-- CreateIndex
CREATE INDEX "event_outbox_status_scheduledFor_idx" ON "public"."event_outbox"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "event_outbox_eventType_idx" ON "public"."event_outbox"("eventType");

-- CreateIndex
CREATE INDEX "event_outbox_createdAt_idx" ON "public"."event_outbox"("createdAt");

-- CreateIndex
CREATE INDEX "idx_integrations_coach_id" ON "public"."integrations"("coachID");

-- CreateIndex
CREATE UNIQUE INDEX "media_files_publicID_key" ON "public"."media_files"("publicID");

-- CreateIndex
CREATE INDEX "media_files_coachID_idx" ON "public"."media_files"("coachID");

-- CreateIndex
CREATE INDEX "media_files_resourceType_idx" ON "public"."media_files"("resourceType");

-- CreateIndex
CREATE INDEX "media_files_folder_idx" ON "public"."media_files"("folder");

-- CreateIndex
CREATE INDEX "media_files_tags_idx" ON "public"."media_files"("tags");

-- CreateIndex
CREATE INDEX "media_files_createdAt_idx" ON "public"."media_files"("createdAt");

-- CreateIndex
CREATE INDEX "media_analytics_date_idx" ON "public"."media_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "media_analytics_mediaFileID_date_key" ON "public"."media_analytics"("mediaFileID", "date");

-- CreateIndex
CREATE INDEX "media_transformations_mediaFileID_idx" ON "public"."media_transformations"("mediaFileID");

-- CreateIndex
CREATE INDEX "media_transformations_coachID_idx" ON "public"."media_transformations"("coachID");

-- CreateIndex
CREATE INDEX "media_transformations_status_idx" ON "public"."media_transformations"("status");

-- CreateIndex
CREATE INDEX "media_transformations_createdAt_idx" ON "public"."media_transformations"("createdAt");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "public"."notifications"("userID", "userType");

-- CreateIndex
CREATE INDEX "idx_notifications_is_read" ON "public"."notifications"("isRead");

-- CreateIndex
CREATE INDEX "notification_preferences_userID_idx" ON "public"."notification_preferences"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userID_userType_key" ON "public"."notification_preferences"("userID", "userType");

-- CreateIndex
CREATE INDEX "notification_deliveries_notificationID_idx" ON "public"."notification_deliveries"("notificationID");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_idx" ON "public"."notification_deliveries"("status");

-- CreateIndex
CREATE INDEX "notification_deliveries_channel_idx" ON "public"."notification_deliveries"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "platform_analytics_date_key" ON "public"."platform_analytics"("date");

-- CreateIndex
CREATE INDEX "idx_platform_analytics_date" ON "public"."platform_analytics"("date");

-- CreateIndex
CREATE INDEX "idx_webhook_events_integration_id" ON "public"."webhook_events"("integrationID");

-- CreateIndex
CREATE INDEX "idx_webhook_events_status" ON "public"."webhook_events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_invoiceNumber_key" ON "public"."transactions"("invoiceNumber");

-- CreateIndex
CREATE INDEX "idx_transactions_payment_method_id" ON "public"."transactions"("paymentMethodID");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "public"."invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "public"."plans"("name");

-- CreateIndex
CREATE INDEX "activity_logs_userID_userType_idx" ON "public"."activity_logs"("userID", "userType");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "public"."activity_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_category_key_key" ON "public"."system_settings"("category", "key");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_stripePaymentLinkID_key" ON "public"."payment_links"("stripePaymentLinkID");

-- CreateIndex
CREATE INDEX "scheduled_emails_scheduledFor_status_idx" ON "public"."scheduled_emails"("scheduledFor", "status");

-- CreateIndex
CREATE INDEX "scheduled_emails_leadID_idx" ON "public"."scheduled_emails"("leadID");

-- CreateIndex
CREATE INDEX "scheduled_emails_coachID_idx" ON "public"."scheduled_emails"("coachID");

-- CreateIndex
CREATE INDEX "scheduled_emails_clientID_idx" ON "public"."scheduled_emails"("clientID");

-- CreateIndex
CREATE INDEX "scheduled_emails_emailSequenceID_idx" ON "public"."scheduled_emails"("emailSequenceID");

-- CreateIndex
CREATE INDEX "email_sequences_coachID_idx" ON "public"."email_sequences"("coachID");

-- CreateIndex
CREATE INDEX "email_sequences_leadID_idx" ON "public"."email_sequences"("leadID");

-- CreateIndex
CREATE INDEX "email_sequences_clientID_idx" ON "public"."email_sequences"("clientID");

-- AddForeignKey
ALTER TABLE "public"."ai_interactions" ADD CONSTRAINT "ai_interactions_agentID_fkey" FOREIGN KEY ("agentID") REFERENCES "public"."ai_agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ai_interactions" ADD CONSTRAINT "ai_interactions_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ai_interactions" ADD CONSTRAINT "ai_interactions_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."client_coaches" ADD CONSTRAINT "client_coaches_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_coaches" ADD CONSTRAINT "client_coaches_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_invites" ADD CONSTRAINT "client_invites_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coach_ai_agents" ADD CONSTRAINT "coach_ai_agents_agentID_fkey" FOREIGN KEY ("agentID") REFERENCES "public"."ai_agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."coach_ai_agents" ADD CONSTRAINT "coach_ai_agents_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."content_categories" ADD CONSTRAINT "content_categories_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_pieces" ADD CONSTRAINT "content_pieces_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "public"."content_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_pieces" ADD CONSTRAINT "content_pieces_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."content_suggestions" ADD CONSTRAINT "content_suggestions_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."course_enrollments" ADD CONSTRAINT "course_enrollments_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."course_enrollments" ADD CONSTRAINT "course_enrollments_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."daily_kpis" ADD CONSTRAINT "daily_kpis_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."email_accounts" ADD CONSTRAINT "email_accounts_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_threadID_fkey" FOREIGN KEY ("threadID") REFERENCES "public"."email_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."email_messages" ADD CONSTRAINT "email_messages_emailTemplateID_fkey" FOREIGN KEY ("emailTemplateID") REFERENCES "public"."email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."email_threads" ADD CONSTRAINT "email_threads_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."email_threads" ADD CONSTRAINT "email_threads_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."email_threads" ADD CONSTRAINT "email_threads_emailAccountID_fkey" FOREIGN KEY ("emailAccountID") REFERENCES "public"."email_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."integrations" ADD CONSTRAINT "integrations_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."media_files" ADD CONSTRAINT "media_files_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media_analytics" ADD CONSTRAINT "media_analytics_mediaFileID_fkey" FOREIGN KEY ("mediaFileID") REFERENCES "public"."media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_events" ADD CONSTRAINT "webhook_events_integrationID_fkey" FOREIGN KEY ("integrationID") REFERENCES "public"."integrations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_subscriptionID_fkey" FOREIGN KEY ("subscriptionID") REFERENCES "public"."subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_planID_fkey" FOREIGN KEY ("planID") REFERENCES "public"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_paymentMethodID_fkey" FOREIGN KEY ("paymentMethodID") REFERENCES "public"."payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_methods" ADD CONSTRAINT "payment_methods_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_subscriptionID_fkey" FOREIGN KEY ("subscriptionID") REFERENCES "public"."subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_transactionID_fkey" FOREIGN KEY ("transactionID") REFERENCES "public"."transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription" ADD CONSTRAINT "subscription_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription" ADD CONSTRAINT "subscription_planID_fkey" FOREIGN KEY ("planID") REFERENCES "public"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_settings" ADD CONSTRAINT "system_settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_links" ADD CONSTRAINT "payment_links_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_links" ADD CONSTRAINT "payment_links_planID_fkey" FOREIGN KEY ("planID") REFERENCES "public"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scheduled_emails" ADD CONSTRAINT "scheduled_emails_emailSequenceID_fkey" FOREIGN KEY ("emailSequenceID") REFERENCES "public"."email_sequences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scheduled_emails" ADD CONSTRAINT "scheduled_emails_leadID_fkey" FOREIGN KEY ("leadID") REFERENCES "public"."leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scheduled_emails" ADD CONSTRAINT "scheduled_emails_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scheduled_emails" ADD CONSTRAINT "scheduled_emails_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_sequences" ADD CONSTRAINT "email_sequences_leadID_fkey" FOREIGN KEY ("leadID") REFERENCES "public"."leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_sequences" ADD CONSTRAINT "email_sequences_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "public"."coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_sequences" ADD CONSTRAINT "email_sequences_clientID_fkey" FOREIGN KEY ("clientID") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
