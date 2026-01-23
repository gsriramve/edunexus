-- Seed Alumni Data for EduNexus - Version 2
-- Fix the userId link and add related data

-- Variables:
-- tenantId: cmk4wcffw0000vi1ypnqxhkfh
-- alumni profile id: cmk69kes40002vii7fllnn4ji
-- correct userId from users table: cmk69ker90000vii7zrk73sed
-- CSE departmentId: cmk4wcfhe0003vi1y1rtu20is

-- 1. Update Alumni Profile to link correct userId and enhance profile
UPDATE alumni_profiles
SET
    "userId" = 'cmk69ker90000vii7zrk73sed',
    "firstName" = 'Rajan',
    "lastName" = 'Alumni',
    phone = '+91-9876543210',
    "graduationYear" = 2022,
    batch = '2018-2022',
    "departmentId" = 'cmk4wcfhe0003vi1y1rtu20is',
    degree = 'B.Tech Computer Science & Engineering',
    "finalCgpa" = 8.5,
    "registrationStatus" = 'approved',
    "currentStatus" = 'employed',
    "visibleInDirectory" = true,
    "showEmail" = true,
    "showPhone" = false,
    "showEmployment" = true,
    "openToMentoring" = true,
    "mentorshipAreas" = ARRAY['career_guidance', 'technical', 'interview_prep'],
    bio = 'Passionate software engineer with 2+ years of experience in full-stack development. Graduated from Nexus Engineering College, currently working at Google as a Senior Software Engineer. I love mentoring students and helping them navigate their career paths.',
    achievements = 'Google STEP Intern 2021, Winner of Smart India Hackathon 2020, Published research paper on Machine Learning',
    "updatedAt" = NOW()
WHERE id = 'cmk69kes40002vii7fllnn4ji';

