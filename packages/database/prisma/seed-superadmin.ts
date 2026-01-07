/**
 * Super Admin Seeding Script
 *
 * This script creates the Platform Owner (Super Admin) user in both
 * Clerk and the local database. Run this once on initial deployment.
 *
 * Usage:
 *   DATABASE_URL="..." CLERK_SECRET_KEY="..." npx ts-node prisma/seed-superadmin.ts
 *
 * Environment Variables:
 *   - DATABASE_URL: PostgreSQL connection string
 *   - CLERK_SECRET_KEY: Clerk secret key for API access
 *   - SUPER_ADMIN_EMAIL: Super admin email (default: admin@edunexus.io)
 *   - SUPER_ADMIN_PASSWORD: Initial password (default: ChangeMe123!)
 *   - SUPER_ADMIN_NAME: Display name (default: EduNexus Admin)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@edunexus.io';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!';
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'EduNexus Admin';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

interface ClerkUser {
  id: string;
  email_addresses: Array<{
    email_address: string;
  }>;
  first_name: string;
  last_name: string;
}

interface ClerkError {
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

async function findExistingClerkUser(email: string): Promise<ClerkUser | null> {
  if (!CLERK_SECRET_KEY) {
    console.log('CLERK_SECRET_KEY not provided, skipping Clerk lookup');
    return null;
  }

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

    if (!response.ok) {
      console.warn('Failed to search Clerk users:', await response.text());
      return null;
    }

    const users = await response.json() as ClerkUser[];
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error searching Clerk:', error);
    return null;
  }
}

async function createClerkUser(): Promise<ClerkUser | null> {
  if (!CLERK_SECRET_KEY) {
    console.warn('CLERK_SECRET_KEY not provided, skipping Clerk user creation');
    console.warn('You will need to manually create the Super Admin in Clerk');
    return null;
  }

  // First check if user already exists in Clerk
  const existingUser = await findExistingClerkUser(SUPER_ADMIN_EMAIL);
  if (existingUser) {
    console.log('Super Admin already exists in Clerk:', existingUser.id);

    // Update metadata to ensure role is set correctly
    try {
      await fetch(`https://api.clerk.com/v1/users/${existingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: {
            role: 'platform_owner',
            tenantId: null,
          },
        }),
      });
      console.log('Updated Clerk metadata for existing user');
    } catch (err) {
      console.warn('Could not update Clerk metadata:', err);
    }

    return existingUser;
  }

  // Create new user in Clerk
  console.log('Creating Super Admin in Clerk...');

  const nameParts = SUPER_ADMIN_NAME.split(' ');
  const firstName = nameParts[0] || 'EduNexus';
  const lastName = nameParts.slice(1).join(' ') || 'Admin';

  try {
    const response = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: [SUPER_ADMIN_EMAIL],
        password: SUPER_ADMIN_PASSWORD,
        first_name: firstName,
        last_name: lastName,
        public_metadata: {
          role: 'platform_owner',
          tenantId: null,
        },
        skip_password_checks: true,
        skip_password_requirement: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as ClerkError;
      console.error('Failed to create Clerk user:', error);

      // Check if error is because user already exists
      if (error.errors?.some(e => e.code === 'form_identifier_exists')) {
        console.log('User already exists in Clerk, fetching...');
        return findExistingClerkUser(SUPER_ADMIN_EMAIL);
      }

      return null;
    }

    const clerkUser = await response.json() as ClerkUser;
    console.log('Created Super Admin in Clerk:', clerkUser.id);
    return clerkUser;
  } catch (error) {
    console.error('Error creating Clerk user:', error);
    return null;
  }
}

async function seedSuperAdmin() {
  console.log('\n=== EduNexus Super Admin Seeding Script ===\n');
  console.log('Email:', SUPER_ADMIN_EMAIL);
  console.log('Name:', SUPER_ADMIN_NAME);
  console.log('Clerk Secret:', CLERK_SECRET_KEY ? 'Configured' : 'NOT CONFIGURED');
  console.log('');

  try {
    // 1. Check if Super Admin already exists in database
    const existingUser = await prisma.user.findFirst({
      where: { role: 'platform_owner' },
    });

    if (existingUser) {
      console.log('Super Admin already exists in database:');
      console.log('  ID:', existingUser.id);
      console.log('  Email:', existingUser.email);
      console.log('  Clerk User ID:', existingUser.clerkUserId || 'Not linked');
      console.log('\nTo reset, manually delete the user from the database.');
      return;
    }

    // 2. Create/find user in Clerk
    const clerkUser = await createClerkUser();
    const clerkUserId = clerkUser?.id || null;

    // 3. Create user in database
    console.log('\nCreating Super Admin in database...');

    const user = await prisma.user.create({
      data: {
        email: SUPER_ADMIN_EMAIL,
        name: SUPER_ADMIN_NAME,
        role: 'platform_owner',
        clerkUserId: clerkUserId,
        status: 'active',
        tenantId: null, // Platform owner has no tenant
      },
    });

    console.log('\nSuper Admin created successfully!');
    console.log('');
    console.log('========================================');
    console.log('  Database User ID:', user.id);
    console.log('  Clerk User ID:', clerkUserId || 'Not created');
    console.log('  Email:', SUPER_ADMIN_EMAIL);
    if (!clerkUser) {
      console.log('\n  NOTE: Clerk user was not created.');
      console.log('  Please create the user manually in Clerk dashboard');
      console.log('  with the email above and set public_metadata:');
      console.log('    { "role": "platform_owner", "tenantId": null }');
    } else {
      console.log('\n  Login Credentials:');
      console.log('  Email:', SUPER_ADMIN_EMAIL);
      console.log('  Password:', SUPER_ADMIN_PASSWORD);
      console.log('\n  IMPORTANT: Change the password after first login!');
    }
    console.log('========================================');

  } catch (error) {
    console.error('\nError seeding Super Admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedSuperAdmin()
  .then(() => {
    console.log('\nSeeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nSeeding failed:', error);
    process.exit(1);
  });
