/**
 * EduNexus Feedback System Data Seeder
 *
 * Seeds feedback cycles, feedback entries, and feedback summaries.
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx prisma/seed-feedback.ts
 */

import { PrismaClient } from '@prisma/client';
import {
  randomInt,
  randomFloat,
  daysAgo,
  generateFeedbackRatings,
  randomStrengths,
  randomImprovements,
} from './lib/seed-utils';

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CYCLES_TO_CREATE = 3; // One closed, one active, one draft
const EVALUATOR_TYPES = ['faculty', 'mentor', 'peer', 'self'];

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

async function seedFeedbackCycles(tenantId: string): Promise<string[]> {
  console.log('  Creating feedback cycles...');
  const cycleIds: string[] = [];

  const now = new Date();
  const cycles = [
    {
      name: 'November 2024 Feedback',
      month: 11,
      year: 2024,
      status: 'closed',
      startDate: new Date(2024, 10, 1),
      endDate: new Date(2024, 10, 30),
    },
    {
      name: 'December 2024 Feedback',
      month: 12,
      year: 2024,
      status: 'closed',
      startDate: new Date(2024, 11, 1),
      endDate: new Date(2024, 11, 31),
    },
    {
      name: 'January 2025 Feedback',
      month: 1,
      year: 2025,
      status: 'active',
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 0, 31),
    },
  ];

  for (const cycleConfig of cycles) {
    const existing = await prisma.feedbackCycle.findFirst({
      where: { tenantId, month: cycleConfig.month, year: cycleConfig.year },
    });

    if (existing) {
      cycleIds.push(existing.id);
      continue;
    }

    const cycle = await prisma.feedbackCycle.create({
      data: {
        tenantId,
        name: cycleConfig.name,
        month: cycleConfig.month,
        year: cycleConfig.year,
        startDate: cycleConfig.startDate,
        endDate: cycleConfig.endDate,
        status: cycleConfig.status,
        enablePeerFeedback: true,
        enableSelfAssessment: true,
        anonymousPeerFeedback: true,
        minPeerFeedbacks: 3,
      },
    });

    cycleIds.push(cycle.id);
  }

  console.log(`    Created ${cycleIds.length} feedback cycles`);
  return cycleIds;
}

