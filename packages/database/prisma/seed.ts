/**
 * EduNexus Master Database Seeder
 *
 * Orchestrates all seeders in the correct dependency order.
 * Run this to seed all data for testing with 3 colleges and 8 personas each.
 *
 * Usage:
 *   npm run db:seed                    # Run all seeders
 *   npm run db:seed -- --only=test     # Run only test data seeder
 *   npm run db:seed -- --skip=enhanced # Skip enhanced data seeder
 *
 * Run: npm run db:seed (from packages/database)
 * Or:  npx tsx prisma/seed.ts
 */

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURATION
// =============================================================================

interface SeedStep {
  name: string;
  file: string;
  description: string;
  required: boolean;
}

const SEED_STEPS: SeedStep[] = [
  {
    name: 'superadmin',
    file: 'seed-superadmin.ts',
    description: 'Platform super admin',
    required: true,
  },
  {
    name: 'test-data',
    file: 'seed-test-data.ts',
    description: 'Tenants + 8 personas + base academic data',
    required: true,
  },
  {
    name: 'enhanced',
    file: 'seed-enhanced-data.ts',
    description: 'More students, library books, departments',
    required: false,
  },
  {
    name: 'fees',
    file: 'seed-fees.ts',
    description: 'Student fees: tuition, exam, library, lab, hostel, transport',
    required: false,
  },
  {
    name: 'alumni',
    file: 'seed-alumni.ts',
    description: 'Alumni profiles, employment, mentorships',
    required: false,
  },
  {
    name: 'activities',
    file: 'seed-activities.ts',
    description: 'Clubs, sports teams, achievements',
    required: false,
  },
  {
    name: 'services',
    file: 'seed-services.ts',
    description: 'Library issues, certificates, hostel fees',
    required: false,
  },
  {
    name: 'student-growth',
    file: 'seed-student-growth.ts',
    description: 'SGI/CRI, goals, guidance, journey',
    required: false,
  },
  {
    name: 'feedback',
    file: 'seed-feedback.ts',
    description: 'Feedback cycles and entries',
    required: false,
  },
  {
    name: 'communications',
    file: 'seed-communications.ts',
    description: 'Message templates, bulk communications',
    required: false,
  },
];

// =============================================================================
// HELPERS
// =============================================================================

function parseArgs(): { only?: string[]; skip?: string[] } {
  const args = process.argv.slice(2);
  const result: { only?: string[]; skip?: string[] } = {};

  for (const arg of args) {
    if (arg.startsWith('--only=')) {
      result.only = arg.replace('--only=', '').split(',');
    }
    if (arg.startsWith('--skip=')) {
      result.skip = arg.replace('--skip=', '').split(',');
    }
  }

  return result;
}

function runSeeder(file: string): boolean {
  try {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Running: ${file}`);
    console.log('─'.repeat(60));

    execSync(`npx tsx prisma/${file}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env },
    });

    return true;
  } catch (error) {
    console.error(`\n❌ Seeder failed: ${file}`);
    return false;
  }
}

// =============================================================================
// VERIFICATION QUERIES
// =============================================================================

