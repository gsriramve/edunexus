/**
 * EduNexus Student Growth & Journey Data Seeder
 *
 * Seeds SGI/CRI records, student goals, AI guidance, disengagement alerts,
 * journey milestones, and semester snapshots.
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx prisma/seed-student-growth.ts
 */

import { PrismaClient } from '@prisma/client';
import {
  randomItem,
  randomItems,
  randomInt,
  randomFloat,
  pastMonths,
  daysAgo,
  daysFromNow,
  generateSgiScores,
  generateCriScores,
  generateCgpa,
  generateAttendance,
  randomStrengths,
  randomImprovements,
  TECHNICAL_SKILLS,
  ALL_GOALS,
  MILESTONE_TYPES,
  ACHIEVEMENT_TYPES,
} from './lib/seed-utils';

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURATION
// =============================================================================

const SGI_MONTHS = 6; // Generate 6 months of SGI history
const CRI_ASSESSMENTS = 3; // Generate 3 CRI assessments
const GOALS_PER_STUDENT = 4;
const GUIDANCE_PER_STUDENT = 8;
const MILESTONES_PER_STUDENT = 6;

const GUIDANCE_TYPES = ['monthly_plan', 'alert', 'recommendation', 'milestone', 'tip'];
const GUIDANCE_CATEGORIES = ['academic', 'career', 'engagement', 'behavioral', 'skill'];
const GUIDANCE_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

async function seedStudentGrowthIndices(tenantId: string, studentId: string): Promise<void> {
  const months = pastMonths(SGI_MONTHS);
  let previousScore = 0;

  for (let i = months.length - 1; i >= 0; i--) {
    const { month, year } = months[i];

    // Check if exists
    const existing = await prisma.studentGrowthIndex.findFirst({
      where: { tenantId, studentId, month, year },
    });

    if (existing) {
      previousScore = existing.sgiScore;
      continue;
    }

    // Generate scores with progressive improvement trend
    const baseScore = 55 + i * 3 + randomInt(-5, 10); // Generally improving
    const scores = generateSgiScores(baseScore);

    const trend = scores.sgiScore > previousScore + 2 ? 'improving' :
      scores.sgiScore < previousScore - 2 ? 'declining' : 'stable';
    const trendDelta = previousScore > 0 ? scores.sgiScore - previousScore : 0;

    await prisma.studentGrowthIndex.create({
      data: {
        tenantId,
        studentId,
        month,
        year,
        ...scores,
        sgiTrend: trend,
        trendDelta,
        academicBreakdown: {
          cgpaTrend: randomFloat(0.1, 0.3, 2),
          examImprovement: randomInt(-5, 15),
          assignmentScore: randomInt(70, 95),
        },
        engagementBreakdown: {
          clubActivity: randomInt(0, 100),
          eventsAttended: randomInt(0, 5),
          attendanceRate: randomInt(75, 98),
        },
        skillsBreakdown: {
          certifications: randomInt(0, 3),
          projects: randomInt(1, 4),
          internships: randomInt(0, 1),
        },
        behavioralBreakdown: {
          feedbackScore: randomFloat(3.5, 5, 1),
          punctuality: randomInt(80, 100),
          discipline: randomInt(85, 100),
        },
        insightsSummary: `Student shows ${trend} trend with SGI score of ${scores.sgiScore}. Focus areas: ${randomItems(GUIDANCE_CATEGORIES, 2).join(', ')}.`,
        recommendations: [
          { category: 'academic', action: 'Focus on core subjects', priority: 'high' },
          { category: 'skill', action: 'Complete at least one certification', priority: 'medium' },
          { category: 'engagement', action: 'Join a technical club', priority: 'low' },
        ],
        visibleToStudent: true,
        visibleToMentor: true,
        visibleToHod: true,
        dataCompleteness: randomFloat(0.7, 1, 2),
        calculatedAt: new Date(year, month - 1, randomInt(1, 5)),
      },
    });

    previousScore = scores.sgiScore;
  }
}

