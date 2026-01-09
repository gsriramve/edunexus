/**
 * EduNexus Services Data Seeder
 *
 * Seeds library book issues, certificate requests, and other campus services.
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx prisma/seed-services.ts
 */

import { PrismaClient } from '@prisma/client';
import {
  randomItem,
  randomItems,
  randomInt,
  daysAgo,
  daysFromNow,
} from './lib/seed-utils';

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CERTIFICATE_PURPOSES = [
  'Passport Application',
  'Visa Application',
  'Bank Loan',
  'Scholarship Application',
  'Job Application',
  'Higher Studies',
  'Government Scheme',
  'Address Proof',
];

const BOOK_ISSUES_PER_STUDENT = 3;
const CERTIFICATE_REQUESTS_PER_TENANT = 12;

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

async function seedCertificateTypes(tenantId: string): Promise<string[]> {
  console.log('  Creating certificate types...');

  const certTypes = [
    { code: 'bonafide', name: 'Bonafide Certificate', fee: 100, description: 'Proof of enrollment' },
    { code: 'study', name: 'Study Certificate', fee: 100, description: 'Certificate of ongoing study' },
    { code: 'character', name: 'Character Certificate', fee: 100, description: 'Character and conduct certificate' },
    { code: 'tc', name: 'Transfer Certificate', fee: 500, description: 'Transfer certificate for leaving institution' },
    { code: 'migration', name: 'Migration Certificate', fee: 300, description: 'For university migration' },
    { code: 'conduct', name: 'Conduct Certificate', fee: 100, description: 'Good conduct certificate' },
    { code: 'medium', name: 'Medium of Instruction', fee: 150, description: 'Proof of medium of instruction' },
    { code: 'provisional', name: 'Provisional Certificate', fee: 200, description: 'Provisional degree certificate' },
  ];

  const typeIds: string[] = [];

  for (const certType of certTypes) {
    let existing = await prisma.certificateType.findFirst({
      where: { tenantId, code: certType.code },
    });

    if (!existing) {
      existing = await prisma.certificateType.create({
        data: {
          tenantId,
          code: certType.code,
          name: certType.name,
          description: certType.description,
          fee: certType.fee,
          isActive: true,
        },
      });
    }

    typeIds.push(existing.id);
  }

  console.log(`    Created ${certTypes.length} certificate types`);
  return typeIds;
}

async function seedCertificateRequests(
  tenantId: string,
  studentIds: string[],
  certTypeIds: string[]
): Promise<void> {
  console.log('  Creating certificate requests...');

  if (certTypeIds.length === 0 || studentIds.length === 0) {
    console.log('    Skipping - no certificate types or students');
    return;
  }

  const statuses = ['pending', 'pending', 'processing', 'issued', 'issued', 'rejected'];
  let requestCount = 0;

  for (let i = 0; i < Math.min(CERTIFICATE_REQUESTS_PER_TENANT, studentIds.length * 2); i++) {
    const studentId = randomItem(studentIds);
    const certTypeId = randomItem(certTypeIds);
    const status = randomItem(statuses);

    // Get cert type info
    const certType = await prisma.certificateType.findUnique({
      where: { id: certTypeId },
    });

    if (!certType) continue;

    // Check for duplicate pending requests
    const existingPending = await prisma.certificateRequest.findFirst({
      where: {
        tenantId,
        studentId,
        certificateTypeId: certTypeId,
        status: { in: ['pending', 'processing'] },
      },
    });

    if (existingPending) continue;

    const requestDate = daysAgo(randomInt(1, 60));
    const isIssued = status === 'issued';
    const isProcessing = status === 'processing';

    await prisma.certificateRequest.create({
      data: {
        tenantId,
        studentId,
        certificateTypeId: certTypeId,
        purpose: randomItem(CERTIFICATE_PURPOSES),
        status,
        requestDate,
        processedDate: isProcessing || isIssued ? daysAgo(randomInt(1, 10)) : null,
        processedBy: isProcessing || isIssued ? 'admin' : null,
        issuedDate: isIssued ? daysAgo(randomInt(1, 5)) : null,
        issuedBy: isIssued ? 'admin' : null,
        certificateNumber: isIssued ? `CERT-${new Date().getFullYear()}-${String(i + 1).padStart(5, '0')}` : null,
        remarks: status === 'rejected' ? 'Incomplete documentation' : null,
        pdfS3Key: isIssued ? `certificates/${certTypeId}/${studentId}.pdf` : null,
      },
    });

    requestCount++;
  }

  console.log(`    Created ${requestCount} certificate requests`);
}

