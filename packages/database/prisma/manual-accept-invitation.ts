/**
 * Manual Invitation Acceptance Script
 *
 * Use this when Clerk webhook isn't configured for local development.
 * This script manually accepts an invitation and sets up the user.
 *
 * Usage:
 *   CLERK_SECRET_KEY="..." EMAIL="..." npx tsx prisma/manual-accept-invitation.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EMAIL = process.env.EMAIL || 'srigonella@outlook.com';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string;
  last_name: string;
}

async function main() {
  console.log('\n=== Manual Invitation Acceptance ===\n');
  console.log('Email:', EMAIL);

  if (!CLERK_SECRET_KEY) {
    console.error('ERROR: CLERK_SECRET_KEY is required');
    process.exit(1);
  }

  // 1. Find pending invitation
  const invitation = await prisma.invitation.findFirst({
    where: { email: EMAIL, status: 'pending' },
  });

  if (!invitation) {
    console.error('No pending invitation found for:', EMAIL);
    process.exit(1);
  }

  console.log('Found invitation:', invitation.id);
  console.log('Role:', invitation.role);
  console.log('Tenant ID:', invitation.tenantId);

  // 2. Find Clerk user
  console.log('\nSearching for Clerk user...');
  const searchRes = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(EMAIL)}`,
    {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!searchRes.ok) {
    console.error('Failed to search Clerk:', await searchRes.text());
    process.exit(1);
  }

  const users = await searchRes.json() as ClerkUser[];
  if (users.length === 0) {
    console.error('User not found in Clerk');
    process.exit(1);
  }

  const clerkUser = users[0];
  console.log('Found Clerk user:', clerkUser.id);

  // 3. Check if user already exists in DB
  const existingUser = await prisma.user.findFirst({
    where: { email: EMAIL },
  });

  if (existingUser) {
    console.log('User already exists in DB, updating...');
  }

  // 4. Create or update user in database
  const user = await prisma.user.upsert({
    where: { clerkUserId: clerkUser.id },
    create: {
      email: EMAIL,
      name: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || 'User',
      role: invitation.role as any,
      tenantId: invitation.tenantId,
      clerkUserId: clerkUser.id,
      status: 'active',
    },
    update: {
      role: invitation.role as any,
      tenantId: invitation.tenantId,
      status: 'active',
    },
  });

  console.log('User created/updated in DB:', user.id);

  // 5. Accept invitation
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      status: 'accepted',
      acceptedAt: new Date(),
      acceptedByUserId: user.id,
    },
  });

  console.log('Invitation accepted!');

  // 6. Update Clerk metadata
  console.log('\nUpdating Clerk metadata...');
  const updateRes = await fetch(
    `https://api.clerk.com/v1/users/${clerkUser.id}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: {
          role: invitation.role,
          tenantId: invitation.tenantId,
        },
      }),
    }
  );

  if (!updateRes.ok) {
    console.error('Failed to update Clerk metadata:', await updateRes.text());
  } else {
    console.log('Clerk metadata updated!');
  }

  console.log('\n========================================');
  console.log('SUCCESS! User can now sign out and sign back in');
  console.log('They should be redirected to /principal dashboard');
  console.log('========================================\n');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