async function seedCareerReadinessIndices(tenantId: string, studentId: string): Promise<void> {
  // Mark all existing as not latest
  await prisma.careerReadinessIndex.updateMany({
    where: { tenantId, studentId },
    data: { isLatest: false },
  });

  for (let i = 0; i < CRI_ASSESSMENTS; i++) {
    const isLatest = i === 0;
    const assessmentDate = daysAgo(i * 90 + randomInt(0, 30)); // Every ~3 months

    const baseScore = 50 + (CRI_ASSESSMENTS - i) * 8 + randomInt(-5, 10); // Improving over time
    const scores = generateCriScores(baseScore);

    await prisma.careerReadinessIndex.create({
      data: {
        tenantId,
        studentId,
        assessmentDate,
        ...scores,
        skillGaps: [
          { skill: 'System Design', currentLevel: 40, requiredLevel: 70, priority: 'high' },
          { skill: 'DSA', currentLevel: 60, requiredLevel: 80, priority: 'medium' },
          { skill: 'Communication', currentLevel: 65, requiredLevel: 75, priority: 'low' },
        ],
        targetRoles: [
          { role: 'Software Engineer', fitScore: scores.skillRoleFitScore, requirements: ['DSA', 'Coding', 'Problem Solving'] },
          { role: 'Data Engineer', fitScore: scores.skillRoleFitScore - 10, requirements: ['SQL', 'Python', 'Big Data'] },
        ],
        topMatchingCompanies: [
          { company: 'Google', fitScore: 75, openings: 50 },
          { company: 'Microsoft', fitScore: 70, openings: 80 },
          { company: 'Amazon', fitScore: 68, openings: 100 },
        ],
        actionPlan: [
          { action: 'Complete LeetCode 100 problems', deadline: daysFromNow(30).toISOString(), impact: 'high' },
          { action: 'Get AWS certification', deadline: daysFromNow(60).toISOString(), impact: 'medium' },
          { action: 'Build portfolio project', deadline: daysFromNow(45).toISOString(), impact: 'high' },
        ],
        confidenceScore: randomFloat(0.65, 0.9, 2),
        isLatest,
      },
    });
  }
}

async function seedStudentGoals(tenantId: string, studentId: string): Promise<void> {
  const goals = randomItems(ALL_GOALS, GOALS_PER_STUDENT);
  const statuses = ['active', 'active', 'completed', 'active'];

  for (let i = 0; i < goals.length; i++) {
    const goal = goals[i];
    const status = statuses[i % statuses.length];
    const progress = status === 'completed' ? 100 : randomInt(10, 85);

    const existing = await prisma.studentGoal.findFirst({
      where: {
        tenantId,
        studentId,
        title: goal.title,
      },
    });

    if (existing) continue;

    await prisma.studentGoal.create({
      data: {
        tenantId,
        studentId,
        title: goal.title,
        description: `Goal to ${goal.title.toLowerCase()} to improve ${goal.category} outcomes.`,
        category: goal.category,
        targetDate: daysFromNow(randomInt(30, 180)),
        targetValue: goal.unit === 'CGPA' ? 8.5 : goal.unit === '%' ? 90 : randomInt(3, 10),
        currentValue: goal.unit === 'CGPA' ? randomFloat(6.5, 8.5, 2) : goal.unit === '%' ? randomInt(60, 85) : randomInt(0, 5),
        unit: goal.unit,
        isAiSuggested: Math.random() > 0.5,
        isMentorAssigned: Math.random() > 0.7,
        status,
        progress,
        milestones: [
          { title: 'Research & Planning', targetDate: daysFromNow(7).toISOString(), completed: true, completedAt: daysAgo(14).toISOString() },
          { title: 'Initial Progress', targetDate: daysFromNow(30).toISOString(), completed: progress > 30, completedAt: progress > 30 ? daysAgo(7).toISOString() : null },
          { title: 'Final Goal', targetDate: daysFromNow(60).toISOString(), completed: status === 'completed', completedAt: status === 'completed' ? daysAgo(1).toISOString() : null },
        ],
        completedAt: status === 'completed' ? daysAgo(randomInt(1, 30)) : null,
      },
    });
  }
}

