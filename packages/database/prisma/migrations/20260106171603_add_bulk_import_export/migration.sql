-- CreateTable
CREATE TABLE "import_jobs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorLog" JSONB,
    "mapping" JSONB,
    "options" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_jobs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "format" TEXT NOT NULL DEFAULT 'xlsx',
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "filters" JSONB,
    "columns" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "mapping" JSONB NOT NULL,
    "options" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_jobs_tenantId_idx" ON "import_jobs"("tenantId");

-- CreateIndex
CREATE INDEX "import_jobs_status_idx" ON "import_jobs"("status");

-- CreateIndex
CREATE INDEX "import_jobs_entityType_idx" ON "import_jobs"("entityType");

-- CreateIndex
CREATE INDEX "import_jobs_createdById_idx" ON "import_jobs"("createdById");

-- CreateIndex
CREATE INDEX "export_jobs_tenantId_idx" ON "export_jobs"("tenantId");

-- CreateIndex
CREATE INDEX "export_jobs_status_idx" ON "export_jobs"("status");

-- CreateIndex
CREATE INDEX "export_jobs_entityType_idx" ON "export_jobs"("entityType");

-- CreateIndex
CREATE INDEX "export_jobs_createdById_idx" ON "export_jobs"("createdById");

-- CreateIndex
CREATE INDEX "import_templates_tenantId_idx" ON "import_templates"("tenantId");

-- CreateIndex
CREATE INDEX "import_templates_entityType_idx" ON "import_templates"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "import_templates_tenantId_name_entityType_key" ON "import_templates"("tenantId", "name", "entityType");
