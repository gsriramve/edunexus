/**
 * EduNexus Alumni Data Seeder
 *
 * Seeds additional alumni profiles, employment history, mentorships, and events.
 * Run after seed-test-data.ts
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx prisma/seed-alumni.ts
 */

import { PrismaClient } from '@prisma/client';
import {
  randomIndianName,
  randomCompanyAndRole,
  randomItem,
  randomItems,
  randomInt,
  randomFloat,
  randomDate,
  daysAgo,
  daysFromNow,
  TECHNICAL_SKILLS,
  CERTIFICATIONS,
  ALL_COMPANIES,
  INDIAN_CITIES,
  JOB_ROLES,
} from './lib/seed-utils';

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURATION
// =============================================================================

const ALUMNI_PER_TENANT = 8; // Additional alumni beyond the primary persona
const MENTORSHIPS_PER_TENANT = 6;
const EVENTS_PER_TENANT = 3;

const GRADUATION_YEARS = [2018, 2019, 2020, 2021, 2022, 2023];
const BATCHES = ['2014-2018', '2015-2019', '2016-2020', '2017-2021', '2018-2022', '2019-2023'];

const MENTORSHIP_FOCUS_AREAS = [
  'career_guidance',
  'technical_mentoring',
  'interview_prep',
  'resume_review',
  'project_guidance',
  'industry_insights',
];

const EVENT_TYPES = ['reunion', 'networking', 'guest_lecture', 'workshop', 'homecoming'];

const TESTIMONIAL_CATEGORIES = ['career_success', 'entrepreneurship', 'higher_studies', 'gratitude'];

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

async function seedAlumniProfiles(tenantId: string, departmentId: string): Promise<string[]> {
  console.log(`  Creating ${ALUMNI_PER_TENANT} additional alumni profiles...`);
  const alumniIds: string[] = [];

  for (let i = 0; i < ALUMNI_PER_TENANT; i++) {
    const { firstName, lastName, fullName } = randomIndianName();
    const graduationYear = randomItem(GRADUATION_YEARS);
    const batchIndex = GRADUATION_YEARS.indexOf(graduationYear);
    const batch = BATCHES[batchIndex >= 0 ? batchIndex : 0];

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${graduationYear}@alumni.edu`;

    // Check if alumni exists
    const existing = await prisma.alumniProfile.findFirst({
      where: { tenantId, email },
    });

    if (existing) {
      alumniIds.push(existing.id);
      continue;
    }

    const cgpa = randomFloat(6.5, 9.5, 2);
    const currentStatus = randomItem(['employed', 'employed', 'employed', 'entrepreneur', 'higher_studies']);
    const openToMentoring = Math.random() > 0.4; // 60% open to mentoring

    const alumni = await prisma.alumniProfile.create({
      data: {
        tenantId,
        firstName,
        lastName,
        email,
        phone: `+91${randomInt(7000000000, 9999999999)}`,
        linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        graduationYear,
        batch,
        departmentId,
        degree: 'B.Tech Computer Science & Engineering',
        finalCgpa: cgpa,
        registrationStatus: 'approved',
        registrationDate: randomDate(new Date(graduationYear, 5, 1), new Date(graduationYear, 11, 31)),
        currentStatus,
        visibleInDirectory: true,
        showEmail: Math.random() > 0.5,
        showPhone: Math.random() > 0.7,
        showEmployment: true,
        openToMentoring,
        mentorshipAreas: openToMentoring ? randomItems(MENTORSHIP_FOCUS_AREAS, randomInt(2, 4)) : [],
        bio: `${fullName} graduated in ${graduationYear} with a CGPA of ${cgpa}. Currently ${currentStatus === 'employed' ? 'working in the tech industry' : currentStatus === 'entrepreneur' ? 'running a startup' : 'pursuing higher studies'}.`,
      },
    });

    alumniIds.push(alumni.id);

    // Create employment history (1-3 jobs)
    const employmentCount = randomInt(1, 3);
    let currentYear = graduationYear;

    for (let j = 0; j < employmentCount; j++) {
      const isCurrentJob = j === employmentCount - 1;
      const { company, role, location } = randomCompanyAndRole();

      const startDate = new Date(currentYear, randomInt(0, 11), randomInt(1, 28));
      const endDate = isCurrentJob ? null : new Date(currentYear + randomInt(1, 2), randomInt(0, 11), randomInt(1, 28));

      await prisma.alumniEmployment.create({
        data: {
          tenantId,
          alumniId: alumni.id,
          companyName: company.name,
          role,
          location,
          startDate,
          endDate,
          isCurrent: isCurrentJob,
          salaryBand: company.salaryBand,
          industry: 'Technology',
          companySize: company.size,
          description: `${role} at ${company.short}, ${location}. Working on ${randomItems(TECHNICAL_SKILLS, 3).join(', ')}.`,
          isVerified: Math.random() > 0.3,
          verifiedAt: Math.random() > 0.3 ? new Date() : null,
        },
      });

      if (endDate) {
        currentYear = endDate.getFullYear();
      }
    }

    // Create testimonial for some alumni (30% chance)
    if (Math.random() > 0.7) {
      await prisma.alumniTestimonial.create({
        data: {
          tenantId,
          alumniId: alumni.id,
          title: `My Journey from Campus to ${randomItem(ALL_COMPANIES).short}`,
          content: `The education and guidance I received at this institution laid the foundation for my career success. The faculty mentorship, practical projects, and campus placements prepared me well for the industry. I'm grateful for the opportunities and connections that continue to benefit me to this day.`,
          category: randomItem(TESTIMONIAL_CATEGORIES),
          isApproved: Math.random() > 0.3,
          approvedAt: Math.random() > 0.3 ? new Date() : null,
          isFeatured: Math.random() > 0.8,
        },
      });
    }
  }

  console.log(`    Created ${alumniIds.length} alumni profiles with employment history`);
  return alumniIds;
}

