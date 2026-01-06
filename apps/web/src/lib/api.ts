/**
 * API client for EduNexus backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  tenantId?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, tenantId } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (tenantId) {
    requestHeaders['x-tenant-id'] = tenantId;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'An error occurred',
      response.status,
      errorData,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Department API
export const departmentsApi = {
  list: (tenantId: string, params?: { search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: Department[]; total: number }>(`/departments${query ? `?${query}` : ''}`, { tenantId });
  },

  get: (tenantId: string, id: string) =>
    api<Department>(`/departments/${id}`, { tenantId }),

  create: (tenantId: string, data: CreateDepartmentInput) =>
    api<Department>('/departments', { method: 'POST', body: data, tenantId }),

  update: (tenantId: string, id: string, data: UpdateDepartmentInput) =>
    api<Department>(`/departments/${id}`, { method: 'PATCH', body: data, tenantId }),

  delete: (tenantId: string, id: string) =>
    api<void>(`/departments/${id}`, { method: 'DELETE', tenantId }),

  stats: (tenantId: string) =>
    api<DepartmentStats>('/departments/stats', { tenantId }),
};

// Staff API
export const staffApi = {
  list: (tenantId: string, params?: StaffListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: Staff[]; total: number }>(`/staff${query ? `?${query}` : ''}`, { tenantId });
  },

  get: (tenantId: string, id: string) =>
    api<Staff>(`/staff/${id}`, { tenantId }),

  create: (tenantId: string, data: CreateStaffInput) =>
    api<Staff>('/staff', { method: 'POST', body: data, tenantId }),

  update: (tenantId: string, id: string, data: UpdateStaffInput) =>
    api<Staff>(`/staff/${id}`, { method: 'PATCH', body: data, tenantId }),

  delete: (tenantId: string, id: string) =>
    api<void>(`/staff/${id}`, { method: 'DELETE', tenantId }),

  stats: (tenantId: string) =>
    api<StaffStats>('/staff/stats', { tenantId }),

  teachers: (tenantId: string, departmentId?: string) => {
    const query = departmentId ? `?departmentId=${departmentId}` : '';
    return api<Staff[]>(`/staff/teachers${query}`, { tenantId });
  },
};

// Tenants API
export const tenantsApi = {
  list: (params?: { status?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: Tenant[]; total: number }>(`/tenants${query ? `?${query}` : ''}`);
  },

  get: (id: string) => api<Tenant>(`/tenants/${id}`),

  create: (data: CreateTenantInput) =>
    api<Tenant>('/tenants', { method: 'POST', body: data }),

  stats: () => api<TenantStats>('/tenants/stats'),
};

// Types
export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  hodId?: string;
  hod?: {
    id: string;
    employeeId: string;
    designation: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  } | null;
  _count?: {
    staff: number;
    students: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentInput {
  name: string;
  code: string;
  hodId?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  hodId?: string;
}

export interface DepartmentStats {
  totalDepartments: number;
  departmentsWithHod: number;
  departmentsWithoutHod: number;
  totalStaff: number;
  totalStudents: number;
}

export interface Staff {
  id: string;
  tenantId: string;
  userId: string;
  employeeId: string;
  designation: string;
  departmentId: string;
  joiningDate: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    profile?: {
      id: string;
      photoUrl?: string;
      dob?: string;
      gender?: string;
      bloodGroup?: string;
      nationality?: string;
    } | null;
  };
  department: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId: string;
  role: 'principal' | 'hod' | 'admin_staff' | 'teacher' | 'lab_assistant';
  designation: string;
  departmentId: string;
  joiningDate: string;
}

export interface UpdateStaffInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  designation?: string;
  departmentId?: string;
}

export interface StaffListParams {
  search?: string;
  departmentId?: string;
  role?: string;
  status?: 'active' | 'inactive';
  limit?: number;
  offset?: number;
}

export interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{ role: string; count: number }>;
  byDepartment: Array<{ departmentId: string; _count: number }>;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  displayName: string;
  logo?: string;
  theme: any;
  config: any;
  status: string;
  onboardedAt: string;
  subscription?: {
    id: string;
    plan: string;
    studentCount: number;
    amount: string;
    currency: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  location?: string;
  logo?: string;
  principalName: string;
  principalEmail: string;
  subscriptionPlan?: 'trial' | 'premium' | 'enterprise';
  estimatedStudents?: number;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  totalStudents: number;
  monthlyRevenue: number;
}

// Students API
export const studentsApi = {
  list: (tenantId: string, params?: StudentListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.batch) searchParams.set('batch', params.batch);
    if (params?.semester) searchParams.set('semester', params.semester.toString());
    if (params?.section) searchParams.set('section', params.section);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: Student[]; total: number }>(`/students${query ? `?${query}` : ''}`, { tenantId });
  },

  get: (tenantId: string, id: string) =>
    api<Student>(`/students/${id}`, { tenantId }),

  getByUserId: (tenantId: string, userId: string) =>
    api<Student>(`/students/user/${userId}`, { tenantId }),

  create: (tenantId: string, data: CreateStudentInput) =>
    api<Student>('/students', { method: 'POST', body: data, tenantId }),

  update: (tenantId: string, id: string, data: UpdateStudentInput) =>
    api<Student>(`/students/${id}`, { method: 'PATCH', body: data, tenantId }),

  delete: (tenantId: string, id: string) =>
    api<void>(`/students/${id}`, { method: 'DELETE', tenantId }),

  stats: (tenantId: string) =>
    api<StudentStats>('/students/stats', { tenantId }),

  dashboard: (tenantId: string, studentId: string) =>
    api<StudentDashboard>(`/students/${studentId}/dashboard`, { tenantId }),

  academics: (tenantId: string, studentId: string) =>
    api<StudentAcademics>(`/students/${studentId}/academics`, { tenantId }),
};

// Student Types
export interface Student {
  id: string;
  tenantId: string;
  userId: string;
  rollNo: string;
  batch: string;
  departmentId: string;
  semester: number;
  section?: string;
  status: string;
  admissionDate: string;
  user: {
    id: string;
    email: string;
    name: string;
    profile?: {
      id: string;
      photoUrl?: string;
      dob?: string;
      gender?: string;
      bloodGroup?: string;
      nationality?: string;
    } | null;
  };
  department: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  rollNo: string;
  departmentId: string;
  batch: string;
  semester?: number;
  section?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  bloodGroup?: string;
  nationality?: string;
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  semester?: number;
  section?: string;
  status?: 'active' | 'inactive' | 'graduated' | 'dropped' | 'suspended';
}

export interface StudentListParams {
  search?: string;
  departmentId?: string;
  batch?: string;
  semester?: number;
  section?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  byDepartment: Array<{ departmentId: string; _count: number }>;
  byBatch: Array<{ batch: string; _count: number }>;
  bySemester: Array<{ semester: number; _count: number }>;
}

export interface StudentDashboard {
  studentId: string;
  name: string;
  rollNo: string;
  department: string;
  departmentCode: string;
  semester: number;
  batch: string;
  cgpa: number;
  attendancePercentage: number;
  pendingFees: number;
  upcomingExams: number;
  notifications: number;
  email: string;
}

export interface StudentAcademics {
  currentSemester: number;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
    credits: number;
    isLab: boolean;
    teacher?: any;
  }>;
  results: Array<{
    examId: string;
    examType: string;
    subject: string;
    date: string;
    marks: number;
    totalMarks: number;
    grade: string;
  }>;
}

// Payments API
export const paymentsApi = {
  createOrder: (tenantId: string, studentId: string, data: CreatePaymentOrderInput) =>
    api<PaymentOrder>('/payments/create-order', {
      method: 'POST',
      body: data,
      tenantId,
      headers: { 'x-student-id': studentId },
    }),

  verifyPayment: (tenantId: string, data: VerifyPaymentInput) =>
    api<PaymentVerificationResult>('/payments/verify', {
      method: 'POST',
      body: data,
      tenantId,
    }),

  getPaymentStatus: (tenantId: string, orderId: string) =>
    api<PaymentTransaction>(`/payments/order/${orderId}`, { tenantId }),

  getStudentPaymentHistory: (tenantId: string, studentId: string, params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: PaymentTransaction[]; total: number }>(
      `/payments/student/${studentId}${query ? `?${query}` : ''}`,
      { tenantId }
    );
  },

  getStudentFees: (tenantId: string, studentId: string) =>
    api<StudentFeesResponse>(`/payments/fees/${studentId}`, { tenantId }),
};

// Payment Types
export interface CreatePaymentOrderInput {
  feeIds: string[];
  amount: number; // Amount in paise
  currency?: string;
  notes?: Record<string, string>;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  keyId: string;
  studentName: string;
  studentEmail: string;
  description: string;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  feeIds: string[];
}

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  receiptNumber: string;
  paymentId: string;
  method: string;
  amount: number;
  fees: StudentFee[];
}

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  studentFeeId: string;
  studentId: string;
  amount: string;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: string;
  status: string;
  receiptNumber?: string;
  notes?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFee {
  id: string;
  tenantId: string;
  studentId: string;
  feeType: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  paidAmount?: string;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFeesResponse {
  fees: StudentFee[];
  summary: {
    totalPending: number;
    totalPaid: number;
    pendingCount: number;
    paidCount: number;
  };
}

// Exams API
export const examsApi = {
  list: (tenantId: string, params?: ExamListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.subjectId) searchParams.set('subjectId', params.subjectId);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: Exam[]; total: number; limit: number; offset: number }>(
      `/exams${query ? `?${query}` : ''}`,
      { tenantId }
    );
  },

  get: (tenantId: string, id: string) =>
    api<Exam>(`/exams/${id}`, { tenantId }),

  create: (tenantId: string, data: CreateExamInput) =>
    api<Exam>('/exams', { method: 'POST', body: data, tenantId }),

  update: (tenantId: string, id: string, data: UpdateExamInput) =>
    api<Exam>(`/exams/${id}`, { method: 'PATCH', body: data, tenantId }),

  delete: (tenantId: string, id: string) =>
    api<void>(`/exams/${id}`, { method: 'DELETE', tenantId }),

  stats: (tenantId: string) =>
    api<ExamStats>('/exams/stats', { tenantId }),

  upcoming: (tenantId: string) =>
    api<Exam[]>('/exams/upcoming', { tenantId }),

  bySubject: (tenantId: string, subjectId: string) =>
    api<Exam[]>(`/exams/subject/${subjectId}`, { tenantId }),
};

// Exam Results API
export const examResultsApi = {
  create: (tenantId: string, data: CreateExamResultInput) =>
    api<ExamResult>('/exam-results', { method: 'POST', body: data, tenantId }),

  bulkCreate: (tenantId: string, data: BulkCreateExamResultInput) =>
    api<BulkExamResultResponse>('/exam-results/bulk', { method: 'POST', body: data, tenantId }),

  update: (tenantId: string, id: string, data: UpdateExamResultInput) =>
    api<ExamResult>(`/exam-results/${id}`, { method: 'PATCH', body: data, tenantId }),

  byExam: (tenantId: string, examId: string) =>
    api<ExamResultsByExam>(`/exam-results/exam/${examId}`, { tenantId }),

  byStudent: (tenantId: string, studentId: string) =>
    api<ExamResultsByStudent>(`/exam-results/student/${studentId}`, { tenantId }),

  semesterResults: (tenantId: string, studentId: string, semester: number) =>
    api<SemesterResult>(`/exam-results/student/${studentId}/semester/${semester}`, { tenantId }),

  cgpa: (tenantId: string, studentId: string) =>
    api<number>(`/exam-results/student/${studentId}/cgpa`, { tenantId }),
};

// Exam Types
export type ExamType = 'internal' | 'midterm' | 'endsem' | 'practical' | 'assignment' | 'lab' | 'viva';

export interface Exam {
  id: string;
  tenantId: string;
  subjectId: string;
  name: string;
  type: ExamType;
  date: string;
  totalMarks: number;
  duration?: number;
  venue?: string;
  instructions?: string;
  subject: {
    id: string;
    name: string;
    code: string;
    semester?: number;
    credits?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamInput {
  name: string;
  subjectId: string;
  type: ExamType;
  date: string;
  totalMarks: number;
  duration?: number;
  venue?: string;
  instructions?: string;
}

export interface UpdateExamInput {
  name?: string;
  type?: ExamType;
  date?: string;
  totalMarks?: number;
  duration?: number;
  venue?: string;
  instructions?: string;
}

export interface ExamListParams {
  subjectId?: string;
  type?: ExamType;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export interface ExamStats {
  total: number;
  upcoming: number;
  completed: number;
  byType: Record<string, number>;
}

// Exam Result Types
export interface ExamResult {
  id: string;
  tenantId: string;
  examId: string;
  studentId: string;
  marks: number;
  grade: string;
  remarks?: string;
  exam: {
    id: string;
    name: string;
    type: ExamType;
    totalMarks: number;
    subject: {
      id: string;
      name: string;
      code: string;
    };
  };
  student: {
    id: string;
    rollNo: string;
    user: {
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamResultInput {
  examId: string;
  studentId: string;
  marks: number;
  grade?: string;
  remarks?: string;
}

export interface UpdateExamResultInput {
  marks?: number;
  grade?: string;
  remarks?: string;
}

export interface BulkCreateExamResultInput {
  examId: string;
  results: Array<{
    studentId: string;
    marks: number;
    remarks?: string;
  }>;
}

export interface BulkExamResultResponse {
  success: number;
  failed: number;
  results: ExamResult[];
  errors: Array<{
    studentId: string;
    error: string;
  }>;
}

export interface ExamResultsByExam {
  exam: Exam;
  results: ExamResult[];
  stats: {
    totalStudents: number;
    average: number;
    highest: number;
    lowest: number;
    passCount: number;
  };
}

export interface ExamResultsByStudent {
  student: {
    id: string;
    rollNo: string;
    name: string;
  };
  results: ExamResult[];
}

export interface SemesterResult {
  semester: number;
  sgpa: number;
  credits: number;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    credits: number;
    exams: Array<{
      examId: string;
      examName: string;
      examType: ExamType;
      date: string;
      totalMarks: number;
      obtainedMarks: number;
      grade: string;
    }>;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
  }>;
}

// Communication API
export const communicationApi = {
  // Announcements
  createAnnouncement: (tenantId: string, data: CreateAnnouncementInput) =>
    api<Announcement>('/communication/announcements', { method: 'POST', body: data, tenantId }),

  listAnnouncements: (tenantId: string, params?: AnnouncementListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.audience) searchParams.set('audience', params.audience);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.pinnedOnly) searchParams.set('pinnedOnly', 'true');
    if (params?.activeOnly) searchParams.set('activeOnly', 'true');
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<AnnouncementListResponse>(`/communication/announcements${query ? `?${query}` : ''}`, { tenantId });
  },

  getAnnouncement: (tenantId: string, id: string) =>
    api<Announcement>(`/communication/announcements/${id}`, { tenantId }),

  updateAnnouncement: (tenantId: string, id: string, data: UpdateAnnouncementInput) =>
    api<Announcement>(`/communication/announcements/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteAnnouncement: (tenantId: string, id: string) =>
    api<void>(`/communication/announcements/${id}`, { method: 'DELETE', tenantId }),

  publishAnnouncement: (tenantId: string, id: string) =>
    api<Announcement>(`/communication/announcements/${id}/publish`, { method: 'POST', tenantId }),

  archiveAnnouncement: (tenantId: string, id: string) =>
    api<Announcement>(`/communication/announcements/${id}/archive`, { method: 'POST', tenantId }),

  getAnnouncementsForUser: (tenantId: string, userId: string, userType: string, params?: { departmentId?: string; courseId?: string; batchYear?: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('userType', userType);
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.courseId) searchParams.set('courseId', params.courseId);
    if (params?.batchYear) searchParams.set('batchYear', params.batchYear.toString());
    return api<AnnouncementWithReadStatus[]>(`/communication/announcements/user/${userId}?${searchParams}`, { tenantId });
  },

  markAnnouncementRead: (tenantId: string, data: { announcementId: string; userId: string; userType: string }) =>
    api<AnnouncementRecipient>('/communication/announcements/read', { method: 'POST', body: data, tenantId }),

  acknowledgeAnnouncement: (tenantId: string, data: { announcementId: string; userId: string }) =>
    api<AnnouncementRecipient>('/communication/announcements/acknowledge', { method: 'POST', body: data, tenantId }),

  getAnnouncementRecipients: (tenantId: string, announcementId: string, readOnly?: boolean) => {
    const query = readOnly !== undefined ? `?readOnly=${readOnly}` : '';
    return api<AnnouncementRecipient[]>(`/communication/announcements/${announcementId}/recipients${query}`, { tenantId });
  },

  // Comments
  createComment: (tenantId: string, data: CreateCommentInput) =>
    api<AnnouncementComment>('/communication/comments', { method: 'POST', body: data, tenantId }),

  getComments: (tenantId: string, announcementId: string) =>
    api<AnnouncementComment[]>(`/communication/announcements/${announcementId}/comments`, { tenantId }),

  hideComment: (tenantId: string, commentId: string) =>
    api<AnnouncementComment>(`/communication/comments/${commentId}/hide`, { method: 'POST', tenantId }),

  // Templates
  createTemplate: (tenantId: string, data: CreateTemplateInput) =>
    api<MessageTemplate>('/communication/templates', { method: 'POST', body: data, tenantId }),

  listTemplates: (tenantId: string, params?: TemplateListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.activeOnly) searchParams.set('activeOnly', 'true');
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<TemplateListResponse>(`/communication/templates${query ? `?${query}` : ''}`, { tenantId });
  },

  getTemplate: (tenantId: string, id: string) =>
    api<MessageTemplate>(`/communication/templates/${id}`, { tenantId }),

  getTemplateByCode: (tenantId: string, code: string) =>
    api<MessageTemplate>(`/communication/templates/code/${code}`, { tenantId }),

  updateTemplate: (tenantId: string, id: string, data: UpdateTemplateInput) =>
    api<MessageTemplate>(`/communication/templates/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteTemplate: (tenantId: string, id: string) =>
    api<void>(`/communication/templates/${id}`, { method: 'DELETE', tenantId }),

  // Bulk Communication
  createBulkCommunication: (tenantId: string, data: CreateBulkCommunicationInput) =>
    api<BulkCommunication>('/communication/bulk', { method: 'POST', body: data, tenantId }),

  listBulkCommunications: (tenantId: string, params?: BulkCommunicationListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<BulkCommunicationListResponse>(`/communication/bulk${query ? `?${query}` : ''}`, { tenantId });
  },

  getBulkCommunication: (tenantId: string, id: string) =>
    api<BulkCommunication>(`/communication/bulk/${id}`, { tenantId }),

  updateBulkCommunication: (tenantId: string, id: string, data: UpdateBulkCommunicationInput) =>
    api<BulkCommunication>(`/communication/bulk/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteBulkCommunication: (tenantId: string, id: string) =>
    api<void>(`/communication/bulk/${id}`, { method: 'DELETE', tenantId }),

  cancelBulkCommunication: (tenantId: string, id: string) =>
    api<BulkCommunication>(`/communication/bulk/${id}/cancel`, { method: 'POST', tenantId }),

  startBulkCommunication: (tenantId: string, id: string) =>
    api<{ message: string; id: string }>(`/communication/bulk/${id}/send`, { method: 'POST', tenantId }),

  // Communication Logs
  listLogs: (tenantId: string, params?: CommunicationLogListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.bulkCommunicationId) searchParams.set('bulkCommunicationId', params.bulkCommunicationId);
    if (params?.recipientId) searchParams.set('recipientId', params.recipientId);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<CommunicationLogListResponse>(`/communication/logs${query ? `?${query}` : ''}`, { tenantId });
  },

  // Send Single Message
  sendMessage: (tenantId: string, data: SendMessageInput) =>
    api<{ message: string; logId: string }>('/communication/send', { method: 'POST', body: data, tenantId }),

  // Stats
  getStats: (tenantId: string) =>
    api<CommunicationStats>('/communication/stats', { tenantId }),
};

// Communication Types
export type AnnouncementType = 'general' | 'academic' | 'event' | 'urgent' | 'holiday' | 'exam' | 'fee' | 'placement';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';
export type AnnouncementAudience = 'all' | 'students' | 'staff' | 'parents' | 'department' | 'course' | 'batch';
export type AnnouncementStatus = 'draft' | 'published' | 'archived';
export type MessageType = 'sms' | 'email' | 'whatsapp' | 'push';
export type TemplateCategory = 'fee_reminder' | 'attendance_alert' | 'exam_notification' | 'result_notification' | 'event_invitation' | 'general' | 'welcome' | 'password_reset';
export type CommunicationStatus = 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

export interface Announcement {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  audienceFilters?: {
    departmentIds?: string[];
    courseIds?: string[];
    batchYears?: number[];
    roles?: string[];
  };
  attachments?: Array<{ name: string; url: string; type: string; size?: number }>;
  publishedAt?: string;
  expiresAt?: string;
  isPinned: boolean;
  allowComments: boolean;
  createdById: string;
  status: AnnouncementStatus;
  _count?: { recipients: number };
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementWithReadStatus extends Announcement {
  isRead: boolean;
  isAcknowledged: boolean;
}

export interface AnnouncementRecipient {
  id: string;
  tenantId: string;
  announcementId: string;
  userId: string;
  userType: string;
  deliveredAt?: string;
  readAt?: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface AnnouncementComment {
  id: string;
  tenantId: string;
  announcementId: string;
  userId: string;
  userType: string;
  userName: string;
  content: string;
  parentId?: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  type: AnnouncementType;
  priority?: AnnouncementPriority;
  audience: AnnouncementAudience;
  audienceFilters?: {
    departmentIds?: string[];
    courseIds?: string[];
    batchYears?: number[];
    roles?: string[];
  };
  attachments?: Array<{ name: string; url: string; type: string; size?: number }>;
  publishedAt?: string;
  expiresAt?: string;
  isPinned?: boolean;
  allowComments?: boolean;
  createdById: string;
  status?: AnnouncementStatus;
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  audience?: AnnouncementAudience;
  audienceFilters?: {
    departmentIds?: string[];
    courseIds?: string[];
    batchYears?: number[];
    roles?: string[];
  };
  attachments?: Array<{ name: string; url: string; type: string; size?: number }>;
  publishedAt?: string;
  expiresAt?: string;
  isPinned?: boolean;
  allowComments?: boolean;
  status?: AnnouncementStatus;
}

export interface AnnouncementListParams {
  search?: string;
  type?: AnnouncementType;
  audience?: AnnouncementAudience;
  status?: AnnouncementStatus;
  priority?: AnnouncementPriority;
  pinnedOnly?: boolean;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface AnnouncementListResponse {
  announcements: Announcement[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateCommentInput {
  announcementId: string;
  userId: string;
  userType: string;
  userName: string;
  content: string;
  parentId?: string;
}

export interface MessageTemplate {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: MessageType;
  category: TemplateCategory;
  subject?: string;
  content: string;
  variables?: Array<{ name: string; description?: string }>;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  code: string;
  type: MessageType;
  category: TemplateCategory;
  subject?: string;
  content: string;
  variables?: Array<{ name: string; description?: string }>;
  isActive?: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  subject?: string;
  content?: string;
  variables?: Array<{ name: string; description?: string }>;
  isActive?: boolean;
}

export interface TemplateListParams {
  search?: string;
  type?: MessageType;
  category?: TemplateCategory;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface TemplateListResponse {
  templates: MessageTemplate[];
  total: number;
  limit: number;
  offset: number;
}

export interface BulkCommunication {
  id: string;
  tenantId: string;
  name: string;
  type: MessageType;
  templateId?: string;
  template?: { id: string; name: string; code: string };
  subject?: string;
  content: string;
  audience: string;
  audienceFilters?: {
    departmentIds?: string[];
    courseIds?: string[];
    batchYears?: number[];
    feeDefaulters?: boolean;
    lowAttendance?: boolean;
    studentIds?: string[];
  };
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdById: string;
  status: CommunicationStatus;
  _count?: { logs: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBulkCommunicationInput {
  name: string;
  type: MessageType;
  templateId?: string;
  subject?: string;
  content: string;
  audience: string;
  audienceFilters?: {
    departmentIds?: string[];
    courseIds?: string[];
    batchYears?: number[];
    feeDefaulters?: boolean;
    lowAttendance?: boolean;
    studentIds?: string[];
  };
  scheduledAt?: string;
  createdById: string;
}

export interface UpdateBulkCommunicationInput {
  name?: string;
  subject?: string;
  content?: string;
  audienceFilters?: {
    departmentIds?: string[];
    courseIds?: string[];
    batchYears?: number[];
    feeDefaulters?: boolean;
    lowAttendance?: boolean;
    studentIds?: string[];
  };
  scheduledAt?: string;
  status?: CommunicationStatus;
}

export interface BulkCommunicationListParams {
  search?: string;
  type?: MessageType;
  status?: CommunicationStatus;
  limit?: number;
  offset?: number;
}

export interface BulkCommunicationListResponse {
  communications: BulkCommunication[];
  total: number;
  limit: number;
  offset: number;
}

export interface CommunicationLog {
  id: string;
  tenantId: string;
  bulkCommunicationId?: string;
  bulkCommunication?: { id: string; name: string };
  type: MessageType;
  recipientId?: string;
  recipientType?: string;
  recipientName?: string;
  recipientContact: string;
  subject?: string;
  content: string;
  variables?: Record<string, string>;
  status: MessageStatus;
  externalId?: string;
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLogListParams {
  bulkCommunicationId?: string;
  recipientId?: string;
  type?: MessageType;
  status?: MessageStatus;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export interface CommunicationLogListResponse {
  logs: CommunicationLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface SendMessageInput {
  type: MessageType;
  recipientContact: string;
  recipientId?: string;
  recipientType?: string;
  recipientName?: string;
  templateCode?: string;
  subject?: string;
  content?: string;
  variables?: Record<string, string>;
}

export interface CommunicationStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  totalTemplates: number;
  totalBulkCommunications: number;
  recentMessages: number;
  messagesByType: Record<string, number>;
}

// Documents API
export const documentsApi = {
  // Statistics
  getStats: (tenantId: string) =>
    api<DocumentStats>('/documents/stats', { tenantId }),

  // Settings
  getSettings: (tenantId: string) =>
    api<DocumentSettings>('/documents/settings', { tenantId }),

  updateSettings: (tenantId: string, data: Partial<DocumentSettings>) =>
    api<DocumentSettings>('/documents/settings', { method: 'PATCH', body: data, tenantId }),

  // Folders
  createFolder: (tenantId: string, data: CreateFolderInput) =>
    api<DocumentFolder>('/documents/folders', { method: 'POST', body: data, tenantId }),

  listFolders: (tenantId: string, parentId?: string) => {
    const query = parentId ? `?parentId=${parentId}` : '';
    return api<DocumentFolderWithCount[]>(`/documents/folders${query}`, { tenantId });
  },

  getFolder: (tenantId: string, id: string) =>
    api<DocumentFolderDetail>(`/documents/folders/${id}`, { tenantId }),

  getFolderBreadcrumb: (tenantId: string, id: string) =>
    api<Array<{ id: string; name: string; path: string }>>(`/documents/folders/${id}/breadcrumb`, { tenantId }),

  updateFolder: (tenantId: string, id: string, data: UpdateFolderInput) =>
    api<DocumentFolder>(`/documents/folders/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteFolder: (tenantId: string, id: string) =>
    api<void>(`/documents/folders/${id}`, { method: 'DELETE', tenantId }),

  // Documents
  uploadDocument: async (tenantId: string, file: File, metadata: UploadDocumentInput) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/documents`, {
      method: 'POST',
      headers: {
        'x-tenant-id': tenantId,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Upload failed', response.status, errorData);
    }

    return response.json() as Promise<Document>;
  },

  listDocuments: (tenantId: string, params?: DocumentListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.folderId) searchParams.set('folderId', params.folderId);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.visibility) searchParams.set('visibility', params.visibility);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.uploadedById) searchParams.set('uploadedById', params.uploadedById);
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.staffId) searchParams.set('staffId', params.staffId);
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isVerified !== undefined) searchParams.set('isVerified', String(params.isVerified));
    if (params?.tags) searchParams.set('tags', params.tags.join(','));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    const query = searchParams.toString();
    return api<DocumentListResponse>(`/documents${query ? `?${query}` : ''}`, { tenantId });
  },

  getDocument: (tenantId: string, id: string) =>
    api<DocumentDetail>(`/documents/${id}`, { tenantId }),

  getUserDocuments: (tenantId: string, userId: string, userType?: string) => {
    const query = userType ? `?userType=${userType}` : '';
    return api<Document[]>(`/documents/user/${userId}${query}`, { tenantId });
  },

  updateDocument: (tenantId: string, id: string, data: UpdateDocumentInput) =>
    api<Document>(`/documents/${id}`, { method: 'PATCH', body: data, tenantId }),

  verifyDocument: (tenantId: string, id: string, data: { verifiedById: string; isVerified: boolean }) =>
    api<Document>(`/documents/${id}/verify`, { method: 'PATCH', body: data, tenantId }),

  deleteDocument: (tenantId: string, id: string, hard?: boolean) => {
    const query = hard ? '?hard=true' : '';
    return api<{ success: boolean }>(`/documents/${id}${query}`, { method: 'DELETE', tenantId });
  },

  // Download/View URLs
  getDownloadUrl: (tenantId: string, id: string, userId: string, userName: string) =>
    api<{ url: string; expiresIn: number; filename: string }>(`/documents/${id}/download?userId=${userId}&userName=${encodeURIComponent(userName)}`, { tenantId }),

  getViewUrl: (tenantId: string, id: string, userId: string, userName: string) =>
    api<{ url: string; expiresIn: number; filename: string; mimeType: string }>(`/documents/${id}/view?userId=${userId}&userName=${encodeURIComponent(userName)}`, { tenantId }),

  // Presigned Upload URL
  getUploadUrl: (tenantId: string, data: { filename: string; contentType: string; category: DocumentCategory; expiresIn?: number }) =>
    api<{ url: string; expiresIn: number; key: string }>('/documents/upload-url', { method: 'POST', body: data, tenantId }),

  // Shares
  createShare: (tenantId: string, data: CreateShareInput) =>
    api<DocumentShare>('/documents/shares', { method: 'POST', body: data, tenantId }),

  updateShare: (tenantId: string, id: string, data: UpdateShareInput) =>
    api<DocumentShare>(`/documents/shares/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteShare: (tenantId: string, id: string) =>
    api<void>(`/documents/shares/${id}`, { method: 'DELETE', tenantId }),

  // Public share access (no tenant required)
  getSharedDocument: (shareToken: string) =>
    api<DocumentShare>(`/documents/shared/${shareToken}`),

  accessSharedDocument: (shareToken: string, password?: string) =>
    api<{ url: string; document: { name: string; originalName: string; mimeType: string; fileSize: number } }>(`/documents/shared/${shareToken}/access`, { method: 'POST', body: { password } }),

  // Access Logs
  getAccessLogs: (tenantId: string, params?: AccessLogParams) => {
    const searchParams = new URLSearchParams();
    if (params?.documentId) searchParams.set('documentId', params.documentId);
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.action) searchParams.set('action', params.action);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return api<AccessLogListResponse>(`/documents/logs${query ? `?${query}` : ''}`, { tenantId });
  },

  // Bulk Operations
  bulkDelete: (tenantId: string, documentIds: string[], hard?: boolean) => {
    const query = hard ? '?hard=true' : '';
    return api<{ success: number; failed: number; total: number }>(`/documents/bulk/delete${query}`, { method: 'POST', body: { documentIds }, tenantId });
  },

  bulkMove: (tenantId: string, documentIds: string[], targetFolderId: string) =>
    api<{ success: boolean; count: number }>('/documents/bulk/move', { method: 'POST', body: { documentIds, targetFolderId }, tenantId }),

  bulkUpdateVisibility: (tenantId: string, documentIds: string[], visibility: DocumentVisibility) =>
    api<{ success: boolean; count: number }>('/documents/bulk/visibility', { method: 'POST', body: { documentIds, visibility }, tenantId }),
};

// Document Types
export type DocumentCategory = 'academic' | 'administrative' | 'personal' | 'certificate' | 'identity' | 'financial' | 'assignment' | 'syllabus' | 'notice' | 'report' | 'other';
export type DocumentVisibility = 'private' | 'shared' | 'department' | 'college' | 'public';
export type DocumentStatus = 'active' | 'archived' | 'deleted' | 'pending_review';
export type SharePermission = 'view' | 'download' | 'edit' | 'admin';

export interface DocumentFolder {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  ownerId: string;
  ownerType: string;
  color?: string;
  icon?: string;
  visibility: DocumentVisibility;
  path: string;
  depth: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFolderWithCount extends DocumentFolder {
  _count: { documents: number; children: number };
}

export interface DocumentFolderDetail extends DocumentFolder {
  parent?: DocumentFolder;
  children: DocumentFolderWithCount[];
  documents: Document[];
  _count: { documents: number; children: number };
}

export interface Document {
  id: string;
  tenantId: string;
  folderId?: string;
  name: string;
  originalName: string;
  description?: string;
  s3Key: string;
  s3Bucket: string;
  s3Region: string;
  s3Url?: string;
  mimeType: string;
  fileSize: number;
  extension: string;
  checksum?: string;
  category: DocumentCategory;
  subcategory?: string;
  tags: string[];
  uploadedById: string;
  uploadedByType: string;
  uploadedByName: string;
  visibility: DocumentVisibility;
  studentId?: string;
  staffId?: string;
  departmentId?: string;
  status: DocumentStatus;
  isVerified: boolean;
  verifiedById?: string;
  verifiedAt?: string;
  version: number;
  previousVersionId?: string;
  expiresAt?: string;
  downloadCount: number;
  viewCount: number;
  lastAccessedAt?: string;
  folder?: { id: string; name: string; path: string };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDetail extends Document {
  folder?: DocumentFolder;
  shares: DocumentShare[];
  versions: Document[];
}

export interface DocumentShare {
  id: string;
  tenantId: string;
  documentId: string;
  sharedWithUserId?: string;
  sharedWithRole?: string;
  sharedWithDeptId?: string;
  permission: SharePermission;
  expiresAt?: string;
  password?: string;
  maxDownloads?: number;
  downloadCount: number;
  shareToken?: string;
  isPublicLink: boolean;
  sharedById: string;
  sharedByName: string;
  document?: Document;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentAccessLog {
  id: string;
  tenantId: string;
  documentId: string;
  userId: string;
  userName: string;
  userType: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  document?: { id: string; name: string };
  createdAt: string;
}

export interface DocumentSettings {
  id: string;
  tenantId: string;
  totalStorageQuota: string;
  usedStorage: string;
  studentQuota: string;
  staffQuota: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  blockedExtensions: string[];
  autoDeleteDays?: number;
  archiveAfterDays?: number;
  versioningEnabled: boolean;
  maxVersions: number;
  publicSharingEnabled: boolean;
  externalSharingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentStats {
  totalDocuments: number;
  storage: {
    used: number;
    quota: number;
    percentage: number;
  };
  byCategory: Array<{ category: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  recentUploads: Array<{
    id: string;
    name: string;
    category: string;
    fileSize: number;
    uploadedByName: string;
    createdAt: string;
  }>;
  topUploaders: Array<{
    userId: string;
    name: string;
    count: number;
  }>;
}

export interface CreateFolderInput {
  name: string;
  description?: string;
  parentId?: string;
  ownerId: string;
  ownerType: string;
  color?: string;
  icon?: string;
  visibility?: DocumentVisibility;
}

export interface UpdateFolderInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  visibility?: DocumentVisibility;
}

export interface UploadDocumentInput {
  name: string;
  description?: string;
  folderId?: string;
  category: DocumentCategory;
  subcategory?: string;
  tags?: string[];
  uploadedById: string;
  uploadedByType: string;
  uploadedByName: string;
  visibility?: DocumentVisibility;
  studentId?: string;
  staffId?: string;
  departmentId?: string;
  expiresAt?: string;
}

export interface UpdateDocumentInput {
  name?: string;
  description?: string;
  folderId?: string;
  category?: DocumentCategory;
  subcategory?: string;
  tags?: string[];
  visibility?: DocumentVisibility;
  status?: DocumentStatus;
  expiresAt?: string;
}

export interface DocumentListParams {
  folderId?: string;
  category?: DocumentCategory;
  visibility?: DocumentVisibility;
  status?: DocumentStatus;
  uploadedById?: string;
  studentId?: string;
  staffId?: string;
  departmentId?: string;
  search?: string;
  tags?: string[];
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DocumentListResponse {
  data: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateShareInput {
  documentId: string;
  sharedWithUserId?: string;
  sharedWithRole?: string;
  sharedWithDeptId?: string;
  permission: SharePermission;
  expiresAt?: string;
  password?: string;
  maxDownloads?: number;
  isPublicLink?: boolean;
  sharedById: string;
  sharedByName: string;
}

export interface UpdateShareInput {
  permission?: SharePermission;
  expiresAt?: string;
  maxDownloads?: number;
}

export interface AccessLogParams {
  documentId?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AccessLogListResponse {
  data: DocumentAccessLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ==================== Sports & Clubs API ====================

export const sportsClubsApi = {
  // Stats
  getStats: (tenantId: string) =>
    api<SportsClubsStats>('/sports-clubs/stats', { tenantId }),

  // Teams
  listTeams: (tenantId: string, params?: TeamQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sport) searchParams.set('sport', params.sport);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.academicYear) searchParams.set('academicYear', params.academicYear);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api<TeamListResponse>(`/sports-clubs/teams${query ? `?${query}` : ''}`, { tenantId });
  },

  getTeam: (tenantId: string, id: string) =>
    api<SportsTeam>(`/sports-clubs/teams/${id}`, { tenantId }),

  createTeam: (tenantId: string, data: CreateTeamInput) =>
    api<SportsTeam>('/sports-clubs/teams', { method: 'POST', body: data, tenantId }),

  updateTeam: (tenantId: string, id: string, data: UpdateTeamInput) =>
    api<SportsTeam>(`/sports-clubs/teams/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteTeam: (tenantId: string, id: string) =>
    api<void>(`/sports-clubs/teams/${id}`, { method: 'DELETE', tenantId }),

  // Team Members
  getTeamMembers: (tenantId: string, teamId: string) =>
    api<TeamMember[]>(`/sports-clubs/teams/${teamId}/members`, { tenantId }),

  addTeamMember: (tenantId: string, data: AddTeamMemberInput) =>
    api<TeamMember>('/sports-clubs/teams/members', { method: 'POST', body: data, tenantId }),

  updateTeamMember: (tenantId: string, id: string, data: UpdateTeamMemberInput) =>
    api<TeamMember>(`/sports-clubs/teams/members/${id}`, { method: 'PATCH', body: data, tenantId }),

  removeTeamMember: (tenantId: string, id: string) =>
    api<void>(`/sports-clubs/teams/members/${id}`, { method: 'DELETE', tenantId }),

  // Clubs
  listClubs: (tenantId: string, params?: ClubQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api<ClubListResponse>(`/sports-clubs/clubs${query ? `?${query}` : ''}`, { tenantId });
  },

  getClub: (tenantId: string, id: string) =>
    api<Club>(`/sports-clubs/clubs/${id}`, { tenantId }),

  createClub: (tenantId: string, data: CreateClubInput) =>
    api<Club>('/sports-clubs/clubs', { method: 'POST', body: data, tenantId }),

  updateClub: (tenantId: string, id: string, data: UpdateClubInput) =>
    api<Club>(`/sports-clubs/clubs/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteClub: (tenantId: string, id: string) =>
    api<void>(`/sports-clubs/clubs/${id}`, { method: 'DELETE', tenantId }),

  // Club Members
  getClubMembers: (tenantId: string, clubId: string) =>
    api<ClubMember[]>(`/sports-clubs/clubs/${clubId}/members`, { tenantId }),

  addClubMember: (tenantId: string, data: AddClubMemberInput) =>
    api<ClubMember>('/sports-clubs/clubs/members', { method: 'POST', body: data, tenantId }),

  updateClubMember: (tenantId: string, id: string, data: UpdateClubMemberInput) =>
    api<ClubMember>(`/sports-clubs/clubs/members/${id}`, { method: 'PATCH', body: data, tenantId }),

  removeClubMember: (tenantId: string, id: string) =>
    api<void>(`/sports-clubs/clubs/members/${id}`, { method: 'DELETE', tenantId }),

  // Sports Events
  listSportsEvents: (tenantId: string, params?: SportsEventQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sport) searchParams.set('sport', params.sport);
    if (params?.eventType) searchParams.set('eventType', params.eventType);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api<SportsEventListResponse>(`/sports-clubs/sports-events${query ? `?${query}` : ''}`, { tenantId });
  },

  getSportsEvent: (tenantId: string, id: string) =>
    api<SportsEvent>(`/sports-clubs/sports-events/${id}`, { tenantId }),

  createSportsEvent: (tenantId: string, data: CreateSportsEventInput) =>
    api<SportsEvent>('/sports-clubs/sports-events', { method: 'POST', body: data, tenantId }),

  updateSportsEvent: (tenantId: string, id: string, data: UpdateSportsEventInput) =>
    api<SportsEvent>(`/sports-clubs/sports-events/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteSportsEvent: (tenantId: string, id: string) =>
    api<void>(`/sports-clubs/sports-events/${id}`, { method: 'DELETE', tenantId }),

  // Club Events
  listClubEvents: (tenantId: string, params?: ClubEventQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.clubId) searchParams.set('clubId', params.clubId);
    if (params?.eventType) searchParams.set('eventType', params.eventType);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api<ClubEventListResponse>(`/sports-clubs/club-events${query ? `?${query}` : ''}`, { tenantId });
  },

  getClubEvent: (tenantId: string, id: string) =>
    api<ClubEvent>(`/sports-clubs/club-events/${id}`, { tenantId }),

  createClubEvent: (tenantId: string, data: CreateClubEventInput) =>
    api<ClubEvent>('/sports-clubs/club-events', { method: 'POST', body: data, tenantId }),

  updateClubEvent: (tenantId: string, id: string, data: UpdateClubEventInput) =>
    api<ClubEvent>(`/sports-clubs/club-events/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteClubEvent: (tenantId: string, id: string) =>
    api<void>(`/sports-clubs/club-events/${id}`, { method: 'DELETE', tenantId }),

  // Event Registrations
  registerForEvent: (tenantId: string, data: RegisterForEventInput) =>
    api<EventRegistration>('/sports-clubs/registrations', { method: 'POST', body: data, tenantId }),

  updateRegistration: (tenantId: string, id: string, data: UpdateRegistrationInput) =>
    api<EventRegistration>(`/sports-clubs/registrations/${id}`, { method: 'PATCH', body: data, tenantId }),

  cancelRegistration: (tenantId: string, id: string) =>
    api<EventRegistration>(`/sports-clubs/registrations/${id}/cancel`, { method: 'POST', tenantId }),

  getStudentRegistrations: (tenantId: string, studentId: string) =>
    api<EventRegistration[]>(`/sports-clubs/registrations/student/${studentId}`, { tenantId }),

  // Achievements
  listAchievements: (tenantId: string, params?: AchievementQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.achievementType) searchParams.set('achievementType', params.achievementType);
    if (params?.level) searchParams.set('level', params.level);
    if (params?.isVerified !== undefined) searchParams.set('isVerified', params.isVerified.toString());
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api<AchievementListResponse>(`/sports-clubs/achievements${query ? `?${query}` : ''}`, { tenantId });
  },

  getAchievement: (tenantId: string, id: string) =>
    api<Achievement>(`/sports-clubs/achievements/${id}`, { tenantId }),

  createAchievement: (tenantId: string, data: CreateAchievementInput) =>
    api<Achievement>('/sports-clubs/achievements', { method: 'POST', body: data, tenantId }),

  updateAchievement: (tenantId: string, id: string, data: UpdateAchievementInput) =>
    api<Achievement>(`/sports-clubs/achievements/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteAchievement: (tenantId: string, id: string) =>
    api<void>(`/sports-clubs/achievements/${id}`, { method: 'DELETE', tenantId }),

  verifyAchievement: (tenantId: string, id: string, verifiedBy: string) =>
    api<Achievement>(`/sports-clubs/achievements/${id}/verify`, { method: 'POST', body: { verifiedBy }, tenantId }),

  // Activity Credits
  listActivityCredits: (tenantId: string, params?: ActivityCreditQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.activityType) searchParams.set('activityType', params.activityType);
    if (params?.academicYear) searchParams.set('academicYear', params.academicYear);
    if (params?.semester) searchParams.set('semester', params.semester.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api<ActivityCreditListResponse>(`/sports-clubs/activity-credits${query ? `?${query}` : ''}`, { tenantId });
  },

  createActivityCredit: (tenantId: string, data: CreateActivityCreditInput) =>
    api<ActivityCredit>('/sports-clubs/activity-credits', { method: 'POST', body: data, tenantId }),

  deleteActivityCredit: (tenantId: string, id: string) =>
    api<void>(`/sports-clubs/activity-credits/${id}`, { method: 'DELETE', tenantId }),

  getStudentCreditsSummary: (tenantId: string, studentId: string, academicYear?: string) => {
    const params = academicYear ? `?academicYear=${academicYear}` : '';
    return api<StudentCreditsSummary>(`/sports-clubs/activity-credits/student/${studentId}/summary${params}`, { tenantId });
  },

  // Student Activities Overview
  getStudentActivities: (tenantId: string, studentId: string) =>
    api<StudentActivitiesResponse>(`/sports-clubs/student/${studentId}/activities`, { tenantId }),
};

// ==================== Sports & Clubs Types ====================

export interface SportsTeam {
  id: string;
  tenantId: string;
  name: string;
  sport: string;
  description?: string;
  academicYear: string;
  coachId?: string;
  coachName?: string;
  captainId?: string;
  captainName?: string;
  maxMembers: number;
  status: 'active' | 'inactive' | 'recruiting';
  logoUrl?: string;
  achievements?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    events: number;
  };
}

export interface TeamMember {
  id: string;
  tenantId: string;
  teamId: string;
  studentId: string;
  studentName: string;
  rollNo?: string;
  position?: string;
  jerseyNumber?: number;
  joinedAt: string;
  status: 'active' | 'inactive' | 'left';
  createdAt: string;
  updatedAt: string;
}

export interface Club {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  description?: string;
  facultyAdvisorId?: string;
  facultyAdvisorName?: string;
  presidentId?: string;
  presidentName?: string;
  secretaryId?: string;
  secretaryName?: string;
  maxMembers?: number;
  membershipFee?: number;
  meetingSchedule?: string;
  venue?: string;
  status: 'active' | 'inactive' | 'recruiting';
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    events: number;
  };
}

export interface ClubMember {
  id: string;
  tenantId: string;
  clubId: string;
  studentId: string;
  studentName: string;
  rollNo?: string;
  role: 'member' | 'coordinator' | 'secretary' | 'president';
  joinedAt: string;
  status: 'active' | 'inactive' | 'left';
  feePaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SportsEvent {
  id: string;
  tenantId: string;
  name: string;
  sport: string;
  eventType: 'match' | 'tournament' | 'practice' | 'training' | 'tryout' | 'competition';
  description?: string;
  startDate: string;
  endDate?: string;
  venue: string;
  opponentTeam?: string;
  teamId?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
  result?: string;
  score?: string;
  highlights?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    registrations: number;
  };
}

export interface ClubEvent {
  id: string;
  tenantId: string;
  clubId: string;
  name: string;
  eventType: 'meeting' | 'workshop' | 'seminar' | 'competition' | 'cultural' | 'social' | 'other';
  description?: string;
  startDate: string;
  endDate?: string;
  venue: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  registrationFee?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  club?: Club;
  _count?: {
    registrations: number;
  };
}

export interface EventRegistration {
  id: string;
  tenantId: string;
  eventId: string;
  eventType: 'sports' | 'club';
  studentId: string;
  studentName: string;
  rollNo?: string;
  registrationDate: string;
  status: 'registered' | 'confirmed' | 'attended' | 'absent' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'waived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  rollNo?: string;
  title: string;
  description?: string;
  achievementType: 'sports' | 'cultural' | 'academic' | 'technical' | 'other';
  level: 'college' | 'university' | 'state' | 'national' | 'international';
  position?: string;
  eventName?: string;
  eventDate: string;
  organizerName?: string;
  certificateUrl?: string;
  proofUrl?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  creditsAwarded?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityCredit {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  activityType: 'sports' | 'cultural' | 'nss' | 'ncc' | 'club' | 'other';
  activityName: string;
  description?: string;
  credits: number;
  academicYear: string;
  semester: number;
  awardedBy: string;
  awardedAt: string;
  achievementId?: string;
  eventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SportsClubsStats {
  teams: {
    total: number;
    active: number;
    bySport: { sport: string; count: number }[];
  };
  clubs: {
    total: number;
    active: number;
    byCategory: { category: string; count: number }[];
  };
  events: {
    upcoming: number;
    ongoing: number;
    completed: number;
    totalRegistrations: number;
  };
  achievements: {
    total: number;
    verified: number;
    byLevel: { level: string; count: number }[];
    byType: { type: string; count: number }[];
  };
  credits: {
    totalAwarded: number;
    byType: { type: string; total: number }[];
  };
}

export interface TeamQueryParams {
  search?: string;
  sport?: string;
  status?: string;
  academicYear?: string;
  page?: number;
  limit?: number;
}

export interface TeamListResponse {
  data: SportsTeam[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ClubQueryParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ClubListResponse {
  data: Club[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SportsEventQueryParams {
  search?: string;
  sport?: string;
  eventType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SportsEventListResponse {
  data: SportsEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ClubEventQueryParams {
  search?: string;
  clubId?: string;
  eventType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ClubEventListResponse {
  data: ClubEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AchievementQueryParams {
  search?: string;
  studentId?: string;
  achievementType?: string;
  level?: string;
  isVerified?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AchievementListResponse {
  data: Achievement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ActivityCreditQueryParams {
  studentId?: string;
  activityType?: string;
  academicYear?: string;
  semester?: number;
  page?: number;
  limit?: number;
}

export interface ActivityCreditListResponse {
  data: ActivityCredit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateTeamInput {
  name: string;
  sport: string;
  description?: string;
  academicYear: string;
  coachId?: string;
  coachName?: string;
  captainId?: string;
  captainName?: string;
  maxMembers?: number;
  status?: 'active' | 'inactive' | 'recruiting';
  logoUrl?: string;
}

export interface UpdateTeamInput {
  name?: string;
  sport?: string;
  description?: string;
  coachId?: string;
  coachName?: string;
  captainId?: string;
  captainName?: string;
  maxMembers?: number;
  status?: 'active' | 'inactive' | 'recruiting';
  logoUrl?: string;
  achievements?: string;
}

export interface AddTeamMemberInput {
  teamId: string;
  studentId: string;
  studentName: string;
  rollNo?: string;
  position?: string;
  jerseyNumber?: number;
}

export interface UpdateTeamMemberInput {
  position?: string;
  jerseyNumber?: number;
  status?: 'active' | 'inactive' | 'left';
}

export interface CreateClubInput {
  name: string;
  category: string;
  description?: string;
  facultyAdvisorId?: string;
  facultyAdvisorName?: string;
  presidentId?: string;
  presidentName?: string;
  secretaryId?: string;
  secretaryName?: string;
  maxMembers?: number;
  membershipFee?: number;
  meetingSchedule?: string;
  venue?: string;
  status?: 'active' | 'inactive' | 'recruiting';
  logoUrl?: string;
}

export interface UpdateClubInput {
  name?: string;
  category?: string;
  description?: string;
  facultyAdvisorId?: string;
  facultyAdvisorName?: string;
  presidentId?: string;
  presidentName?: string;
  secretaryId?: string;
  secretaryName?: string;
  maxMembers?: number;
  membershipFee?: number;
  meetingSchedule?: string;
  venue?: string;
  status?: 'active' | 'inactive' | 'recruiting';
  logoUrl?: string;
}

export interface AddClubMemberInput {
  clubId: string;
  studentId: string;
  studentName: string;
  rollNo?: string;
  role?: 'member' | 'coordinator' | 'secretary' | 'president';
  feePaid?: boolean;
}

export interface UpdateClubMemberInput {
  role?: 'member' | 'coordinator' | 'secretary' | 'president';
  status?: 'active' | 'inactive' | 'left';
  feePaid?: boolean;
}

export interface CreateSportsEventInput {
  name: string;
  sport: string;
  eventType: 'match' | 'tournament' | 'practice' | 'training' | 'tryout' | 'competition';
  description?: string;
  startDate: string;
  endDate?: string;
  venue: string;
  opponentTeam?: string;
  teamId?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
}

export interface UpdateSportsEventInput {
  name?: string;
  sport?: string;
  eventType?: 'match' | 'tournament' | 'practice' | 'training' | 'tryout' | 'competition';
  description?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  opponentTeam?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
  result?: string;
  score?: string;
  highlights?: string;
}

export interface CreateClubEventInput {
  clubId: string;
  name: string;
  eventType: 'meeting' | 'workshop' | 'seminar' | 'competition' | 'cultural' | 'social' | 'other';
  description?: string;
  startDate: string;
  endDate?: string;
  venue: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  registrationFee?: number;
  isPublic?: boolean;
}

export interface UpdateClubEventInput {
  name?: string;
  eventType?: 'meeting' | 'workshop' | 'seminar' | 'competition' | 'cultural' | 'social' | 'other';
  description?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  registrationFee?: number;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
  isPublic?: boolean;
}

export interface RegisterForEventInput {
  eventId: string;
  eventType: 'sports' | 'club';
  studentId: string;
  studentName: string;
  rollNo?: string;
  notes?: string;
}

export interface UpdateRegistrationInput {
  status?: 'registered' | 'confirmed' | 'attended' | 'absent' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'waived';
  notes?: string;
}

export interface CreateAchievementInput {
  studentId: string;
  studentName: string;
  rollNo?: string;
  title: string;
  description?: string;
  achievementType: 'sports' | 'cultural' | 'academic' | 'technical' | 'other';
  level: 'college' | 'university' | 'state' | 'national' | 'international';
  position?: string;
  eventName?: string;
  eventDate: string;
  organizerName?: string;
  certificateUrl?: string;
  proofUrl?: string;
  creditsAwarded?: number;
}

export interface UpdateAchievementInput {
  title?: string;
  description?: string;
  achievementType?: 'sports' | 'cultural' | 'academic' | 'technical' | 'other';
  level?: 'college' | 'university' | 'state' | 'national' | 'international';
  position?: string;
  eventName?: string;
  eventDate?: string;
  organizerName?: string;
  certificateUrl?: string;
  proofUrl?: string;
  creditsAwarded?: number;
}

export interface CreateActivityCreditInput {
  studentId: string;
  studentName: string;
  activityType: 'sports' | 'cultural' | 'nss' | 'ncc' | 'club' | 'other';
  activityName: string;
  description?: string;
  credits: number;
  academicYear: string;
  semester: number;
  awardedBy: string;
  achievementId?: string;
  eventId?: string;
}

export interface StudentCreditsSummary {
  totalCredits: number;
  byType: { type: string; credits: number }[];
  bySemester: { semester: number; credits: number }[];
  details: ActivityCredit[];
}

export interface StudentActivitiesResponse {
  teams: SportsTeam[];
  clubs: Club[];
  registrations: EventRegistration[];
  achievements: Achievement[];
  credits: {
    total: number;
    byType: { type: string; credits: number }[];
  };
}

// ==================== Import/Export API ====================

export const importExportApi = {
  // Stats
  getStats: (tenantId: string) =>
    api<ImportExportStats>('/import-export/stats', { tenantId }),

  // Entity Types & Fields
  getEntityTypes: (tenantId: string) =>
    api<EntityTypesResponse>('/import-export/entity-types', { tenantId }),

  getEntityFields: (tenantId: string, entityType: string) =>
    api<EntityFieldsResponse>(`/import-export/fields/${entityType}`, { tenantId }),

  // Sample Templates
  downloadSampleTemplate: async (tenantId: string, entityType: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/import-export/sample-template/${entityType}`,
      {
        headers: {
          'x-tenant-id': tenantId,
        },
      }
    );
    if (!response.ok) {
      throw new ApiError('Failed to download template', response.status);
    }
    return response.blob();
  },

  // Import Jobs
  createImportJob: (tenantId: string, data: CreateImportJobInput) =>
    api<ImportJob>('/import-export/import', { method: 'POST', body: data, tenantId }),

  listImportJobs: (tenantId: string, params?: ImportJobQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.entityType) searchParams.set('entityType', params.entityType);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.createdById) searchParams.set('createdById', params.createdById);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<ImportJobListResponse>(`/import-export/import${query ? `?${query}` : ''}`, { tenantId });
  },

  getImportJob: (tenantId: string, id: string) =>
    api<ImportJob>(`/import-export/import/${id}`, { tenantId }),

  updateImportJob: (tenantId: string, id: string, data: UpdateImportJobInput) =>
    api<ImportJob>(`/import-export/import/${id}`, { method: 'PATCH', body: data, tenantId }),

  cancelImportJob: (tenantId: string, id: string) =>
    api<ImportJob>(`/import-export/import/${id}/cancel`, { method: 'POST', tenantId }),

  deleteImportJob: (tenantId: string, id: string) =>
    api<void>(`/import-export/import/${id}`, { method: 'DELETE', tenantId }),

  validateImportFile: async (tenantId: string, jobId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/import-export/import/${jobId}/validate`,
      {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Validation failed', response.status, errorData);
    }

    return response.json() as Promise<ImportValidationResult>;
  },

  processImportJob: async (tenantId: string, jobId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/import-export/import/${jobId}/process`,
      {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Import processing failed', response.status, errorData);
    }

    return response.json() as Promise<ImportProcessResult>;
  },

  uploadAndValidate: async (tenantId: string, file: File, entityType: string, createdById: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('createdById', createdById);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/import-export/import/upload`,
      {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Upload failed', response.status, errorData);
    }

    return response.json() as Promise<{ job: ImportJob; validation: ImportValidationResult }>;
  },

  quickImport: async (tenantId: string, file: File, entityType: string, createdById: string, updateExisting: boolean = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('createdById', createdById);
    formData.append('updateExisting', updateExisting.toString());

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/import-export/import/quick`,
      {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Quick import failed', response.status, errorData);
    }

    return response.json() as Promise<{ job: ImportJob; result: ImportProcessResult }>;
  },

  // Export Jobs
  createExportJob: (tenantId: string, data: CreateExportJobInput) =>
    api<ExportJob>('/import-export/export', { method: 'POST', body: data, tenantId }),

  listExportJobs: (tenantId: string, params?: ExportJobQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.entityType) searchParams.set('entityType', params.entityType);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.createdById) searchParams.set('createdById', params.createdById);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<ExportJobListResponse>(`/import-export/export${query ? `?${query}` : ''}`, { tenantId });
  },

  getExportJob: (tenantId: string, id: string) =>
    api<ExportJob>(`/import-export/export/${id}`, { tenantId }),

  processAndDownloadExport: async (tenantId: string, id: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/import-export/export/${id}/process`,
      {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
        },
      }
    );
    if (!response.ok) {
      throw new ApiError('Failed to process export', response.status);
    }
    return response.blob();
  },

  downloadExport: async (tenantId: string, id: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/import-export/export/${id}/download`,
      {
        headers: {
          'x-tenant-id': tenantId,
        },
      }
    );
    if (!response.ok) {
      throw new ApiError('Failed to download export', response.status);
    }
    return response.blob();
  },

  quickExport: async (tenantId: string, data: CreateExportJobInput) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/import-export/export/quick`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new ApiError('Failed to export', response.status);
    }
    return response.blob();
  },

  // Import Templates
  createTemplate: (tenantId: string, data: CreateImportTemplateInput) =>
    api<ImportTemplate>('/import-export/templates', { method: 'POST', body: data, tenantId }),

  listTemplates: (tenantId: string, params?: ImportTemplateQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.entityType) searchParams.set('entityType', params.entityType);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<ImportTemplateListResponse>(`/import-export/templates${query ? `?${query}` : ''}`, { tenantId });
  },

  getTemplate: (tenantId: string, id: string) =>
    api<ImportTemplate>(`/import-export/templates/${id}`, { tenantId }),

  updateTemplate: (tenantId: string, id: string, data: UpdateImportTemplateInput) =>
    api<ImportTemplate>(`/import-export/templates/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteTemplate: (tenantId: string, id: string) =>
    api<void>(`/import-export/templates/${id}`, { method: 'DELETE', tenantId }),
};

// ==================== Import/Export Types ====================

export type ImportEntityType =
  | 'students'
  | 'staff'
  | 'departments'
  | 'courses'
  | 'subjects'
  | 'fees'
  | 'attendance'
  | 'marks'
  | 'library_books'
  | 'hostel_rooms'
  | 'transport_routes';

export type ImportStatus = 'pending' | 'validating' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ExportFormat = 'xlsx' | 'csv';

export interface EntityField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  example?: string;
}

export interface EntityTypesResponse {
  types: Array<{
    value: ImportEntityType;
    label: string;
    fields: EntityField[];
  }>;
}

export interface EntityFieldsResponse {
  entityType: string;
  fields: EntityField[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  transform?: string;
}

export interface ImportOptions {
  skipHeaderRow?: boolean;
  updateExisting?: boolean;
  uniqueField?: string;
  validateOnly?: boolean;
  startRow?: number;
  endRow?: number;
}

export interface ExportFilters {
  search?: string;
  departmentId?: string;
  courseId?: string;
  batchYear?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ImportJob {
  id: string;
  tenantId: string;
  entityType: ImportEntityType;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  status: ImportStatus;
  errorLog?: Array<{
    row: number;
    field: string;
    value: string;
    error: string;
  }>;
  mapping?: ColumnMapping[];
  options?: ImportOptions;
  startedAt?: string;
  completedAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportJob {
  id: string;
  tenantId: string;
  entityType: ImportEntityType;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  format: ExportFormat;
  totalRecords: number;
  filters?: ExportFilters;
  columns?: string[];
  status: ExportStatus;
  expiresAt?: string;
  downloadCount: number;
  startedAt?: string;
  completedAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportTemplate {
  id: string;
  tenantId: string;
  name: string;
  entityType: ImportEntityType;
  mapping: ColumnMapping[];
  options?: ImportOptions;
  isDefault: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{
    row: number;
    field: string;
    value: string;
    error: string;
  }>;
  preview: Array<Record<string, unknown>>;
}

export interface ImportProcessResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export interface ImportExportStats {
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalImports: number;
  totalExports: number;
  recentImports: number;
  recentExports: number;
}

export interface CreateImportJobInput {
  entityType: ImportEntityType;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  mapping?: ColumnMapping[];
  options?: ImportOptions;
  createdById: string;
}

export interface UpdateImportJobInput {
  mapping?: ColumnMapping[];
  options?: ImportOptions;
  status?: ImportStatus;
}

export interface ImportJobQueryParams {
  entityType?: ImportEntityType;
  status?: ImportStatus;
  createdById?: string;
  limit?: number;
  offset?: number;
}

export interface ImportJobListResponse {
  data: ImportJob[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateExportJobInput {
  entityType: ImportEntityType;
  fileName?: string;
  format?: ExportFormat;
  filters?: ExportFilters;
  columns?: string[];
  createdById: string;
}

export interface ExportJobQueryParams {
  entityType?: ImportEntityType;
  status?: ExportStatus;
  createdById?: string;
  limit?: number;
  offset?: number;
}

export interface ExportJobListResponse {
  data: ExportJob[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateImportTemplateInput {
  name: string;
  entityType: ImportEntityType;
  mapping: ColumnMapping[];
  options?: ImportOptions;
  isDefault?: boolean;
  createdById: string;
}

export interface UpdateImportTemplateInput {
  name?: string;
  mapping?: ColumnMapping[];
  options?: ImportOptions;
  isDefault?: boolean;
}

export interface ImportTemplateQueryParams {
  entityType?: ImportEntityType;
  limit?: number;
  offset?: number;
}

export interface ImportTemplateListResponse {
  data: ImportTemplate[];
  total: number;
  limit: number;
  offset: number;
}

// ==================== Audit Log API ====================

export const auditApi = {
  // Stats & Summaries
  getStats: (tenantId: string) =>
    api<AuditLogStats>('/audit/stats', { tenantId }),

  getSummaries: (tenantId: string, params?: AuditLogSummaryQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.days) searchParams.set('days', params.days.toString());
    const query = searchParams.toString();
    return api<AuditLogSummary[]>(`/audit/summaries${query ? `?${query}` : ''}`, { tenantId });
  },

  // Audit Logs
  listLogs: (tenantId: string, params?: AuditLogQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.action) searchParams.set('action', params.action);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.entityType) searchParams.set('entityType', params.entityType);
    if (params?.entityId) searchParams.set('entityId', params.entityId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    const query = searchParams.toString();
    return api<AuditLogListResponse>(`/audit/logs${query ? `?${query}` : ''}`, { tenantId });
  },

  getLogById: (tenantId: string, id: string) =>
    api<AuditLog>(`/audit/logs/${id}`, { tenantId }),

  // Quick filters
  getRecentLogs: (tenantId: string, limit = 20) =>
    api<AuditLogListResponse>(`/audit/recent?limit=${limit}`, { tenantId }),

  getFailures: (tenantId: string, limit = 20) =>
    api<AuditLogListResponse>(`/audit/failures?limit=${limit}`, { tenantId }),

  getLogins: (tenantId: string, limit = 20) =>
    api<AuditLogListResponse>(`/audit/logins?limit=${limit}`, { tenantId }),

  // Entity & User Activity
  getEntityActivity: (tenantId: string, entityType: string, entityId: string, limit = 50) =>
    api<EntityActivityResponse>(`/audit/entity/${entityType}/${entityId}?limit=${limit}`, { tenantId }),

  getUserActivity: (tenantId: string, userId: string, limit = 50) =>
    api<UserActivityResponse>(`/audit/user/${userId}?limit=${limit}`, { tenantId }),

  // Settings
  getSettings: (tenantId: string) =>
    api<AuditLogSettings>('/audit/settings', { tenantId }),

  updateSettings: (tenantId: string, data: UpdateAuditSettingsInput) =>
    api<AuditLogSettings>('/audit/settings', { method: 'PATCH', body: data, tenantId }),

  // Export & Maintenance
  exportLogs: (tenantId: string, params?: AuditLogQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.action) searchParams.set('action', params.action);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.entityType) searchParams.set('entityType', params.entityType);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return api<AuditLog[]>(`/audit/export${query ? `?${query}` : ''}`, { tenantId });
  },

  cleanupOldLogs: (tenantId: string) =>
    api<{ count: number }>('/audit/cleanup', { method: 'POST', tenantId }),
};

// ==================== Audit Log Types ====================

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'PUBLISH'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'BULK_CREATE'
  | 'BULK_UPDATE'
  | 'BULK_DELETE'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'PERMISSION_CHANGE'
  | 'SETTINGS_CHANGE';

export type AuditCategory =
  | 'AUTHENTICATION'
  | 'USER_MANAGEMENT'
  | 'STUDENT_MANAGEMENT'
  | 'STAFF_MANAGEMENT'
  | 'ACADEMIC'
  | 'FINANCIAL'
  | 'ATTENDANCE'
  | 'EXAM'
  | 'TRANSPORT'
  | 'HOSTEL'
  | 'LIBRARY'
  | 'COMMUNICATION'
  | 'DOCUMENT'
  | 'IMPORT_EXPORT'
  | 'SYSTEM'
  | 'SETTINGS';

export type AuditStatus = 'success' | 'failure' | 'pending';

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  action: AuditAction;
  category: AuditCategory;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  changedFields: string[];
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  requestId?: string;
  status: AuditStatus;
  errorMessage?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditLogStats {
  totalLogs: number;
  todayLogs: number;
  successLogs: number;
  failureLogs: number;
  uniqueUsers: number;
  actionCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  entityTypeCounts: Record<string, number>;
  recentActivity: AuditLog[];
}

export interface AuditLogSummary {
  date: string;
  createCount: number;
  updateCount: number;
  deleteCount: number;
  viewCount: number;
  loginCount: number;
  logoutCount: number;
  exportCount: number;
  importCount: number;
  otherCount: number;
  successCount: number;
  failureCount: number;
  uniqueUsers: number;
  topEntities?: Array<{ entityType: string; count: number }>;
}

export interface AuditLogSettings {
  id: string;
  tenantId: string;
  retentionDays: number;
  logReads: boolean;
  logAuthentication: boolean;
  logDataChanges: boolean;
  logExports: boolean;
  logImports: boolean;
  logSystemEvents: boolean;
  excludedEntityTypes: string[];
  excludedActions: string[];
}

export interface EntityActivityResponse {
  entityType: string;
  entityId: string;
  entityName?: string;
  logs: AuditLog[];
  total: number;
}

export interface UserActivityResponse {
  userId: string;
  userName?: string;
  userEmail?: string;
  logs: AuditLog[];
  total: number;
  actionCounts: Record<string, number>;
}

export interface AuditLogQueryParams {
  userId?: string;
  action?: AuditAction;
  category?: AuditCategory;
  entityType?: string;
  entityId?: string;
  status?: AuditStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogSummaryQueryParams {
  startDate?: string;
  endDate?: string;
  days?: number;
}

export interface UpdateAuditSettingsInput {
  retentionDays?: number;
  logReads?: boolean;
  logAuthentication?: boolean;
  logDataChanges?: boolean;
  logExports?: boolean;
  logImports?: boolean;
  logSystemEvents?: boolean;
  excludedEntityTypes?: string[];
  excludedActions?: string[];
}

// ==================== Reports API ====================

export const reportsApi = {
  // Stats
  getStats: (tenantId: string) =>
    api<ReportStats>('/reports/stats', { tenantId }),

  // Templates
  listTemplates: (tenantId: string, params?: ReportTemplateQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.dataSource) searchParams.set('dataSource', params.dataSource);
    if (params?.isSystem !== undefined) searchParams.set('isSystem', params.isSystem.toString());
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<ReportTemplateListResponse>(`/reports/templates${query ? `?${query}` : ''}`, { tenantId });
  },

  getTemplateById: (tenantId: string, id: string) =>
    api<ReportTemplate>(`/reports/templates/${id}`, { tenantId }),

  createTemplate: (tenantId: string, data: CreateReportTemplateInput) =>
    api<ReportTemplate>('/reports/templates', { method: 'POST', body: data, tenantId }),

  updateTemplate: (tenantId: string, id: string, data: UpdateReportTemplateInput) =>
    api<ReportTemplate>(`/reports/templates/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteTemplate: (tenantId: string, id: string) =>
    api<void>(`/reports/templates/${id}`, { method: 'DELETE', tenantId }),

  // Report Generation
  generateReport: (tenantId: string, data: GenerateReportInput) =>
    api<ReportJob>('/reports/generate', { method: 'POST', body: data, tenantId }),

  generateFromTemplate: (tenantId: string, data: GenerateFromTemplateInput) =>
    api<ReportJob>('/reports/generate/from-template', { method: 'POST', body: data, tenantId }),

  // Report Jobs
  listJobs: (tenantId: string, params?: ReportJobQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.templateId) searchParams.set('templateId', params.templateId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.format) searchParams.set('format', params.format);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<ReportJobListResponse>(`/reports/jobs${query ? `?${query}` : ''}`, { tenantId });
  },

  getJobById: (tenantId: string, id: string) =>
    api<ReportJob>(`/reports/jobs/${id}`, { tenantId }),

  deleteJob: (tenantId: string, id: string) =>
    api<void>(`/reports/jobs/${id}`, { method: 'DELETE', tenantId }),

  // Scheduled Reports
  listScheduledReports: (tenantId: string, params?: ScheduledReportQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.templateId) searchParams.set('templateId', params.templateId);
    if (params?.frequency) searchParams.set('frequency', params.frequency);
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<ScheduledReportListResponse>(`/reports/scheduled${query ? `?${query}` : ''}`, { tenantId });
  },

  createScheduledReport: (tenantId: string, data: CreateScheduledReportInput) =>
    api<ScheduledReport>('/reports/scheduled', { method: 'POST', body: data, tenantId }),

  updateScheduledReport: (tenantId: string, id: string, data: UpdateScheduledReportInput) =>
    api<ScheduledReport>(`/reports/scheduled/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteScheduledReport: (tenantId: string, id: string) =>
    api<void>(`/reports/scheduled/${id}`, { method: 'DELETE', tenantId }),

  // Quick Reports
  quickStudentReport: (tenantId: string, params?: QuickReportParams) => {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.semester) searchParams.set('semester', params.semester.toString());
    if (params?.format) searchParams.set('format', params.format);
    const query = searchParams.toString();
    return api<ReportJob>(`/reports/quick/students${query ? `?${query}` : ''}`, { tenantId });
  },

  quickFeeReport: (tenantId: string, params?: QuickReportParams) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.feeType) searchParams.set('feeType', params.feeType);
    if (params?.format) searchParams.set('format', params.format);
    const query = searchParams.toString();
    return api<ReportJob>(`/reports/quick/fees${query ? `?${query}` : ''}`, { tenantId });
  },

  quickAttendanceReport: (tenantId: string, params?: QuickReportParams) => {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.format) searchParams.set('format', params.format);
    const query = searchParams.toString();
    return api<ReportJob>(`/reports/quick/attendance${query ? `?${query}` : ''}`, { tenantId });
  },

  quickExamResultsReport: (tenantId: string, params?: QuickReportParams) => {
    const searchParams = new URLSearchParams();
    if (params?.examId) searchParams.set('examId', params.examId);
    if (params?.format) searchParams.set('format', params.format);
    const query = searchParams.toString();
    return api<ReportJob>(`/reports/quick/exam-results${query ? `?${query}` : ''}`, { tenantId });
  },

  // Seed system templates
  seedTemplates: () =>
    api<{ count: number }>('/reports/seed-templates', { method: 'POST' }),
};

// ==================== Reports Types ====================

export type ReportCategory =
  | 'academic'
  | 'financial'
  | 'attendance'
  | 'exam'
  | 'student'
  | 'staff'
  | 'transport'
  | 'hostel'
  | 'library'
  | 'sports'
  | 'communication'
  | 'audit';

export type ReportType = 'summary' | 'detailed' | 'comparison' | 'trend';

export type DataSource =
  | 'students'
  | 'staff'
  | 'departments'
  | 'attendance'
  | 'fees'
  | 'payments'
  | 'exams'
  | 'exam_results'
  | 'transport'
  | 'hostel'
  | 'library'
  | 'sports_teams'
  | 'clubs'
  | 'announcements'
  | 'audit_logs';

export type ReportFormat = 'pdf' | 'xlsx' | 'csv';

export type ReportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'none';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface ColumnDefinition {
  field: string;
  label: string;
  width?: number;
  format?: string;
  align?: string;
}

export interface FilterOption {
  field: string;
  label: string;
  type: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface AggregationDefinition {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
  label?: string;
}

export interface ReportTemplate {
  id: string;
  tenantId: string | null;
  name: string;
  description: string | null;
  category: ReportCategory;
  reportType: ReportType;
  dataSource: DataSource;
  columns: ColumnDefinition[];
  filters: FilterOption[] | null;
  groupBy: string[];
  sortBy: string | null;
  sortOrder: string;
  aggregations: AggregationDefinition[] | null;
  chartType: ChartType | null;
  chartConfig: Record<string, any> | null;
  orientation: string;
  pageSize: string;
  showHeader: boolean;
  showFooter: boolean;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportJob {
  id: string;
  tenantId: string;
  templateId: string | null;
  name: string;
  description: string | null;
  dataSource: DataSource;
  format: ReportFormat;
  status: ReportJobStatus;
  progress: number;
  errorMessage: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  rowCount: number | null;
  generatedAt: string | null;
  executionTime: number | null;
  createdAt: string;
}

export interface ScheduledReport {
  id: string;
  tenantId: string;
  templateId: string;
  name: string;
  description: string | null;
  frequency: Frequency;
  time: string;
  timezone: string;
  format: ReportFormat;
  deliveryMethod: string;
  recipients: string[];
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  lastStatus: string | null;
  runCount: number;
  failureCount: number;
  template?: ReportTemplate;
}

export interface ReportStats {
  totalTemplates: number;
  systemTemplates: number;
  customTemplates: number;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  pendingJobs: number;
  scheduledReports: number;
  activeSchedules: number;
  jobsByFormat: Record<string, number>;
  jobsByCategory: Record<string, number>;
  recentJobs: ReportJob[];
}

export interface ReportTemplateListResponse {
  templates: ReportTemplate[];
  total: number;
}

export interface ReportJobListResponse {
  jobs: ReportJob[];
  total: number;
}

export interface ScheduledReportListResponse {
  reports: ScheduledReport[];
  total: number;
}

export interface ReportTemplateQueryParams {
  category?: ReportCategory;
  dataSource?: DataSource;
  isSystem?: boolean;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ReportJobQueryParams {
  templateId?: string;
  status?: ReportJobStatus;
  format?: ReportFormat;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ScheduledReportQueryParams {
  templateId?: string;
  frequency?: Frequency;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateReportTemplateInput {
  name: string;
  description?: string;
  category: ReportCategory;
  reportType: ReportType;
  dataSource: DataSource;
  columns: ColumnDefinition[];
  filters?: FilterOption[];
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: string;
  aggregations?: AggregationDefinition[];
  chartType?: ChartType;
  chartConfig?: Record<string, any>;
  orientation?: string;
  pageSize?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export interface UpdateReportTemplateInput {
  name?: string;
  description?: string;
  category?: ReportCategory;
  reportType?: ReportType;
  columns?: ColumnDefinition[];
  filters?: FilterOption[];
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: string;
  aggregations?: AggregationDefinition[];
  chartType?: ChartType;
  chartConfig?: Record<string, any>;
  orientation?: string;
  pageSize?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  isActive?: boolean;
}

export interface GenerateReportInput {
  templateId?: string;
  name: string;
  description?: string;
  dataSource: DataSource;
  columns: ColumnDefinition[];
  filters?: Record<string, any>;
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: string;
  aggregations?: AggregationDefinition[];
  dateRange?: { startDate?: string; endDate?: string };
  format?: ReportFormat;
  orientation?: string;
  pageSize?: string;
}

export interface GenerateFromTemplateInput {
  templateId: string;
  filters?: Record<string, any>;
  dateRange?: { startDate?: string; endDate?: string };
  format?: ReportFormat;
}

export interface CreateScheduledReportInput {
  templateId: string;
  name: string;
  description?: string;
  frequency: Frequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfYear?: number;
  time: string;
  timezone?: string;
  filters?: Record<string, any>;
  dateRangeType?: string;
  dateRangeValue?: Record<string, any>;
  format?: ReportFormat;
  deliveryMethod?: string;
  recipients?: string[];
  emailSubject?: string;
  emailBody?: string;
}

export interface UpdateScheduledReportInput {
  name?: string;
  description?: string;
  frequency?: Frequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfYear?: number;
  time?: string;
  timezone?: string;
  filters?: Record<string, any>;
  dateRangeType?: string;
  dateRangeValue?: Record<string, any>;
  format?: ReportFormat;
  deliveryMethod?: string;
  recipients?: string[];
  emailSubject?: string;
  emailBody?: string;
  isActive?: boolean;
}

export interface QuickReportParams {
  departmentId?: string;
  semester?: number;
  status?: string;
  feeType?: string;
  examId?: string;
  startDate?: string;
  endDate?: string;
  format?: ReportFormat;
}

export { ApiError };
