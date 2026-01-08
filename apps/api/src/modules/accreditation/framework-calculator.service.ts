import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Framework, NbaCategory, NaacCategory, NirfCategory } from './dto/accreditation.dto';

interface MetricDefinition {
  criterionCode: string;
  criterionName: string;
  category: string;
  description?: string;
  maxScore: number;
  weightage: number;
  dataSource?: string;
  minThreshold?: number;
  maxThreshold?: number;
}

@Injectable()
export class FrameworkCalculatorService {
  private readonly logger = new Logger(FrameworkCalculatorService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============ SEED PREDEFINED METRICS ============

  async seedNbaMetrics(tenantId: string, overwrite: boolean = false) {
    const metrics = this.getNbaMetricDefinitions();
    return this.seedMetrics(tenantId, Framework.NBA, metrics, overwrite);
  }

  async seedNaacMetrics(tenantId: string, overwrite: boolean = false) {
    const metrics = this.getNaacMetricDefinitions();
    return this.seedMetrics(tenantId, Framework.NAAC, metrics, overwrite);
  }

  async seedNirfMetrics(tenantId: string, overwrite: boolean = false) {
    const metrics = this.getNirfMetricDefinitions();
    return this.seedMetrics(tenantId, Framework.NIRF, metrics, overwrite);
  }

  private async seedMetrics(
    tenantId: string,
    framework: Framework,
    metrics: MetricDefinition[],
    overwrite: boolean,
  ) {
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const metric of metrics) {
      const existing = await this.prisma.accreditationMetric.findFirst({
        where: { tenantId, framework, criterionCode: metric.criterionCode },
      });

      if (existing) {
        if (overwrite) {
          await this.prisma.accreditationMetric.update({
            where: { id: existing.id },
            data: {
              criterionName: metric.criterionName,
              category: metric.category,
              description: metric.description,
              maxScore: metric.maxScore,
              weightage: metric.weightage,
              dataSource: metric.dataSource,
              minThreshold: metric.minThreshold,
              maxThreshold: metric.maxThreshold,
            },
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await this.prisma.accreditationMetric.create({
          data: {
            tenantId,
            framework,
            ...metric,
          },
        });
        created++;
      }
    }

    return { created, updated, skipped, total: metrics.length };
  }

  // ============ AUTO-CALCULATE METRICS ============

  async calculateMetricsFromData(tenantId: string, framework: Framework, academicYear: string) {
    const metrics = await this.prisma.accreditationMetric.findMany({
      where: { tenantId, framework, isActive: true, dataSource: { not: null } },
    });

    const results = {
      calculated: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const metric of metrics) {
      try {
        const value = await this.calculateMetricValue(tenantId, metric, academicYear);
        if (value !== null) {
          // Check if value exists
          const existing = await this.prisma.accreditationValue.findFirst({
            where: { tenantId, metricId: metric.id, academicYear },
          });

          if (existing) {
            // Update if different
            if (existing.rawValue !== value) {
              await this.prisma.accreditationValue.update({
                where: { id: existing.id },
                data: {
                  rawValue: value,
                  normalizedValue: Math.min((value / metric.maxScore) * 100, 100),
                  score: (value / metric.maxScore) * metric.maxScore * (metric.weightage || 1),
                  previousValue: existing.rawValue,
                  trend: value > (existing.rawValue || 0) ? 'improving' :
                         value < (existing.rawValue || 0) ? 'declining' : 'stable',
                  calculatedAt: new Date(),
                },
              });
            }
          } else {
            // Create new value
            await this.prisma.accreditationValue.create({
              data: {
                tenantId,
                metricId: metric.id,
                academicYear,
                rawValue: value,
                normalizedValue: Math.min((value / metric.maxScore) * 100, 100),
                score: (value / metric.maxScore) * metric.maxScore * (metric.weightage || 1),
                calculatedAt: new Date(),
                isLatest: true,
              },
            });
          }
          results.calculated++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${metric.criterionCode}: ${error}`);
        this.logger.error(`Failed to calculate ${metric.criterionCode}: ${error}`);
      }
    }

    return results;
  }

  private async calculateMetricValue(
    tenantId: string,
    metric: { dataSource: string | null; criterionCode: string },
    academicYear: string,
  ): Promise<number | null> {
    if (!metric.dataSource) return null;

    const dataSource = metric.dataSource.toLowerCase();

    // Map data sources to actual calculations
    switch (dataSource) {
      case 'student_count':
        return this.getStudentCount(tenantId);
      case 'faculty_count':
        return this.getFacultyCount(tenantId);
      case 'student_faculty_ratio':
        return this.getStudentFacultyRatio(tenantId);
      case 'pass_percentage':
        return this.getPassPercentage(tenantId, academicYear);
      case 'placement_percentage':
        return this.getPlacementPercentage(tenantId, academicYear);
      case 'average_cgpa':
        return this.getAverageCgpa(tenantId);
      case 'phd_faculty_percentage':
        return this.getPhdFacultyPercentage(tenantId);
      case 'research_publications':
        return this.getResearchPublications(tenantId, academicYear);
      case 'patents_filed':
        return this.getPatentsFiled(tenantId, academicYear);
      case 'industry_collaborations':
        return this.getIndustryCollaborations(tenantId);
      case 'alumni_engagement':
        return this.getAlumniEngagement(tenantId);
      default:
        this.logger.warn(`Unknown data source: ${dataSource} for ${metric.criterionCode}`);
        return null;
    }
  }

  // ============ DATA RETRIEVAL METHODS ============

  private async getStudentCount(tenantId: string): Promise<number> {
    return this.prisma.student.count({
      where: { tenantId, status: 'active' },
    });
  }

  private async getFacultyCount(tenantId: string): Promise<number> {
    // Query staff through user relation to filter by role
    return this.prisma.staff.count({
      where: {
        user: {
          tenantId,
          role: { in: ['teacher', 'hod'] },
          status: 'active',
        },
      },
    });
  }

  private async getStudentFacultyRatio(tenantId: string): Promise<number> {
    const [students, faculty] = await Promise.all([
      this.getStudentCount(tenantId),
      this.getFacultyCount(tenantId),
    ]);
    return faculty > 0 ? Math.round((students / faculty) * 10) / 10 : 0;
  }

  private async getPassPercentage(tenantId: string, academicYear: string): Promise<number> {
    // Calculate from exam results
    // Assumes passing is 40% of totalMarks (standard threshold)
    const results = await this.prisma.examResult.findMany({
      where: {
        tenantId,
      },
      select: { marks: true, exam: { select: { totalMarks: true } } },
    });

    if (results.length === 0) return 0;

    // Passing threshold is 40% of total marks
    const passed = results.filter(r => {
      const passingMarks = (r.exam.totalMarks || 100) * 0.4;
      return Number(r.marks) >= passingMarks;
    }).length;
    return Math.round((passed / results.length) * 100 * 10) / 10;
  }

  private async getPlacementPercentage(tenantId: string, academicYear: string): Promise<number> {
    // Get final year students and their placements
    const finalYearStudents = await this.prisma.student.count({
      where: { tenantId, semester: { gte: 7 }, status: 'active' },
    });

    // Check for placement offers from journey milestones
    const placedCount = await this.prisma.journeyMilestone.count({
      where: {
        tenantId,
        milestoneType: { in: ['placement_offer', 'placement_accepted'] },
        academicYear,
      },
    });

    return finalYearStudents > 0 ? Math.round((placedCount / finalYearStudents) * 100 * 10) / 10 : 0;
  }

  private async getAverageCgpa(tenantId: string): Promise<number> {
    const snapshots = await this.prisma.semesterSnapshot.findMany({
      where: { tenantId, cgpa: { not: null } },
      select: { cgpa: true },
      distinct: ['studentId'],
      orderBy: { createdAt: 'desc' },
    });

    if (snapshots.length === 0) return 0;
    const avg = snapshots.reduce((sum, s) => sum + (s.cgpa || 0), 0) / snapshots.length;
    return Math.round(avg * 100) / 100;
  }

  private async getPhdFacultyPercentage(tenantId: string): Promise<number> {
    // Faculty with role teacher or hod through user relation
    const total = await this.prisma.staff.count({
      where: {
        user: {
          tenantId,
          role: { in: ['teacher', 'hod'] },
          status: 'active',
        },
      },
    });

    // PhD faculty - check designation field for PhD mention
    const phd = await this.prisma.staff.count({
      where: {
        user: {
          tenantId,
          role: { in: ['teacher', 'hod'] },
          status: 'active',
        },
        designation: { contains: 'PhD', mode: 'insensitive' },
      },
    });

    return total > 0 ? Math.round((phd / total) * 100 * 10) / 10 : 0;
  }

  private async getResearchPublications(tenantId: string, academicYear: string): Promise<number> {
    // Would need a Publications model - returning placeholder
    return 0;
  }

  private async getPatentsFiled(tenantId: string, academicYear: string): Promise<number> {
    // Would need a Patents model - returning placeholder
    return 0;
  }

  private async getIndustryCollaborations(tenantId: string): Promise<number> {
    // Count unique companies from placements/internships
    const placements = await this.prisma.alumniEmployment.findMany({
      where: { tenantId },
      select: { companyName: true },
      distinct: ['companyName'],
    });
    return placements.length;
  }

  private async getAlumniEngagement(tenantId: string): Promise<number> {
    // Count active alumni
    return this.prisma.alumniProfile.count({
      where: { tenantId, registrationStatus: 'approved' },
    });
  }

  // ============ METRIC DEFINITIONS ============

  private getNbaMetricDefinitions(): MetricDefinition[] {
    return [
      // Criterion 1: Vision, Mission and PEOs
      {
        criterionCode: '1.1',
        criterionName: 'Vision and Mission Statements',
        category: NbaCategory.VISION_MISSION,
        description: 'Vision and Mission statements are published and disseminated among stakeholders',
        maxScore: 15,
        weightage: 1,
      },
      {
        criterionCode: '1.2',
        criterionName: 'Program Educational Objectives',
        category: NbaCategory.VISION_MISSION,
        description: 'PEOs are stated, published, and are consistent with mission',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '1.3',
        criterionName: 'PEO Attainment Process',
        category: NbaCategory.VISION_MISSION,
        description: 'Process for reviewing and revising PEOs',
        maxScore: 10,
        weightage: 1,
      },
      // Criterion 2: Program Outcomes
      {
        criterionCode: '2.1',
        criterionName: 'Program Outcomes Definition',
        category: NbaCategory.PROGRAM_OUTCOMES,
        description: 'Graduate Attributes / Program Outcomes are defined',
        maxScore: 20,
        weightage: 1,
      },
      {
        criterionCode: '2.2',
        criterionName: 'PO-PEO Mapping',
        category: NbaCategory.PROGRAM_OUTCOMES,
        description: 'POs are mapped to PEOs',
        maxScore: 15,
        weightage: 1,
      },
      // Criterion 3: Program Curriculum
      {
        criterionCode: '3.1',
        criterionName: 'Curriculum Design',
        category: NbaCategory.PROGRAM_CURRICULUM,
        description: 'Curriculum design and content',
        maxScore: 30,
        weightage: 1,
      },
      {
        criterionCode: '3.2',
        criterionName: 'CO-PO Mapping',
        category: NbaCategory.PROGRAM_CURRICULUM,
        description: 'Course Outcomes mapped to Program Outcomes',
        maxScore: 20,
        weightage: 1,
      },
      // Criterion 4: Students
      {
        criterionCode: '4.1',
        criterionName: 'Student Admissions',
        category: NbaCategory.STUDENTS,
        description: 'Student admission process and quality',
        maxScore: 25,
        weightage: 1,
        dataSource: 'student_count',
      },
      {
        criterionCode: '4.2',
        criterionName: 'Student Performance',
        category: NbaCategory.STUDENTS,
        description: 'Success rate and academic performance',
        maxScore: 35,
        weightage: 1,
        dataSource: 'pass_percentage',
      },
      {
        criterionCode: '4.3',
        criterionName: 'Placement and Higher Studies',
        category: NbaCategory.STUDENTS,
        description: 'Placement and higher studies statistics',
        maxScore: 40,
        weightage: 1,
        dataSource: 'placement_percentage',
      },
      // Criterion 5: Faculty
      {
        criterionCode: '5.1',
        criterionName: 'Faculty Qualifications',
        category: NbaCategory.FACULTY,
        description: 'Faculty qualifications and PhD percentage',
        maxScore: 30,
        weightage: 1,
        dataSource: 'phd_faculty_percentage',
      },
      {
        criterionCode: '5.2',
        criterionName: 'Faculty-Student Ratio',
        category: NbaCategory.FACULTY,
        description: 'Student to faculty ratio',
        maxScore: 25,
        weightage: 1,
        dataSource: 'student_faculty_ratio',
        maxThreshold: 20,
        minThreshold: 15,
      },
      {
        criterionCode: '5.3',
        criterionName: 'Faculty Development',
        category: NbaCategory.FACULTY,
        description: 'Faculty development programs and research',
        maxScore: 20,
        weightage: 1,
      },
      // Criterion 6: Facilities
      {
        criterionCode: '6.1',
        criterionName: 'Infrastructure',
        category: NbaCategory.FACILITIES,
        description: 'Classrooms, laboratories, computing facilities',
        maxScore: 40,
        weightage: 1,
      },
      {
        criterionCode: '6.2',
        criterionName: 'Library Resources',
        category: NbaCategory.FACILITIES,
        description: 'Library and learning resources',
        maxScore: 20,
        weightage: 1,
      },
      // Criterion 7: Continuous Improvement
      {
        criterionCode: '7.1',
        criterionName: 'Quality Improvement',
        category: NbaCategory.CONTINUOUS_IMPROVEMENT,
        description: 'Actions taken for quality improvement',
        maxScore: 30,
        weightage: 1,
      },
    ];
  }

  private getNaacMetricDefinitions(): MetricDefinition[] {
    return [
      // Criterion 1: Curricular Aspects (150 marks)
      {
        criterionCode: '1.1.1',
        criterionName: 'Curriculum Design and Development',
        category: NaacCategory.CURRICULAR_ASPECTS,
        description: 'Curricula developed/adopted with CBCS',
        maxScore: 20,
        weightage: 1,
      },
      {
        criterionCode: '1.2.1',
        criterionName: 'Academic Flexibility',
        category: NaacCategory.CURRICULAR_ASPECTS,
        description: 'Number of Add-on/Certificate programs',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '1.3.1',
        criterionName: 'Curriculum Enrichment',
        category: NaacCategory.CURRICULAR_ASPECTS,
        description: 'Cross-cutting issues in curriculum',
        maxScore: 30,
        weightage: 1,
      },
      {
        criterionCode: '1.4.1',
        criterionName: 'Feedback System',
        category: NaacCategory.CURRICULAR_ASPECTS,
        description: 'Structured feedback and action taken',
        maxScore: 25,
        weightage: 1,
      },
      // Criterion 2: Teaching-Learning (200 marks)
      {
        criterionCode: '2.1.1',
        criterionName: 'Student Enrollment',
        category: NaacCategory.TEACHING_LEARNING,
        description: 'Enrollment percentage',
        maxScore: 30,
        weightage: 1,
        dataSource: 'student_count',
      },
      {
        criterionCode: '2.2.1',
        criterionName: 'Student-Teacher Ratio',
        category: NaacCategory.TEACHING_LEARNING,
        description: 'Student - Full time teacher ratio',
        maxScore: 25,
        weightage: 1,
        dataSource: 'student_faculty_ratio',
      },
      {
        criterionCode: '2.3.1',
        criterionName: 'Teaching-Learning Process',
        category: NaacCategory.TEACHING_LEARNING,
        description: 'Student-centric methods used',
        maxScore: 40,
        weightage: 1,
      },
      {
        criterionCode: '2.4.1',
        criterionName: 'Faculty Profile',
        category: NaacCategory.TEACHING_LEARNING,
        description: 'Full time teachers with PhD',
        maxScore: 40,
        weightage: 1,
        dataSource: 'phd_faculty_percentage',
      },
      {
        criterionCode: '2.5.1',
        criterionName: 'Evaluation Process',
        category: NaacCategory.TEACHING_LEARNING,
        description: 'Mechanism for internal assessment',
        maxScore: 30,
        weightage: 1,
      },
      {
        criterionCode: '2.6.1',
        criterionName: 'Student Performance',
        category: NaacCategory.TEACHING_LEARNING,
        description: 'Pass percentage of students',
        maxScore: 35,
        weightage: 1,
        dataSource: 'pass_percentage',
      },
      // Criterion 3: Research (150 marks)
      {
        criterionCode: '3.1.1',
        criterionName: 'Research Grants',
        category: NaacCategory.RESEARCH_INNOVATION,
        description: 'Grants for research projects',
        maxScore: 30,
        weightage: 1,
      },
      {
        criterionCode: '3.2.1',
        criterionName: 'Innovation Ecosystem',
        category: NaacCategory.RESEARCH_INNOVATION,
        description: 'Institution has incubation center',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '3.3.1',
        criterionName: 'Research Publications',
        category: NaacCategory.RESEARCH_INNOVATION,
        description: 'Papers published per teacher',
        maxScore: 40,
        weightage: 1,
        dataSource: 'research_publications',
      },
      {
        criterionCode: '3.4.1',
        criterionName: 'Extension Activities',
        category: NaacCategory.RESEARCH_INNOVATION,
        description: 'Extension and outreach programs',
        maxScore: 30,
        weightage: 1,
      },
      // Criterion 4: Infrastructure (100 marks)
      {
        criterionCode: '4.1.1',
        criterionName: 'Physical Facilities',
        category: NaacCategory.INFRASTRUCTURE,
        description: 'Classrooms and seminar halls',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '4.2.1',
        criterionName: 'Library Resources',
        category: NaacCategory.INFRASTRUCTURE,
        description: 'Library automation and resources',
        maxScore: 30,
        weightage: 1,
      },
      {
        criterionCode: '4.3.1',
        criterionName: 'IT Infrastructure',
        category: NaacCategory.INFRASTRUCTURE,
        description: 'Institution has IT facilities',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '4.4.1',
        criterionName: 'Maintenance',
        category: NaacCategory.INFRASTRUCTURE,
        description: 'Expenditure for infrastructure',
        maxScore: 20,
        weightage: 1,
      },
      // Criterion 5: Student Support (100 marks)
      {
        criterionCode: '5.1.1',
        criterionName: 'Scholarships',
        category: NaacCategory.STUDENT_SUPPORT,
        description: 'Students benefited by scholarships',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '5.2.1',
        criterionName: 'Capacity Development',
        category: NaacCategory.STUDENT_SUPPORT,
        description: 'Soft skills, language, life skills',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '5.3.1',
        criterionName: 'Student Participation',
        category: NaacCategory.STUDENT_SUPPORT,
        description: 'Sports and cultural activities',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '5.4.1',
        criterionName: 'Alumni Engagement',
        category: NaacCategory.STUDENT_SUPPORT,
        description: 'Registered alumni association',
        maxScore: 25,
        weightage: 1,
        dataSource: 'alumni_engagement',
      },
      // Criterion 6: Governance (100 marks)
      {
        criterionCode: '6.1.1',
        criterionName: 'Vision and Leadership',
        category: NaacCategory.GOVERNANCE_LEADERSHIP,
        description: 'Institution has stated vision',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '6.2.1',
        criterionName: 'Strategy Development',
        category: NaacCategory.GOVERNANCE_LEADERSHIP,
        description: 'Perspective plan for development',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '6.3.1',
        criterionName: 'Faculty Empowerment',
        category: NaacCategory.GOVERNANCE_LEADERSHIP,
        description: 'Welfare measures for staff',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '6.4.1',
        criterionName: 'Financial Management',
        category: NaacCategory.GOVERNANCE_LEADERSHIP,
        description: 'Institutional funds mobilized',
        maxScore: 25,
        weightage: 1,
      },
      // Criterion 7: Institutional Values (100 marks)
      {
        criterionCode: '7.1.1',
        criterionName: 'Gender Equity',
        category: NaacCategory.INSTITUTIONAL_VALUES,
        description: 'Gender equity promotion measures',
        maxScore: 25,
        weightage: 1,
      },
      {
        criterionCode: '7.2.1',
        criterionName: 'Environmental Consciousness',
        category: NaacCategory.INSTITUTIONAL_VALUES,
        description: 'Green campus initiatives',
        maxScore: 35,
        weightage: 1,
      },
      {
        criterionCode: '7.3.1',
        criterionName: 'Institutional Distinctiveness',
        category: NaacCategory.INSTITUTIONAL_VALUES,
        description: 'Best practices of the institution',
        maxScore: 40,
        weightage: 1,
      },
    ];
  }

  private getNirfMetricDefinitions(): MetricDefinition[] {
    return [
      // TLR - Teaching, Learning & Resources (100 marks, 30% weight)
      {
        criterionCode: 'TLR-SS',
        criterionName: 'Student Strength',
        category: NirfCategory.TLR,
        description: 'Total student strength including PhD',
        maxScore: 20,
        weightage: 0.3,
        dataSource: 'student_count',
      },
      {
        criterionCode: 'TLR-FSR',
        criterionName: 'Faculty-Student Ratio',
        category: NirfCategory.TLR,
        description: 'Faculty-student ratio with emphasis on PhD',
        maxScore: 30,
        weightage: 0.3,
        dataSource: 'student_faculty_ratio',
      },
      {
        criterionCode: 'TLR-FQE',
        criterionName: 'Faculty Quality and Experience',
        category: NirfCategory.TLR,
        description: 'Faculty with PhD and experience',
        maxScore: 30,
        weightage: 0.3,
        dataSource: 'phd_faculty_percentage',
      },
      {
        criterionCode: 'TLR-FRU',
        criterionName: 'Financial Resources and Utilization',
        category: NirfCategory.TLR,
        description: 'Financial resources and their utilization',
        maxScore: 20,
        weightage: 0.3,
      },
      // RP - Research and Professional Practice (100 marks, 30% weight)
      {
        criterionCode: 'RP-PU',
        criterionName: 'Publications',
        category: NirfCategory.RP,
        description: 'Combined metric for publications',
        maxScore: 35,
        weightage: 0.3,
        dataSource: 'research_publications',
      },
      {
        criterionCode: 'RP-QP',
        criterionName: 'Quality of Publications',
        category: NirfCategory.RP,
        description: 'Citation metrics',
        maxScore: 35,
        weightage: 0.3,
      },
      {
        criterionCode: 'RP-IPR',
        criterionName: 'IPR and Patents',
        category: NirfCategory.RP,
        description: 'Published and granted patents',
        maxScore: 15,
        weightage: 0.3,
        dataSource: 'patents_filed',
      },
      {
        criterionCode: 'RP-FPPP',
        criterionName: 'Footprint of Projects',
        category: NirfCategory.RP,
        description: 'Projects, professional practice, executive development',
        maxScore: 15,
        weightage: 0.3,
      },
      // GO - Graduation Outcomes (100 marks, 20% weight)
      {
        criterionCode: 'GO-GPH',
        criterionName: 'Graduation Performance',
        category: NirfCategory.GO,
        description: 'Combined metric for university examinations',
        maxScore: 40,
        weightage: 0.2,
        dataSource: 'average_cgpa',
      },
      {
        criterionCode: 'GO-GUE',
        criterionName: 'University Examinations',
        category: NirfCategory.GO,
        description: 'Number of PhD students graduated',
        maxScore: 25,
        weightage: 0.2,
      },
      {
        criterionCode: 'GO-MS',
        criterionName: 'Median Salary',
        category: NirfCategory.GO,
        description: 'Median salary of graduates',
        maxScore: 25,
        weightage: 0.2,
      },
      {
        criterionCode: 'GO-GPHD',
        criterionName: 'Higher Studies',
        category: NirfCategory.GO,
        description: 'Number of students going for higher studies',
        maxScore: 10,
        weightage: 0.2,
      },
      // OI - Outreach and Inclusivity (100 marks, 10% weight)
      {
        criterionCode: 'OI-RD',
        criterionName: 'Regional Diversity',
        category: NirfCategory.OI,
        description: 'Percentage of students from other states/countries',
        maxScore: 30,
        weightage: 0.1,
      },
      {
        criterionCode: 'OI-WD',
        criterionName: 'Women Diversity',
        category: NirfCategory.OI,
        description: 'Percentage of women students and faculty',
        maxScore: 30,
        weightage: 0.1,
      },
      {
        criterionCode: 'OI-ESCS',
        criterionName: 'Economically and Socially Challenged',
        category: NirfCategory.OI,
        description: 'Percentage of economically/socially challenged students',
        maxScore: 20,
        weightage: 0.1,
      },
      {
        criterionCode: 'OI-PCS',
        criterionName: 'Physically Challenged Students',
        category: NirfCategory.OI,
        description: 'Facilities for physically challenged',
        maxScore: 20,
        weightage: 0.1,
      },
      // Perception (100 marks, 10% weight)
      {
        criterionCode: 'PR-PR',
        criterionName: 'Peer Perception',
        category: NirfCategory.PERCEPTION,
        description: 'Academic peers and employers',
        maxScore: 100,
        weightage: 0.1,
      },
    ];
  }
}
