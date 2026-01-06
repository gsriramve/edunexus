-- CreateTable
CREATE TABLE "report_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "columns" JSONB NOT NULL,
    "filters" JSONB,
    "groupBy" TEXT[],
    "sortBy" TEXT,
    "sortOrder" TEXT NOT NULL DEFAULT 'asc',
    "aggregations" JSONB,
    "chartType" TEXT,
    "chartConfig" JSONB,
    "orientation" TEXT NOT NULL DEFAULT 'portrait',
    "pageSize" TEXT NOT NULL DEFAULT 'A4',
    "showHeader" BOOLEAN NOT NULL DEFAULT true,
    "showFooter" BOOLEAN NOT NULL DEFAULT true,
    "headerTemplate" TEXT,
    "footerTemplate" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_jobs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataSource" TEXT NOT NULL,
    "columns" JSONB NOT NULL,
    "filters" JSONB,
    "groupBy" TEXT[],
    "sortBy" TEXT,
    "sortOrder" TEXT NOT NULL DEFAULT 'asc',
    "aggregations" JSONB,
    "dateRange" JSONB,
    "format" TEXT NOT NULL DEFAULT 'pdf',
    "orientation" TEXT NOT NULL DEFAULT 'portrait',
    "pageSize" TEXT NOT NULL DEFAULT 'A4',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "rowCount" INTEGER,
    "generatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "executionTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "report_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_reports" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "monthOfYear" INTEGER,
    "time" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "filters" JSONB,
    "dateRangeType" TEXT NOT NULL DEFAULT 'auto',
    "dateRangeValue" JSONB,
    "format" TEXT NOT NULL DEFAULT 'pdf',
    "deliveryMethod" TEXT NOT NULL DEFAULT 'email',
    "recipients" TEXT[],
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "lastStatus" TEXT,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "scheduled_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_templates_tenantId_idx" ON "report_templates"("tenantId");

-- CreateIndex
CREATE INDEX "report_templates_category_idx" ON "report_templates"("category");

-- CreateIndex
CREATE INDEX "report_templates_dataSource_idx" ON "report_templates"("dataSource");

-- CreateIndex
CREATE INDEX "report_jobs_tenantId_idx" ON "report_jobs"("tenantId");

-- CreateIndex
CREATE INDEX "report_jobs_templateId_idx" ON "report_jobs"("templateId");

-- CreateIndex
CREATE INDEX "report_jobs_status_idx" ON "report_jobs"("status");

-- CreateIndex
CREATE INDEX "report_jobs_createdAt_idx" ON "report_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "scheduled_reports_tenantId_idx" ON "scheduled_reports"("tenantId");

-- CreateIndex
CREATE INDEX "scheduled_reports_templateId_idx" ON "scheduled_reports"("templateId");

-- CreateIndex
CREATE INDEX "scheduled_reports_isActive_idx" ON "scheduled_reports"("isActive");

-- CreateIndex
CREATE INDEX "scheduled_reports_nextRunAt_idx" ON "scheduled_reports"("nextRunAt");

-- AddForeignKey
ALTER TABLE "report_jobs" ADD CONSTRAINT "report_jobs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_reports" ADD CONSTRAINT "scheduled_reports_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
