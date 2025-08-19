-- CreateEnum
CREATE TYPE "public"."CommunityType" AS ENUM ('coach_client', 'coach_to_coach', 'course', 'private');

-- CreateEnum
CREATE TYPE "public"."CommunityVisibility" AS ENUM ('public', 'private', 'invite_only');

-- CreateEnum
CREATE TYPE "public"."MemberRole" AS ENUM ('owner', 'admin', 'moderator', 'member');

-- CreateEnum
CREATE TYPE "public"."MemberStatus" AS ENUM ('active', 'inactive', 'suspended', 'pending');

-- CreateEnum
CREATE TYPE "public"."PostType" AS ENUM ('text', 'image', 'video', 'link', 'poll', 'event');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('text', 'image', 'video', 'file', 'system');

-- CreateEnum
CREATE TYPE "public"."ReactionType" AS ENUM ('like', 'love', 'laugh', 'angry', 'sad', 'celebrate');

-- CreateTable
CREATE TABLE "public"."communities" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "public"."CommunityType" NOT NULL,
    "visibility" "public"."CommunityVisibility" NOT NULL DEFAULT 'private',
    "ownerID" UUID NOT NULL,
    "ownerType" VARCHAR(20) NOT NULL,
    "coachID" UUID,
    "courseID" UUID,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "postCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."community_members" (
    "id" UUID NOT NULL,
    "communityID" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "userType" VARCHAR(20) NOT NULL,
    "role" "public"."MemberRole" NOT NULL DEFAULT 'member',
    "status" "public"."MemberStatus" NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMPTZ(6),
    "invitedBy" UUID,
    "customTitle" VARCHAR(100),
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "community_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."community_invites" (
    "id" UUID NOT NULL,
    "communityID" UUID NOT NULL,
    "inviterID" UUID NOT NULL,
    "inviterType" VARCHAR(20) NOT NULL,
    "inviteeID" UUID NOT NULL,
    "inviteeType" VARCHAR(20) NOT NULL,
    "message" TEXT,
    "token" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "acceptedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" UUID NOT NULL,
    "communityID" UUID NOT NULL,
    "authorID" UUID NOT NULL,
    "authorType" VARCHAR(20) NOT NULL,
    "type" "public"."PostType" NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "linkUrl" TEXT,
    "linkPreview" JSONB DEFAULT '{}',
    "pollOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eventData" JSONB DEFAULT '{}',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_comments" (
    "id" UUID NOT NULL,
    "postID" UUID NOT NULL,
    "authorID" UUID NOT NULL,
    "authorType" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "parentCommentID" UUID,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_reactions" (
    "id" UUID NOT NULL,
    "postID" UUID,
    "commentID" UUID,
    "userID" UUID NOT NULL,
    "userType" VARCHAR(20) NOT NULL,
    "type" "public"."ReactionType" NOT NULL DEFAULT 'like',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255),
    "participantIDs" TEXT[],
    "participantTypes" TEXT[],
    "lastMessageID" UUID,
    "lastMessageAt" TIMESTAMPTZ(6),
    "unreadCount" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."direct_messages" (
    "id" UUID NOT NULL,
    "conversationID" UUID NOT NULL,
    "senderID" UUID NOT NULL,
    "senderType" VARCHAR(20) NOT NULL,
    "type" "public"."MessageType" NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMPTZ(6),
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMPTZ(6),
    "replyToMessageID" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."community_analytics" (
    "id" UUID NOT NULL,
    "communityID" UUID NOT NULL,
    "date" DATE NOT NULL,
    "newMembers" INTEGER NOT NULL DEFAULT 0,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "newPosts" INTEGER NOT NULL DEFAULT 0,
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "newComments" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "newReactions" INTEGER NOT NULL DEFAULT 0,
    "totalReactions" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "communities_type_idx" ON "public"."communities"("type");

-- CreateIndex
CREATE INDEX "communities_coachID_idx" ON "public"."communities"("coachID");

-- CreateIndex
CREATE INDEX "communities_courseID_idx" ON "public"."communities"("courseID");

-- CreateIndex
CREATE INDEX "communities_ownerID_ownerType_idx" ON "public"."communities"("ownerID", "ownerType");

-- CreateIndex
CREATE INDEX "communities_createdAt_idx" ON "public"."communities"("createdAt");

-- CreateIndex
CREATE INDEX "community_members_userID_userType_idx" ON "public"."community_members"("userID", "userType");

-- CreateIndex
CREATE INDEX "community_members_communityID_idx" ON "public"."community_members"("communityID");

-- CreateIndex
CREATE INDEX "community_members_status_idx" ON "public"."community_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "community_members_communityID_userID_userType_key" ON "public"."community_members"("communityID", "userID", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "community_invites_token_key" ON "public"."community_invites"("token");

-- CreateIndex
CREATE INDEX "community_invites_token_idx" ON "public"."community_invites"("token");

-- CreateIndex
CREATE INDEX "community_invites_inviteeID_inviteeType_idx" ON "public"."community_invites"("inviteeID", "inviteeType");

-- CreateIndex
CREATE INDEX "community_invites_status_idx" ON "public"."community_invites"("status");

-- CreateIndex
CREATE INDEX "posts_communityID_idx" ON "public"."posts"("communityID");

-- CreateIndex
CREATE INDEX "posts_authorID_authorType_idx" ON "public"."posts"("authorID", "authorType");

-- CreateIndex
CREATE INDEX "posts_type_idx" ON "public"."posts"("type");

-- CreateIndex
CREATE INDEX "posts_createdAt_idx" ON "public"."posts"("createdAt");

-- CreateIndex
CREATE INDEX "posts_isPinned_idx" ON "public"."posts"("isPinned");

-- CreateIndex
CREATE INDEX "post_comments_postID_idx" ON "public"."post_comments"("postID");

-- CreateIndex
CREATE INDEX "post_comments_authorID_authorType_idx" ON "public"."post_comments"("authorID", "authorType");

-- CreateIndex
CREATE INDEX "post_comments_parentCommentID_idx" ON "public"."post_comments"("parentCommentID");

-- CreateIndex
CREATE INDEX "post_comments_createdAt_idx" ON "public"."post_comments"("createdAt");

-- CreateIndex
CREATE INDEX "post_reactions_userID_userType_idx" ON "public"."post_reactions"("userID", "userType");

-- CreateIndex
CREATE INDEX "post_reactions_type_idx" ON "public"."post_reactions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_postID_userID_userType_key" ON "public"."post_reactions"("postID", "userID", "userType");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_commentID_userID_userType_key" ON "public"."post_reactions"("commentID", "userID", "userType");

-- CreateIndex
CREATE INDEX "conversations_participantIDs_idx" ON "public"."conversations"("participantIDs");

-- CreateIndex
CREATE INDEX "conversations_lastMessageAt_idx" ON "public"."conversations"("lastMessageAt");

-- CreateIndex
CREATE INDEX "direct_messages_conversationID_idx" ON "public"."direct_messages"("conversationID");

-- CreateIndex
CREATE INDEX "direct_messages_senderID_senderType_idx" ON "public"."direct_messages"("senderID", "senderType");

-- CreateIndex
CREATE INDEX "direct_messages_isRead_idx" ON "public"."direct_messages"("isRead");

-- CreateIndex
CREATE INDEX "direct_messages_createdAt_idx" ON "public"."direct_messages"("createdAt");

-- CreateIndex
CREATE INDEX "community_analytics_date_idx" ON "public"."community_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "community_analytics_communityID_date_key" ON "public"."community_analytics"("communityID", "date");

-- AddForeignKey
ALTER TABLE "public"."community_members" ADD CONSTRAINT "community_members_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_invites" ADD CONSTRAINT "community_invites_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "public"."communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_comments" ADD CONSTRAINT "post_comments_postID_fkey" FOREIGN KEY ("postID") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_comments" ADD CONSTRAINT "post_comments_parentCommentID_fkey" FOREIGN KEY ("parentCommentID") REFERENCES "public"."post_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_reactions" ADD CONSTRAINT "post_reactions_postID_fkey" FOREIGN KEY ("postID") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_reactions" ADD CONSTRAINT "post_reactions_commentID_fkey" FOREIGN KEY ("commentID") REFERENCES "public"."post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."direct_messages" ADD CONSTRAINT "direct_messages_conversationID_fkey" FOREIGN KEY ("conversationID") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."direct_messages" ADD CONSTRAINT "direct_messages_replyToMessageID_fkey" FOREIGN KEY ("replyToMessageID") REFERENCES "public"."direct_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
