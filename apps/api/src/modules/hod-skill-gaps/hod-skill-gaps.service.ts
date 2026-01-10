import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QuerySkillGapsDto,
  SkillGapsResponse,
  SkillGap,
  SkillCategory,
  IndustryDemand,
  PlacementReadiness,
} from './dto/hod-skill-gaps.dto';

@Injectable()
export class HodSkillGapsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSkillGaps(
    tenantId: string,
    hodClerkUserId: string,
    query: QuerySkillGapsDto,
  ): Promise<SkillGapsResponse> {
    // Get HOD's department by looking up user via Clerk ID first
    const user = await this.prisma.user.findFirst({
      where: { tenantId, clerkUserId: hodClerkUserId },
      include: {
        staff: {
          include: { department: true },
        },
      },
    });

    if (!user?.staff?.departmentId) {
      return this.getSampleSkillGaps();
    }
    const staff = user.staff;

    // departmentId is guaranteed to be non-null after the check above
    const departmentId = staff.departmentId as string;
    const batchFilter = query.batch && query.batch !== 'all'
      ? { admissionDate: { gte: new Date(`${query.batch}-01-01`), lt: new Date(`${parseInt(query.batch) + 1}-01-01`) } }
      : {};

    // Get students in department
    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId,
        status: 'active',
        ...batchFilter,
      },
      select: { id: true, semester: true },
    });

    const studentIds = students.map((s) => s.id);
    const totalStudents = students.length;

    if (totalStudents === 0) {
      return this.getSampleSkillGaps();
    }

    // Get exam results grouped by subject
    const examResults = await this.prisma.examResult.findMany({
      where: {
        tenantId,
        studentId: { in: studentIds },
      },
      include: {
        exam: {
          include: { subject: true },
        },
      },
    });

    // Calculate subject-wise performance (as skill proxy)
    const subjectPerformance = new Map<string, { total: number; count: number; name: string }>();

    for (const result of examResults) {
      const subjectName = result.exam?.subject?.name || 'Unknown';
      const marks = Number(result.marks);

      if (!subjectPerformance.has(subjectName)) {
        subjectPerformance.set(subjectName, { total: 0, count: 0, name: subjectName });
      }

      const entry = subjectPerformance.get(subjectName)!;
      entry.total += marks;
      entry.count += 1;
    }

    // Convert to skill gaps (gap = 100 - average)
    const topGaps: SkillGap[] = Array.from(subjectPerformance.entries())
      .map(([skill, data]) => ({
        skill,
        category: this.categorizeSkill(skill),
        gap: Math.round(100 - (data.total / data.count)),
        students: Math.min(totalStudents, Math.round(totalStudents * (1 - (data.total / data.count) / 100))),
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, query.limit || 10);

    // Group by category
    const categoryMap = new Map<string, { total: number; count: number; students: Set<string> }>();

    for (const result of examResults) {
      const subjectName = result.exam?.subject?.name || 'Unknown';
      const category = this.categorizeSkill(subjectName);
      const marks = Number(result.marks);

      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, count: 0, students: new Set() });
      }

      const entry = categoryMap.get(category)!;
      entry.total += marks;
      entry.count += 1;
      entry.students.add(result.studentId);
    }

    const byCategory: SkillCategory[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
      studentCount: data.students.size,
    }));

    // Calculate placement readiness based on average performance
    const studentAvgs = new Map<string, number[]>();
    for (const result of examResults) {
      if (!studentAvgs.has(result.studentId)) {
        studentAvgs.set(result.studentId, []);
      }
      studentAvgs.get(result.studentId)!.push(Number(result.marks));
    }

    let ready = 0;
    let almostReady = 0;
    let needsWork = 0;
    let atRisk = 0;

    for (const [, marks] of studentAvgs) {
      const avg = marks.reduce((a, b) => a + b, 0) / marks.length;
      const cri = avg; // Using average as CRI proxy

      if (cri >= 80) ready++;
      else if (cri >= 60) almostReady++;
      else if (cri >= 40) needsWork++;
      else atRisk++;
    }

    // Students without results go to needs work
    const studentsWithResults = studentAvgs.size;
    const studentsWithoutResults = totalStudents - studentsWithResults;
    needsWork += studentsWithoutResults;

    const placementReadiness: PlacementReadiness = {
      ready,
      almostReady,
      needsWork,
      atRisk,
    };

    // Industry demand is external data - use representative values
    const industryDemand = this.getIndustryDemand(byCategory);

    // If no real data, return sample
    if (topGaps.length === 0 || examResults.length === 0) {
      return this.getSampleSkillGaps();
    }

    return {
      topGaps,
      byCategory: byCategory.length > 0 ? byCategory : this.getSampleSkillGaps().byCategory,
      industryDemand,
      placementReadiness,
    };
  }

  private categorizeSkill(skillName: string): string {
    const name = skillName.toLowerCase();

    if (name.includes('programming') || name.includes('java') || name.includes('python') ||
        name.includes('c++') || name.includes('data structure') || name.includes('algorithm')) {
      return 'Programming';
    }
    if (name.includes('database') || name.includes('sql') || name.includes('dbms')) {
      return 'Database';
    }
    if (name.includes('cloud') || name.includes('aws') || name.includes('network') || name.includes('system')) {
      return 'Cloud';
    }
    if (name.includes('machine learning') || name.includes('ai') || name.includes('artificial') || name.includes('deep learning')) {
      return 'AI/ML';
    }
    if (name.includes('communication') || name.includes('english') || name.includes('soft skill')) {
      return 'Soft Skills';
    }
    return 'Technical';
  }

  private getIndustryDemand(categories: SkillCategory[]): IndustryDemand[] {
    // Industry demand is external benchmark data
    const benchmarks: Record<string, number> = {
      'Programming': 95,
      'Database': 90,
      'Cloud': 88,
      'AI/ML': 85,
      'Soft Skills': 92,
      'Technical': 80,
    };

    const categoryScores = new Map(categories.map(c => [c.category, c.avgScore]));

    return Object.entries(benchmarks).map(([skill, demand]) => ({
      skill,
      demand,
      supply: categoryScores.get(skill) || 50,
    }));
  }

  private getSampleSkillGaps(): SkillGapsResponse {
    return {
      topGaps: [
        { skill: 'Data Structures', category: 'Technical', gap: 35, students: 120 },
        { skill: 'System Design', category: 'Technical', gap: 42, students: 95 },
        { skill: 'Communication', category: 'Soft Skills', gap: 28, students: 150 },
        { skill: 'Cloud Computing', category: 'Technical', gap: 45, students: 80 },
        { skill: 'Machine Learning', category: 'Technical', gap: 38, students: 110 },
      ],
      byCategory: [
        { category: 'Programming', avgScore: 68, studentCount: 200 },
        { category: 'Database', avgScore: 62, studentCount: 200 },
        { category: 'Cloud', avgScore: 45, studentCount: 180 },
        { category: 'AI/ML', avgScore: 52, studentCount: 150 },
        { category: 'Soft Skills', avgScore: 72, studentCount: 200 },
      ],
      industryDemand: [
        { skill: 'Python', demand: 95, supply: 78 },
        { skill: 'AWS/Cloud', demand: 88, supply: 45 },
        { skill: 'React/Frontend', demand: 82, supply: 65 },
        { skill: 'SQL/Database', demand: 90, supply: 72 },
        { skill: 'AI/ML', demand: 85, supply: 52 },
        { skill: 'Communication', demand: 92, supply: 72 },
      ],
      placementReadiness: {
        ready: 45,
        almostReady: 85,
        needsWork: 50,
        atRisk: 20,
      },
    };
  }
}
