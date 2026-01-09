/**
 * Fix Clerk Roles for Test Users
 *
 * This script fixes the role metadata for all test users across all 3 colleges.
 * Run this if sidebar navigation shows incorrect menu items for a user.
 *
 * Usage:
 *   CLERK_SECRET_KEY="..." npx tsx scripts/fix-clerk-roles.ts
 *
 * Note: Requires CLERK_SECRET_KEY environment variable
 */

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error('❌ CLERK_SECRET_KEY environment variable is required');
  console.log('\nUsage: CLERK_SECRET_KEY="sk_test_..." npx tsx scripts/fix-clerk-roles.ts');
  process.exit(1);
}

// Tenant IDs (database tenant ID for each domain)
const TENANTS: Record<string, string> = {
  'nexus-ec': 'cmk4wcffw0000vi1ypnqxhkfh',
  'quantum-it': 'cmk4wcl0q0083vi1yymij0yib',
  'careerfied': 'cmk4wcpx100g6vi1yan1iwvxq',
};

// Role mappings by email prefix
const ROLE_BY_EMAIL_PREFIX: Record<string, string> = {
  'principal': 'principal',
  'hod.cse': 'hod',
  'admin': 'admin_staff',
  'teacher': 'teacher',
  'lab': 'lab_assistant',
  'student': 'student',
  'parent': 'parent',
  'alumni': 'alumni',
};

interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  public_metadata: Record<string, unknown>;
}

async function getAllUsers(): Promise<ClerkUser[]> {
  const allUsers: ClerkUser[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await fetch(
      `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const users = await response.json() as ClerkUser[];
    if (users.length === 0) break;

    allUsers.push(...users);
    offset += limit;
    if (users.length < limit) break;
  }

  return allUsers;
}

async function updateUserRole(userId: string, role: string, tenantId: string): Promise<boolean> {
  const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      public_metadata: { role, tenantId },
    }),
  });

  return response.ok;
}

function getExpectedRole(email: string): { role: string; tenantId: string } | null {
  // Check each domain
  for (const [domain, tenantId] of Object.entries(TENANTS)) {
    if (email.endsWith(`@${domain}.edu`)) {
      // Find matching role prefix
      for (const [prefix, role] of Object.entries(ROLE_BY_EMAIL_PREFIX)) {
        if (email.startsWith(prefix + '@') || email.startsWith(prefix + '.')) {
          return { role, tenantId };
        }
      }
    }
  }
  return null;
}

async function main() {
  console.log('🔧 Fixing Clerk roles for test users...\n');

  const users = await getAllUsers();
  console.log(`Found ${users.length} users in Clerk\n`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    const email = user.email_addresses[0]?.email_address;
    if (!email) continue;

    const expected = getExpectedRole(email);
    if (!expected) {
      // Not a test user
      continue;
    }

    const currentRole = (user.public_metadata as { role?: string })?.role;
    const currentTenant = (user.public_metadata as { tenantId?: string })?.tenantId;

    if (currentRole === expected.role && currentTenant === expected.tenantId) {
      console.log(`✓ ${email.padEnd(30)} role=${currentRole} (correct)`);
      skipped++;
      continue;
    }

    console.log(`→ ${email.padEnd(30)} ${currentRole || '(none)'} → ${expected.role}`);

    const success = await updateUserRole(user.id, expected.role, expected.tenantId);
    if (success) {
      console.log(`  ✓ Updated successfully`);
      fixed++;
    } else {
      console.log(`  ✗ Failed to update`);
      errors++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Summary:`);
  console.log(`  Fixed:   ${fixed}`);
  console.log(`  Correct: ${skipped}`);
  console.log(`  Errors:  ${errors}`);
  console.log(`${'='.repeat(50)}`);

  if (fixed > 0) {
    console.log('\n⚠️  After fixing roles, restart the Next.js dev server and log in again.');
  }
}

main().catch(console.error);
