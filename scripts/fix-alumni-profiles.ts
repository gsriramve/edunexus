/**
 * Fix Alumni Profiles userId
 *
 * This script updates AlumniProfile.userId to use Clerk user IDs instead of
 * database User IDs. The frontend sends Clerk user IDs via x-user-id header,
 * so AlumniProfile.userId needs to match.
 *
 * Usage:
 *   npx tsx scripts/fix-alumni-profiles.ts
 *
 * Note: Run this from the project root directory
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing alumni profile userIds...\n');

  // Get all alumni profiles
  const profiles = await prisma.alumniProfile.findMany({
    select: {
      id: true,
      email: true,
      userId: true,
      tenantId: true,
      firstName: true,
      lastName: true,
    },
  });

  console.log(`Found ${profiles.length} alumni profiles\n`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const profile of profiles) {
    // Find the database User by email and tenantId
    const user = await prisma.user.findFirst({
      where: {
        email: profile.email,
        tenantId: profile.tenantId,
      },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
      },
    });

    if (!user) {
      console.log(`[SKIP] No user found for ${profile.email}`);
      skipped++;
      continue;
    }

    if (!user.clerkUserId) {
      console.log(`[SKIP] No Clerk user ID for ${profile.email}`);
      skipped++;
      continue;
    }

    // Check if already using Clerk user ID
    if (profile.userId === user.clerkUserId) {
      console.log(`[OK] ${profile.email} - already using Clerk user ID`);
      skipped++;
      continue;
    }

    // Update to use Clerk user ID
    try {
      await prisma.alumniProfile.update({
        where: { id: profile.id },
        data: { userId: user.clerkUserId },
      });
      console.log(`[FIXED] ${profile.email} - updated userId to ${user.clerkUserId}`);
      fixed++;
    } catch (err) {
      console.log(`[ERROR] ${profile.email}: ${err}`);
      errors++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('Summary:');
  console.log(`  Fixed:   ${fixed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors:  ${errors}`);
  console.log('='.repeat(50));

  if (fixed > 0) {
    console.log('\nAlumni profiles updated. Refresh the browser to see the changes.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