async function seedAiGuidance(tenantId: string, studentId: string): Promise<void> {
  const guidanceItems = [
    {
      guidanceType: 'monthly_plan',
      category: 'academic',
      priority: 'high',
      title: 'January 2025 Academic Focus',
      description: 'Based on your SGI trends, focus on improving your academic score by attending all classes and completing assignments on time.',
    },
    {
      guidanceType: 'recommendation',
      category: 'career',
      priority: 'medium',
      title: 'Resume Enhancement',
      description: 'Your resume score could be improved. Consider adding your recent project work and any certifications you have completed.',
    },
    {
      guidanceType: 'tip',
      category: 'skill',
      priority: 'low',
      title: 'Skill Building: Cloud Computing',
      description: 'Cloud skills are in high demand. Consider starting with AWS Cloud Practitioner certification.',
    },
    {
      guidanceType: 'alert',
      category: 'engagement',
      priority: 'high',
      title: 'Club Participation Reminder',
      description: 'Your engagement score is lower than peers. Joining a technical club could boost your overall growth index.',
    },
    {
      guidanceType: 'recommendation',
      category: 'academic',
      priority: 'medium',
      title: 'Focus on Data Structures',
      description: 'Data Structures is a key subject for placements. Allocate extra study time this month.',
    },
    {
      guidanceType: 'milestone',
      category: 'career',
      priority: 'low',
      title: 'Internship Milestone',
      description: 'Start applying for summer internships. Create a list of target companies and prepare your applications.',
    },
    {
      guidanceType: 'tip',
      category: 'behavioral',
      priority: 'low',
      title: 'Time Management Tip',
      description: 'Use the Pomodoro technique to improve focus during study sessions.',
    },
    {
      guidanceType: 'recommendation',
      category: 'skill',
      priority: 'medium',
      title: 'LeetCode Practice',
      description: 'Solve at least 2 LeetCode problems daily to prepare for technical interviews.',
    },
  ];

  for (let i = 0; i < Math.min(GUIDANCE_PER_STUDENT, guidanceItems.length); i++) {
    const item = guidanceItems[i];
    const status = i < 3 ? 'active' : i < 5 ? 'viewed' : 'completed';

    const existing = await prisma.aiGuidance.findFirst({
      where: {
        tenantId,
        studentId,
        title: item.title,
      },
    });

    if (existing) continue;

    await prisma.aiGuidance.create({
      data: {
        tenantId,
        studentId,
        ...item,
        actionItems: [
          { action: 'Review relevant materials', deadline: daysFromNow(7).toISOString(), completed: status === 'completed' },
          { action: 'Complete practice exercises', deadline: daysFromNow(14).toISOString(), completed: false },
        ],
        resources: [
          { title: 'Relevant Course', url: 'https://coursera.org/example', type: 'course' },
          { title: 'Practice Problems', url: 'https://leetcode.com', type: 'practice' },
        ],
        triggerReason: 'Based on SGI/CRI analysis',
        triggerMetric: randomItem(['sgiScore', 'criScore', 'attendanceRate', 'clubActivity']),
        triggerValue: randomFloat(40, 70, 1),
        confidenceScore: randomFloat(0.7, 0.95, 2),
        status,
        viewedAt: status !== 'active' ? daysAgo(randomInt(1, 14)) : null,
        wasHelpful: status === 'completed' ? Math.random() > 0.3 : null,
        expiresAt: daysFromNow(30),
      },
    });
  }
}

async function seedDisengagementAlerts(tenantId: string, studentId: string): Promise<void> {
  // Only create alerts for some students (20% chance)
  if (Math.random() > 0.2) return;

  const alertTypes = ['attendance_drop', 'grade_decline', 'activity_drop', 'feedback_concern'];
  const alertType = randomItem(alertTypes);
  const severity = randomItem(['warning', 'warning', 'critical']);

  const existing = await prisma.disengagementAlert.findFirst({
    where: { tenantId, studentId, alertType, status: { in: ['new', 'acknowledged', 'in_progress'] } },
  });

  if (existing) return;

  const metrics: Record<string, { name: string; current: number; previous: number; threshold: number }> = {
    attendance_drop: { name: 'attendance_rate', current: randomInt(55, 72), previous: randomInt(80, 90), threshold: 75 },
    grade_decline: { name: 'cgpa', current: randomFloat(5.5, 6.5, 2), previous: randomFloat(7.0, 8.0, 2), threshold: 6.5 },
    activity_drop: { name: 'club_activity', current: randomInt(10, 30), previous: randomInt(50, 80), threshold: 40 },
    feedback_concern: { name: 'feedback_score', current: randomFloat(2.5, 3.2, 1), previous: randomFloat(3.8, 4.5, 1), threshold: 3.5 },
  };

  const metric = metrics[alertType];
  const changePercent = ((metric.current - metric.previous) / metric.previous) * 100;

  await prisma.disengagementAlert.create({
    data: {
      tenantId,
      studentId,
      alertType,
      severity,
      metricName: metric.name,
      currentValue: metric.current,
      previousValue: metric.previous,
      thresholdValue: metric.threshold,
      changePercent,
      timeframe: 'last 30 days',
      description: `Student's ${metric.name.replace('_', ' ')} has dropped from ${metric.previous} to ${metric.current} (${changePercent.toFixed(1)}% decline).`,
      suggestedActions: [
        { action: 'Schedule counseling session', priority: 'high', assignedTo: 'mentor' },
        { action: 'Contact parent/guardian', priority: 'medium', assignedTo: 'admin' },
        { action: 'Review academic support options', priority: 'low', assignedTo: 'hod' },
      ],
      status: randomItem(['new', 'acknowledged', 'in_progress']),
      acknowledgedAt: Math.random() > 0.5 ? daysAgo(randomInt(1, 7)) : null,
    },
  });
}