async function verifySeeding(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    SEEDING VERIFICATION                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const counts = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.student.count(),
    prisma.staff.count(),
    prisma.department.count(),
    prisma.course.count(),
    prisma.subject.count(),
    prisma.studentFee.count(),
    prisma.paymentTransaction.count(),
    prisma.alumniProfile.count(),
    prisma.alumniMentorship.count(),
    prisma.studentGrowthIndex.count(),
    prisma.careerReadinessIndex.count(),
    prisma.feedbackCycle.count(),
    prisma.feedbackEntry.count(),
    prisma.club.count(),
    prisma.sportsTeam.count(),
    prisma.achievement.count(),
    prisma.certificateRequest.count(),
    prisma.bookIssue.count(),
    prisma.messageTemplate.count(),
  ]);

  const labels = [
    'Tenants',
    'Users',
    'Students',
    'Staff',
    'Departments',
    'Courses',
    'Subjects',
    'Student Fees',
    'Payment Transactions',
    'Alumni Profiles',
    'Mentorships',
    'SGI Records',
    'CRI Records',
    'Feedback Cycles',
    'Feedback Entries',
    'Clubs',
    'Sports Teams',
    'Achievements',
    'Certificate Requests',
    'Book Issues',
    'Message Templates',
  ];

  console.log('Data counts per model:');
  console.log('─'.repeat(40));

  for (let i = 0; i < labels.length; i++) {
    console.log(`  ${labels[i].padEnd(25)} ${counts[i]}`);
  }

  console.log('─'.repeat(40));

  // Per-tenant breakdown
  const tenants = await prisma.tenant.findMany({
    select: { id: true, displayName: true },
    orderBy: { displayName: 'asc' },
  });

  console.log('\nPer-tenant breakdown:');
  console.log('─'.repeat(60));

  for (const tenant of tenants) {
    const [users, students, staff, alumni] = await Promise.all([
      prisma.user.count({ where: { tenantId: tenant.id } }),
      prisma.student.count({ where: { tenantId: tenant.id } }),
      prisma.staff.count({ where: { tenantId: tenant.id } }),
      prisma.alumniProfile.count({ where: { tenantId: tenant.id } }),
    ]);

    console.log(`  ${tenant.displayName}`);
    console.log(`    Users: ${users}, Students: ${students}, Staff: ${staff}, Alumni: ${alumni}`);
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           EDUNEXUS MASTER DATABASE SEEDER                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('This seeder orchestrates all seed scripts in dependency order.');
  console.log('');

  const { only, skip } = parseArgs();

  if (only) {
    console.log(`Running only: ${only.join(', ')}`);
  }
  if (skip) {
    console.log(`Skipping: ${skip.join(', ')}`);
  }

  const failedSteps: string[] = [];
  let completedSteps = 0;

  for (const step of SEED_STEPS) {
    // Skip if using --only and this step is not included
    if (only && !only.includes(step.name)) {
      console.log(`\n⏭️  Skipping ${step.name} (not in --only list)`);
      continue;
    }

    // Skip if using --skip and this step is in the skip list
    if (skip && skip.includes(step.name)) {
      console.log(`\n⏭️  Skipping ${step.name} (in --skip list)`);
      continue;
    }

    console.log(`\n📌 Step ${completedSteps + 1}: ${step.name}`);
    console.log(`   ${step.description}`);

    const success = runSeeder(step.file);

    if (success) {
      console.log(`\n✅ ${step.name} completed`);
      completedSteps++;
    } else {
      failedSteps.push(step.name);
      if (step.required) {
        console.error(`\n❌ Required seeder ${step.name} failed. Stopping.`);
        break;
      } else {
        console.log(`\n⚠️  Optional seeder ${step.name} failed, continuing...`);
      }
    }
  }

  // Run verification
  await verifySeeding();

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    SEEDING SUMMARY                             ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║ Completed: ${completedSteps}/${SEED_STEPS.length} steps`.padEnd(65) + '║');

  if (failedSteps.length > 0) {
    console.log(`║ Failed: ${failedSteps.join(', ')}`.padEnd(65) + '║');
  }

  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║ Test Credentials:                                              ║');
  console.log('║ Password: Nexus@1104 (all accounts)                            ║');
  console.log('║                                                                 ║');
  console.log('║ Colleges:                                                       ║');
  console.log('║   - nexus-ec: Nexus Engineering College                         ║');
  console.log('║   - quantum-it: Quantum Institute of Technology                 ║');
  console.log('║   - careerfied: Careerfied Academy                              ║');
  console.log('║                                                                 ║');
  console.log('║ Personas per college:                                           ║');
  console.log('║   principal@<domain>.edu, hod.cse@<domain>.edu,                 ║');
  console.log('║   admin@<domain>.edu, teacher@<domain>.edu,                     ║');
  console.log('║   lab@<domain>.edu, student@<domain>.edu,                       ║');
  console.log('║   parent@<domain>.edu, alumni@<domain>.edu                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  if (failedSteps.length > 0) {
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Master seeder failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
