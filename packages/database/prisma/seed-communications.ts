/**
 * EduNexus Communications Data Seeder
 *
 * Seeds message templates and bulk communication records.
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx prisma/seed-communications.ts
 */

import { PrismaClient } from '@prisma/client';
import { randomInt, daysAgo, daysFromNow } from './lib/seed-utils';

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURATION
// =============================================================================

const MESSAGE_TEMPLATES = [
  {
    name: 'Fee Payment Reminder',
    code: 'FEE_REMINDER',
    category: 'fee',
    type: 'sms',
    subject: 'Fee Payment Reminder',
    content: 'Dear {{student_name}}, this is a reminder that your {{fee_type}} fee of Rs. {{amount}} is due on {{due_date}}. Please make the payment at the earliest. - {{college_name}}',
    variables: ['student_name', 'fee_type', 'amount', 'due_date', 'college_name'],
  },
  {
    name: 'Fee Payment Confirmation',
    code: 'FEE_PAID',
    category: 'fee',
    type: 'email',
    subject: 'Fee Payment Confirmation - {{college_name}}',
    content: 'Dear {{student_name}},\n\nYour payment of Rs. {{amount}} for {{fee_type}} has been received successfully.\n\nTransaction ID: {{transaction_id}}\nDate: {{payment_date}}\n\nThank you for your timely payment.\n\nRegards,\n{{college_name}}',
    variables: ['student_name', 'fee_type', 'amount', 'transaction_id', 'payment_date', 'college_name'],
  },
  {
    name: 'Attendance Alert',
    code: 'ATTENDANCE_ALERT',
    category: 'attendance',
    type: 'sms',
    subject: 'Low Attendance Alert',
    content: 'Dear {{parent_name}}, your ward {{student_name}} has attendance of {{attendance_percentage}}% which is below the required 75%. Please ensure regular attendance. - {{college_name}}',
    variables: ['parent_name', 'student_name', 'attendance_percentage', 'college_name'],
  },
  {
    name: 'Exam Schedule Notification',
    code: 'EXAM_SCHEDULE',
    category: 'academic',
    type: 'email',
    subject: 'Examination Schedule - {{exam_name}}',
    content: 'Dear {{student_name}},\n\nThe schedule for {{exam_name}} has been released. Please find the details below:\n\nSubject: {{subject_name}}\nDate: {{exam_date}}\nTime: {{exam_time}}\nVenue: {{venue}}\n\nPlease carry your ID card. Best of luck!\n\nRegards,\n{{college_name}}',
    variables: ['student_name', 'exam_name', 'subject_name', 'exam_date', 'exam_time', 'venue', 'college_name'],
  },
  {
    name: 'Result Announcement',
    code: 'RESULT_ANNOUNCE',
    category: 'academic',
    type: 'email',
    subject: 'Results Declared - {{exam_name}}',
    content: 'Dear {{student_name}},\n\nResults for {{exam_name}} have been declared. You can view your results on the student portal.\n\nRegards,\n{{college_name}}',
    variables: ['student_name', 'exam_name', 'college_name'],
  },
  {
    name: 'Event Announcement',
    code: 'EVENT_ANNOUNCE',
    category: 'event',
    type: 'whatsapp',
    subject: 'Upcoming Event: {{event_name}}',
    content: '*{{event_name}}*\n\nDate: {{event_date}}\nTime: {{event_time}}\nVenue: {{venue}}\n\n{{event_description}}\n\nRegister now on the student portal!\n\n- {{college_name}}',
    variables: ['event_name', 'event_date', 'event_time', 'venue', 'event_description', 'college_name'],
  },
  {
    name: 'Library Due Reminder',
    code: 'LIBRARY_DUE',
    category: 'library',
    type: 'sms',
    subject: 'Library Book Due Reminder',
    content: 'Dear {{student_name}}, the book "{{book_title}}" is due on {{due_date}}. Please return or renew to avoid fine. - {{college_name}} Library',
    variables: ['student_name', 'book_title', 'due_date', 'college_name'],
  },
  {
    name: 'Library Overdue Notice',
    code: 'LIBRARY_OVERDUE',
    category: 'library',
    type: 'email',
    subject: 'Library Book Overdue - Action Required',
    content: 'Dear {{student_name}},\n\nThe following book is overdue:\n\nTitle: {{book_title}}\nDue Date: {{due_date}}\nOverdue Days: {{overdue_days}}\nFine Accumulated: Rs. {{fine_amount}}\n\nPlease return the book immediately to avoid further fines.\n\nRegards,\n{{college_name}} Library',
    variables: ['student_name', 'book_title', 'due_date', 'overdue_days', 'fine_amount', 'college_name'],
  },
  {
    name: 'Placement Drive Notification',
    code: 'PLACEMENT_DRIVE',
    category: 'placement',
    type: 'email',
    subject: 'Placement Drive - {{company_name}}',
    content: 'Dear {{student_name}},\n\n{{company_name}} is visiting our campus for placement.\n\nRole: {{job_role}}\nPackage: {{package}}\nEligibility: {{eligibility}}\n\nRegistration Deadline: {{deadline}}\n\nRegister on the placement portal if interested.\n\nBest regards,\n{{college_name}} Placement Cell',
    variables: ['student_name', 'company_name', 'job_role', 'package', 'eligibility', 'deadline', 'college_name'],
  },
  {
    name: 'Holiday Announcement',
    code: 'HOLIDAY_ANNOUNCE',
    category: 'general',
    type: 'whatsapp',
    subject: 'Holiday Announcement',
    content: '*Holiday Announcement*\n\nThe college will remain closed on {{holiday_date}} on account of {{holiday_reason}}.\n\nClasses will resume on {{resume_date}}.\n\n- {{college_name}}',
    variables: ['holiday_date', 'holiday_reason', 'resume_date', 'college_name'],
  },
  {
    name: 'Certificate Ready',
    code: 'CERT_READY',
    category: 'certificate',
    type: 'sms',
    subject: 'Certificate Ready for Collection',
    content: 'Dear {{student_name}}, your {{certificate_type}} is ready for collection. Please visit the Admin Office with your ID card. - {{college_name}}',
    variables: ['student_name', 'certificate_type', 'college_name'],
  },
  {
    name: 'Welcome Message',
    code: 'WELCOME_NEW',
    category: 'onboarding',
    type: 'email',
    subject: 'Welcome to {{college_name}}!',
    content: 'Dear {{student_name}},\n\nWelcome to {{college_name}}! We are delighted to have you as part of our academic community.\n\nYour Roll Number: {{roll_number}}\nDepartment: {{department}}\nBatch: {{batch}}\n\nLogin to the student portal to access your academic resources and stay updated.\n\nWishing you a successful academic journey!\n\nWarm regards,\n{{college_name}}',
    variables: ['student_name', 'college_name', 'roll_number', 'department', 'batch'],
  },
];

