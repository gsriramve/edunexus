-- CreateTable
CREATE TABLE "sports_teams" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'men',
    "description" TEXT,
    "logoUrl" TEXT,
    "coachId" TEXT,
    "captainId" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 20,
    "foundedYear" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "position" TEXT,
    "jerseyNo" INTEGER,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "advisorId" TEXT,
    "presidentId" TEXT,
    "maxMembers" INTEGER,
    "meetingSchedule" TEXT,
    "roomNo" TEXT,
    "foundedYear" INTEGER,
    "website" TEXT,
    "socialLinks" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_members" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "designation" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teamId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "description" TEXT,
    "venue" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "homeTeamId" TEXT,
    "awayTeamId" TEXT,
    "homeScore" TEXT,
    "awayScore" TEXT,
    "result" TEXT,
    "level" TEXT NOT NULL DEFAULT 'college',
    "organizer" TEXT,
    "registrationDeadline" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "entryFee" DECIMAL(8,2),
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "venue" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "registrationDeadline" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "entryFee" DECIMAL(8,2),
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "resourceUrl" TEXT,
    "posterUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sportsEventId" TEXT,
    "clubEventId" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "attendedAt" TIMESTAMP(3),
    "feedback" TEXT,
    "rating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teamId" TEXT,
    "clubId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "awardedDate" TIMESTAMP(3) NOT NULL,
    "awardedBy" TEXT,
    "eventName" TEXT,
    "level" TEXT NOT NULL DEFAULT 'college',
    "position" TEXT,
    "certificateUrl" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "creditsAwarded" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_credits" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" INTEGER,
    "category" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "maxCredits" INTEGER NOT NULL DEFAULT 10,
    "awardedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awardedBy" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_credits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sports_teams_tenantId_idx" ON "sports_teams"("tenantId");

-- CreateIndex
CREATE INDEX "sports_teams_sport_idx" ON "sports_teams"("sport");

-- CreateIndex
CREATE UNIQUE INDEX "sports_teams_tenantId_name_sport_key" ON "sports_teams"("tenantId", "name", "sport");

-- CreateIndex
CREATE INDEX "team_members_tenantId_idx" ON "team_members"("tenantId");

-- CreateIndex
CREATE INDEX "team_members_teamId_idx" ON "team_members"("teamId");

-- CreateIndex
CREATE INDEX "team_members_studentId_idx" ON "team_members"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_studentId_key" ON "team_members"("teamId", "studentId");

-- CreateIndex
CREATE INDEX "clubs_tenantId_idx" ON "clubs"("tenantId");

-- CreateIndex
CREATE INDEX "clubs_category_idx" ON "clubs"("category");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_tenantId_code_key" ON "clubs"("tenantId", "code");

-- CreateIndex
CREATE INDEX "club_members_tenantId_idx" ON "club_members"("tenantId");

-- CreateIndex
CREATE INDEX "club_members_clubId_idx" ON "club_members"("clubId");

-- CreateIndex
CREATE INDEX "club_members_studentId_idx" ON "club_members"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "club_members_clubId_studentId_key" ON "club_members"("clubId", "studentId");

-- CreateIndex
CREATE INDEX "sports_events_tenantId_idx" ON "sports_events"("tenantId");

-- CreateIndex
CREATE INDEX "sports_events_teamId_idx" ON "sports_events"("teamId");

-- CreateIndex
CREATE INDEX "sports_events_sport_idx" ON "sports_events"("sport");

-- CreateIndex
CREATE INDEX "sports_events_startDate_idx" ON "sports_events"("startDate");

-- CreateIndex
CREATE INDEX "club_events_tenantId_idx" ON "club_events"("tenantId");

-- CreateIndex
CREATE INDEX "club_events_clubId_idx" ON "club_events"("clubId");

-- CreateIndex
CREATE INDEX "club_events_startDate_idx" ON "club_events"("startDate");

-- CreateIndex
CREATE INDEX "event_registrations_tenantId_idx" ON "event_registrations"("tenantId");

-- CreateIndex
CREATE INDEX "event_registrations_studentId_idx" ON "event_registrations"("studentId");

-- CreateIndex
CREATE INDEX "event_registrations_sportsEventId_idx" ON "event_registrations"("sportsEventId");

-- CreateIndex
CREATE INDEX "event_registrations_clubEventId_idx" ON "event_registrations"("clubEventId");

-- CreateIndex
CREATE INDEX "achievements_tenantId_idx" ON "achievements"("tenantId");

-- CreateIndex
CREATE INDEX "achievements_studentId_idx" ON "achievements"("studentId");

-- CreateIndex
CREATE INDEX "achievements_category_idx" ON "achievements"("category");

-- CreateIndex
CREATE INDEX "activity_credits_tenantId_idx" ON "activity_credits"("tenantId");

-- CreateIndex
CREATE INDEX "activity_credits_studentId_idx" ON "activity_credits"("studentId");

-- CreateIndex
CREATE INDEX "activity_credits_academicYear_idx" ON "activity_credits"("academicYear");

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "sports_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sports_events" ADD CONSTRAINT "sports_events_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "sports_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sports_events" ADD CONSTRAINT "sports_events_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "sports_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sports_events" ADD CONSTRAINT "sports_events_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "sports_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_events" ADD CONSTRAINT "club_events_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_sportsEventId_fkey" FOREIGN KEY ("sportsEventId") REFERENCES "sports_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_clubEventId_fkey" FOREIGN KEY ("clubEventId") REFERENCES "club_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "sports_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_credits" ADD CONSTRAINT "activity_credits_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
