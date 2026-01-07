/**
 * Clerk Role Assignment Utility
 *
 * Usage:
 *   npx ts-node scripts/assign-clerk-role.ts <user_id> <role>
 *
 * Example:
 *   npx ts-node scripts/assign-clerk-role.ts user_2abc123 principal
 *
 * Available roles:
 *   - platform_owner
 *   - principal
 *   - hod
 *   - admin_staff
 *   - teacher
 *   - lab_assistant
 *   - student
 *   - parent
 */

import { createClerkClient } from '@clerk/backend';

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const VALID_ROLES = [
  'platform_owner',
  'principal',
  'hod',
  'admin_staff',
  'teacher',
  'lab_assistant',
  'student',
  'parent',
] as const;

type Role = typeof VALID_ROLES[number];

interface UserMetadata {
  role: Role;
  tenantId?: string;
  departmentId?: string;
}

async function assignRole(userId: string, role: Role, tenantId?: string, departmentId?: string) {
  if (!VALID_ROLES.includes(role)) {
    console.error(`Invalid role: ${role}`);
    console.log(`Valid roles: ${VALID_ROLES.join(', ')}`);
    process.exit(1);
  }

  try {
    // Get current user
    const user = await clerk.users.getUser(userId);
    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.emailAddresses[0]?.emailAddress})`);

    // Prepare metadata
    const metadata: UserMetadata = {
      role,
      ...(tenantId && { tenantId }),
      ...(departmentId && { departmentId }),
    };

    // Update user's public metadata
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: metadata,
    });

    console.log(`\n✅ Successfully assigned role "${role}" to user ${userId}`);
    console.log(`   Metadata: ${JSON.stringify(metadata, null, 2)}`);

    // Fetch updated user to confirm
    const updatedUser = await clerk.users.getUser(userId);
    console.log(`\n📋 Updated user metadata:`);
    console.log(JSON.stringify(updatedUser.publicMetadata, null, 2));

  } catch (error: any) {
    console.error(`\n❌ Error assigning role:`, error.message);
    if (error.status === 404) {
      console.log(`   User with ID "${userId}" not found.`);
      console.log(`   Get user IDs from: https://dashboard.clerk.com → Users`);
    }
    process.exit(1);
  }
}

async function listUsers() {
  try {
    const users = await clerk.users.getUserList({ limit: 20 });

    console.log('\n📋 Users in your Clerk application:\n');
    console.log('ID'.padEnd(35) + 'Email'.padEnd(35) + 'Role');
    console.log('-'.repeat(90));

    for (const user of users.data) {
      const email = user.emailAddresses[0]?.emailAddress || 'N/A';
      const role = (user.publicMetadata as any)?.role || '(no role)';
      console.log(user.id.padEnd(35) + email.padEnd(35) + role);
    }

    console.log(`\nTotal: ${users.data.length} users`);
  } catch (error: any) {
    console.error('Error listing users:', error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);

if (args[0] === 'list') {
  listUsers();
} else if (args.length < 2) {
  console.log(`
Clerk Role Assignment Utility
=============================

Usage:
  npx ts-node scripts/assign-clerk-role.ts <user_id> <role> [tenant_id] [department_id]
  npx ts-node scripts/assign-clerk-role.ts list

Commands:
  list                              List all users and their roles
  <user_id> <role>                  Assign a role to a user

Available Roles:
  ${VALID_ROLES.join('\n  ')}

Examples:
  npx ts-node scripts/assign-clerk-role.ts list
  npx ts-node scripts/assign-clerk-role.ts user_2abc123 principal
  npx ts-node scripts/assign-clerk-role.ts user_2abc123 teacher tenant_xyz dept_cs

Get user IDs from: https://dashboard.clerk.com → Users
  `);
} else {
  const [userId, role, tenantId, departmentId] = args;
  assignRole(userId, role as Role, tenantId, departmentId);
}
