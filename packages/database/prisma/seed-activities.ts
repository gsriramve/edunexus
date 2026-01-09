/**
 * EduNexus Activities Data Seeder
 *
 * Seeds clubs, sports teams, achievements, and events.
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx prisma/seed-activities.ts
 */

import { PrismaClient } from '@prisma/client';
import {
  randomItem,
  randomItems,
  randomInt,
  daysAgo,
  daysFromNow,
} from './lib/seed-utils';

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CLUBS_DATA = [
  { name: 'Coding Club', code: 'CC', category: 'technical', description: 'Competitive programming and hackathons' },
  { name: 'AI/ML Society', code: 'AIML', category: 'technical', description: 'Artificial Intelligence and Machine Learning enthusiasts' },
  { name: 'Robotics Club', code: 'RC', category: 'technical', description: 'Building and programming robots' },
  { name: 'Cultural Club', code: 'CULT', category: 'cultural', description: 'Music, dance, and cultural activities' },
  { name: 'Drama Society', code: 'DS', category: 'cultural', description: 'Theater and acting' },
  { name: 'Photography Club', code: 'PC', category: 'hobby', description: 'Photography and videography' },
  { name: 'Entrepreneurship Cell', code: 'ECELL', category: 'technical', description: 'Startup ecosystem and business ideas' },
  { name: 'NSS Unit', code: 'NSS', category: 'social', description: 'National Service Scheme - community service' },
];

const SPORTS_TEAMS_DATA = [
  { name: 'Cricket Team', sport: 'cricket', maxMembers: 15 },
  { name: 'Football Team', sport: 'football', maxMembers: 18 },
  { name: 'Basketball Team', sport: 'basketball', maxMembers: 12 },
  { name: 'Volleyball Team', sport: 'volleyball', maxMembers: 12 },
  { name: 'Table Tennis Team', sport: 'table_tennis', maxMembers: 6 },
  { name: 'Athletics Team', sport: 'athletics', maxMembers: 20 },
  { name: 'Chess Team', sport: 'chess', maxMembers: 8 },
  { name: 'Badminton Team', sport: 'badminton', maxMembers: 8 },
];

const ACHIEVEMENT_TYPES = [
  { type: 'award', category: 'technical', titles: ['Smart India Hackathon', 'Code Gladiators', 'AngelHack', 'HackWithInfy'] },
  { type: 'certificate', category: 'academic', titles: ['Paper Presentation', 'Project Exhibition', 'Quiz Competition', 'Debate Championship'] },
  { type: 'trophy', category: 'sports', titles: ['Inter-College Tournament', 'State Level Championship', 'University Games', 'Sports Day'] },
  { type: 'medal', category: 'cultural', titles: ['College Fest', 'Cultural Night', 'Annual Day Performance', 'Inter-College Fest'] },
  { type: 'certificate', category: 'technical', titles: ['AWS Certified', 'Google Cloud Certified', 'Oracle Certified', 'Microsoft Certified'] },
];

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

async function seedClubs(tenantId: string, studentIds: string[], staffIds: string[]): Promise<void> {
  console.log('  Creating clubs...');

  for (const clubData of CLUBS_DATA) {
    const existing = await prisma.club.findFirst({
      where: { tenantId, code: clubData.code },
    });

    if (existing) continue;

    const club = await prisma.club.create({
      data: {
        tenantId,
        name: clubData.name,
        code: clubData.code,
        description: clubData.description,
        category: clubData.category,
        foundedYear: randomInt(2015, 2022),
        advisorId: staffIds.length > 0 ? randomItem(staffIds) : null,
        maxMembers: randomInt(30, 100),
        meetingSchedule: 'Every Saturday 4:00 PM',
        roomNo: `Room ${randomInt(100, 300)}`,
        socialLinks: {
          instagram: `@${clubData.code.toLowerCase()}_club`,
          linkedin: `linkedin.com/company/${clubData.code.toLowerCase()}`,
        },
        status: 'active',
      },
    });

    // Add members (5-15 per club)
    const memberCount = Math.min(studentIds.length, randomInt(5, 15));
    const selectedStudents = randomItems(studentIds, memberCount);
    const roles = ['member', 'member', 'member', 'secretary', 'treasurer'];

    for (let i = 0; i < selectedStudents.length; i++) {
      const studentId = selectedStudents[i];
      const role = i === 0 ? 'president' : i === 1 ? 'vice-president' : randomItem(roles);

      await prisma.clubMember.create({
        data: {
          tenantId,
          clubId: club.id,
          studentId,
          role,
          designation: role !== 'member' ? `${role.charAt(0).toUpperCase() + role.slice(1)}` : null,
          joinedAt: daysAgo(randomInt(30, 365)),
          status: 'active',
        },
      });
    }

    // Update club with president if we have one
    if (selectedStudents.length > 0) {
      await prisma.club.update({
        where: { id: club.id },
        data: { presidentId: selectedStudents[0] },
      });
    }

    // Create club events (2-3 per club)
    const eventCount = randomInt(2, 3);
    for (let i = 0; i < eventCount; i++) {
      const isPast = i < eventCount - 1;
      const startDate = isPast ? daysAgo(randomInt(30, 180)) : daysFromNow(randomInt(7, 60));
      const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);

      await prisma.clubEvent.create({
        data: {
          tenantId,
          clubId: club.id,
          name: `${clubData.name} - ${isPast ? 'Workshop' : 'Upcoming Event'} ${i + 1}`,
          description: `An exciting event by ${clubData.name} for all members and interested students.`,
          type: randomItem(['workshop', 'seminar', 'competition', 'meetup', 'hackathon']),
          startDate,
          endDate,
          venue: `Seminar Hall ${randomItem(['A', 'B', 'C'])}`,
          maxParticipants: randomInt(30, 100),
          isPublic: true,
          status: isPast ? 'completed' : 'scheduled',
        },
      });
    }
  }

  console.log(`    Created ${CLUBS_DATA.length} clubs with members and events`);
}