async function seedJourneyMilestones(tenantId: string, studentId: string): Promise<void> {
  const milestoneConfigs = [
    { type: 'admission', title: 'College Admission', category: 'academic', semester: 1, daysAgoVal: 365 * 2 },
    { type: 'semester_start', title: 'Started Semester 3', category: 'academic', semester: 3, daysAgoVal: 180 },
    { type: 'achievement', title: 'Won Hackathon', category: 'extracurricular', semester: 3, daysAgoVal: 90 },
    { type: 'exam', title: 'Completed Internal Exams', category: 'academic', semester: 3, daysAgoVal: 60 },
    { type: 'internship', title: 'Started Summer Internship', category: 'career', semester: 4, daysAgoVal: 30 },
    { type: 'semester_end', title: 'Completed Semester 3', category: 'academic', semester: 3, daysAgoVal: 15 },
  ];

  for (const config of milestoneConfigs.slice(0, MILESTONES_PER_STUDENT)) {
    const existing = await prisma.journeyMilestone.findFirst({
      where: { tenantId, studentId, title: config.title },
    });

    if (existing) continue;

    await prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: config.type,
        title: config.title,
        description: `${config.title} - a significant milestone in the academic journey.`,
        occurredAt: daysAgo(config.daysAgoVal),
        academicYear: '2024-25',
        semester: config.semester,
        snapshotData: {
          cgpa: randomFloat(6.5, 9.0, 2),
          sgi: randomInt(50, 85),
          cri: randomInt(45, 80),
          attendance: randomInt(75, 95),
          achievements: randomInt(0, 5),
        },
        category: config.category,
        isPositive: config.type !== 'attendance_drop',
        isPublic: Math.random() > 0.5,
        linkedEntityType: config.type,
      },
    });
  }
}

async function seedSemesterSnapshots(tenantId: string, studentId: string): Promise<void> {
  const semesters = [
    { year: '2023-24', sem: 1, sgpa: randomFloat(7.0, 8.5, 2) },
    { year: '2023-24', sem: 2, sgpa: randomFloat(7.2, 8.8, 2) },
    { year: '2024-25', sem: 3, sgpa: randomFloat(7.5, 9.0, 2) },
  ];

  let cumulativeCgpa = 0;
  for (let i = 0; i < semesters.length; i++) {
    const sem = semesters[i];
    cumulativeCgpa = ((cumulativeCgpa * i) + sem.sgpa) / (i + 1);

    const existing = await prisma.semesterSnapshot.findFirst({
      where: { tenantId, studentId, academicYear: sem.year, semester: sem.sem },
    });

    if (existing) continue;

    await prisma.semesterSnapshot.create({
      data: {
        tenantId,
        studentId,
        academicYear: sem.year,
        semester: sem.sem,
        sgpa: sem.sgpa,
        cgpa: Number(cumulativeCgpa.toFixed(2)),
        backlogs: Math.random() > 0.9 ? 1 : 0,
        overallAttendance: randomInt(75, 95),
        endSgiScore: randomInt(55, 85),
        endCriScore: randomInt(45, 80),
        clubsActive: randomInt(1, 3),
        eventsAttended: randomInt(2, 8),
        achievementsCount: randomInt(0, 3),
        departmentAvgCgpa: randomFloat(7.0, 7.8, 2),
        batchRank: randomInt(1, 60),
        batchSize: 60,
      },
    });
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function seedStudentGrowthData(tenantId: string, studentId: string): Promise<void> {
  await seedStudentGrowthIndices(tenantId, studentId);
  await seedCareerReadinessIndices(tenantId, studentId);
  await seedStudentGoals(tenantId, studentId);
  await seedAiGuidance(tenantId, studentId);
  await seedDisengagementAlerts(tenantId, studentId);
  await seedJourneyMilestones(tenantId, studentId);
  await seedSemesterSnapshots(tenantId, studentId);
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          EDUNEXUS STUDENT GROWTH DATA SEEDER                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      where: { status: 'active' },
    });

    console.log(`Found ${tenants.length} active tenants\n`);

    for (const tenant of tenants) {
      console.log(`\n[TENANT] ${tenant.displayName} (${tenant.domain})`);

      // Get all students for this tenant
      const students = await prisma.student.findMany({
        where: { tenantId: tenant.id },
        select: { id: true, rollNo: true },
      });

      console.log(`  Found ${students.length} students`);

      for (const student of students) {
        console.log(`    Processing student: ${student.rollNo}`);
        await seedStudentGrowthData(tenant.id, student.id);
      }
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          STUDENT GROWTH SEEDING COMPLETE                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n[ERROR] Student growth seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in main seed.ts
export { seedStudentGrowthData };

// Run if executed directly
main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