-- 2. Create Alumni Employment History
INSERT INTO alumni_employment (
    id, "tenantId", "alumniId", "companyName", role, location,
    "startDate", "endDate", "isCurrent", "salaryBand", industry, "companySize",
    description, "isVerified", "verifiedAt", "createdAt", "updatedAt"
) VALUES
(
    'emp_nexus_001',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'cmk69kes40002vii7fllnn4ji',
    'Google',
    'Senior Software Engineer',
    'Bangalore, India',
    '2023-06-01',
    NULL,
    true,
    '25-35 LPA',
    'Technology',
    'enterprise',
    'Working on Google Cloud Platform, developing scalable microservices and APIs.',
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    'emp_nexus_002',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'cmk69kes40002vii7fllnn4ji',
    'Microsoft',
    'Software Engineer',
    'Hyderabad, India',
    '2022-07-01',
    '2023-05-31',
    false,
    '18-22 LPA',
    'Technology',
    'enterprise',
    'Worked on Azure DevOps team, building CI/CD pipelines.',
    true,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    "companyName" = EXCLUDED."companyName",
    role = EXCLUDED.role,
    "isCurrent" = EXCLUDED."isCurrent",
    "updatedAt" = NOW();

-- 3. Create Alumni Events (upcoming)
INSERT INTO alumni_events (
    id, "tenantId", title, description, "eventType",
    "startDate", "endDate", venue, "isVirtual", "meetLink",
    "registrationDeadline", "maxAttendees", "registrationFee",
    "targetBatches", "targetDepartments", status, "createdById",
    "createdAt", "updatedAt"
) VALUES
(
    'event_nexus_001',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'Annual Alumni Reunion 2026',
    'Join us for the grand annual alumni reunion! Meet your batchmates, network with fellow alumni, and relive the golden memories of college life. Special sessions on career development and industry trends.',
    'reunion',
    '2026-02-15 10:00:00',
    '2026-02-15 18:00:00',
    'Nexus Engineering College Main Auditorium',
    false,
    NULL,
    '2026-02-10',
    500,
    0,
    ARRAY[]::text[],
    ARRAY[]::text[],
    'published',
    'cmk69ker90000vii7zrk73sed',
    NOW(),
    NOW()
),
(
    'event_nexus_002',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'Tech Talk: AI in 2026',
    'A virtual tech talk session featuring alumni working at top tech companies discussing the latest trends in Artificial Intelligence and Machine Learning.',
    'guest_lecture',
    '2026-01-30 14:00:00',
    '2026-01-30 16:00:00',
    NULL,
    true,
    'https://meet.google.com/abc-defg-hij',
    '2026-01-28',
    200,
    0,
    ARRAY[]::text[],
    ARRAY['cmk4wcfhe0003vi1y1rtu20is']::text[],
    'published',
    'cmk69ker90000vii7zrk73sed',
    NOW(),
    NOW()
),
(
    'event_nexus_003',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'Career Guidance Workshop',
    'Interactive workshop for final year students conducted by successful alumni. Topics include resume building, interview preparation, and industry insights.',
    'workshop',
    '2026-02-05 09:00:00',
    '2026-02-05 17:00:00',
    'Seminar Hall B, Nexus Engineering College',
    false,
    NULL,
    '2026-02-01',
    100,
    0,
    ARRAY[]::text[],
    ARRAY[]::text[],
    'published',
    'cmk69ker90000vii7zrk73sed',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status,
    "updatedAt" = NOW();

-- 4. Create Alumni Contributions
INSERT INTO alumni_contributions (
    id, "tenantId", "alumniId", "contributionType", title, description,
    amount, currency, "estimatedValue", "hoursContributed",
    "allocatedTo", "beneficiaryInfo", status, "receivedDate", "acknowledgedBy",
    "isPubliclyAcknowledged", "acknowledgementText", "createdAt", "updatedAt"
) VALUES
(
    'contrib_nexus_001',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'cmk69kes40002vii7fllnn4ji',
    'monetary',
    'Annual Donation 2025',
    'Annual contribution to support student scholarships and infrastructure development.',
    50000,
    'INR',
    NULL,
    NULL,
    'scholarship_fund',
    'Merit scholarship for CSE students',
    'acknowledged',
    '2025-12-15',
    'cmk4wcfhe0003vi1y1rtu20is',
    true,
    'We gratefully acknowledge the generous contribution from Rajan Alumni towards the scholarship fund.',
    NOW(),
    NOW()
),
(
    'contrib_nexus_002',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'cmk69kes40002vii7fllnn4ji',
    'time',
    'Mock Interview Sessions',
    'Conducted 10 mock interview sessions for final year students preparing for placements.',
    NULL,
    'INR',
    25000,
    20,
    'department',
    'CSE final year students',
    'acknowledged',
    '2025-11-20',
    'cmk4wcfhe0003vi1y1rtu20is',
    true,
    'Thank you Rajan Alumni for dedicating 20 hours to prepare our students for placements!',
    NOW(),
    NOW()
),
(
    'contrib_nexus_003',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'cmk69kes40002vii7fllnn4ji',
    'guest_lecture',
    'Industry Insights Session',
    'Delivered a guest lecture on "Working at FAANG Companies" for pre-final year students.',
    NULL,
    'INR',
    10000,
    3,
    'department',
    'CSE and IT students',
    'acknowledged',
    '2025-10-10',
    'cmk4wcfhe0003vi1y1rtu20is',
    true,
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status,
    "updatedAt" = NOW();

-- 5. Create Alumni Testimonial
INSERT INTO alumni_testimonials (
    id, "tenantId", "alumniId", title, content, "videoUrl", "imageUrl",
    category, "isApproved", "approvedBy", "approvedAt", "isFeatured",
    "displayOrder", "createdAt", "updatedAt"
) VALUES (
    'testimonial_nexus_001',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'cmk69kes40002vii7fllnn4ji',
    'From Campus to Google: My Journey',
    'Nexus Engineering College provided me with the perfect launchpad for my career. The rigorous curriculum, dedicated faculty, and amazing peer group helped me develop both technical and soft skills. The placement cell''s support was invaluable in landing my first job at Microsoft. I''m forever grateful for the strong foundation NEC gave me.',
    NULL,
    NULL,
    'career_success',
    true,
    'cmk4wcfhe0003vi1y1rtu20is',
    NOW(),
    true,
    1,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    "isApproved" = EXCLUDED."isApproved",
    "updatedAt" = NOW();

-- Verify the data
SELECT 'Alumni profile updated:' as status, id, "userId", "firstName", "lastName", "registrationStatus"
FROM alumni_profiles WHERE id = 'cmk69kes40002vii7fllnn4ji';

SELECT 'Employment records:' as status, count(*) as count
FROM alumni_employment WHERE "alumniId" = 'cmk69kes40002vii7fllnn4ji';

SELECT 'Events created:' as status, count(*) as count
FROM alumni_events WHERE "tenantId" = 'cmk4wcffw0000vi1ypnqxhkfh';

SELECT 'Contributions:' as status, count(*) as count
FROM alumni_contributions WHERE "alumniId" = 'cmk69kes40002vii7fllnn4ji';

SELECT 'Testimonials:' as status, count(*) as count
FROM alumni_testimonials WHERE "alumniId" = 'cmk69kes40002vii7fllnn4ji';
