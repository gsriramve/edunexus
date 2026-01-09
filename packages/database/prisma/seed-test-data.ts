/**
 * EduNexus Comprehensive Test Data Seeding Script
 *
 * Creates 3 college tenants with all 8 user personas each for E2E testing.
 * Includes academic structure, students, fees, attendance, and operational data.
 *
 * Usage:
 *   DATABASE_URL="..." CLERK_SECRET_KEY="..." npx tsx prisma/seed-test-data.ts
 *
 * Options:
 *   --clean    Delete all test data before seeding
 *   --verbose  Show detailed progress
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const TEST_PASSWORD = 'Nexus@1104';

interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string;
  last_name: string;
}

interface College {
  name: string;
  domain: string;
  displayName: string;
  type: string;
}

const COLLEGES: College[] = [
  {
    name: 'nexus-ec',
    domain: 'nexus-ec',
    displayName: 'Nexus Engineering College',
    type: 'Private',
  },
  {
    name: 'quantum-it',
    domain: 'quantum-it',
    displayName: 'Quantum Institute of Technology',
    type: 'Autonomous',
  },
  {
    name: 'careerfied',
    domain: 'careerfied',
    displayName: 'Careerfied Academy',
    type: 'Deemed University',
  },
];

interface UserDefinition {
  email: string;
  name: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

function getUsersForTenant(domain: string): UserDefinition[] {
  return [
    { email: `principal@${domain}.edu`, name: 'Dr. Principal Kumar', role: 'principal' as UserRole, firstName: 'Principal', lastName: 'Kumar' },
    { email: `hod.cse@${domain}.edu`, name: 'Dr. HOD Sharma', role: 'hod' as UserRole, firstName: 'HOD', lastName: 'Sharma' },
    { email: `admin@${domain}.edu`, name: 'Admin Verma', role: 'admin_staff' as UserRole, firstName: 'Admin', lastName: 'Verma' },
    { email: `teacher@${domain}.edu`, name: 'Prof. Teacher Singh', role: 'teacher' as UserRole, firstName: 'Teacher', lastName: 'Singh' },
    { email: `lab@${domain}.edu`, name: 'Lab Asst Patel', role: 'lab_assistant' as UserRole, firstName: 'Lab', lastName: 'Patel' },
    { email: `student@${domain}.edu`, name: 'Student Rahul', role: 'student' as UserRole, firstName: 'Rahul', lastName: 'Student' },
    { email: `parent@${domain}.edu`, name: 'Parent Gupta', role: 'parent' as UserRole, firstName: 'Parent', lastName: 'Gupta' },
    { email: `alumni@${domain}.edu`, name: 'Alumni Rajan', role: 'alumni' as UserRole, firstName: 'Rajan', lastName: 'Alumni' },
  ];
}

// =============================================================================
// CLERK API HELPERS
// =============================================================================

async function findClerkUser(email: string): Promise<ClerkUser | null> {
  if (!CLERK_SECRET_KEY) return null;

  try {
    const response = await fetch(
      `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return null;
    const users = await response.json() as ClerkUser[];
    return users.length > 0 ? users[0] : null;
  } catch {
    return null;
  }
}

async function createClerkUser(
  email: string,
  firstName: string,
  lastName: string,
  role: string,
  tenantId: string | null
): Promise<ClerkUser | null> {
  if (!CLERK_SECRET_KEY) {
    console.log(`  [SKIP] Clerk not configured, skipping: ${email}`);
    return null;
  }

  // Check if user exists
  const existing = await findClerkUser(email);
  if (existing) {
    console.log(`  [EXISTS] ${email} (${existing.id})`);
    // Update metadata with proper error handling
    try {
      const updateResponse = await fetch(`https://api.clerk.com/v1/users/${existing.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: { role, tenantId },
          bypass_client_trust: true,
        }),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        console.log(`  [WARN] Failed to update metadata for ${email}: ${JSON.stringify(error)}`);
      } else {
        console.log(`  [UPDATED] ${email} role=${role}`);
      }
    } catch (err) {
      console.log(`  [WARN] Error updating metadata for ${email}: ${err}`);
    }
    return existing;
  }

  // Create new user
  try {
    const response = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: [email],
        password: TEST_PASSWORD,
        first_name: firstName,
        last_name: lastName,
        public_metadata: { role, tenantId },
        skip_password_checks: true,
        bypass_client_trust: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(`  [ERROR] ${email}: ${JSON.stringify(error)}`);
      return null;
    }

    const user = await response.json() as ClerkUser;
    console.log(`  [CREATED] ${email} (${user.id})`);

    // Rate limiting - wait 100ms between creations
    await new Promise(resolve => setTimeout(resolve, 100));

    return user;
  } catch (error) {
    console.log(`  [ERROR] ${email}: ${error}`);
    return null;
  }
}

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

async function seedPlatformOwner(): Promise<string> {
  console.log('\n[1/6] Creating Platform Owner...');

  const email = 'admin@edunexus.io';

  // Check if exists
  let user = await prisma.user.findFirst({
    where: { role: 'platform_owner' },
  });

  if (user) {
    console.log(`  [EXISTS] Platform Owner: ${user.email}`);
    return user.id;
  }

  // Create in Clerk
  const clerkUser = await createClerkUser(email, 'EduNexus', 'Admin', 'platform_owner', null);

  // Create in DB
  user = await prisma.user.create({
    data: {
      email,
      name: 'EduNexus Admin',
      role: 'platform_owner',
      clerkUserId: clerkUser?.id || null,
      status: 'active',
      tenantId: null,
    },
  });

  console.log(`  [CREATED] Platform Owner: ${email}`);
  return user.id;
}

async function seedTenant(college: College): Promise<string> {
  console.log(`\n  Creating tenant: ${college.displayName}...`);

  // Check if exists
  let tenant = await prisma.tenant.findUnique({
    where: { domain: college.domain },
  });

  if (tenant) {
    console.log(`    [EXISTS] Tenant: ${college.domain}`);
    return tenant.id;
  }

  // Create tenant
  tenant = await prisma.tenant.create({
    data: {
      name: college.name,
      domain: college.domain,
      displayName: college.displayName,
      status: 'active',
      theme: { primaryColor: '#3b82f6', secondaryColor: '#1e40af' },
      config: { type: college.type },
    },
  });

  // Create subscription
  await prisma.tenantSubscription.create({
    data: {
      tenantId: tenant.id,
      plan: 'standard',
      studentCount: 1000,
      amount: 500000,
      currency: 'INR',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
  });

  console.log(`    [CREATED] Tenant: ${college.domain}`);
  return tenant.id;
}

async function seedDepartment(tenantId: string): Promise<string> {
  let dept = await prisma.department.findFirst({
    where: { tenantId, code: 'CSE' },
  });

  if (dept) return dept.id;

  dept = await prisma.department.create({
    data: {
      tenantId,
      name: 'Computer Science & Engineering',
      code: 'CSE',
    },
  });

  return dept.id;
}

async function seedCourseAndSubjects(tenantId: string, departmentId: string): Promise<{ courseId: string; subjectIds: string[] }> {
  // Create course
  let course = await prisma.course.findFirst({
    where: { tenantId, code: 'BTECHCSE' },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        tenantId,
        name: 'B.Tech Computer Science & Engineering',
        code: 'BTECHCSE',
        departmentId,
        credits: 180,
        durationYears: 4,
      },
    });
  }

  // Create subjects
  const subjects = [
    { name: 'Data Structures', code: 'CS301', semester: 3, isLab: false },
    { name: 'Data Structures Lab', code: 'CS301L', semester: 3, isLab: true },
    { name: 'Database Management Systems', code: 'CS401', semester: 4, isLab: false },
    { name: 'DBMS Lab', code: 'CS401L', semester: 4, isLab: true },
    { name: 'Operating Systems', code: 'CS501', semester: 5, isLab: false },
    { name: 'Computer Networks', code: 'CS601', semester: 6, isLab: false },
  ];

  const subjectIds: string[] = [];
  for (const subj of subjects) {
    let subject = await prisma.subject.findFirst({
      where: { tenantId, code: subj.code },
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          tenantId,
          courseId: course.id,
          name: subj.name,
          code: subj.code,
          semester: subj.semester,
          credits: subj.isLab ? 2 : 3,
          isLab: subj.isLab,
        },
      });
    }
    subjectIds.push(subject.id);
  }

  return { courseId: course.id, subjectIds };
}

async function seedUsersForTenant(
  tenantId: string,
  domain: string,
  departmentId: string,
  subjectIds: string[]
): Promise<{ studentId: string; staffIds: string[] }> {
  console.log(`    Creating users for ${domain}...`);

  const users = getUsersForTenant(domain);
  let studentId = '';
  const staffIds: string[] = [];
  let studentUserId = '';

  for (const userDef of users) {
    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { tenantId, email: userDef.email },
    });

    if (!user) {
      // Create in Clerk
      const clerkUser = await createClerkUser(
        userDef.email,
        userDef.firstName,
        userDef.lastName,
        userDef.role,
        tenantId
      );

      // Create in DB
      user = await prisma.user.create({
        data: {
          tenantId,
          email: userDef.email,
          name: userDef.name,
          role: userDef.role,
          clerkUserId: clerkUser?.id || null,
          status: 'active',
        },
      });
    }

    // Create role-specific records
    if (userDef.role === 'student') {
      studentUserId = user.id;
      let student = await prisma.student.findFirst({
        where: { userId: user.id },
      });

      if (!student) {
        student = await prisma.student.create({
          data: {
            tenantId,
            userId: user.id,
            rollNo: `${domain.toUpperCase().replace('-', '')}-2024-001`,
            batch: '2024-2028',
            departmentId,
            semester: 3,
            section: 'A',
            status: 'active',
            admissionDate: new Date('2024-08-01'),
          },
        });
      }
      studentId = student.id;
    } else if (['hod', 'teacher', 'lab_assistant', 'admin_staff'].includes(userDef.role)) {
      let staff = await prisma.staff.findFirst({
        where: { userId: user.id },
      });

      if (!staff) {
        const designation = {
          hod: 'Head of Department',
          teacher: 'Assistant Professor',
          lab_assistant: 'Lab Technician',
          admin_staff: 'Administrative Officer',
        }[userDef.role] || 'Staff';

        staff = await prisma.staff.create({
          data: {
            tenantId,
            userId: user.id,
            employeeId: `${domain.toUpperCase().replace('-', '')}-E-${Date.now().toString().slice(-4)}`,
            designation,
            departmentId: userDef.role !== 'admin_staff' ? departmentId : null,
            joiningDate: new Date('2020-01-01'),
          },
        });

        // Assign subjects to teachers
        if (userDef.role === 'teacher' && subjectIds.length > 0) {
          const theorySubjects = subjectIds.filter((_, i) => i % 2 === 0);
          for (const subjectId of theorySubjects.slice(0, 2)) {
            await prisma.teacherSubject.upsert({
              where: {
                tenantId_staffId_subjectId_section_academicYear: {
                  tenantId,
                  staffId: staff.id,
                  subjectId,
                  section: 'A',
                  academicYear: '2024-25',
                },
              },
              update: {},
              create: {
                tenantId,
                staffId: staff.id,
                subjectId,
                section: 'A',
                academicYear: '2024-25',
              },
            });
          }
        }

        // Assign lab subjects to lab assistants
        if (userDef.role === 'lab_assistant' && subjectIds.length > 0) {
          const labSubjects = subjectIds.filter((_, i) => i % 2 === 1);
          for (const subjectId of labSubjects.slice(0, 1)) {
            await prisma.teacherSubject.upsert({
              where: {
                tenantId_staffId_subjectId_section_academicYear: {
                  tenantId,
                  staffId: staff.id,
                  subjectId,
                  section: 'A',
                  academicYear: '2024-25',
                },
              },
              update: {},
              create: {
                tenantId,
                staffId: staff.id,
                subjectId,
                section: 'A',
                academicYear: '2024-25',
              },
            });
          }
        }
      }
      staffIds.push(staff.id);

      // Update HOD in department
      if (userDef.role === 'hod') {
        await prisma.department.update({
          where: { id: departmentId },
          data: { hodId: staff.id },
        });
      }
    } else if (userDef.role === 'parent' && studentUserId) {
      // Create parent record linked to student
      const parentExists = await prisma.parent.findFirst({
        where: { userId: user.id },
      });

      if (!parentExists && studentId) {
        await prisma.parent.create({
          data: {
            tenantId,
            userId: user.id,
            studentId,
            relation: 'father',
          },
        });
      }
    } else if (userDef.role === 'alumni') {
      // Create alumni profile for the alumni persona
      // Use clerkUserId for lookup since the frontend sends Clerk user ID
      const alumniExists = await prisma.alumniProfile.findFirst({
        where: { tenantId, email: userDef.email },
      });

      if (!alumniExists && user.clerkUserId) {
        const alumni = await prisma.alumniProfile.create({
          data: {
            tenantId,
            userId: user.clerkUserId, // Use Clerk user ID, not database user ID
            firstName: userDef.firstName,
            lastName: userDef.lastName,
            email: userDef.email,
            graduationYear: 2022,
            batch: '2018-2022',
            departmentId,
            degree: 'B.Tech Computer Science & Engineering',
            finalCgpa: 8.5,
            registrationStatus: 'approved',
            registrationDate: new Date('2022-06-15'),
            currentStatus: 'employed',
            visibleInDirectory: true,
            openToMentoring: true,
            mentorshipAreas: ['career_guidance', 'technical_mentoring', 'interview_prep'],
            bio: 'Passionate software engineer with experience in building scalable applications. Always eager to give back to the college community.',
          },
        });

        // Add employment history for alumni
        await prisma.alumniEmployment.create({
          data: {
            tenantId,
            alumniId: alumni.id,
            companyName: 'Google',
            role: 'Senior Software Engineer',
            location: 'Bangalore',
            startDate: new Date('2022-07-01'),
            isCurrent: true,
            salaryBand: 'LPA_20_PLUS',
            industry: 'Technology',
            companySize: 'enterprise',
            description: 'Working on Google Cloud Platform services, focusing on distributed systems and infrastructure.',
            isVerified: true,
            verifiedAt: new Date(),
          },
        });

        // Add previous employment
        await prisma.alumniEmployment.create({
          data: {
            tenantId,
            alumniId: alumni.id,
            companyName: 'Infosys',
            role: 'Software Engineer',
            location: 'Pune',
            startDate: new Date('2020-01-15'),
            endDate: new Date('2022-06-30'),
            isCurrent: false,
            salaryBand: 'LPA_5_8',
            industry: 'IT Services',
            companySize: 'enterprise',
            description: 'Worked on enterprise Java applications and microservices architecture.',
            isVerified: true,
            verifiedAt: new Date(),
          },
        });
      }
    }
  }

  return { studentId, staffIds };
}

async function seedStudentFees(tenantId: string, studentId: string): Promise<void> {
  const feeTypes = [
    { feeType: 'tuition', amount: 75000, status: 'paid' },
    { feeType: 'hostel', amount: 45000, status: 'pending' },
    { feeType: 'transport', amount: 15000, status: 'partial' },
    { feeType: 'exam', amount: 5000, status: 'overdue' },
  ];

  for (const fee of feeTypes) {
    const existing = await prisma.studentFee.findFirst({
      where: { tenantId, studentId, feeType: fee.feeType },
    });

    if (!existing) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() - (fee.status === 'overdue' ? 2 : -1));

      await prisma.studentFee.create({
        data: {
          tenantId,
          studentId,
          feeType: fee.feeType,
          amount: fee.amount,
          dueDate,
          status: fee.status,
          paidAmount: fee.status === 'paid' ? fee.amount : fee.status === 'partial' ? fee.amount / 2 : 0,
          paidDate: fee.status === 'paid' ? new Date() : null,
        },
      });
    }
  }
}

async function seedAttendance(tenantId: string, studentId: string, staffId: string): Promise<void> {
  // Seed 30 days of attendance
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const existing = await prisma.studentAttendance.findFirst({
      where: {
        tenantId,
        studentId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (!existing) {
      // 85% attendance rate
      const status = Math.random() < 0.85 ? 'present' : Math.random() < 0.5 ? 'absent' : 'late';

      await prisma.studentAttendance.create({
        data: {
          tenantId,
          studentId,
          date: new Date(date.setHours(9, 0, 0, 0)),
          status,
          markedBy: staffId,
        },
      });
    }
  }
}

async function seedExamsAndResults(
  tenantId: string,
  studentId: string,
  subjectIds: string[]
): Promise<void> {
  for (const subjectId of subjectIds.slice(0, 2)) {
    // Create exam
    let exam = await prisma.exam.findFirst({
      where: { tenantId, subjectId, type: 'internal' },
    });

    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          tenantId,
          subjectId,
          name: 'Internal Assessment 1',
          type: 'internal',
          date: new Date(),
          totalMarks: 50,
        },
      });
    }

    // Create result
    const resultExists = await prisma.examResult.findFirst({
      where: { tenantId, examId: exam.id, studentId },
    });

    if (!resultExists) {
      const marks = 30 + Math.floor(Math.random() * 15); // 30-45 out of 50
      await prisma.examResult.create({
        data: {
          tenantId,
          examId: exam.id,
          studentId,
          marks,
          grade: marks >= 40 ? 'A' : marks >= 30 ? 'B' : 'C',
        },
      });
    }
  }
}

async function seedTransport(tenantId: string, studentId: string): Promise<void> {
  // Create route
  let route = await prisma.transportRoute.findFirst({
    where: { tenantId, code: 'R001' },
  });

  if (!route) {
    route = await prisma.transportRoute.create({
      data: {
        tenantId,
        name: 'Route 1 - City Center',
        code: 'R001',
        startPoint: 'City Bus Stand',
        endPoint: 'College Campus',
        totalDistance: 15.5,
        estimatedTime: 45,
        fare: 1500,
        status: 'active',
      },
    });

    // Create stops
    const stops = [
      { name: 'City Bus Stand', sequence: 1, pickupTime: '07:00' },
      { name: 'Railway Station', sequence: 2, pickupTime: '07:15' },
      { name: 'Main Market', sequence: 3, pickupTime: '07:30' },
      { name: 'College Campus', sequence: 4, pickupTime: '07:45' },
    ];

    for (const stop of stops) {
      await prisma.transportStop.create({
        data: {
          tenantId,
          routeId: route.id,
          name: stop.name,
          sequence: stop.sequence,
          pickupTime: stop.pickupTime,
          dropTime: String(parseInt(stop.pickupTime.split(':')[0]) + 10) + ':' + stop.pickupTime.split(':')[1],
        },
      });
    }

    // Create vehicle
    await prisma.transportVehicle.create({
      data: {
        tenantId,
        routeId: route.id,
        vehicleNumber: 'KA-01-AB-1234',
        vehicleType: 'bus',
        capacity: 40,
        make: 'Tata',
        model: 'Starbus',
        driverName: 'Ramesh Kumar',
        driverPhone: '9876543210',
        status: 'active',
      },
    });
  }

  // Create transport pass for student
  const passExists = await prisma.transportPass.findFirst({
    where: { tenantId, studentId },
  });

  if (!passExists) {
    await prisma.transportPass.create({
      data: {
        tenantId,
        studentId,
        routeId: route.id,
        passNumber: `TP-${Date.now().toString().slice(-6)}`,
        stopName: 'Railway Station',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        fare: 9000,
        paidAmount: 9000,
        paymentStatus: 'paid',
        status: 'active',
      },
    });
  }
}

async function seedHostel(tenantId: string, studentId: string): Promise<void> {
  // Create hostel block
  let block = await prisma.hostelBlock.findFirst({
    where: { tenantId, code: 'BH1' },
  });

  if (!block) {
    block = await prisma.hostelBlock.create({
      data: {
        tenantId,
        name: 'Boys Hostel 1',
        code: 'BH1',
        type: 'boys',
        totalFloors: 4,
        totalRooms: 80,
        totalCapacity: 160,
        amenities: ['wifi', 'laundry', 'gym', 'mess'],
        status: 'active',
      },
    });

    // Create rooms
    for (let floor = 1; floor <= 4; floor++) {
      for (let room = 1; room <= 20; room++) {
        await prisma.hostelRoom.create({
          data: {
            tenantId,
            blockId: block.id,
            roomNumber: `${floor}${room.toString().padStart(2, '0')}`,
            floor,
            roomType: 'double',
            capacity: 2,
            occupancy: 0,
            monthlyRent: 5000,
            amenities: ['attached_bath', 'study_table'],
            status: 'available',
          },
        });
      }
    }
  }

  // Allocate room to student
  const allocationExists = await prisma.hostelAllocation.findFirst({
    where: { tenantId, studentId, status: 'active' },
  });

  if (!allocationExists) {
    const room = await prisma.hostelRoom.findFirst({
      where: { tenantId, blockId: block.id, status: 'available' },
    });

    if (room) {
      await prisma.hostelAllocation.create({
        data: {
          tenantId,
          studentId,
          roomId: room.id,
          bedNumber: 1,
          checkInDate: new Date('2024-08-01'),
          status: 'active',
        },
      });

      await prisma.hostelRoom.update({
        where: { id: room.id },
        data: { occupancy: 1, status: 'occupied' },
      });
    }
  }
}

async function seedLibrary(tenantId: string, studentId: string): Promise<void> {
  // Create book category
  let category = await prisma.bookCategory.findFirst({
    where: { tenantId, code: 'CS' },
  });

  if (!category) {
    category = await prisma.bookCategory.create({
      data: {
        tenantId,
        name: 'Computer Science',
        code: 'CS',
        description: 'Books related to Computer Science and Engineering',
      },
    });

    // Create sample books
    const books = [
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '9780262033848' },
      { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '9780073523323' },
      { title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '9781118063330' },
      { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '9780132126953' },
    ];

    for (const book of books) {
      await prisma.libraryBook.create({
        data: {
          tenantId,
          categoryId: category.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publisher: 'Pearson',
          totalCopies: 5,
          availableCopies: 5,
          status: 'available',
        },
      });
    }
  }

  // Create library card for student
  const cardExists = await prisma.libraryCard.findFirst({
    where: { tenantId, studentId },
  });

  if (!cardExists) {
    await prisma.libraryCard.create({
      data: {
        tenantId,
        studentId,
        cardNumber: `LIB-${Date.now().toString().slice(-6)}`,
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        maxBooks: 5,
        currentBooks: 0,
        status: 'active',
      },
    });
  }
}

async function seedLibrarySettings(tenantId: string): Promise<void> {
  const existing = await prisma.librarySettings.findFirst({
    where: { tenantId },
  });

  if (!existing) {
    await prisma.librarySettings.create({
      data: {
        tenantId,
        finePerDay: 5,
        maxFineAmount: 500,
        loanPeriodDays: 14,
        renewalPeriodDays: 7,
        maxRenewals: 2,
        reservationDays: 3,
        gracePeriodDays: 1,
      },
    });
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║          EDUNEXUS TEST DATA SEEDING SCRIPT                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Clerk API: ${CLERK_SECRET_KEY ? 'Configured' : 'NOT CONFIGURED (users will not have login access)'}`);
  console.log(`Password: ${TEST_PASSWORD}`);
  console.log('');

  try {
    // 1. Platform Owner
    await seedPlatformOwner();

    // 2. Seed each college
    console.log('\n[2/6] Creating 3 College Tenants...');

    for (const college of COLLEGES) {
      const tenantId = await seedTenant(college);

      // 3. Academic Structure
      console.log(`\n[3/6] Creating academic structure for ${college.displayName}...`);
      const departmentId = await seedDepartment(tenantId);
      const { subjectIds } = await seedCourseAndSubjects(tenantId, departmentId);

      // 4. Users
      console.log(`\n[4/6] Creating users for ${college.displayName}...`);
      const { studentId, staffIds } = await seedUsersForTenant(tenantId, college.domain, departmentId, subjectIds);

      // 5. Operational Data
      console.log(`\n[5/6] Creating operational data for ${college.displayName}...`);
      if (studentId) {
        await seedStudentFees(tenantId, studentId);
        if (staffIds.length > 0) {
          await seedAttendance(tenantId, studentId, staffIds[0]);
        }
        await seedExamsAndResults(tenantId, studentId, subjectIds);
        await seedTransport(tenantId, studentId);
        await seedHostel(tenantId, studentId);
        await seedLibrary(tenantId, studentId);
        await seedLibrarySettings(tenantId);
      }
    }

    // Print login credentials
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST ACCOUNT CREDENTIALS                    ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║ All accounts use password: Nexus@1104                           ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║ PLATFORM OWNER                                                 ║');
    console.log('║   admin@edunexus.io                                            ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');

    for (const college of COLLEGES) {
      console.log(`║ ${college.displayName.toUpperCase().padEnd(60)}║`);
      console.log('╠────────────────────────────────────────────────────────────────╣');
      const users = getUsersForTenant(college.domain);
      for (const user of users) {
        const roleLabel = user.role.replace('_', ' ').toUpperCase().padEnd(14);
        const email = user.email.padEnd(36);
        console.log(`║ ${roleLabel}│ ${email}║`);
      }
      console.log('╠════════════════════════════════════════════════════════════════╣');
    }

    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('\n[6/6] Seeding complete!');

  } catch (error) {
    console.error('\n[ERROR] Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run
main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