async function seedSportsTeams(tenantId: string, studentIds: string[], staffIds: string[]): Promise<void> {
  console.log('  Creating sports teams...');

  for (const teamData of SPORTS_TEAMS_DATA) {
    const existing = await prisma.sportsTeam.findFirst({
      where: { tenantId, sport: teamData.sport },
    });

    if (existing) continue;

    const team = await prisma.sportsTeam.create({
      data: {
        tenantId,
        name: teamData.name,
        sport: teamData.sport,
        category: 'men',
        description: `Official ${teamData.name} of the institution`,
        coachId: staffIds.length > 0 ? randomItem(staffIds) : null,
        maxMembers: teamData.maxMembers,
        foundedYear: randomInt(2010, 2020),
        status: 'active',
      },
    });

    // Add team members
    const memberCount = Math.min(studentIds.length, randomInt(5, teamData.maxMembers));
    const selectedStudents = randomItems(studentIds, memberCount);

    for (let i = 0; i < selectedStudents.length; i++) {
      const studentId = selectedStudents[i];
      const role = i === 0 ? 'captain' : i === 1 ? 'vice-captain' : 'member';

      await prisma.teamMember.create({
        data: {
          tenantId,
          teamId: team.id,
          studentId,
          role,
          position: getPositionForSport(teamData.sport),
          jerseyNo: i + 1,
          joinedAt: daysAgo(randomInt(30, 730)),
          status: 'active',
        },
      });
    }

    // Update team with captain if we have one
    if (selectedStudents.length > 0) {
      await prisma.sportsTeam.update({
        where: { id: team.id },
        data: { captainId: selectedStudents[0] },
      });
    }
  }

  console.log(`    Created ${SPORTS_TEAMS_DATA.length} sports teams with members`);
}

function getPositionForSport(sport: string): string {
  const positions: Record<string, string[]> = {
    cricket: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
    football: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
    basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    volleyball: ['Setter', 'Outside Hitter', 'Libero', 'Middle Blocker'],
    table_tennis: ['Singles', 'Doubles'],
    athletics: ['Sprinter', 'Long Distance', 'Jumper', 'Thrower'],
    chess: ['Player'],
    badminton: ['Singles', 'Doubles'],
  };
  return randomItem(positions[sport] || ['Player']);
}

async function seedAchievements(tenantId: string, studentIds: string[]): Promise<void> {
  console.log('  Creating student achievements...');

  let achievementCount = 0;

  // Only seed for a subset of students (not all 300)
  const sampleStudents = randomItems(studentIds, Math.min(studentIds.length, 50));

  for (const studentId of sampleStudents) {
    // Each student gets 1-3 achievements
    const numAchievements = randomInt(1, 3);

    for (let i = 0; i < numAchievements; i++) {
      const achievementConfig = randomItem(ACHIEVEMENT_TYPES);
      const title = randomItem(achievementConfig.titles);

      // Check if similar achievement exists
      const existing = await prisma.achievement.findFirst({
        where: {
          tenantId,
          studentId,
          title: { contains: title.split(' ')[0] },
        },
      });

      if (existing) continue;

      const position = randomItem(['1st', '2nd', '3rd', 'finalist', 'participant']);
      const hasVerification = Math.random() > 0.2;
      const awardedDate = daysAgo(randomInt(30, 365));

      await prisma.achievement.create({
        data: {
          tenantId,
          studentId,
          title: `${title} - ${position}`,
          description: `Participated in ${title} and secured ${position} position.`,
          category: achievementConfig.category,
          type: achievementConfig.type,
          awardedDate,
          awardedBy: randomItem(['College', 'University', 'State Government', 'Corporate', 'NGO']),
          eventName: title,
          level: randomItem(['college', 'inter-college', 'state', 'national']),
          position,
          certificateUrl: hasVerification ? `https://certificates.edu/${studentId}/${Date.now()}` : null,
          verifiedBy: hasVerification ? 'admin' : null,
          verifiedAt: hasVerification ? daysAgo(randomInt(1, 30)) : null,
          creditsAwarded: achievementConfig.type === 'award' ? randomInt(50, 100) : randomInt(10, 50),
          status: 'active',
        },
      });

      achievementCount++;
    }
  }

  console.log(`    Created ${achievementCount} achievements`);
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          EDUNEXUS ACTIVITIES DATA SEEDER                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'active' },
    });

    console.log(`Found ${tenants.length} active tenants\n`);

    for (const tenant of tenants) {
      console.log(`\n[TENANT] ${tenant.displayName} (${tenant.domain})`);

      // Get students and staff
      const students = await prisma.student.findMany({
        where: { tenantId: tenant.id },
        select: { id: true },
      });
      const studentIds = students.map((s) => s.id);

      const staff = await prisma.staff.findMany({
        where: { tenantId: tenant.id },
        select: { id: true },
      });
      const staffIds = staff.map((s) => s.id);

      if (studentIds.length === 0) {
        console.log('  No students found, skipping...');
        continue;
      }

      await seedClubs(tenant.id, studentIds, staffIds);
      await seedSportsTeams(tenant.id, studentIds, staffIds);
      await seedAchievements(tenant.id, studentIds);
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          ACTIVITIES SEEDING COMPLETE                           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n[ERROR] Activities seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in main seed.ts
export { seedClubs, seedSportsTeams, seedAchievements };

// Run if executed directly
main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
