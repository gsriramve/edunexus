-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "audience" TEXT NOT NULL,
    "audienceFilters" JSONB,
    "attachments" JSONB,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "allowComments" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_recipients" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "announcement_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_communications" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "templateId" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "audienceFilters" JSONB,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bulkCommunicationId" TEXT,
    "type" TEXT NOT NULL,
    "recipientId" TEXT,
    "recipientType" TEXT,
    "recipientName" TEXT,
    "recipientContact" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "externalId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cost" DECIMAL(6,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_comments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcements_tenantId_idx" ON "announcements"("tenantId");

-- CreateIndex
CREATE INDEX "announcements_type_idx" ON "announcements"("type");

-- CreateIndex
CREATE INDEX "announcements_audience_idx" ON "announcements"("audience");

-- CreateIndex
CREATE INDEX "announcements_status_idx" ON "announcements"("status");

-- CreateIndex
CREATE INDEX "announcements_publishedAt_idx" ON "announcements"("publishedAt");

-- CreateIndex
CREATE INDEX "announcement_recipients_tenantId_idx" ON "announcement_recipients"("tenantId");

-- CreateIndex
CREATE INDEX "announcement_recipients_userId_idx" ON "announcement_recipients"("userId");

-- CreateIndex
CREATE INDEX "announcement_recipients_readAt_idx" ON "announcement_recipients"("readAt");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_recipients_announcementId_userId_key" ON "announcement_recipients"("announcementId", "userId");

-- CreateIndex
CREATE INDEX "message_templates_tenantId_idx" ON "message_templates"("tenantId");

-- CreateIndex
CREATE INDEX "message_templates_type_idx" ON "message_templates"("type");

-- CreateIndex
CREATE INDEX "message_templates_category_idx" ON "message_templates"("category");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_tenantId_code_key" ON "message_templates"("tenantId", "code");

-- CreateIndex
CREATE INDEX "bulk_communications_tenantId_idx" ON "bulk_communications"("tenantId");

-- CreateIndex
CREATE INDEX "bulk_communications_type_idx" ON "bulk_communications"("type");

-- CreateIndex
CREATE INDEX "bulk_communications_status_idx" ON "bulk_communications"("status");

-- CreateIndex
CREATE INDEX "bulk_communications_scheduledAt_idx" ON "bulk_communications"("scheduledAt");

-- CreateIndex
CREATE INDEX "communication_logs_tenantId_idx" ON "communication_logs"("tenantId");

-- CreateIndex
CREATE INDEX "communication_logs_bulkCommunicationId_idx" ON "communication_logs"("bulkCommunicationId");

-- CreateIndex
CREATE INDEX "communication_logs_recipientId_idx" ON "communication_logs"("recipientId");

-- CreateIndex
CREATE INDEX "communication_logs_status_idx" ON "communication_logs"("status");

-- CreateIndex
CREATE INDEX "communication_logs_type_idx" ON "communication_logs"("type");

-- CreateIndex
CREATE INDEX "communication_logs_createdAt_idx" ON "communication_logs"("createdAt");

-- CreateIndex
CREATE INDEX "announcement_comments_tenantId_idx" ON "announcement_comments"("tenantId");

-- CreateIndex
CREATE INDEX "announcement_comments_announcementId_idx" ON "announcement_comments"("announcementId");

-- CreateIndex
CREATE INDEX "announcement_comments_parentId_idx" ON "announcement_comments"("parentId");

-- AddForeignKey
ALTER TABLE "announcement_recipients" ADD CONSTRAINT "announcement_recipients_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_communications" ADD CONSTRAINT "bulk_communications_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "message_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_bulkCommunicationId_fkey" FOREIGN KEY ("bulkCommunicationId") REFERENCES "bulk_communications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
