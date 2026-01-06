-- CreateTable
CREATE TABLE "transport_routes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "startPoint" TEXT NOT NULL,
    "endPoint" TEXT NOT NULL,
    "totalDistance" DECIMAL(6,2),
    "estimatedTime" INTEGER,
    "fare" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_stops" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "sequence" INTEGER NOT NULL,
    "pickupTime" TEXT,
    "dropTime" TEXT,
    "landmark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_vehicles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "routeId" TEXT,
    "vehicleNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'bus',
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "color" TEXT,
    "fuelType" TEXT NOT NULL DEFAULT 'diesel',
    "insuranceExpiry" TIMESTAMP(3),
    "fitnessExpiry" TIMESTAMP(3),
    "permitExpiry" TIMESTAMP(3),
    "driverName" TEXT,
    "driverPhone" TEXT,
    "driverLicense" TEXT,
    "conductorName" TEXT,
    "conductorPhone" TEXT,
    "gpsDeviceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_passes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "passNumber" TEXT NOT NULL,
    "stopName" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "fare" DECIMAL(8,2) NOT NULL,
    "paidAmount" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "status" TEXT NOT NULL DEFAULT 'active',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_tracking" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "speed" DECIMAL(5,2),
    "heading" INTEGER,
    "altitude" DECIMAL(8,2),
    "accuracy" DECIMAL(6,2),
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transport_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transport_routes_tenantId_idx" ON "transport_routes"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_routes_tenantId_code_key" ON "transport_routes"("tenantId", "code");

-- CreateIndex
CREATE INDEX "transport_stops_tenantId_idx" ON "transport_stops"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_stops_routeId_sequence_key" ON "transport_stops"("routeId", "sequence");

-- CreateIndex
CREATE INDEX "transport_vehicles_tenantId_idx" ON "transport_vehicles"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_vehicles_tenantId_vehicleNumber_key" ON "transport_vehicles"("tenantId", "vehicleNumber");

-- CreateIndex
CREATE INDEX "transport_passes_tenantId_idx" ON "transport_passes"("tenantId");

-- CreateIndex
CREATE INDEX "transport_passes_studentId_idx" ON "transport_passes"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_passes_tenantId_passNumber_key" ON "transport_passes"("tenantId", "passNumber");

-- CreateIndex
CREATE INDEX "transport_tracking_tenantId_idx" ON "transport_tracking"("tenantId");

-- CreateIndex
CREATE INDEX "transport_tracking_vehicleId_idx" ON "transport_tracking"("vehicleId");

-- CreateIndex
CREATE INDEX "transport_tracking_recordedAt_idx" ON "transport_tracking"("recordedAt");

-- AddForeignKey
ALTER TABLE "transport_stops" ADD CONSTRAINT "transport_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_vehicles" ADD CONSTRAINT "transport_vehicles_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_passes" ADD CONSTRAINT "transport_passes_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_passes" ADD CONSTRAINT "transport_passes_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_tracking" ADD CONSTRAINT "transport_tracking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "transport_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
