/**
 * Seed Utilities for EduNexus
 *
 * Shared utilities for generating realistic test data with Indian context.
 */

// =============================================================================
// INDIAN NAME GENERATORS
// =============================================================================

export const INDIAN_FIRST_NAMES_MALE = [
  'Aarav', 'Aditya', 'Arjun', 'Amit', 'Akash', 'Bharat', 'Chinmay', 'Deepak', 'Dev', 'Dhruv',
  'Gaurav', 'Harsh', 'Ishaan', 'Jay', 'Karan', 'Krishna', 'Kunal', 'Lakshya', 'Manish', 'Mohit',
  'Nikhil', 'Omkar', 'Pranav', 'Rahul', 'Rajesh', 'Ravi', 'Rohan', 'Sachin', 'Sagar', 'Sahil',
  'Sandeep', 'Shivam', 'Siddharth', 'Suresh', 'Tanmay', 'Tushar', 'Varun', 'Vikram', 'Vishal', 'Yash',
];

export const INDIAN_FIRST_NAMES_FEMALE = [
  'Aanya', 'Aditi', 'Ananya', 'Anjali', 'Bhavya', 'Chitra', 'Deepika', 'Diya', 'Gayatri', 'Ishita',
  'Jiya', 'Kavya', 'Khushi', 'Kritika', 'Lavanya', 'Meera', 'Neha', 'Nisha', 'Pallavi', 'Pooja',
  'Priya', 'Riya', 'Sakshi', 'Sanvi', 'Shreya', 'Shruti', 'Simran', 'Sneha', 'Swati', 'Tanvi',
  'Tanya', 'Uma', 'Vaishnavi', 'Vanshika', 'Vidya', 'Yamini', 'Zara',
];

export const INDIAN_LAST_NAMES = [
  'Agarwal', 'Bansal', 'Bhatia', 'Chadha', 'Chopra', 'Das', 'Desai', 'Dubey', 'Garg', 'Goyal',
  'Gupta', 'Iyer', 'Jain', 'Joshi', 'Kapoor', 'Khan', 'Kumar', 'Malhotra', 'Mehta', 'Menon',
  'Mishra', 'Nair', 'Naidu', 'Patel', 'Pillai', 'Prasad', 'Rao', 'Reddy', 'Saxena', 'Shah',
  'Sharma', 'Singh', 'Sinha', 'Srivastava', 'Tiwari', 'Varma', 'Verma', 'Yadav',
];

// =============================================================================
// COMPANY DATA
// =============================================================================

export const INDIAN_IT_COMPANIES = [
  { name: 'Tata Consultancy Services', short: 'TCS', size: 'enterprise', salaryBand: 'LPA_5_8' },
  { name: 'Infosys', short: 'Infosys', size: 'enterprise', salaryBand: 'LPA_5_8' },
  { name: 'Wipro', short: 'Wipro', size: 'enterprise', salaryBand: 'LPA_5_8' },
  { name: 'HCL Technologies', short: 'HCL', size: 'enterprise', salaryBand: 'LPA_5_8' },
  { name: 'Tech Mahindra', short: 'TechM', size: 'large', salaryBand: 'LPA_5_8' },
  { name: 'Cognizant', short: 'CTS', size: 'enterprise', salaryBand: 'LPA_5_8' },
  { name: 'Mindtree', short: 'Mindtree', size: 'large', salaryBand: 'LPA_5_8' },
  { name: 'L&T Infotech', short: 'LTI', size: 'large', salaryBand: 'LPA_5_8' },
  { name: 'Mphasis', short: 'Mphasis', size: 'large', salaryBand: 'LPA_5_8' },
  { name: 'Persistent Systems', short: 'Persistent', size: 'medium', salaryBand: 'LPA_5_8' },
];

