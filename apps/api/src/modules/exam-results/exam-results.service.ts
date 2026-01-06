import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateExamResultDto,
  BulkCreateExamResultDto,
  UpdateExamResultDto,
  ExamResultQueryDto,
  SemesterResultDto,
  SubjectResultDto,
} from './dto/exam-result.dto';

// Grade calculation based on percentage
const GRADE_SCALE = [
  { min: 90, grade: 'A+', points: 10 },
  { min: 80, grade: 'A', points: 9 },
  { min: 70, grade: 'B+', points: 8 },
  { min: 60, grade: 'B', points: 7 },
  { min: 50, grade: 'C', points: 6 },
  { min: 40, grade: 'D', points: 4 },
  { min: 0, grade: 'F', points: 0 },
];

@Injectable()
export class ExamResultsService {
  constructor(private prisma: PrismaService) {}

  calculateGrade(marks: number, totalMarks: number): string {
    const percentage = (marks / totalMarks) * 100;
    const gradeEntry = GRADE_SCALE.find((g) => percentage >= g.min);
    return gradeEntry?.grade || 'F';
  }

  getGradePoints(grade: string): number {
    const gradeEntry = GRADE_SCALE.find((g) => g.grade === grade);
    return gradeEntry?.points || 0;
  }

  async create(tenantId: string, createDto: CreateExamResultDto) {
    // Verify exam exists
    const exam = await this.prisma.exam.findFirst({
      where: { id: createDto.examId, tenantId },
    });

    if (!exam) {
      throw new BadRequestException('Exam not found');
    }

    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: createDto.studentId, tenantId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    // Validate marks
    if (createDto.marks > exam.totalMarks) {
      throw new BadRequestException(
        `Marks cannot exceed total marks (${exam.totalMarks})`,
      );
    }

    // Check for existing result
    const existingResult = await this.prisma.examResult.findFirst({
      where: {
        tenantId,
        examId: createDto.examId,
        studentId: createDto.studentId,
      },
    });

    if (existingResult) {
      throw new ConflictException('Result already exists for this student');
    }

    // Calculate grade if not provided
    const grade = createDto.grade || this.calculateGrade(createDto.marks, exam.totalMarks);

    const result = await this.prisma.examResult.create({
      data: {
        tenantId,
        examId: createDto.examId,
        studentId: createDto.studentId,
        marks: createDto.marks,
        grade,
        remarks: createDto.remarks,
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            type: true,
            totalMarks: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return result;
  }

  async bulkCreate(tenantId: string, bulkDto: BulkCreateExamResultDto) {
    // Verify exam exists
    const exam = await this.prisma.exam.findFirst({
      where: { id: bulkDto.examId, tenantId },
    });

    if (!exam) {
      throw new BadRequestException('Exam not found');
    }

    const results: any[] = [];
    const errors: { studentId: string; error: string }[] = [];

    // Process each result
    for (const item of bulkDto.results) {
      // Validate marks
      if (item.marks > exam.totalMarks) {
        errors.push({
          studentId: item.studentId,
          error: `Marks cannot exceed total marks (${exam.totalMarks})`,
        });
        continue;
      }

      // Verify student exists
      const student = await this.prisma.student.findFirst({
        where: { id: item.studentId, tenantId },
      });

      if (!student) {
        errors.push({
          studentId: item.studentId,
          error: 'Student not found',
        });
        continue;
      }

      // Calculate grade
      const grade = this.calculateGrade(item.marks, exam.totalMarks);

      // Upsert result (create or update)
      try {
        const result = await this.prisma.examResult.upsert({
          where: {
            tenantId_examId_studentId: {
              tenantId,
              examId: bulkDto.examId,
              studentId: item.studentId,
            },
          },
          update: {
            marks: item.marks,
            grade,
            remarks: item.remarks,
          },
          create: {
            tenantId,
            examId: bulkDto.examId,
            studentId: item.studentId,
            marks: item.marks,
            grade,
            remarks: item.remarks,
          },
          include: {
            student: {
              select: {
                id: true,
                rollNo: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
        results.push(result);
      } catch (error) {
        errors.push({
          studentId: item.studentId,
          error: 'Failed to save result',
        });
      }
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  async update(tenantId: string, id: string, updateDto: UpdateExamResultDto) {
    const existing = await this.prisma.examResult.findFirst({
      where: { id, tenantId },
      include: { exam: true },
    });

    if (!existing) {
      throw new NotFoundException('Result not found');
    }

    // Validate marks if provided
    if (updateDto.marks !== undefined && updateDto.marks > existing.exam.totalMarks) {
      throw new BadRequestException(
        `Marks cannot exceed total marks (${existing.exam.totalMarks})`,
      );
    }

    // Calculate new grade if marks changed
    let grade = updateDto.grade;
    if (updateDto.marks !== undefined && !updateDto.grade) {
      grade = this.calculateGrade(updateDto.marks, existing.exam.totalMarks);
    }

    const result = await this.prisma.examResult.update({
      where: { id },
      data: {
        marks: updateDto.marks,
        grade,
        remarks: updateDto.remarks,
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            type: true,
            totalMarks: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return result;
  }

  async findByExam(tenantId: string, examId: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, tenantId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const results = await this.prisma.examResult.findMany({
      where: { examId, tenantId },
      orderBy: {
        student: {
          rollNo: 'asc',
        },
      },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Calculate statistics
    const marks = results.map((r: any) => Number(r.marks));
    const stats = {
      totalStudents: results.length,
      average: marks.length > 0 ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : 0,
      highest: marks.length > 0 ? Math.max(...marks) : 0,
      lowest: marks.length > 0 ? Math.min(...marks) : 0,
      passCount: results.filter((r: any) => this.getGradePoints(r.grade) >= 4).length,
    };

    return {
      exam,
      results,
      stats,
    };
  }

  async findByStudent(tenantId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const results = await this.prisma.examResult.findMany({
      where: { studentId, tenantId },
      orderBy: {
        exam: {
          date: 'desc',
        },
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            type: true,
            date: true,
            totalMarks: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                semester: true,
                credits: true,
              },
            },
          },
        },
      },
    });

    return {
      student: {
        id: student.id,
        rollNo: student.rollNo,
        name: student.user.name,
      },
      results,
    };
  }

  async getStudentSemesterResults(
    tenantId: string,
    studentId: string,
    semester: number,
  ): Promise<SemesterResultDto> {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get all results for this student in this semester
    const results = await this.prisma.examResult.findMany({
      where: {
        studentId,
        tenantId,
        exam: {
          subject: { semester },
        },
      },
      include: {
        exam: {
          include: {
            subject: true,
          },
        },
      },
    });

    // Group by subject
    const subjectMap = new Map<string, any>();

    for (const result of results) {
      const subjectId = result.exam.subject.id;

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subjectId,
          subjectName: result.exam.subject.name,
          subjectCode: result.exam.subject.code,
          credits: result.exam.subject.credits,
          exams: [],
          totalMarks: 0,
          obtainedMarks: 0,
        });
      }

      const subjectData = subjectMap.get(subjectId);
      subjectData.exams.push({
        examId: result.exam.id,
        examName: result.exam.name,
        examType: result.exam.type,
        date: result.exam.date,
        totalMarks: result.exam.totalMarks,
        obtainedMarks: Number(result.marks),
        grade: result.grade,
      });
      subjectData.totalMarks += result.exam.totalMarks;
      subjectData.obtainedMarks += Number(result.marks);
    }

    // Calculate subject grades and SGPA
    const subjects: SubjectResultDto[] = [];
    let totalCredits = 0;
    let totalPoints = 0;

    subjectMap.forEach((subject) => {
      const percentage = (subject.obtainedMarks / subject.totalMarks) * 100;
      const grade = this.calculateGrade(subject.obtainedMarks, subject.totalMarks);
      const gradePoints = this.getGradePoints(grade);

      subjects.push({
        ...subject,
        percentage: Math.round(percentage * 100) / 100,
        grade,
      });

      totalCredits += subject.credits;
      totalPoints += gradePoints * subject.credits;
    });

    const sgpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;

    return {
      semester,
      sgpa,
      credits: totalCredits,
      subjects,
    };
  }

  async calculateCGPA(tenantId: string, studentId: string): Promise<number> {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get all semesters for which the student has results
    const semesters = await this.prisma.examResult.findMany({
      where: { studentId, tenantId },
      include: {
        exam: {
          include: {
            subject: true,
          },
        },
      },
      distinct: ['examId'],
    });

    const semesterSet = new Set<number>();
    semesters.forEach((r: any) => {
      if (r.exam.subject.semester) {
        semesterSet.add(r.exam.subject.semester);
      }
    });

    if (semesterSet.size === 0) {
      return 0;
    }

    let totalPoints = 0;
    let totalCredits = 0;

    for (const semester of semesterSet) {
      const semesterResult = await this.getStudentSemesterResults(tenantId, studentId, semester);
      totalPoints += semesterResult.sgpa * semesterResult.credits;
      totalCredits += semesterResult.credits;
    }

    return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  }
}
