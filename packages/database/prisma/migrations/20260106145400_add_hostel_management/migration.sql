-- CreateTable
CREATE TABLE "hostel_blocks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'boys',
    "totalFloors" INTEGER NOT NULL DEFAULT 4,
    "totalRooms" INTEGER NOT NULL DEFAULT 0,
    "totalCapacity" INTEGER NOT NULL DEFAULT 0,
    "wardenId" TEXT,
    "wardenName" TEXT,
    "wardenPhone" TEXT,
    "address" TEXT,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_rooms" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL DEFAULT 'double',
    "capacity" INTEGER NOT NULL DEFAULT 2,
    "occupancy" INTEGER NOT NULL DEFAULT 0,
    "monthlyRent" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_allocations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "bedNumber" INTEGER,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3),
    "expectedCheckOut" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_fees" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" INTEGER,
    "roomRent" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "messCharges" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "electricityCharges" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "otherCharges" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "receiptNumber" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mess_menu" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "blockId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "items" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timing" TEXT,
    "isVeg" BOOLEAN NOT NULL DEFAULT true,
    "specialDay" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mess_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_complaints" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "roomId" TEXT,
    "complaintNumber" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "assignedTo" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "feedback" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_complaints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hostel_blocks_tenantId_idx" ON "hostel_blocks"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_blocks_tenantId_code_key" ON "hostel_blocks"("tenantId", "code");

-- CreateIndex
CREATE INDEX "hostel_rooms_tenantId_idx" ON "hostel_rooms"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_rooms_blockId_roomNumber_key" ON "hostel_rooms"("blockId", "roomNumber");

-- CreateIndex
CREATE INDEX "hostel_allocations_tenantId_idx" ON "hostel_allocations"("tenantId");

-- CreateIndex
CREATE INDEX "hostel_allocations_studentId_idx" ON "hostel_allocations"("studentId");

-- CreateIndex
CREATE INDEX "hostel_allocations_roomId_idx" ON "hostel_allocations"("roomId");

-- CreateIndex
CREATE INDEX "hostel_fees_tenantId_idx" ON "hostel_fees"("tenantId");

-- CreateIndex
CREATE INDEX "hostel_fees_studentId_idx" ON "hostel_fees"("studentId");

-- CreateIndex
CREATE INDEX "mess_menu_tenantId_idx" ON "mess_menu"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "mess_menu_tenantId_blockId_dayOfWeek_mealType_validFrom_key" ON "mess_menu"("tenantId", "blockId", "dayOfWeek", "mealType", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_complaints_complaintNumber_key" ON "hostel_complaints"("complaintNumber");

-- CreateIndex
CREATE INDEX "hostel_complaints_tenantId_idx" ON "hostel_complaints"("tenantId");

-- CreateIndex
CREATE INDEX "hostel_complaints_studentId_idx" ON "hostel_complaints"("studentId");

-- CreateIndex
CREATE INDEX "hostel_complaints_status_idx" ON "hostel_complaints"("status");

-- AddForeignKey
ALTER TABLE "hostel_rooms" ADD CONSTRAINT "hostel_rooms_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "hostel_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_allocations" ADD CONSTRAINT "hostel_allocations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_allocations" ADD CONSTRAINT "hostel_allocations_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "hostel_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_fees" ADD CONSTRAINT "hostel_fees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_complaints" ADD CONSTRAINT "hostel_complaints_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_complaints" ADD CONSTRAINT "hostel_complaints_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "hostel_blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_complaints" ADD CONSTRAINT "hostel_complaints_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "hostel_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