async function seedFeedbackEntries(
  tenantId: string,
  cycleId: string,
  studentId: string,
  staffIds: string[]
): Promise<void> {
  // Get cycle to check status
  const cycle = await prisma.feedbackCycle.findUnique({
    where: { id: cycleId },
  });

  if (!cycle || cycle.status === 'draft') return;

  // Faculty feedback
  if (staffIds.length > 0) {
    const facultyExists = await prisma.feedbackEntry.findFirst({
      where: { tenantId, cycleId, targetStudentId: studentId, evaluatorType: 'faculty' },
    });

    if (!facultyExists) {
      const ratings = generateFeedbackRatings();
      const rawAvg = (ratings.academicRating + ratings.participationRating + ratings.teamworkRating +
        ratings.communicationRating + ratings.leadershipRating + ratings.punctualityRating) / 6;

      await prisma.feedbackEntry.create({
        data: {
          tenantId,
          cycleId,
          targetStudentId: studentId,
          evaluatorType: 'faculty',
          evaluatorId: staffIds[0],
          isAnonymous: false,
          ...ratings,
          strengths: randomStrengths(3).join('. '),
          improvements: randomImprovements(2).join('. '),
          rawAverageScore: rawAvg,
          normalizedScore: rawAvg + randomFloat(-0.3, 0.3, 2),
          evaluatorBiasFactor: randomFloat(-0.2, 0.2, 2),
          aiSummary: 'Student shows consistent academic performance with room for improvement in participation.',
          sentimentScore: randomFloat(0.3, 0.8, 2),
          submittedAt: daysAgo(randomInt(1, 20)),
        },
      });
    }
  }

  // Mentor feedback
  const mentorExists = await prisma.feedbackEntry.findFirst({
    where: { tenantId, cycleId, targetStudentId: studentId, evaluatorType: 'mentor' },
  });

  if (!mentorExists && staffIds.length > 1) {
    const ratings = generateFeedbackRatings();
    const rawAvg = (ratings.academicRating + ratings.participationRating + ratings.teamworkRating +
      ratings.communicationRating + ratings.leadershipRating + ratings.punctualityRating) / 6;

    await prisma.feedbackEntry.create({
      data: {
        tenantId,
        cycleId,
        targetStudentId: studentId,
        evaluatorType: 'mentor',
        evaluatorId: staffIds[1],
        isAnonymous: false,
        ...ratings,
        strengths: randomStrengths(2).join('. '),
        improvements: randomImprovements(2).join('. '),
        rawAverageScore: rawAvg,
        normalizedScore: rawAvg + randomFloat(-0.2, 0.2, 2),
        evaluatorBiasFactor: randomFloat(-0.1, 0.1, 2),
        aiSummary: 'Good mentee with proactive approach to learning and skill development.',
        sentimentScore: randomFloat(0.4, 0.9, 2),
        submittedAt: daysAgo(randomInt(1, 15)),
      },
    });
  }

  // Self assessment
  const selfExists = await prisma.feedbackEntry.findFirst({
    where: { tenantId, cycleId, targetStudentId: studentId, evaluatorType: 'self' },
  });

  if (!selfExists) {
    // Self assessments tend to be slightly higher
    const ratings = generateFeedbackRatings();
    ratings.academicRating = Math.min(5, ratings.academicRating + 1);
    ratings.teamworkRating = Math.min(5, ratings.teamworkRating + 1);

    const rawAvg = (ratings.academicRating + ratings.participationRating + ratings.teamworkRating +
      ratings.communicationRating + ratings.leadershipRating + ratings.punctualityRating) / 6;

    await prisma.feedbackEntry.create({
      data: {
        tenantId,
        cycleId,
        targetStudentId: studentId,
        evaluatorType: 'self',
        evaluatorId: null, // Self assessment
        isAnonymous: false,
        ...ratings,
        strengths: 'Strong technical skills and consistent effort in coursework.',
        improvements: 'Need to improve public speaking and presentation skills.',
        rawAverageScore: rawAvg,
        normalizedScore: rawAvg - 0.3, // Bias correction for self-assessment
        evaluatorBiasFactor: 0.3, // Positive bias in self-assessment
        aiSummary: 'Self-assessment shows good self-awareness with realistic improvement goals.',
        sentimentScore: randomFloat(0.5, 0.8, 2),
        submittedAt: daysAgo(randomInt(1, 10)),
      },
    });
  }

  // Peer feedback (2-3 anonymous entries)
  const peerCount = randomInt(2, 3);
  const existingPeerCount = await prisma.feedbackEntry.count({
    where: { tenantId, cycleId, targetStudentId: studentId, evaluatorType: 'peer' },
  });

  for (let i = existingPeerCount; i < peerCount; i++) {
    const ratings = generateFeedbackRatings();
    const rawAvg = (ratings.academicRating + ratings.participationRating + ratings.teamworkRating +
      ratings.communicationRating + ratings.leadershipRating + ratings.punctualityRating) / 6;

    await prisma.feedbackEntry.create({
      data: {
        tenantId,
        cycleId,
        targetStudentId: studentId,
        evaluatorType: 'peer',
        evaluatorId: null, // Anonymous
        isAnonymous: true,
        ...ratings,
        strengths: randomStrengths(2).join('. '),
        improvements: randomImprovements(1).join('. '),
        rawAverageScore: rawAvg,
        normalizedScore: rawAvg + randomFloat(-0.2, 0.2, 2),
        evaluatorBiasFactor: randomFloat(-0.15, 0.15, 2),
        aiSummary: 'Peer feedback indicates collaborative nature and team contribution.',
        sentimentScore: randomFloat(0.3, 0.8, 2),
        submittedAt: daysAgo(randomInt(1, 25)),
      },
    });
  }
}

