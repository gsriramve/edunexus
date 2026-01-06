/**
 * EduNexus Database Seed
 *
 * Creates minimal required data for a fresh deployment:
 * - Platform super admin account
 * - Demo tenant for testing
 * - Principal user for demo tenant
 *
 * Run: npm run db:seed (from packages/database)
 * Or:  npx tsx prisma/seed.ts
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Seed data configuration
const SEED_CONFIG = {
  platformAdmin: {
    email: 'admin@edunexus.io',
    name: 'Platform Admin',
    role: 'super_admin',
  },
  demoTenant: {
    name: 'demo-college',
    domain: 'demo',
    displayName: 'Demo Engineering College',
    studentCount: 1000,
    subscriptionAmount: 500000, // ₹5,00,000
  },
  demoPrincipal: {
    email: 'principal@demo.edunexus.io',
    name: 'Dr. Demo Principal',
  },
};

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. Create Platform Admin
  console.log('📌 Creating platform admin...');
  const platformAdmin = await prisma.platformAdmin.upsert({
    where: { email: SEED_CONFIG.platformAdmin.email },
    update: {},
    create: {
      email: SEED_CONFIG.platformAdmin.email,
      name: SEED_CONFIG.platformAdmin.name,
      role: SEED_CONFIG.platformAdmin.role,
      permissions: {
        tenants: ['create', 'read', 'update', 'delete'],
        billing: ['create', 'read', 'update'],
        support: ['read', 'update', 'assign'],
        reports: ['read', 'export'],
        settings: ['read', 'update'],
      },
    },
  });
  console.log(`   ✅ Platform admin created: ${platformAdmin.email}\n`);

  // 2. Create Demo Tenant
  console.log('🏫 Creating demo tenant...');
  const tenant = await prisma.tenant.upsert({
    where: { domain: SEED_CONFIG.demoTenant.domain },
    update: {},
    create: {
      name: SEED_CONFIG.demoTenant.name,
      domain: SEED_CONFIG.demoTenant.domain,
      displayName: SEED_CONFIG.demoTenant.displayName,
      status: 'active',
      theme: {
        primaryColor: '#2563eb',
        secondaryColor: '#3b82f6',
        fontFamily: 'Inter',
      },
      config: {
        features: {
          payments: true,
          sms: true,
          email: true,
          pushNotifications: true,
        },
        branding: {
          showPoweredBy: true,
        },
      },
    },
  });
  console.log(`   ✅ Demo tenant created: ${tenant.displayName} (${tenant.domain})\n`);

  // 3. Create Tenant Subscription
  console.log('💳 Creating tenant subscription...');
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

  const subscription = await prisma.tenantSubscription.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      plan: 'standard',
      studentCount: SEED_CONFIG.demoTenant.studentCount,
      amount: SEED_CONFIG.demoTenant.subscriptionAmount,
      currency: 'INR',
      startDate,
      endDate,
      status: 'active',
    },
  });
  console.log(`   ✅ Subscription created: ${subscription.plan} plan until ${endDate.toDateString()}\n`);

  // 4. Create Demo Principal User
  console.log('👤 Creating demo principal user...');
  const principalUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: SEED_CONFIG.demoPrincipal.email,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: SEED_CONFIG.demoPrincipal.email,
      name: SEED_CONFIG.demoPrincipal.name,
      role: UserRole.principal,
      status: 'active',
    },
  });
  console.log(`   ✅ Principal user created: ${principalUser.name} (${principalUser.email})\n`);

  // 5. Create User Profile for Principal
  console.log('📋 Creating principal profile...');
  const profile = await prisma.userProfile.upsert({
    where: { userId: principalUser.id },
    update: {},
    create: {
      userId: principalUser.id,
      gender: 'Male',
      nationality: 'Indian',
    },
  });
  console.log(`   ✅ Profile created for principal\n`);

  // 6. Create a sample department
  console.log('🏢 Creating sample department...');
  const department = await prisma.department.upsert({
    where: {
      tenantId_code: {
        tenantId: tenant.id,
        code: 'CSE',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Computer Science & Engineering',
      code: 'CSE',
    },
  });
  console.log(`   ✅ Department created: ${department.name} (${department.code})\n`);

  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 Seed completed successfully!\n');
  console.log('Summary:');
  console.log(`  • Platform Admin: ${platformAdmin.email}`);
  console.log(`  • Demo Tenant: ${tenant.displayName}`);
  console.log(`  • Principal: ${principalUser.email}`);
  console.log(`  • Department: ${department.name}`);
  console.log('\nNext Steps:');
  console.log('  1. Configure authentication provider (Clerk)');
  console.log('  2. Map Clerk users to database users');
  console.log('  3. Access demo tenant at: /demo');
  console.log('═══════════════════════════════════════════════════════════');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