export const GLOBAL_TECH_COMPANIES = [
  { name: 'Google', short: 'Google', size: 'enterprise', salaryBand: 'LPA_20_PLUS' },
  { name: 'Microsoft', short: 'Microsoft', size: 'enterprise', salaryBand: 'LPA_20_PLUS' },
  { name: 'Amazon', short: 'Amazon', size: 'enterprise', salaryBand: 'LPA_15_20' },
  { name: 'Meta', short: 'Meta', size: 'enterprise', salaryBand: 'LPA_20_PLUS' },
  { name: 'Apple', short: 'Apple', size: 'enterprise', salaryBand: 'LPA_20_PLUS' },
  { name: 'Netflix', short: 'Netflix', size: 'large', salaryBand: 'LPA_20_PLUS' },
  { name: 'Uber', short: 'Uber', size: 'large', salaryBand: 'LPA_15_20' },
  { name: 'LinkedIn', short: 'LinkedIn', size: 'large', salaryBand: 'LPA_15_20' },
  { name: 'Salesforce', short: 'Salesforce', size: 'large', salaryBand: 'LPA_12_15' },
  { name: 'Adobe', short: 'Adobe', size: 'large', salaryBand: 'LPA_12_15' },
];

export const INDIAN_STARTUPS = [
  { name: 'Flipkart', short: 'Flipkart', size: 'large', salaryBand: 'LPA_12_15' },
  { name: 'Razorpay', short: 'Razorpay', size: 'medium', salaryBand: 'LPA_15_20' },
  { name: 'Zomato', short: 'Zomato', size: 'large', salaryBand: 'LPA_12_15' },
  { name: 'Swiggy', short: 'Swiggy', size: 'large', salaryBand: 'LPA_12_15' },
  { name: 'Paytm', short: 'Paytm', size: 'large', salaryBand: 'LPA_10_12' },
  { name: 'PhonePe', short: 'PhonePe', size: 'large', salaryBand: 'LPA_12_15' },
  { name: 'Zerodha', short: 'Zerodha', size: 'medium', salaryBand: 'LPA_12_15' },
  { name: 'CRED', short: 'CRED', size: 'medium', salaryBand: 'LPA_15_20' },
  { name: 'Meesho', short: 'Meesho', size: 'medium', salaryBand: 'LPA_12_15' },
  { name: 'Dream11', short: 'Dream11', size: 'medium', salaryBand: 'LPA_12_15' },
];

export const ALL_COMPANIES = [...INDIAN_IT_COMPANIES, ...GLOBAL_TECH_COMPANIES, ...INDIAN_STARTUPS];

// =============================================================================
// JOB ROLES
// =============================================================================

export const JOB_ROLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Staff Engineer',
  'Tech Lead',
  'Engineering Manager',
  'Data Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Cloud Architect',
  'Full Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'Mobile Developer',
  'Product Manager',
  'Technical Program Manager',
  'QA Engineer',
  'Security Engineer',
];

export const INDIAN_CITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
  'Gurgaon', 'Noida', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'Kochi', 'Coimbatore',
];

// =============================================================================
// SKILLS AND CERTIFICATIONS
// =============================================================================

export const TECHNICAL_SKILLS = [
  'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'Go', 'Rust',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Spring Boot',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'TensorFlow', 'PyTorch', 'Scikit-learn',
  'Git', 'CI/CD', 'Microservices', 'REST APIs', 'GraphQL',
];

export const CERTIFICATIONS = [
  'AWS Solutions Architect',
  'AWS Developer Associate',
  'Azure Administrator',
  'Google Cloud Professional',
  'Kubernetes Administrator (CKA)',
  'Certified Scrum Master (CSM)',
  'PMP Certification',
  'CCNA',
  'Oracle Certified Professional',
  'Microsoft Certified: Azure Developer',
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get random item from array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random items from array (without duplicates)
 */
export function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max with precision
 */
export function randomFloat(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Generate random Indian name
 */
export function randomIndianName(gender?: 'male' | 'female'): { firstName: string; lastName: string; fullName: string } {
  const isMale = gender === 'male' || (gender === undefined && Math.random() > 0.5);
  const firstName = randomItem(isMale ? INDIAN_FIRST_NAMES_MALE : INDIAN_FIRST_NAMES_FEMALE);
  const lastName = randomItem(INDIAN_LAST_NAMES);
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
  };
}

/**
 * Generate random company with role
 */
export function randomCompanyAndRole(): {
  company: typeof ALL_COMPANIES[0];
  role: string;
  location: string;
} {
  return {
    company: randomItem(ALL_COMPANIES),
    role: randomItem(JOB_ROLES),
    location: randomItem(INDIAN_CITIES),
  };
}

/**
 * Generate random date within range
 */
export function randomDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(startTime + Math.random() * (endTime - startTime));
}