async function seedMentorships(
  tenantId: string,
  alumniIds: string[],
  studentIds: string[]
): Promise<void> {
  console.log(`  Creating ${MENTORSHIPS_PER_TENANT} mentorship connections...`);

  if (studentIds.length === 0 || alumniIds.length === 0) {
    console.log('    Skipping - no students or alumni available');
    return;
  }

  const statuses = ['pending', 'active', 'active', 'completed', 'completed', 'cancelled'];

  for (let i = 0; i < MENTORSHIPS_PER_TENANT; i++) {
    const alumniId = randomItem(alumniIds);
    const studentId = randomItem(studentIds);
    const status = statuses[i % statuses.length];

    // Check if mentorship exists
    const existing = await prisma.alumniMentorship.findFirst({
      where: { alumniId, studentId },
    });

    if (existing) continue;

    const focusArea = randomItem(MENTORSHIP_FOCUS_AREAS);
    const startDate = status !== 'pending' ? daysAgo(randomInt(30, 180)) : null;
    const endDate = status === 'completed' ? daysAgo(randomInt(1, 29)) : null;
    const meetingsCount = status === 'pending' ? 0 : status === 'active' ? randomInt(1, 5) : randomInt(5, 12);

    await prisma.alumniMentorship.create({
      data: {
        tenantId,
        alumniId,
        studentId,
        focusArea,
        status,
        requestMessage: `Hi, I am interested in getting mentorship for ${focusArea.replace('_', ' ')}. Would you be available to guide me?`,
        responseMessage: status !== 'pending' ? `Happy to help! Let's schedule our first meeting.` : null,
        startDate,
        endDate,
        meetingsCount,
        studentRating: status === 'completed' ? randomInt(4, 5) : null,
        studentReview: status === 'completed' ? 'Great mentor! Very helpful and insightful.' : null,
        alumniRating: status === 'completed' ? randomInt(4, 5) : null,
        alumniReview: status === 'completed' ? 'Motivated student with great potential.' : null,
      },
    });
  }

  console.log(`    Created mentorship connections`);
}