async function seedFeedbackSummaries(
  tenantId: string,
  cycleId: string,
  studentId: string
): Promise<void> {
  const cycle = await prisma.feedbackCycle.findUnique({
    where: { id: cycleId },
  });

  if (!cycle || cycle.status === 'draft') return;

  const existing = await prisma.feedbackSummary.findFirst({
    where: { tenantId, cycleId, studentId },
  });

  if (existing) return;

  // Get all feedback entries for this student in this cycle
  const entries = await prisma.feedbackEntry.findMany({
    where: { tenantId, cycleId, targetStudentId: studentId },
  });

  if (entries.length === 0) return;

  // Calculate averages by evaluator type
  const byType: Record<string, { total: number; count: number }> = {
    faculty: { total: 0, count: 0 },
    mentor: { total: 0, count: 0 },
    peer: { total: 0, count: 0 },
    self: { total: 0, count: 0 },
  };

  for (const entry of entries) {
    if (entry.normalizedScore) {
      byType[entry.evaluatorType].total += entry.normalizedScore;
      byType[entry.evaluatorType].count += 1;
    }
  }

  const facultyAvg = byType.faculty.count > 0 ? byType.faculty.total / byType.faculty.count : null;
  const mentorAvg = byType.mentor.count > 0 ? byType.mentor.total / byType.mentor.count : null;
  const peerAvg = byType.peer.count > 0 ? byType.peer.total / byType.peer.count : null;
  const selfScore = byType.self.count > 0 ? byType.self.total / byType.self.count : null;

  // Calculate overall score (weighted: faculty 40%, mentor 25%, peer 25%, self 10%)
  let overallScore = 0;
  let totalWeight = 0;

  if (facultyAvg !== null) { overallScore += facultyAvg * 0.4; totalWeight += 0.4; }
  if (mentorAvg !== null) { overallScore += mentorAvg * 0.25; totalWeight += 0.25; }
  if (peerAvg !== null) { overallScore += peerAvg * 0.25; totalWeight += 0.25; }
  if (selfScore !== null) { overallScore += selfScore * 0.1; totalWeight += 0.1; }

  overallScore = totalWeight > 0 ? overallScore / totalWeight : 0;

  await prisma.feedbackSummary.create({
    data: {
      tenantId,
      studentId,
      cycleId,
      month: cycle.month,
      year: cycle.year,
      facultyAvgScore: facultyAvg,
      mentorAvgScore: mentorAvg,
      peerAvgScore: peerAvg,
      selfScore,
      overallScore,
      facultyCount: byType.faculty.count,
      peerCount: byType.peer.count,
      aiSummary: `Student received an overall feedback score of ${overallScore.toFixed(2)}. Faculty and peer feedback align, indicating ${overallScore > 3.5 ? 'strong' : 'average'} performance across academic and soft skill dimensions.`,
      topStrengths: randomStrengths(3).map((s) => ({
        strength: s,
        frequency: randomInt(2, 5),
        sources: ['faculty', 'peer'],
      })),
      topImprovements: randomImprovements(2).map((i) => ({
        area: i,
        frequency: randomInt(1, 3),
        suggestions: ['Focus on regular practice', 'Seek mentorship'],
      })),
      processedAt: cycle.status === 'closed' ? new Date() : null,
    },
  });
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          EDUNEXUS FEEDBACK SYSTEM SEEDER                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'active' },
    });

    console.log(`Found ${tenants.length} active tenants\n`);

    for (const tenant of tenants) {
      console.log(`\n[TENANT] ${tenant.displayName} (${tenant.domain})`);

      // Get staff for evaluators
      const staff = await prisma.staff.findMany({
        where: { tenantId: tenant.id },
        select: { id: true },
      });
      const staffIds = staff.map((s) => s.id);

      // Get students
      const students = await prisma.student.findMany({
        where: { tenantId: tenant.id },
        select: { id: true, rollNo: true },
      });

      if (students.length === 0) {
        console.log('  No students found, skipping...');
        continue;
      }

      // Create feedback cycles
      const cycleIds = await seedFeedbackCycles(tenant.id);

      // Create entries and summaries for each student
      console.log(`  Processing ${students.length} students for feedback...`);
      for (const student of students) {
        for (const cycleId of cycleIds) {
          await seedFeedbackEntries(tenant.id, cycleId, student.id, staffIds);
          await seedFeedbackSummaries(tenant.id, cycleId, student.id);
        }
      }
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          FEEDBACK SEEDING COMPLETE                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n[ERROR] Feedback seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in main seed.ts
export { seedFeedbackCycles, seedFeedbackEntries, seedFeedbackSummaries };

// Run if executed directly
main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