/**
 * Generate date X days ago
 */
export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Generate date X days from now
 */
export function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Generate date X months ago
 */
export function monthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

/**
 * Generate month/year tuple for past N months
 */
export function pastMonths(count: number): Array<{ month: number; year: number }> {
  const result: Array<{ month: number; year: number }> = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      month: date.getMonth() + 1, // 1-indexed
      year: date.getFullYear(),
    });
  }

  return result;
}

/**
 * Generate realistic SGI scores with trend
 */
export function generateSgiScores(baseScore: number = 65): {
  academicScore: number;
  engagementScore: number;
  skillsScore: number;
  behavioralScore: number;
  sgiScore: number;
} {
  const academicScore = clamp(baseScore + randomInt(-10, 10), 30, 95);
  const engagementScore = clamp(baseScore + randomInt(-15, 15), 25, 95);
  const skillsScore = clamp(baseScore + randomInt(-20, 10), 20, 90);
  const behavioralScore = clamp(baseScore + randomInt(-5, 10), 50, 98);

  // Weighted composite (40% academic, 30% engagement, 20% skills, 10% behavioral)
  const sgiScore = Math.round(
    academicScore * 0.4 + engagementScore * 0.3 + skillsScore * 0.2 + behavioralScore * 0.1
  );

  return { academicScore, engagementScore, skillsScore, behavioralScore, sgiScore };
}

/**
 * Generate realistic CRI scores
 */
export function generateCriScores(baseScore: number = 60): {
  criScore: number;
  placementProbability: number;
  salaryBand: string;
  resumeScore: number;
  interviewScore: number;
  skillRoleFitScore: number;
  industryExposureScore: number;
} {
  const resumeScore = clamp(baseScore + randomInt(-10, 15), 30, 95);
  const interviewScore = clamp(baseScore + randomInt(-20, 10), 25, 95);
  const skillRoleFitScore = clamp(baseScore + randomInt(-15, 15), 30, 95);
  const industryExposureScore = clamp(baseScore + randomInt(-25, 5), 20, 90);

  const criScore = Math.round(
    resumeScore * 0.25 + interviewScore * 0.25 + skillRoleFitScore * 0.25 + industryExposureScore * 0.25
  );

  const placementProbability = Math.min(0.95, criScore / 100);

  let salaryBand: string;
  if (criScore >= 85) salaryBand = 'LPA_12_PLUS';
  else if (criScore >= 70) salaryBand = 'LPA_8_12';
  else if (criScore >= 55) salaryBand = 'LPA_5_8';
  else salaryBand = 'LPA_3_5';

  return { criScore, placementProbability, salaryBand, resumeScore, interviewScore, skillRoleFitScore, industryExposureScore };
}

/**
 * Generate feedback ratings (1-5 scale)
 */
