/**
 * Enhanced Test Data Seeding Script
 *
 * Adds comprehensive data to existing colleges:
 * - 5 Departments: CSE, ECE, EEE, MECH, IT
 * - Per Department: 1 HOD, 1 Professor, 1 Lab Assistant
 * - 60 Students per department (300 total per college)
 * - Library books and cards
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx prisma/seed-enhanced-data.ts
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Department definitions
const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'ECE', name: 'Electronics & Communication Engineering' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering' },
  { code: 'MECH', name: 'Mechanical Engineering' },
  { code: 'IT', name: 'Information Technology' },
];

// Indian first names for realistic data
const FIRST_NAMES = [
  'Aarav', 'Aditya', 'Akash', 'Amit', 'Ananya', 'Anjali', 'Arjun', 'Aryan', 'Deepika', 'Divya',
  'Gaurav', 'Harsh', 'Ishaan', 'Kavya', 'Kiran', 'Krishna', 'Lakshmi', 'Manish', 'Meera', 'Mohit',
  'Neha', 'Nisha', 'Pooja', 'Priya', 'Rahul', 'Raj', 'Rajesh', 'Riya', 'Rohan', 'Sakshi',
  'Sandeep', 'Sanjay', 'Shreya', 'Simran', 'Sneha', 'Suresh', 'Tanvi', 'Varun', 'Vikram', 'Vinay',
  'Aishwarya', 'Bhavna', 'Chetan', 'Daksh', 'Esha', 'Farhan', 'Gauri', 'Hemant', 'Isha', 'Jayesh',
  'Kajal', 'Lalit', 'Megha', 'Nikhil', 'Omkar', 'Pallavi', 'Qasim', 'Ritika', 'Sahil', 'Tanya',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Nair', 'Rao', 'Iyer',
  'Pillai', 'Menon', 'Das', 'Bose', 'Sen', 'Mukherjee', 'Banerjee', 'Chatterjee', 'Roy', 'Ghosh',
  'Joshi', 'Kulkarni', 'Deshmukh', 'Patil', 'Shinde', 'More', 'Jadhav', 'Pawar', 'Chavan', 'Kadam',
];

// Library books by department
const LIBRARY_BOOKS: Record<string, Array<{ title: string; author: string; isbn: string }>> = {
  CSE: [
    { title: 'Introduction to Algorithms', author: 'Cormen et al.', isbn: '978-0262033848' },
    { title: 'Operating System Concepts', author: 'Silberschatz', isbn: '978-1118063330' },
    { title: 'Computer Networks', author: 'Tanenbaum', isbn: '978-0132126953' },
    { title: 'Database System Concepts', author: 'Korth', isbn: '978-0073523323' },
    { title: 'Compiler Design', author: 'Aho, Ullman', isbn: '978-0321486813' },
  ],
  ECE: [
    { title: 'Electronic Devices & Circuits', author: 'Boylestad', isbn: '978-0132622264' },
    { title: 'Digital Signal Processing', author: 'Proakis', isbn: '978-0131873742' },
    { title: 'Communication Systems', author: 'Haykin', isbn: '978-0471697909' },
    { title: 'VLSI Design', author: 'Kang', isbn: '978-0072460537' },
    { title: 'Microprocessors', author: 'Ramesh Gaonkar', isbn: '978-8131700341' },
  ],
  EEE: [
    { title: 'Electric Machinery', author: 'Fitzgerald', isbn: '978-0073380469' },
    { title: 'Power System Analysis', author: 'Stevenson', isbn: '978-0070612938' },
    { title: 'Control Systems Engineering', author: 'Nise', isbn: '978-1118170519' },
    { title: 'Electrical Machines', author: 'Nagrath', isbn: '978-0070699670' },
    { title: 'Power Electronics', author: 'Rashid', isbn: '978-0131011403' },
  ],
  MECH: [
    { title: 'Engineering Mechanics', author: 'Beer & Johnston', isbn: '978-0073398167' },
    { title: 'Thermodynamics', author: 'Cengel', isbn: '978-0073398174' },
    { title: 'Fluid Mechanics', author: 'White', isbn: '978-0073529349' },
    { title: 'Machine Design', author: 'Shigley', isbn: '978-0073529288' },
    { title: 'Heat Transfer', author: 'Incropera', isbn: '978-0470501979' },
  ],
  IT: [
    { title: 'Web Technologies', author: 'Godbole', isbn: '978-0070681781' },
    { title: 'Software Engineering', author: 'Pressman', isbn: '978-0078022128' },
    { title: 'Cloud Computing', author: 'Buyya', isbn: '978-0124046276' },
    { title: 'Information Security', author: 'Stallings', isbn: '978-0133354690' },
    { title: 'Data Mining', author: 'Han & Kamber', isbn: '978-0123814791' },
  ],
};

function getRandomName(): { firstName: string; lastName: string } {
  return {
    firstName: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
    lastName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
  };
}

function generateStudentId(deptCode: string, year: number, num: number): string {
  return `${deptCode}${year}${String(num).padStart(3, '0')}`;
}

function generateEmployeeId(deptCode: string, role: string, num: number): string {
  const prefix = role === 'hod' ? 'HOD' : role === 'teacher' ? 'PROF' : 'LAB';
  return `${prefix}-${deptCode}-${String(num).padStart(2, '0')}`;
}

async function seedTenant(tenantId: string, tenantName: string, domain: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Seeding: ${tenantName}`);
  console.log(`${'='.repeat(60)}`);

  // Get existing departments
  const existingDepts = await prisma.department.findMany({
    where: { tenantId },
  });

  // Create/update departments
  console.log('\n📚 Creating Departments...');
  const departments: Record<string, string> = {};

  for (const dept of DEPARTMENTS) {
    const existing = await prisma.department.findFirst({
      where: { tenantId, code: dept.code },
    });

    if (existing) {
      departments[dept.code] = existing.id;
      console.log(`  [EXISTS] ${dept.code}: ${dept.name}`);
    } else {
      const created = await prisma.department.create({
        data: {
          tenantId,
          code: dept.code,
          name: dept.name,
        },
      });
      departments[dept.code] = created.id;
      console.log(`  [CREATED] ${dept.code}: ${dept.name}`);
    }
  }

  // Create Course for each department
  console.log('\n🎓 Creating Courses...');
  const courses: Record<string, string> = {};

  for (const dept of DEPARTMENTS) {
    const existing = await prisma.course.findFirst({
      where: { tenantId, departmentId: departments[dept.code] },
    });

    if (existing) {
      courses[dept.code] = existing.id;
    } else {
      const course = await prisma.course.create({
        data: {
          tenantId,
          departmentId: departments[dept.code],
          name: `B.Tech ${dept.code}`,
          code: `BTECH-${dept.code}`,
          durationYears: 4,
          credits: 160,
        },
      });
      courses[dept.code] = course.id;
      console.log(`  [CREATED] B.Tech ${dept.code}`);
    }
  }

  // Create staff for each department
  console.log('\n👥 Creating Staff (HOD, Professor, Lab Assistant per department)...');

  for (let i = 0; i < DEPARTMENTS.length; i++) {
    const dept = DEPARTMENTS[i];
    const deptId = departments[dept.code];

    // Check if HOD exists for this department
    const existingHod = await prisma.staff.findFirst({
      where: { tenantId, departmentId: deptId, user: { role: 'hod' } },
    });

    if (!existingHod) {
      // Create HOD
      const hodEmail = `hod.${dept.code.toLowerCase()}@${domain}.internal`;
      const hodName = getRandomName();

      try {
        // Check if user already exists
        let hodUser = await prisma.user.findFirst({
          where: { tenantId, email: hodEmail },
        });

        if (!hodUser) {
          hodUser = await prisma.user.create({
            data: {
              tenantId,
              email: hodEmail,
              name: `Dr. ${hodName.firstName} ${hodName.lastName}`,
              role: 'hod',
            },
          });
        }

        // Check if staff record exists
        const existingStaff = await prisma.staff.findFirst({
          where: { userId: hodUser.id },
        });

        if (!existingStaff) {
          await prisma.staff.create({
            data: {
              tenantId,
              userId: hodUser.id,
              departmentId: deptId,
              employeeId: generateEmployeeId(dept.code, 'hod', i + 1),
              designation: 'Head of Department',
              qualification: 'Ph.D',
              experience: 15 + Math.floor(Math.random() * 10),
              joiningDate: new Date('2015-06-01'),
            },
          });
        }

        // Update department with HOD
        await prisma.department.update({
          where: { id: deptId },
          data: { hodId: hodUser.id },
        });

        console.log(`  [HOD] ${dept.code}: ${hodUser.name}`);
      } catch (e) {
        console.log(`  [SKIP HOD] ${dept.code}: Already exists`);
      }
    }

    // Create Professor
    const existingProf = await prisma.staff.findFirst({
      where: {
        tenantId,
        departmentId: deptId,
        user: { role: 'teacher' },
        designation: { contains: 'Professor' }
      },
    });

    if (!existingProf) {
      const profEmail = `prof.${dept.code.toLowerCase()}${i + 1}@${domain}.internal`;
      const profName = getRandomName();

      try {
        let profUser = await prisma.user.findFirst({
          where: { tenantId, email: profEmail },
        });

        if (!profUser) {
          profUser = await prisma.user.create({
            data: {
              tenantId,
              email: profEmail,
              name: `Prof. ${profName.firstName} ${profName.lastName}`,
              role: 'teacher',
            },
          });
        }

        const existingStaff = await prisma.staff.findFirst({
          where: { userId: profUser.id },
        });

        if (!existingStaff) {
          await prisma.staff.create({
            data: {
              tenantId,
              userId: profUser.id,
              departmentId: deptId,
              employeeId: generateEmployeeId(dept.code, 'teacher', i + 1),
              designation: 'Associate Professor',
              qualification: 'M.Tech',
              experience: 8 + Math.floor(Math.random() * 7),
              joiningDate: new Date('2018-07-01'),
            },
          });
        }
        console.log(`  [PROF] ${dept.code}: ${profUser.name}`);
      } catch (e) {
        console.log(`  [SKIP PROF] ${dept.code}: Already exists`);
      }
    }

    // Create Lab Assistant
    const existingLab = await prisma.staff.findFirst({
      where: { tenantId, departmentId: deptId, user: { role: 'lab_assistant' } },
    });

    if (!existingLab) {
      const labEmail = `lab.${dept.code.toLowerCase()}@${domain}.internal`;
      const labName = getRandomName();

      try {
        let labUser = await prisma.user.findFirst({
          where: { tenantId, email: labEmail },
        });

        if (!labUser) {
          labUser = await prisma.user.create({
            data: {
              tenantId,
              email: labEmail,
              name: `${labName.firstName} ${labName.lastName}`,
              role: 'lab_assistant',
            },
          });
        }

        const existingStaff = await prisma.staff.findFirst({
          where: { userId: labUser.id },
        });

        if (!existingStaff) {
          await prisma.staff.create({
            data: {
              tenantId,
              userId: labUser.id,
              departmentId: deptId,
              employeeId: generateEmployeeId(dept.code, 'lab', i + 1),
              designation: 'Lab Assistant',
              qualification: 'B.Tech',
              experience: 3 + Math.floor(Math.random() * 5),
              joiningDate: new Date('2020-08-01'),
            },
          });
        }
        console.log(`  [LAB] ${dept.code}: ${labUser.name}`);
      } catch (e) {
        console.log(`  [SKIP LAB] ${dept.code}: Already exists`);
      }
    }
  }

  // Create students for each department
  console.log('\n🧑‍🎓 Creating Students (60 per department)...');

  for (const dept of DEPARTMENTS) {
    const deptId = departments[dept.code];
    let courseId = courses[dept.code];

    // Ensure course exists
    if (!courseId) {
      const existingCourse = await prisma.course.findFirst({
        where: { tenantId, departmentId: deptId },
      });
      if (existingCourse) {
        courseId = existingCourse.id;
        courses[dept.code] = courseId;
      }
    }

    if (!courseId) {
      console.log(`  [SKIP] ${dept.code}: No course found`);
      continue;
    }

    // Check existing student count
    const existingCount = await prisma.student.count({
      where: { tenantId, departmentId: deptId },
    });

    if (existingCount >= 60) {
      console.log(`  [SKIP] ${dept.code}: Already has ${existingCount} students`);
      continue;
    }

    const studentsToCreate = 60 - existingCount;
    let created = 0;

    for (let i = existingCount; i < 60; i++) {
      const year = 2021 + Math.floor(i / 15); // Distribute across 4 years
      const semester = ((i % 8) + 1); // Semesters 1-8
      const { firstName, lastName } = getRandomName();
      const studentId = generateStudentId(dept.code, year, i + 1);

      try {
        const studentEmail = `${studentId.toLowerCase()}@student.internal`;

        // Check if user already exists
        let studentUser = await prisma.user.findFirst({
          where: { tenantId, email: studentEmail },
        });

        if (!studentUser) {
          studentUser = await prisma.user.create({
            data: {
              tenantId,
              email: studentEmail,
              name: `${firstName} ${lastName}`,
              role: 'student',
            },
          });
        }

        // Check if student record exists
        const existingStudent = await prisma.student.findFirst({
          where: { userId: studentUser.id },
        });

        if (!existingStudent) {
          await prisma.student.create({
            data: {
              tenantId,
              userId: studentUser.id,
              departmentId: deptId,
              rollNo: studentId,
              admissionDate: new Date(`${year}-07-15`),
              semester: semester,
              section: String.fromCharCode(65 + (i % 3)), // A, B, C
              batch: `${year}-${year + 4}`,
            },
          });
          created++;
        }
      } catch (e: any) {
        // Log first error for debugging
        if (created === 0 && i === existingCount) {
          console.log(`    Error: ${e.message}`);
        }
      }
    }
    console.log(`  [STUDENTS] ${dept.code}: Created ${created} students (Total: ${existingCount + created})`);
  }

  // Create library books
  console.log('\n📖 Creating Library Books...');

  // Check if book categories exist
  let categories: Record<string, string> = {};

  for (const dept of DEPARTMENTS) {
    const existing = await prisma.bookCategory.findFirst({
      where: { tenantId, name: dept.name },
    });

    if (existing) {
      categories[dept.code] = existing.id;
    } else {
      const cat = await prisma.bookCategory.create({
        data: {
          tenantId,
          name: dept.name,
          code: dept.code,
        },
      });
      categories[dept.code] = cat.id;
    }
  }

  // Add books
  for (const dept of DEPARTMENTS) {
    const books = LIBRARY_BOOKS[dept.code] || [];
    for (const book of books) {
      const existing = await prisma.libraryBook.findFirst({
        where: { tenantId, isbn: book.isbn },
      });

      if (!existing) {
        await prisma.libraryBook.create({
          data: {
            tenantId,
            categoryId: categories[dept.code],
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            totalCopies: 10,
            availableCopies: 10,
            location: `${dept.code}-RACK-${Math.floor(Math.random() * 10) + 1}`,
          },
        });
      }
    }
    console.log(`  [BOOKS] ${dept.code}: ${books.length} titles added`);
  }

  console.log(`\n✅ Completed seeding for ${tenantName}`);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     EDUNEXUS ENHANCED DATA SEEDING                         ║');
  console.log('║     5 Departments × 60 Students × 3 Colleges               ║');
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
    await seedTenant(tenant.id, tenant.name, tenant.domain);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('SEEDING COMPLETE!');
  console.log('═'.repeat(60));
  console.log('\nSummary per college:');
  console.log('  • 5 Departments: CSE, ECE, EEE, MECH, IT');
  console.log('  • 15 Staff: 5 HODs + 5 Professors + 5 Lab Assistants');
  console.log('  • 300 Students: 60 per department');
  console.log('  • 25 Library Books: 5 per department');
  console.log('\nTotal across 3 colleges:');
  console.log('  • 15 Departments');
  console.log('  • 45 Staff members');
  console.log('  • 900 Students');
  console.log('  • 75 Library Books');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
