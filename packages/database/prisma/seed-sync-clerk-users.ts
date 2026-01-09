/**
 * EduNexus Clerk User Sync Script
 *
 * Syncs database users with Clerk authentication.
 * Creates missing Clerk users for existing database users.
 *
 * Usage:
 *   DATABASE_URL="..." CLERK_SECRET_KEY="..." npx tsx prisma/seed-sync-clerk-users.ts
 *
 * Options:
 *   --role=alumni     Only sync users with specific role
 *   --dry-run         Show what would be created without making changes
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const TEST_PASSWORD = 'Nexus@1104';

interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string;
  last_name: string;
}

interface ClerkError {
  errors?: Array<{ message: string; code: string }>;
  message?: string;
}

// =============================================================================
// CLERK API HELPERS
// =============================================================================

async function findClerkUser(email: string): Promise<ClerkUser | null> {
  if (!CLERK_SECRET_KEY) return null;

  try {
    const response = await fetch(
      `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return null;
    const users = await response.json() as ClerkUser[];
    return users.length > 0 ? users[0] : null;
  } catch {
    return null;
  }
}

async function createClerkUser(
  email: string,
  firstName: string,
  lastName: string,
  role: string,
  tenantId: string | null
): Promise<ClerkUser | null> {
  if (!CLERK_SECRET_KEY) {
    console.log(`  [SKIP] Clerk not configured, skipping: ${email}`);
    return null;
  }

  // Check if user exists
  const existing = await findClerkUser(email);
  if (existing) {
    console.log(`  [EXISTS] ${email} (${existing.id})`);
    return existing;
  }

  // Create new user
  try {
    const response = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: [email],
        password: TEST_PASSWORD,
        first_name: firstName,
        last_name: lastName,
        public_metadata: { role, tenantId },
        skip_password_checks: true,
        bypass_client_trust: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as ClerkError;
      const errorMessage = error.errors?.[0]?.message || error.message || 'Unknown error';
      console.log(`  [ERROR] ${email}: ${errorMessage}`);
      return null;
    }

    const user = await response.json() as ClerkUser;
    console.log(`  [CREATED] ${email} (${user.id})`);

    // Rate limiting - wait 100ms between creations
    await new Promise(resolve => setTimeout(resolve, 100));

    return user;
  } catch (error) {
    console.log(`  [ERROR] ${email}: ${error}`);
    return null;
  }
}

// =============================================================================
// MAIN SYNC FUNCTION
// =============================================================================

async function syncClerkUsers(roleFilter?: string, dryRun = false) {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║          EDUNEXUS CLERK USER SYNC SCRIPT                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Clerk API: ${CLERK_SECRET_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`Role Filter: ${roleFilter || 'All roles'}`);
  console.log(`Dry Run: ${dryRun}`);
  console.log('');

  if (!CLERK_SECRET_KEY) {
    console.error('ERROR: CLERK_SECRET_KEY environment variable is required');
    process.exit(1);
  }

  // Find users without Clerk IDs or with null Clerk IDs
  const whereClause: {
    clerkUserId: null;
    role?: string;
  } = {
    clerkUserId: null,
  };

  if (roleFilter) {
    whereClause.role = roleFilter;
  }

  const usersWithoutClerk = await prisma.user.findMany({
    where: whereClause,
    orderBy: [
      { role: 'asc' },
      { email: 'asc' },
    ],
  });

  // Get tenant names for display
  const tenantIds = [...new Set(usersWithoutClerk.map(u => u.tenantId).filter(Boolean))];
  const tenants = await prisma.tenant.findMany({
    where: { id: { in: tenantIds as string[] } },
    select: { id: true, displayName: true },
  });
  const tenantMap = new Map(tenants.map(t => [t.id, t.displayName]));

  console.log(`Found ${usersWithoutClerk.length} users without Clerk accounts\n`);

  if (usersWithoutClerk.length === 0) {
    console.log('All users already have Clerk accounts!');
    return;
  }

  // Group by tenant for display
  const byTenant = usersWithoutClerk.reduce((acc, user) => {
    const tenantName = user.tenantId ? (tenantMap.get(user.tenantId) || 'Unknown') : 'Platform';
    if (!acc[tenantName]) acc[tenantName] = [];
    acc[tenantName].push(user);
    return acc;
  }, {} as Record<string, typeof usersWithoutClerk>);

  let created = 0;
  let failed = 0;
  let skipped = 0;

  for (const [tenantName, users] of Object.entries(byTenant)) {
    console.log(`\n[TENANT] ${tenantName}`);
    console.log('─'.repeat(50));

    for (const user of users) {
      // Parse name into first/last
      const nameParts = user.name?.split(' ') || ['User'];
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || user.role;

      if (dryRun) {
        console.log(`  [DRY-RUN] Would create: ${user.email} (${user.role})`);
        skipped++;
        continue;
      }

      const clerkUser = await createClerkUser(
        user.email,
        firstName,
        lastName,
        user.role,
        user.tenantId
      );

      if (clerkUser) {
        // Update database with Clerk ID
        await prisma.user.update({
          where: { id: user.id },
          data: { clerkUserId: clerkUser.id },
        });
        created++;
      } else {
        failed++;
      }
    }
  }

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                         SYNC SUMMARY                           ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║ Created: ${String(created).padEnd(52)}║`);
  console.log(`║ Failed:  ${String(failed).padEnd(52)}║`);
  console.log(`║ Skipped: ${String(skipped).padEnd(52)}║`);
  console.log('╚════════════════════════════════════════════════════════════════╝');

  if (created > 0) {
    console.log(`\nPassword for all accounts: ${TEST_PASSWORD}`);
  }
}

// =============================================================================
// CLI PARSING
// =============================================================================

function parseArgs(): { role?: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  let role: string | undefined;
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith('--role=')) {
      role = arg.replace('--role=', '');
    }
    if (arg === '--dry-run') {
      dryRun = true;
    }
  }

  return { role, dryRun };
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  const { role, dryRun } = parseArgs();

  try {
    await syncClerkUsers(role, dryRun);
  } catch (error) {
    console.error('\n[ERROR] Sync failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