async function seedBookIssues(tenantId: string, studentIds: string[]): Promise<void> {
  console.log('  Creating library book issues...');

  // Get available books
  const books = await prisma.libraryBook.findMany({
    where: { tenantId, availableCopies: { gt: 0 } },
    take: 20,
  });

  if (books.length === 0) {
    console.log('    Skipping - no books available');
    return;
  }

  // Get library cards
  const libraryCards = await prisma.libraryCard.findMany({
    where: { tenantId, status: 'active' },
    include: { student: true },
  });

  if (libraryCards.length === 0) {
    console.log('    Skipping - no active library cards');
    return;
  }

  let issueCount = 0;
  const statuses = ['issued', 'issued', 'returned', 'overdue'];

  for (const card of libraryCards) {
    // Issue 1-3 books per card
    const issuesToCreate = randomInt(1, BOOK_ISSUES_PER_STUDENT);
    const selectedBooks = randomItems(books, issuesToCreate);

    for (const book of selectedBooks) {
      const status = randomItem(statuses);
      const issueDate = daysAgo(randomInt(7, 45));
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 14); // 14 day loan period

      const isOverdue = status === 'overdue' || dueDate < new Date();
      const isReturned = status === 'returned';
      const returnDate = isReturned ? daysAgo(randomInt(1, 10)) : null;

      // Calculate fine for overdue
      let fineAmount = 0;
      if (isOverdue && !isReturned) {
        const overdueDays = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        fineAmount = Math.min(overdueDays * 5, 500); // ₹5/day, max ₹500
      }

      await prisma.bookIssue.create({
        data: {
          tenantId,
          bookId: book.id,
          cardId: card.id,
          issueDate,
          dueDate,
          returnDate,
          status: isReturned ? 'returned' : isOverdue ? 'overdue' : 'issued',
          renewCount: randomInt(0, 2),
          fineAmount,
          finePaid: fineAmount > 0 ? Math.random() > 0.5 : false,
          remarks: isOverdue && !isReturned ? 'Reminder sent' : null,
        },
      });

      issueCount++;
    }

    // Update card current books count
    const currentIssued = await prisma.bookIssue.count({
      where: {
        cardId: card.id,
        status: { in: ['issued', 'overdue'] },
      },
    });

    await prisma.libraryCard.update({
      where: { id: card.id },
      data: { currentBooks: currentIssued },
    });
  }

  console.log(`    Created ${issueCount} book issues`);
}

async function seedEResources(tenantId: string): Promise<void> {
  console.log('  Creating e-resources...');

  const eResources = [
    { title: 'IEEE Xplore', type: 'journal', url: 'https://ieeexplore.ieee.org', category: 'Engineering' },
    { title: 'ACM Digital Library', type: 'journal', url: 'https://dl.acm.org', category: 'Computer Science' },
    { title: 'Coursera Campus', type: 'course', url: 'https://coursera.org', category: 'Online Learning' },
    { title: 'NPTEL', type: 'course', url: 'https://nptel.ac.in', category: 'Engineering' },
    { title: 'MIT OpenCourseWare', type: 'course', url: 'https://ocw.mit.edu', category: 'General' },
    { title: 'ScienceDirect', type: 'journal', url: 'https://sciencedirect.com', category: 'Science' },
    { title: 'O\'Reilly Safari', type: 'ebook', url: 'https://learning.oreilly.com', category: 'Technology' },
    { title: 'Springer Link', type: 'journal', url: 'https://link.springer.com', category: 'General' },
  ];

  for (const resource of eResources) {
    const existing = await prisma.eResource.findFirst({
      where: { tenantId, title: resource.title },
    });

    if (existing) continue;

    await prisma.eResource.create({
      data: {
        tenantId,
        title: resource.title,
        type: resource.type,
        url: resource.url,
        description: `Access to ${resource.title} for academic research and learning.`,
        category: resource.category,
        accessType: 'subscription',
        views: randomInt(50, 500),
        downloads: randomInt(10, 100),
        status: 'active',
      },
    });
  }

  console.log(`    Created ${eResources.length} e-resources`);
}

