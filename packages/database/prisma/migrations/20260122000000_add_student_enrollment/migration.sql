-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('INITIATED', 'INVITATION_SENT', 'STUDENT_SIGNED_UP', 'PROFILE_INCOMPLETE', 'SUBMITTED', 'ADMIN_APPROVED', 'CHANGES_REQUESTED', 'HOD_APPROVED', 'PRINCIPAL_APPROVED', 'COMPLETED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "invitationToken" TEXT NOT NULL,
    "invitationExpiresAt" TIMESTAMP(3) NOT NULL,
    "personalDetails" JSONB,
    "academicDetails" JSONB,
    "documents" JSONB,
    "section" TEXT,
    "rollNumber" TEXT,
    "officialEmail" TEXT,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'INITIATED',
    "submittedAt" TIMESTAMP(3),
    "adminReviewedAt" TIMESTAMP(3),
    "adminReviewedById" TEXT,
    "adminNotes" TEXT,
    "hodApprovedAt" TIMESTAMP(3),
    "hodApprovedById" TEXT,
    "hodNotes" TEXT,
    "principalApprovedAt" TIMESTAMP(3),
    "principalApprovedById" TEXT,
    "principalNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_invitationToken_key" ON "student_enrollments"("invitationToken");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_studentId_key" ON "student_enrollments"("studentId");

-- CreateIndex
CREATE INDEX "student_enrollments_tenantId_status_idx" ON "student_enrollments"("tenantId", "status");

-- CreateIndex
CREATE INDEX "student_enrollments_invitationToken_idx" ON "student_enrollments"("invitationToken");

-- CreateIndex
CREATE INDEX "student_enrollments_email_tenantId_idx" ON "student_enrollments"("email", "tenantId");

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
