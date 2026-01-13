/**
 * Student Fee Data Seeding Script
 *
 * Creates realistic fee records for all students:
 * - Fee Types: tuition, exam, library, lab, hostel, transport
 * - Status Mix: 60% paid, 25% pending, 10% partial, 5% overdue
 * - Payment transactions for paid fees
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx prisma/seed-fees.ts
 */

import { PrismaClient, Decimal } from '@prisma/client';

const prisma = new PrismaClient();

// Fee type configurations with realistic amounts (in INR)
const FEE_TYPES = {
  tuition: {
    name: 'Tuition Fee',
    minAmount: 50000,
    maxAmount: 75000,
    frequency: 'semester', // Every student gets this
  },
  exam: {
    name: 'Examination Fee',
    minAmount: 2000,
    maxAmount: 3500,
    frequency: 'semester',
  },
  library: {
    name: 'Library Fee',
    minAmount: 1000,
    maxAmount: 2000,
    frequency: 'annual',
  },
  lab: {
    name: 'Laboratory Fee',
    minAmount: 5000,
    maxAmount: 8000,
    frequency: 'semester',
  },
  hostel: {
    name: 'Hostel Fee',
    minAmount: 25000,
    maxAmount: 40000,
    frequency: 'semester',
    probability: 0.4, // Only 40% of students have hostel fees
  },
  transport: {
    name: 'Transport Fee',
    minAmount: 8000,
    maxAmount: 15000,
    frequency: 'semester',
    probability: 0.3, // Only 30% of students have transport fees
  },
};

// Status distribution
const STATUS_DISTRIBUTION = {
  paid: 0.60,      // 60% paid
  pending: 0.25,   // 25% pending
  partial: 0.10,   // 10% partial
  overdue: 0.05,   // 5% overdue
};

function randomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStatus(): string {
  const rand = Math.random();
  let cumulative = 0;

  for (const [status, probability] of Object.entries(STATUS_DISTRIBUTION)) {
    cumulative += probability;
    if (rand <= cumulative) {
      return status;
    }
  }
  return 'pending';
}

