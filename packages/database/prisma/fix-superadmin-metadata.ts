/**
 * Fix Super Admin Clerk Metadata Script
 *
 * This script updates the Clerk user's publicMetadata to include the platform_owner role.
 *
 * Usage:
 *   CLERK_SECRET_KEY="..." SUPER_ADMIN_EMAIL="..." npx tsx prisma/fix-superadmin-metadata.ts
 */

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'sriram.venkat@quantumlayerplatform.com';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

interface ClerkUser {
  id: string;
  email_addresses: Array<{
    email_address: string;
  }>;
  public_metadata: Record<string, unknown>;
}

async function fixSuperAdminMetadata() {
  console.log('\n=== Fix Super Admin Clerk Metadata ===\n');
  console.log('Email:', SUPER_ADMIN_EMAIL);

  if (!CLERK_SECRET_KEY) {
    console.error('ERROR: CLERK_SECRET_KEY is required!');
    console.log('\nUsage:');
    console.log('  CLERK_SECRET_KEY="sk_test_..." npx tsx prisma/fix-superadmin-metadata.ts');
    process.exit(1);
  }

  try {
    // 1. Find user in Clerk
    console.log('\nSearching for user in Clerk...');
    const searchResponse = await fetch(
      `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(SUPER_ADMIN_EMAIL)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!searchResponse.ok) {
      console.error('Failed to search Clerk:', await searchResponse.text());
      process.exit(1);
    }

    const users = await searchResponse.json() as ClerkUser[];
    if (users.length === 0) {
      console.error('User not found in Clerk with email:', SUPER_ADMIN_EMAIL);
      process.exit(1);
    }

    const clerkUser = users[0];
    console.log('Found Clerk user:', clerkUser.id);
    console.log('Current publicMetadata:', JSON.stringify(clerkUser.public_metadata, null, 2));

    // 2. Update publicMetadata with role
    console.log('\nUpdating publicMetadata with platform_owner role...');
    const updateResponse = await fetch(
      `https://api.clerk.com/v1/users/${clerkUser.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: {
            ...clerkUser.public_metadata,
            role: 'platform_owner',
            tenantId: null,
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update Clerk user:', await updateResponse.text());
      process.exit(1);
    }

    const updatedUser = await updateResponse.json() as ClerkUser;
    console.log('\n✅ Successfully updated Clerk user metadata!');
    console.log('New publicMetadata:', JSON.stringify(updatedUser.public_metadata, null, 2));
    console.log('\n========================================');
    console.log('IMPORTANT: You need to sign out and sign back in');
    console.log('for the new metadata to take effect in your session.');
    console.log('========================================\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixSuperAdminMetadata();
