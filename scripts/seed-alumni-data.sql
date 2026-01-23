-- Seed Alumni Data for EduNexus
-- This script creates alumni profiles, employment, events, and contributions

-- Variables for Nexus Engineering College
-- tenantId: cmk4wcffw0000vi1ypnqxhkfh
-- alumni userId: cmk69ker90000vii7zrk73sed
-- CSE departmentId: cmk4wcfhe0003vi1y1rtu20is

-- 1. Create Alumni Profile for alumni@nexus-ec.edu
INSERT INTO alumni_profiles (
    id, "tenantId", "userId", "firstName", "lastName", email, phone,
    "graduationYear", batch, "departmentId", degree, "finalCgpa",
    "registrationStatus", "registrationDate", "currentStatus",
    "visibleInDirectory", "showEmail", "showPhone", "showEmployment",
    "openToMentoring", "mentorshipAreas", bio, achievements,
    "createdAt", "updatedAt"
) VALUES (
    'alum_nexus_001',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'cmk69ker90000vii7zrk73sed',
    'Alumni',
    'Rahul',
    'alumni@nexus-ec.edu',
    '+91-9876543210',
    2022,
    '2018-2022',
    'cmk4wcfhe0003vi1y1rtu20is',
    'B.Tech Computer Science & Engineering',
    8.5,
    'approved',
    NOW(),
    'employed',
    true,
    true,
    false,
    true,
    true,
    ARRAY['career_guidance', 'technical', 'interview_prep'],
    'Passionate software engineer with 2+ years of experience in full-stack development. I graduated from Nexus Engineering College and currently work at Google as a Senior Software Engineer. I love mentoring students and helping them navigate their career paths.',
    'Google STEP Intern 2021, Winner of Smart India Hackathon 2020, Published research paper on Machine Learning',
    NOW(),
    NOW()
) ON CONFLICT ("userId") DO UPDATE SET
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    "registrationStatus" = EXCLUDED."registrationStatus",
    "openToMentoring" = EXCLUDED."openToMentoring",
    "updatedAt" = NOW();

-- 2. Create Alumni Employment History
INSERT INTO alumni_employment (
    id, "tenantId", "alumniId", "companyName", role, location,
    "startDate", "endDate", "isCurrent", "salaryBand", industry, "companySize",
    description, "isVerified", "verifiedAt", "createdAt", "updatedAt"
) VALUES
(
    'emp_001',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'alum_nexus_001',
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
    'emp_002',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'alum_nexus_001',
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
ON CONFLICT (id) DO NOTHING;

-- 3. Create Alumni Events
INSERT INTO alumni_events (
    id, "tenantId", title, description, "eventType",
    "startDate", "endDate", venue, "isVirtual", "meetLink",
    "registrationDeadline", "maxAttendees", "registrationFee",
    "targetBatches", "targetDepartments", status, "createdById",
    "createdAt", "updatedAt"
) VALUES
(
    'event_001',
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
    'event_002',
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
    'event_003',
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
ON CONFLICT (id) DO NOTHING;

-- 4. Create Alumni Contributions
INSERT INTO alumni_contributions (
    id, "tenantId", "alumniId", "contributionType", title, description,
    amount, currency, "estimatedValue", "hoursContributed",
    "allocatedTo", "beneficiaryInfo", status, "receivedDate", "acknowledgedBy",
    "isPubliclyAcknowledged", "acknowledgementText", "createdAt", "updatedAt"
) VALUES
(
    'contrib_001',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'alum_nexus_001',
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
    'We gratefully acknowledge the generous contribution from Alumni Rahul towards the scholarship fund.',
    NOW(),
    NOW()
),
(
    'contrib_002',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'alum_nexus_001',
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
    'Thank you Alumni Rahul for dedicating 20 hours to prepare our students for placements!',
    NOW(),
    NOW()
),
(
    'contrib_003',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'alum_nexus_001',
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
ON CONFLICT (id) DO NOTHING;

-- 5. Create Alumni Testimonial
INSERT INTO alumni_testimonials (
    id, "tenantId", "alumniId", title, content, "videoUrl", "imageUrl",
    category, "isApproved", "approvedBy", "approvedAt", "isFeatured",
    "displayOrder", "createdAt", "updatedAt"
) VALUES (
    'testimonial_001',
    'cmk4wcffw0000vi1ypnqxhkfh',
    'alum_nexus_001',
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
ON CONFLICT (id) DO NOTHING;

-- Done!
SELECT 'Alumni data seeded successfully!' as message;