async function seedAlumniEvents(tenantId: string, alumniIds: string[]): Promise<void> {
  console.log(`  Creating ${EVENTS_PER_TENANT} alumni events...`);

  const eventConfigs = [
    {
      title: 'Annual Alumni Reunion 2025',
      eventType: 'reunion',
      startDate: daysFromNow(60),
      venue: 'College Main Auditorium',
      isVirtual: false,
      status: 'published',
    },
    {
      title: 'Tech Talk: AI in Industry',
      eventType: 'guest_lecture',
      startDate: daysFromNow(14),
      venue: 'Seminar Hall B',
      isVirtual: true,
      meetLink: 'https://meet.google.com/abc-defg-hij',
      status: 'published',
    },
    {
      title: 'Alumni Networking Night 2024',
      eventType: 'networking',
      startDate: daysAgo(30),
      venue: 'College Campus Lawn',
      isVirtual: false,
      status: 'completed',
    },
  ];

  for (const config of eventConfigs) {
    // Check if event exists
    const existing = await prisma.alumniEvent.findFirst({
      where: { tenantId, title: config.title },
    });

    if (existing) continue;

    const event = await prisma.alumniEvent.create({
      data: {
        tenantId,
        title: config.title,
        description: `Join us for ${config.title}. This is a great opportunity to connect with fellow alumni and current students.`,
        eventType: config.eventType,
        startDate: config.startDate,
        endDate: new Date(config.startDate.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
        venue: config.venue,
        isVirtual: config.isVirtual,
        meetLink: config.meetLink || null,
        registrationDeadline: new Date(config.startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
        maxAttendees: 100,
        registrationFee: config.eventType === 'reunion' ? 500 : 0,
        targetBatches: [],
        targetDepartments: [],
        status: config.status,
        createdById: 'system',
      },
    });

    // Add some attendees for past/upcoming events
    if (config.status !== 'draft') {
      const attendeeCount = Math.min(alumniIds.length, randomInt(3, 8));
      const selectedAlumni = randomItems(alumniIds, attendeeCount);

      for (const alumniId of selectedAlumni) {
        await prisma.alumniEventAttendance.create({
          data: {
            tenantId,
            eventId: event.id,
            alumniId,
            registeredAt: daysAgo(randomInt(1, 14)),
            attended: config.status === 'completed' ? Math.random() > 0.2 : false,
            attendedAt: config.status === 'completed' && Math.random() > 0.2 ? config.startDate : null,
            feedback: config.status === 'completed' ? 'Great event! Looking forward to the next one.' : null,
            rating: config.status === 'completed' ? randomInt(4, 5) : null,
          },
        });
      }
    }
  }

  console.log(`    Created alumni events with attendees`);
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          EDUNEXUS ALUMNI DATA SEEDER                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      where: { status: 'active' },
    });

    console.log(`Found ${tenants.length} active tenants\n`);

    for (const tenant of tenants) {
      console.log(`\n[TENANT] ${tenant.displayName} (${tenant.domain})`);

      // Get department
      const department = await prisma.department.findFirst({
        where: { tenantId: tenant.id, code: 'CSE' },
      });

      if (!department) {
        console.log('  Skipping - no CSE department found');
        continue;
      }

      // Get students for mentorship
      const students = await prisma.student.findMany({
        where: { tenantId: tenant.id, status: 'active' },
        select: { id: true },
      });
      const studentIds = students.map((s) => s.id);

      // Seed alumni data
      const alumniIds = await seedAlumniProfiles(tenant.id, department.id);
      await seedMentorships(tenant.id, alumniIds, studentIds);
      await seedAlumniEvents(tenant.id, alumniIds);
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          ALUMNI SEEDING COMPLETE                               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n[ERROR] Alumni seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in main seed.ts
export { seedAlumniProfiles, seedMentorships, seedAlumniEvents };

// Run if executed directly
main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
