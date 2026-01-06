-- CreateTable
CREATE TABLE "document_folders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "ownerId" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "path" TEXT NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "folderId" TEXT,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "description" TEXT,
    "s3Key" TEXT NOT NULL,
    "s3Bucket" TEXT NOT NULL,
    "s3Region" TEXT NOT NULL DEFAULT 'ap-south-1',
    "s3Url" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "extension" TEXT NOT NULL,
    "checksum" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uploadedById" TEXT NOT NULL,
    "uploadedByType" TEXT NOT NULL,
    "uploadedByName" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "studentId" TEXT,
    "staffId" TEXT,
    "departmentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_shares" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sharedWithUserId" TEXT,
    "sharedWithRole" TEXT,
    "sharedWithDeptId" TEXT,
    "permission" TEXT NOT NULL DEFAULT 'view',
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "maxDownloads" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "shareToken" TEXT,
    "isPublicLink" BOOLEAN NOT NULL DEFAULT false,
    "sharedById" TEXT NOT NULL,
    "sharedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_access_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "totalStorageQuota" BIGINT NOT NULL DEFAULT 10737418240,
    "usedStorage" BIGINT NOT NULL DEFAULT 0,
    "studentQuota" BIGINT NOT NULL DEFAULT 104857600,
    "staffQuota" BIGINT NOT NULL DEFAULT 524288000,
    "maxFileSize" INTEGER NOT NULL DEFAULT 52428800,
    "allowedMimeTypes" TEXT[] DEFAULT ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']::TEXT[],
    "blockedExtensions" TEXT[] DEFAULT ARRAY['exe', 'bat', 'cmd', 'sh', 'ps1']::TEXT[],
    "autoDeleteDays" INTEGER,
    "archiveAfterDays" INTEGER,
    "versioningEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maxVersions" INTEGER NOT NULL DEFAULT 5,
    "publicSharingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "externalSharingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_folders_tenantId_idx" ON "document_folders"("tenantId");

-- CreateIndex
CREATE INDEX "document_folders_ownerId_idx" ON "document_folders"("ownerId");

-- CreateIndex
CREATE INDEX "document_folders_parentId_idx" ON "document_folders"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "document_folders_tenantId_path_key" ON "document_folders"("tenantId", "path");

-- CreateIndex
CREATE INDEX "documents_tenantId_idx" ON "documents"("tenantId");

-- CreateIndex
CREATE INDEX "documents_folderId_idx" ON "documents"("folderId");

-- CreateIndex
CREATE INDEX "documents_uploadedById_idx" ON "documents"("uploadedById");

-- CreateIndex
CREATE INDEX "documents_studentId_idx" ON "documents"("studentId");

-- CreateIndex
CREATE INDEX "documents_staffId_idx" ON "documents"("staffId");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "documents_tenantId_s3Key_key" ON "documents"("tenantId", "s3Key");

-- CreateIndex
CREATE UNIQUE INDEX "document_shares_shareToken_key" ON "document_shares"("shareToken");

-- CreateIndex
CREATE INDEX "document_shares_tenantId_idx" ON "document_shares"("tenantId");

-- CreateIndex
CREATE INDEX "document_shares_documentId_idx" ON "document_shares"("documentId");

-- CreateIndex
CREATE INDEX "document_shares_sharedWithUserId_idx" ON "document_shares"("sharedWithUserId");

-- CreateIndex
CREATE INDEX "document_shares_shareToken_idx" ON "document_shares"("shareToken");

-- CreateIndex
CREATE INDEX "document_access_logs_tenantId_idx" ON "document_access_logs"("tenantId");

-- CreateIndex
CREATE INDEX "document_access_logs_documentId_idx" ON "document_access_logs"("documentId");

-- CreateIndex
CREATE INDEX "document_access_logs_userId_idx" ON "document_access_logs"("userId");

-- CreateIndex
CREATE INDEX "document_access_logs_createdAt_idx" ON "document_access_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "document_settings_tenantId_key" ON "document_settings"("tenantId");

-- AddForeignKey
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "document_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "document_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_access_logs" ADD CONSTRAINT "document_access_logs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