function getPaymentMethod(): string {
  const methods = ['upi', 'card', 'netbanking', 'wallet'];
  return methods[Math.floor(Math.random() * methods.length)];
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function generateReceiptNumber(tenantId: string, index: number): string {
  const year = new Date().getFullYear();
  return `RCP-${year}-${String(index).padStart(6, '0')}`;
}

function generateRazorpayOrderId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'order_';
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRazorpayPaymentId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'pay_';
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function seedFeesForTenant(tenantId: string, tenantName: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Seeding Fees: ${tenantName}`);
  console.log(`${'='.repeat(60)}`);

  // Get all students for this tenant
  const students = await prisma.student.findMany({
    where: { tenantId },
    select: { id: true, userId: true, semester: true },
  });

  if (students.length === 0) {
    console.log('  No students found. Run seed-enhanced-data.ts first.');
    return;
  }

  console.log(`  Found ${students.length} students`);

  // Check existing fee count
  const existingFeeCount = await prisma.studentFee.count({
    where: { tenantId },
  });

  if (existingFeeCount > 0) {
    console.log(`  [SKIP] Already has ${existingFeeCount} fee records`);
    return;
  }

  let feesCreated = 0;
  let transactionsCreated = 0;
  let receiptCounter = 1;

  const academicYear = '2024-25';
  const currentSemester = new Date().getMonth() < 6 ? 'Even' : 'Odd';

  for (const student of students) {
    // Create fees for different fee types
    for (const [feeType, config] of Object.entries(FEE_TYPES)) {
      // Skip optional fees based on probability
      if (config.probability && Math.random() > config.probability) {
        continue;
      }

      const amount = randomAmount(config.minAmount, config.maxAmount);
      const status = randomStatus();

      // Calculate dates based on status
      let dueDate: Date;
      let paidDate: Date | null = null;
      let paidAmount: number | null = null;

      if (status === 'overdue') {
        dueDate = daysAgo(Math.floor(Math.random() * 60) + 30); // 30-90 days ago
      } else if (status === 'paid') {
        dueDate = daysAgo(Math.floor(Math.random() * 30) + 15); // 15-45 days ago
        paidDate = daysAgo(Math.floor(Math.random() * 14)); // Paid within last 2 weeks
        paidAmount = amount;
      } else if (status === 'partial') {
        dueDate = daysAgo(Math.floor(Math.random() * 20)); // 0-20 days ago
        paidDate = daysAgo(Math.floor(Math.random() * 10));
        paidAmount = Math.floor(amount * (0.3 + Math.random() * 0.4)); // 30-70% paid
      } else {
        // pending
        dueDate = daysFromNow(Math.floor(Math.random() * 30) + 5); // 5-35 days from now
      }

      const razorpayOrderId = generateRazorpayOrderId();
      const razorpayPaymentId = status === 'paid' || status === 'partial'
        ? generateRazorpayPaymentId()
        : null;
      const receiptNumber = status === 'paid'
        ? generateReceiptNumber(tenantId, receiptCounter++)
        : null;

      try {
        const fee = await prisma.studentFee.create({
          data: {
            tenantId,
            studentId: student.id,
            feeType,
            amount: new Decimal(amount),
            dueDate,
            paidDate,
            paidAmount: paidAmount ? new Decimal(paidAmount) : null,
            status,
            razorpayOrderId,
            razorpayPaymentId,
            paymentMethod: paidAmount ? getPaymentMethod() : null,
            receiptNumber,
          },
        });
        feesCreated++;

        // Create payment transaction for paid/partial fees
        if (paidAmount && paidAmount > 0) {
          await prisma.paymentTransaction.create({
            data: {
              tenantId,
              studentFeeId: fee.id,
              studentId: student.id,
              amount: new Decimal(paidAmount),
              currency: 'INR',
              razorpayOrderId,
              razorpayPaymentId,
              paymentMethod: getPaymentMethod(),
              status: status === 'paid' ? 'captured' : 'authorized',
              receiptNumber,
              createdAt: paidDate || new Date(),
            },
          });
          transactionsCreated++;
        }
      } catch (e: any) {
        // Skip duplicates silently
        if (!e.message?.includes('Unique constraint')) {
          console.log(`    Error creating fee: ${e.message}`);
        }
      }
    }
  }

  console.log(`  [CREATED] ${feesCreated} fee records`);
  console.log(`  [CREATED] ${transactionsCreated} payment transactions`);

  // Print status breakdown
  const statusCounts = await prisma.studentFee.groupBy({
    by: ['status'],
    where: { tenantId },
    _count: { status: true },
  });

  console.log('\n  Status Breakdown:');
  for (const sc of statusCounts) {
    console.log(`    ${sc.status}: ${sc._count.status}`);
  }

  // Print fee type breakdown
  const feeTypeCounts = await prisma.studentFee.groupBy({
    by: ['feeType'],
    where: { tenantId },
    _count: { feeType: true },
    _sum: { amount: true },
  });

  console.log('\n  Fee Type Breakdown:');
  for (const fc of feeTypeCounts) {
    const totalAmount = fc._sum.amount ? Number(fc._sum.amount) : 0;
    console.log(`    ${fc.feeType}: ${fc._count.feeType} records, Total: ₹${totalAmount.toLocaleString()}`);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          EDUNEXUS STUDENT FEE DATA SEEDING                 ║');
  console.log('║     Fee Types: tuition, exam, library, lab, hostel, transport');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Get all test tenants
  const tenants = await prisma.tenant.findMany({
    where: {
      OR: [
        { domain: 'nexus-ec' },
        { domain: 'quantum-it' },
        { domain: 'careerfied' },
      ],
    },
  });

  if (tenants.length === 0) {
    console.error('No test tenants found. Run seed-test-data.ts first.');
    process.exit(1);
  }

  console.log(`\nFound ${tenants.length} tenants to seed:`);
  tenants.forEach(t => console.log(`  - ${t.name} (${t.domain})`));

  for (const tenant of tenants) {
    await seedFeesForTenant(tenant.id, tenant.name);
  }

  // Final summary
  console.log('\n' + '═'.repeat(60));
  console.log('FEE SEEDING COMPLETE!');
  console.log('═'.repeat(60));

  const totalFees = await prisma.studentFee.count();
  const totalTransactions = await prisma.paymentTransaction.count();
  const totalPaid = await prisma.studentFee.aggregate({
    where: { status: 'paid' },
    _sum: { paidAmount: true },
  });

  console.log('\nOverall Summary:');
  console.log(`  • Total Fee Records: ${totalFees}`);
  console.log(`  • Total Transactions: ${totalTransactions}`);
  console.log(`  • Total Collected: ₹${totalPaid._sum.paidAmount ? Number(totalPaid._sum.paidAmount).toLocaleString() : 0}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