export function generateFeedbackRatings(): {
  academicRating: number;
  participationRating: number;
  teamworkRating: number;
  communicationRating: number;
  leadershipRating: number;
  punctualityRating: number;
} {
  return {
    academicRating: randomInt(3, 5),
    participationRating: randomInt(2, 5),
    teamworkRating: randomInt(3, 5),
    communicationRating: randomInt(3, 5),
    leadershipRating: randomInt(2, 5),
    punctualityRating: randomInt(3, 5),
  };
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generate CGPA (0-10 scale)
 */
export function generateCgpa(quality: 'low' | 'medium' | 'high' | 'excellent' = 'medium'): number {
  const ranges = {
    low: { min: 5.5, max: 6.5 },
    medium: { min: 6.5, max: 7.8 },
    high: { min: 7.8, max: 8.8 },
    excellent: { min: 8.8, max: 9.8 },
  };
  const { min, max } = ranges[quality];
  return randomFloat(min, max, 2);
}

/**
 * Generate attendance percentage
 */
export function generateAttendance(type: 'excellent' | 'good' | 'borderline' | 'critical' = 'good'): number {
  const ranges = {
    excellent: { min: 92, max: 100 },
    good: { min: 80, max: 92 },
    borderline: { min: 74, max: 77 },
    critical: { min: 55, max: 68 },
  };
  const { min, max } = ranges[type];
  return randomInt(min, max);
}

/**
 * Generate roll number
 */
export function generateRollNo(departmentCode: string, batch: string, sequence: number): string {
  const year = batch.slice(0, 4);
  return `${year}${departmentCode}${String(sequence).padStart(3, '0')}`;
}

/**
 * Generate email from name and domain
 */
export function generateEmail(firstName: string, lastName: string, domain: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}.edu`;
}

// =============================================================================
// STRENGTH AND IMPROVEMENT GENERATORS
// =============================================================================

export const STRENGTHS = [
  'Strong analytical and problem-solving skills',
  'Excellent communication and presentation abilities',
  'Consistent academic performance',
  'Active participation in class discussions',
  'Good team collaboration skills',
  'Strong programming fundamentals',
  'Quick learner with good adaptability',
  'Leadership qualities in group projects',
  'Regular attendance and punctuality',
  'Good at managing time effectively',
  'Strong work ethic and dedication',
  'Creative approach to problem-solving',
];

export const IMPROVEMENTS = [
  'Could improve participation in extracurricular activities',
  'Needs to work on public speaking skills',
  'Should focus on practical implementation of concepts',
  'Can improve documentation and report writing',
  'Needs more hands-on project experience',
  'Should explore industry certifications',
  'Could benefit from peer collaboration',
  'Time management during exams needs improvement',
  'Should focus on soft skills development',
  'More consistent effort needed in assignments',
];

/**
 * Get random strengths
 */
export function randomStrengths(count: number = 3): string[] {
  return randomItems(STRENGTHS, count);
}

/**
 * Get random improvements
 */
export function randomImprovements(count: number = 2): string[] {
  return randomItems(IMPROVEMENTS, count);
}

// =============================================================================
// GOALS AND MILESTONES
// =============================================================================

export const ACADEMIC_GOALS = [
  { title: 'Improve CGPA', category: 'academic', unit: 'CGPA' },
  { title: 'Clear all backlogs', category: 'academic', unit: 'subjects' },
  { title: 'Score 90%+ in internals', category: 'academic', unit: '%' },
  { title: 'Complete research paper', category: 'academic', unit: 'papers' },
];

export const CAREER_GOALS = [
  { title: 'Get AWS certification', category: 'career', unit: 'certifications' },
  { title: 'Complete internship', category: 'career', unit: 'weeks' },
  { title: 'Build portfolio projects', category: 'career', unit: 'projects' },
  { title: 'Crack placement interview', category: 'career', unit: 'offers' },
];

export const SKILL_GOALS = [
  { title: 'Learn React.js', category: 'skill', unit: 'proficiency' },
  { title: 'Master DSA', category: 'skill', unit: 'problems' },
  { title: 'Complete Python course', category: 'skill', unit: 'completion' },
  { title: 'Learn cloud computing', category: 'skill', unit: 'modules' },
];

export const ALL_GOALS = [...ACADEMIC_GOALS, ...CAREER_GOALS, ...SKILL_GOALS];

// =============================================================================
// MILESTONE TYPES
// =============================================================================

export const MILESTONE_TYPES = [
  'admission',
  'semester_start',
  'semester_end',
  'exam',
  'internship',
  'placement',
  'achievement',
  'graduation',
];

export const ACHIEVEMENT_TYPES = [
  'hackathon',
  'competition',
  'scholarship',
  'certification',
  'paper_publication',
  'sports',
  'cultural',
  'community_service',
];

// =============================================================================
// BATCH HELPERS
// =============================================================================

export async function batchProcess<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log progress
 */
export function logProgress(current: number, total: number, label: string): void {
  const percent = Math.round((current / total) * 100);
  console.log(`  [${percent}%] ${label} (${current}/${total})`);
}