async function seedHostelFees(tenantId: string): Promise<void> {
  console.log('  Creating hostel fees...');

  // Get students with hostel allocation
  const allocations = await prisma.hostelAllocation.findMany({
    where: { tenantId, status: 'active' },
    include: { room: true },
  });

  let feeCount = 0;

  for (const allocation of allocations) {
    // Check if fee exists
    const existingFee = await prisma.hostelFee.findFirst({
      where: {
        tenantId,
        allocationId: allocation.id,
        semester: 3, // Current semester
      },
    });

    if (existingFee) continue;

    const monthlyRent = allocation.room.monthlyRent;
    const totalAmount = monthlyRent * 6; // 6 months semester
    const status = randomItem(['paid', 'paid', 'pending', 'partial', 'overdue']);

    await prisma.hostelFee.create({
      data: {
        tenantId,
        allocationId: allocation.id,
        studentId: allocation.studentId,
        semester: 3,
        academicYear: '2024-25',
        roomRent: totalAmount,
        messCharges: 30000, // Fixed mess charges
        electricityCharges: randomInt(1000, 3000),
        otherCharges: randomInt(0, 500),
        totalAmount: totalAmount + 30000 + 2000,
        paidAmount: status === 'paid' ? totalAmount + 32000 :
          status === 'partial' ? Math.floor((totalAmount + 32000) / 2) : 0,
        dueDate: daysAgo(status === 'overdue' ? 30 : -30),
        status,
        paymentMode: status !== 'pending' ? 'online' : null,
        transactionId: status === 'paid' ? `TXN${Date.now()}` : null,
        receipt: status === 'paid' ? `RCP-${allocation.studentId.slice(-6)}` : null,
      },
    });

    feeCount++;
  }

  console.log(`    Created ${feeCount} hostel fees`);
}

async function seedTransportFees(tenantId: string): Promise<void> {
  console.log('  Creating transport fees...');

  // Get students with transport passes
  const passes = await prisma.transportPass.findMany({
    where: { tenantId, status: 'active' },
  });

  let feeCount = 0;

  for (const pass of passes) {
    // Check if fee record exists (transport uses different model)
    // The pass already has fare and paymentStatus, but we can add more detailed tracking

    // Update pass payment status based on edge cases
    const statusUpdate = randomItem(['paid', 'paid', 'paid', 'pending', 'overdue']);

    await prisma.transportPass.update({
      where: { id: pass.id },
      data: {
        paymentStatus: statusUpdate,
        paidAmount: statusUpdate === 'paid' ? pass.fare : statusUpdate === 'pending' ? 0 : pass.fare / 2,
      },
    });

    feeCount++;
  }

  console.log(`    Updated ${feeCount} transport fee statuses`);
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          EDUNEXUS SERVICES DATA SEEDER                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'active' },
    });

    console.log(`Found ${tenants.length} active tenants\n`);

    for (const tenant of tenants) {
      console.log(`\n[TENANT] ${tenant.displayName} (${tenant.domain})`);

      // Get students
      const students = await prisma.student.findMany({
        where: { tenantId: tenant.id },
        select: { id: true },
      });
      const studentIds = students.map((s) => s.id);

      if (studentIds.length === 0) {
        console.log('  No students found, skipping...');
        continue;
      }

      // Seed certificate types and requests
      const certTypeIds = await seedCertificateTypes(tenant.id);
      await seedCertificateRequests(tenant.id, studentIds, certTypeIds);

      // Seed library services
      await seedBookIssues(tenant.id, studentIds);
      await seedEResources(tenant.id);

      // Note: Hostel and transport fee seeding skipped due to schema differences
      // If needed, these can be re-enabled after schema alignment
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          SERVICES SEEDING COMPLETE                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n[ERROR] Services seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in main seed.ts
export {
  seedCertificateTypes,
  seedCertificateRequests,
  seedBookIssues,
  seedEResources,
  seedHostelFees,
  seedTransportFees,
};

// Run if executed directly
main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
