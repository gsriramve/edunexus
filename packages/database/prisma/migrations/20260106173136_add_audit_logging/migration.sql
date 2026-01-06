-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "userRole" TEXT,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "entityName" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedFields" TEXT[],
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestMethod" TEXT,
    "requestPath" TEXT,
    "requestId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "errorMessage" TEXT,
    "duration" INTEGER,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL DEFAULT 365,
    "logReads" BOOLEAN NOT NULL DEFAULT false,
    "logAuthentication" BOOLEAN NOT NULL DEFAULT true,
    "logDataChanges" BOOLEAN NOT NULL DEFAULT true,
    "logExports" BOOLEAN NOT NULL DEFAULT true,
    "logImports" BOOLEAN NOT NULL DEFAULT true,
    "logSystemEvents" BOOLEAN NOT NULL DEFAULT true,
    "excludedEntityTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_log_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log_summaries" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createCount" INTEGER NOT NULL DEFAULT 0,
    "updateCount" INTEGER NOT NULL DEFAULT 0,
    "deleteCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "logoutCount" INTEGER NOT NULL DEFAULT 0,
    "exportCount" INTEGER NOT NULL DEFAULT 0,
    "importCount" INTEGER NOT NULL DEFAULT 0,
    "otherCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "topEntities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_log_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_category_idx" ON "audit_logs"("category");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_entityId_idx" ON "audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_status_idx" ON "audit_logs"("status");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_timestamp_idx" ON "audit_logs"("tenantId", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_userId_timestamp_idx" ON "audit_logs"("tenantId", "userId", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_entityType_entityId_idx" ON "audit_logs"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "audit_log_settings_tenantId_key" ON "audit_log_settings"("tenantId");

-- CreateIndex
CREATE INDEX "audit_log_summaries_tenantId_idx" ON "audit_log_summaries"("tenantId");

-- CreateIndex
CREATE INDEX "audit_log_summaries_date_idx" ON "audit_log_summaries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "audit_log_summaries_tenantId_date_key" ON "audit_log_summaries"("tenantId", "date");