const BULK_COMMUNICATIONS = [
  {
    name: 'January 2025 Fee Reminder',
    templateCode: 'FEE_REMINDER',
    type: 'sms',
    audience: 'students',
    status: 'completed',
  },
  {
    name: 'Semester 3 Exam Schedule',
    templateCode: 'EXAM_SCHEDULE',
    type: 'email',
    audience: 'students',
    status: 'completed',
  },
  {
    name: 'TechFest 2025 Announcement',
    templateCode: 'EVENT_ANNOUNCE',
    type: 'whatsapp',
    audience: 'all',
    status: 'completed',
  },
  {
    name: 'Attendance Warning - December 2024',
    templateCode: 'ATTENDANCE_ALERT',
    type: 'sms',
    audience: 'parents',
    status: 'completed',
  },
  {
    name: 'Library Overdue Notices - Week 1',
    templateCode: 'LIBRARY_OVERDUE',
    type: 'email',
    audience: 'students',
    status: 'scheduled',
    scheduledAt: daysFromNow(2),
  },
];

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

async function seedMessageTemplates(tenantId: string): Promise<Map<string, string>> {
  console.log('  Creating message templates...');

  const templateMap = new Map<string, string>();

  for (const template of MESSAGE_TEMPLATES) {
    let existing = await prisma.messageTemplate.findFirst({
      where: { tenantId, code: template.code },
    });

    if (!existing) {
      existing = await prisma.messageTemplate.create({
        data: {
          tenantId,
          name: template.name,
          code: template.code,
          category: template.category,
          type: template.type,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          isActive: true,
          isSystem: false,
        },
      });
    }

    templateMap.set(template.code, existing.id);
  }

  console.log(`    Created ${MESSAGE_TEMPLATES.length} message templates`);
  return templateMap;
}

async function seedBulkCommunications(
  tenantId: string,
  templateMap: Map<string, string>
): Promise<void> {
  console.log('  Creating bulk communication records...');

  // Get a user ID to use as createdById
  const adminUser = await prisma.user.findFirst({
    where: { tenantId, role: 'admin_staff' },
    select: { id: true },
  });

  const createdById = adminUser?.id || 'system';

  for (const comm of BULK_COMMUNICATIONS) {
    const templateId = templateMap.get(comm.templateCode);
    const template = MESSAGE_TEMPLATES.find(t => t.code === comm.templateCode);

    const existing = await prisma.bulkCommunication.findFirst({
      where: { tenantId, name: comm.name },
    });

    if (existing) continue;

    const isCompleted = comm.status === 'completed';
    const isScheduled = comm.status === 'scheduled';
    const recipientCount = randomInt(50, 200);
    const sentCount = isCompleted ? Math.floor(recipientCount * 0.95) : 0;
    const failedCount = isCompleted ? recipientCount - sentCount : 0;
    const sentDate = isCompleted ? daysAgo(randomInt(1, 30)) : null;

    await prisma.bulkCommunication.create({
      data: {
        tenantId,
        name: comm.name,
        type: comm.type,
        templateId: templateId || null,
        subject: template?.subject || comm.name,
        content: template?.content || 'Content from template',
        audience: comm.audience,
        audienceFilters: {
          type: comm.audience,
        },
        recipientCount,
        sentCount,
        failedCount,
        status: comm.status,
        scheduledAt: isScheduled ? comm.scheduledAt : null,
        startedAt: sentDate,
        completedAt: isCompleted ? sentDate : null,
        createdById,
      },
    });
  }

  console.log(`    Created ${BULK_COMMUNICATIONS.length} bulk communication records`);
}

// Note: NotificationPreference model not implemented in schema yet
// Skipping notification preferences seeding

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          EDUNEXUS COMMUNICATIONS DATA SEEDER                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'active' },
    });

    console.log(`Found ${tenants.length} active tenants\n`);

    for (const tenant of tenants) {
      console.log(`\n[TENANT] ${tenant.displayName} (${tenant.domain})`);

      const templateMap = await seedMessageTemplates(tenant.id);
      await seedBulkCommunications(tenant.id, templateMap);
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          COMMUNICATIONS SEEDING COMPLETE                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n[ERROR] Communications seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in main seed.ts
export { seedMessageTemplates, seedBulkCommunications };

// Run if executed directly
main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
