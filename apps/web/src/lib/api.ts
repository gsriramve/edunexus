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

// Store for auth context - set by useAuthenticatedApi hook
let authContext: {
  userId?: string;
  role?: string;
  tenantId?: string | null;
  name?: string;
} | null = null;

export function setAuthContext(context: typeof authContext) {
  authContext = context;
}

export function getAuthContext() {
  return authContext;
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, tenantId } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth headers from context
  if (authContext) {
    if (authContext.userId) {
      requestHeaders['x-user-id'] = authContext.userId;
    }
    if (authContext.role) {
      requestHeaders['x-user-role'] = authContext.role;
    }
    if (authContext.name) {
      requestHeaders['x-user-name'] = authContext.name;
    }
    if (authContext.tenantId) {
      requestHeaders['x-user-tenant-id'] = authContext.tenantId;
    }
  }

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

  getByDomain: (domain: string) => api<Tenant>(`/tenants/domain/${domain}`),

  updateSettings: (
    id: string,
    settings: {
      displayName?: string;
      logo?: string;
      theme?: {
        primaryColor?: string;
        secondaryColor?: string;
      };
      config?: Record<string, any>;
    },
  ) => api<Tenant>(`/tenants/${id}/settings`, { method: 'PATCH', body: settings }),
};

// Platform API (Super Admin)
export interface PlatformTenant {
  id: string;
  name: string;
  domain: string;
  displayName: string;
  logo?: string;
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  trialEndsAt?: string;
  activatedAt?: string;
  suspendedAt?: string;
  subscription?: {
    plan: string;
    studentCount: number;
    amount: string;
  };
  principal?: {
    id: string;
    email: string;
    name: string;
    status: string;
  };
  pendingInvitation?: {
    id: string;
    email: string;
    expiresAt: string;
  };
  trialDaysRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  tenants: {
    total: number;
    trial: number;
    active: number;
    suspended: number;
    expiringTrials: number;
  };
  users: {
    total: number;
    students: number;
  };
  invitations: {
    pending: number;
  };
  activity: {
    last24Hours: number;
  };
}

export interface PlatformAuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  performedBy: string;
  performedByEmail?: string;
  performedByName?: string;
  details?: Record<string, unknown>;
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    displayName: string;
  };
  createdAt: string;
}

export interface CreatePlatformTenantInput {
  name: string;
  domain: string;
  displayName: string;
  logo?: string;
  principalEmail?: string;
  principalName?: string;
  trialDays?: number;
}

export interface InvitePrincipalInput {
  email: string;
  name?: string;
  message?: string;
}

export interface ExtendTrialInput {
  days?: number;
}

export interface TenantStatusInput {
  reason?: string;
}

export interface PlatformAuditLogQueryParams {
  action?: string;
  targetType?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TenantQueryParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const platformApi = {
  // Statistics
  getStats: () => api<PlatformStats>('/platform/stats'),

  // Tenant Management
  listTenants: (params?: TenantQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api<{
      tenants: PlatformTenant[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/platform/tenants${query ? `?${query}` : ''}`);
  },

  getTenant: (id: string) => api<PlatformTenant>(`/platform/tenants/${id}`),

  createTenant: (data: CreatePlatformTenantInput) =>
    api<PlatformTenant>('/platform/tenants', { method: 'POST', body: data }),

  extendTrial: (id: string, data: ExtendTrialInput) =>
    api<PlatformTenant>(`/platform/tenants/${id}/extend-trial`, { method: 'PATCH', body: data }),

  activateTenant: (id: string, data?: TenantStatusInput) =>
    api<PlatformTenant>(`/platform/tenants/${id}/activate`, { method: 'PATCH', body: data || {} }),

  suspendTenant: (id: string, data?: TenantStatusInput) =>
    api<PlatformTenant>(`/platform/tenants/${id}/suspend`, { method: 'PATCH', body: data || {} }),

  reactivateTenant: (id: string, data?: TenantStatusInput) =>
    api<PlatformTenant>(`/platform/tenants/${id}/reactivate`, { method: 'PATCH', body: data || {} }),

  // Invitation Management
  invitePrincipal: (tenantId: string, data: InvitePrincipalInput) =>
    api<{ id: string; email: string; expiresAt: string }>(
      `/platform/tenants/${tenantId}/invite-principal`,
      { method: 'POST', body: data }
    ),

  resendInvitation: (invitationId: string, message?: string) =>
    api<{ id: string; email: string; expiresAt: string }>(
      `/platform/invitations/${invitationId}/resend`,
      { method: 'POST', body: { message } }
    ),

  cancelInvitation: (invitationId: string) =>
    api<{ id: string; status: string }>(
      `/platform/invitations/${invitationId}`,
      { method: 'DELETE' }
    ),

  // Audit Logs
  getAuditLogs: (params?: PlatformAuditLogQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.action) searchParams.set('action', params.action);
    if (params?.targetType) searchParams.set('targetType', params.targetType);
    if (params?.targetId) searchParams.set('targetId', params.targetId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api<{
      logs: PlatformAuditLog[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/platform/audit-logs${query ? `?${query}` : ''}`);
  },

  getTenantAuditLogs: (tenantId: string, params?: PlatformAuditLogQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.action) searchParams.set('action', params.action);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api<{
      logs: PlatformAuditLog[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/platform/tenants/${tenantId}/audit-logs${query ? `?${query}` : ''}`);
  },
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

// Profile sub-types
export interface UserAddress {
  id: string;
  type: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface UserContact {
  id: string;
  type: string;
  value: string;
  isPrimary: boolean;
}

export interface UserDocument {
  id: string;
  type: string;
  fileUrl: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface Parent {
  id: string;
  relation: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profile?: {
      photoUrl?: string;
      contacts?: UserContact[];
    };
  };
}

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
      addresses?: UserAddress[];
      contacts?: UserContact[];
      documents?: UserDocument[];
      emergency?: EmergencyContact[];
    } | null;
  };
  department: {
    id: string;
    name: string;
    code: string;
  };
  parent?: Parent[];
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

// =============================================================================
// PUSH NOTIFICATIONS API
// =============================================================================

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  clickAction?: string;
  data?: Record<string, string>;
}

export interface DeviceTokenInput {
  userId: string;
  tenantId: string;
  token: string;
  deviceType?: string;
  deviceName?: string;
  deviceModel?: string;
  appVersion?: string;
}

export interface PushResult {
  success: boolean;
  messageId?: string;
  failedTokens?: string[];
  error?: string;
}

export const pushNotificationsApi = {
  // Device token management
  registerToken: (tenantId: string, data: DeviceTokenInput) =>
    api<{ success: boolean; tokenId?: string }>('/notifications/push/register-token', {
      method: 'POST',
      body: data,
      tenantId,
    }),

  unregisterToken: (token: string) =>
    api<{ success: boolean }>('/notifications/push/unregister-token', {
      method: 'DELETE',
      body: { token },
    }),

  // Send push notifications
  send: (tenantId: string, userId: string, notification: PushNotificationPayload) =>
    api<PushResult>('/notifications/push', {
      method: 'POST',
      body: { userId, tenantId, notification },
      tenantId,
    }),

  sendBulk: (tenantId: string, userIds: string[], notification: PushNotificationPayload) =>
    api<PushResult>('/notifications/push/bulk', {
      method: 'POST',
      body: { userIds, tenantId, notification },
      tenantId,
    }),

  // Convenience methods
  sendPaymentSuccess: (
    tenantId: string,
    userId: string,
    studentName: string,
    amount: number,
    receiptNumber: string,
  ) =>
    api<PushResult>('/notifications/push/payment-success', {
      method: 'POST',
      body: { userId, tenantId, studentName, amount, receiptNumber },
      tenantId,
    }),

  sendFeeReminder: (
    tenantId: string,
    userId: string,
    studentName: string,
    amount: number,
    dueDate: string,
  ) =>
    api<PushResult>('/notifications/push/fee-reminder', {
      method: 'POST',
      body: { userId, tenantId, studentName, amount, dueDate },
      tenantId,
    }),

  sendFeeOverdue: (tenantId: string, userId: string, studentName: string, amount: number) =>
    api<PushResult>('/notifications/push/fee-overdue', {
      method: 'POST',
      body: { userId, tenantId, studentName, amount },
      tenantId,
    }),

  sendAttendanceAlert: (
    tenantId: string,
    userId: string,
    studentName: string,
    percentage: number,
  ) =>
    api<PushResult>('/notifications/push/attendance-alert', {
      method: 'POST',
      body: { userId, tenantId, studentName, percentage },
      tenantId,
    }),

  sendExamResult: (tenantId: string, userId: string, examName: string, subjectName: string) =>
    api<PushResult>('/notifications/push/exam-result', {
      method: 'POST',
      body: { userId, tenantId, examName, subjectName },
      tenantId,
    }),

  sendAnnouncement: (tenantId: string, userIds: string[], title: string, message: string) =>
    api<PushResult>('/notifications/push/announcement', {
      method: 'POST',
      body: { userIds, tenantId, title, message },
      tenantId,
    }),

  // Test push notification
  sendTest: (tenantId: string, userId: string) =>
    api<PushResult>('/notifications/test/push', {
      method: 'POST',
      body: { userId, tenantId },
      tenantId,
    }),
};

// =============================================================================
// TRANSPORT API
// =============================================================================

export interface TransportRoute {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  type: 'morning' | 'evening' | 'both';
  isActive: boolean;
  startLocation?: string;
  endLocation?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  vehicleId?: string;
  vehicle?: TransportVehicle;
  stops?: TransportStop[];
  _count?: { stops: number; passes: number };
  createdAt: string;
  updatedAt: string;
}

export interface TransportStop {
  id: string;
  tenantId: string;
  routeId: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  stopOrder: number;
  pickupTime?: string;
  dropTime?: string;
  landmark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportVehicle {
  id: string;
  tenantId: string;
  vehicleNumber: string;
  type: 'bus' | 'van' | 'minibus';
  capacity: number;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  permitExpiry?: string;
  driverName?: string;
  driverPhone?: string;
  driverLicenseNumber?: string;
  conductorName?: string;
  conductorPhone?: string;
  isActive: boolean;
  currentRouteId?: string;
  currentRoute?: TransportRoute;
  gpsDeviceId?: string;
  lastLatitude?: number;
  lastLongitude?: number;
  lastLocationUpdate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportPass {
  id: string;
  tenantId: string;
  studentId: string;
  student?: { id: string; user: { firstName: string; lastName: string }; rollNo: string };
  routeId: string;
  route?: TransportRoute;
  boardingStopId?: string;
  boardingStop?: TransportStop;
  dropStopId?: string;
  dropStop?: TransportStop;
  passType: 'monthly' | 'quarterly' | 'yearly' | 'one_way';
  validFrom: string;
  validTo: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  paymentStatus: 'paid' | 'pending' | 'partial';
  createdAt: string;
  updatedAt: string;
}

export interface TransportTracking {
  id: string;
  tenantId: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;
  createdAt: string;
}

export interface TransportStats {
  totalRoutes: number;
  activeRoutes: number;
  totalVehicles: number;
  activeVehicles: number;
  totalPasses: number;
  activePasses: number;
  totalStops: number;
  monthlyRevenue?: number;
}

export interface RouteQueryParams {
  search?: string;
  type?: 'morning' | 'evening' | 'both';
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface VehicleQueryParams {
  search?: string;
  type?: 'bus' | 'van' | 'minibus';
  isActive?: boolean;
  hasRoute?: boolean;
  limit?: number;
  offset?: number;
}

export interface PassQueryParams {
  search?: string;
  studentId?: string;
  routeId?: string;
  status?: 'active' | 'expired' | 'cancelled' | 'pending';
  paymentStatus?: 'paid' | 'pending' | 'partial';
  limit?: number;
  offset?: number;
}

export interface CreateRouteInput {
  name: string;
  code: string;
  description?: string;
  type: 'morning' | 'evening' | 'both';
  isActive?: boolean;
  startLocation?: string;
  endLocation?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  vehicleId?: string;
}

export interface UpdateRouteInput {
  name?: string;
  description?: string;
  type?: 'morning' | 'evening' | 'both';
  isActive?: boolean;
  startLocation?: string;
  endLocation?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  vehicleId?: string;
}

export interface CreateStopInput {
  routeId: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  stopOrder: number;
  pickupTime?: string;
  dropTime?: string;
  landmark?: string;
}

export interface CreateVehicleInput {
  vehicleNumber: string;
  type: 'bus' | 'van' | 'minibus';
  capacity: number;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  permitExpiry?: string;
  driverName?: string;
  driverPhone?: string;
  driverLicenseNumber?: string;
  conductorName?: string;
  conductorPhone?: string;
  isActive?: boolean;
  gpsDeviceId?: string;
}

export interface CreatePassInput {
  studentId: string;
  routeId: string;
  boardingStopId?: string;
  dropStopId?: string;
  passType: 'monthly' | 'quarterly' | 'yearly' | 'one_way';
  validFrom: string;
  validTo: string;
  amount: number;
  paymentStatus?: 'paid' | 'pending' | 'partial';
}

export const transportApi = {
  // Routes
  listRoutes: (tenantId: string, params?: RouteQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: TransportRoute[]; total: number }>(`/transport/routes${query ? `?${query}` : ''}`, { tenantId });
  },

  getRoute: (tenantId: string, id: string) =>
    api<TransportRoute>(`/transport/routes/${id}`, { tenantId }),

  createRoute: (tenantId: string, data: CreateRouteInput) =>
    api<TransportRoute>('/transport/routes', { method: 'POST', body: data, tenantId }),

  updateRoute: (tenantId: string, id: string, data: UpdateRouteInput) =>
    api<TransportRoute>(`/transport/routes/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteRoute: (tenantId: string, id: string) =>
    api<void>(`/transport/routes/${id}`, { method: 'DELETE', tenantId }),

  // Stops
  getRouteStops: (tenantId: string, routeId: string) =>
    api<TransportStop[]>(`/transport/routes/${routeId}/stops`, { tenantId }),

  createStop: (tenantId: string, data: CreateStopInput) =>
    api<TransportStop>('/transport/stops', { method: 'POST', body: data, tenantId }),

  bulkCreateStops: (tenantId: string, routeId: string, stops: Omit<CreateStopInput, 'routeId'>[]) =>
    api<TransportStop[]>('/transport/stops/bulk', { method: 'POST', body: { routeId, stops }, tenantId }),

  updateStop: (tenantId: string, id: string, data: Partial<CreateStopInput>) =>
    api<TransportStop>(`/transport/stops/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteStop: (tenantId: string, id: string) =>
    api<void>(`/transport/stops/${id}`, { method: 'DELETE', tenantId }),

  // Vehicles
  listVehicles: (tenantId: string, params?: VehicleQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params?.hasRoute !== undefined) searchParams.set('hasRoute', params.hasRoute.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: TransportVehicle[]; total: number }>(`/transport/vehicles${query ? `?${query}` : ''}`, { tenantId });
  },

  getVehicle: (tenantId: string, id: string) =>
    api<TransportVehicle>(`/transport/vehicles/${id}`, { tenantId }),

  getAllVehicleLocations: (tenantId: string) =>
    api<Array<{ vehicleId: string; latitude: number; longitude: number; updatedAt: string }>>('/transport/vehicles/locations', { tenantId }),

  createVehicle: (tenantId: string, data: CreateVehicleInput) =>
    api<TransportVehicle>('/transport/vehicles', { method: 'POST', body: data, tenantId }),

  updateVehicle: (tenantId: string, id: string, data: Partial<CreateVehicleInput>) =>
    api<TransportVehicle>(`/transport/vehicles/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteVehicle: (tenantId: string, id: string) =>
    api<void>(`/transport/vehicles/${id}`, { method: 'DELETE', tenantId }),

  // Passes
  listPasses: (tenantId: string, params?: PassQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.routeId) searchParams.set('routeId', params.routeId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.paymentStatus) searchParams.set('paymentStatus', params.paymentStatus);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: TransportPass[]; total: number }>(`/transport/passes${query ? `?${query}` : ''}`, { tenantId });
  },

  getPass: (tenantId: string, id: string) =>
    api<TransportPass>(`/transport/passes/${id}`, { tenantId }),

  getStudentPass: (tenantId: string, studentId: string) =>
    api<TransportPass>(`/transport/passes/student/${studentId}`, { tenantId }),

  createPass: (tenantId: string, data: CreatePassInput) =>
    api<TransportPass>('/transport/passes', { method: 'POST', body: data, tenantId }),

  updatePass: (tenantId: string, id: string, data: Partial<CreatePassInput>) =>
    api<TransportPass>(`/transport/passes/${id}`, { method: 'PATCH', body: data, tenantId }),

  cancelPass: (tenantId: string, id: string) =>
    api<TransportPass>(`/transport/passes/${id}/cancel`, { method: 'PATCH', tenantId }),

  // Tracking
  getLatestTracking: (tenantId: string, vehicleId: string) =>
    api<TransportTracking>(`/transport/tracking/vehicle/${vehicleId}`, { tenantId }),

  getTrackingHistory: (tenantId: string, vehicleId: string, params?: { from?: string; to?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('vehicleId', vehicleId);
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    return api<TransportTracking[]>(`/transport/tracking/history?${searchParams.toString()}`, { tenantId });
  },

  createTracking: (tenantId: string, data: { vehicleId: string; latitude: number; longitude: number; speed?: number; heading?: number }) =>
    api<TransportTracking>('/transport/tracking', { method: 'POST', body: data, tenantId }),

  // Stats
  getStats: (tenantId: string) =>
    api<TransportStats>('/transport/stats', { tenantId }),
};

// =============================================================================
// HOSTEL API
// =============================================================================

export interface HostelBlock {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  type: 'boys' | 'girls' | 'mixed';
  totalFloors: number;
  wardenName?: string;
  wardenPhone?: string;
  wardenEmail?: string;
  isActive: boolean;
  address?: string;
  amenities?: string[];
  _count?: { rooms: number; allocations: number };
  createdAt: string;
  updatedAt: string;
}

export interface HostelRoom {
  id: string;
  tenantId: string;
  blockId: string;
  block?: HostelBlock;
  roomNumber: string;
  floor: number;
  type: 'single' | 'double' | 'triple' | 'dormitory';
  capacity: number;
  occupancy: number;
  monthlyRent: number;
  isAvailable: boolean;
  amenities?: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  _count?: { allocations: number };
  createdAt: string;
  updatedAt: string;
}

export interface HostelAllocation {
  id: string;
  tenantId: string;
  studentId: string;
  student?: { id: string; user: { firstName: string; lastName: string }; rollNo: string };
  roomId: string;
  room?: HostelRoom;
  bedNumber?: string;
  allocatedDate: string;
  vacatedDate?: string;
  status: 'active' | 'vacated' | 'transferred';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostelFee {
  id: string;
  tenantId: string;
  studentId: string;
  student?: { id: string; user: { firstName: string; lastName: string }; rollNo: string };
  allocationId?: string;
  feeType: 'rent' | 'mess' | 'deposit' | 'maintenance' | 'other';
  amount: number;
  month?: number;
  year?: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paymentMethod?: string;
  transactionId?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessMenu {
  id: string;
  tenantId: string;
  blockId?: string;
  block?: HostelBlock;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  items: string[];
  timingFrom?: string;
  timingTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HostelComplaint {
  id: string;
  tenantId: string;
  studentId: string;
  student?: { id: string; user: { firstName: string; lastName: string }; rollNo: string };
  roomId?: string;
  room?: HostelRoom;
  category: 'maintenance' | 'cleanliness' | 'food' | 'security' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolvedAt?: string;
  feedback?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HostelStats {
  totalBlocks: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalCapacity: number;
  currentOccupancy: number;
  occupancyRate: number;
  activeAllocations: number;
  pendingComplaints: number;
  monthlyRevenue?: number;
}

export interface BlockQueryParams {
  search?: string;
  type?: 'boys' | 'girls' | 'mixed';
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface RoomQueryParams {
  search?: string;
  blockId?: string;
  floor?: number;
  type?: 'single' | 'double' | 'triple' | 'dormitory';
  status?: 'available' | 'occupied' | 'maintenance' | 'reserved';
  isAvailable?: boolean;
  limit?: number;
  offset?: number;
}

export interface AllocationQueryParams {
  search?: string;
  blockId?: string;
  roomId?: string;
  status?: 'active' | 'vacated' | 'transferred';
  limit?: number;
  offset?: number;
}

export interface HostelFeeQueryParams {
  studentId?: string;
  feeType?: 'rent' | 'mess' | 'deposit' | 'maintenance' | 'other';
  status?: 'pending' | 'paid' | 'overdue' | 'waived';
  month?: number;
  year?: number;
  limit?: number;
  offset?: number;
}

export interface ComplaintQueryParams {
  studentId?: string;
  roomId?: string;
  blockId?: string;
  category?: 'maintenance' | 'cleanliness' | 'food' | 'security' | 'other';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  limit?: number;
  offset?: number;
}

export interface CreateBlockInput {
  name: string;
  code: string;
  description?: string;
  type: 'boys' | 'girls' | 'mixed';
  totalFloors: number;
  wardenName?: string;
  wardenPhone?: string;
  wardenEmail?: string;
  isActive?: boolean;
  address?: string;
  amenities?: string[];
}

export interface CreateRoomInput {
  blockId: string;
  roomNumber: string;
  floor: number;
  type: 'single' | 'double' | 'triple' | 'dormitory';
  capacity: number;
  monthlyRent: number;
  isAvailable?: boolean;
  amenities?: string[];
}

export interface CreateAllocationInput {
  studentId: string;
  roomId: string;
  bedNumber?: string;
  allocatedDate: string;
  remarks?: string;
}

export interface TransferAllocationInput {
  newRoomId: string;
  newBedNumber?: string;
  reason?: string;
}

export interface CreateHostelFeeInput {
  studentId: string;
  allocationId?: string;
  feeType: 'rent' | 'mess' | 'deposit' | 'maintenance' | 'other';
  amount: number;
  month?: number;
  year?: number;
  dueDate: string;
  remarks?: string;
}

export interface CreateMessMenuInput {
  blockId?: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  items: string[];
  timingFrom?: string;
  timingTo?: string;
  isActive?: boolean;
}

export interface CreateComplaintInput {
  studentId: string;
  roomId?: string;
  category: 'maintenance' | 'cleanliness' | 'food' | 'security' | 'other';
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export const hostelApi = {
  // Blocks
  listBlocks: (tenantId: string, params?: BlockQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: HostelBlock[]; total: number }>(`/hostel/blocks${query ? `?${query}` : ''}`, { tenantId });
  },

  getBlock: (tenantId: string, id: string) =>
    api<HostelBlock>(`/hostel/blocks/${id}`, { tenantId }),

  createBlock: (tenantId: string, data: CreateBlockInput) =>
    api<HostelBlock>('/hostel/blocks', { method: 'POST', body: data, tenantId }),

  updateBlock: (tenantId: string, id: string, data: Partial<CreateBlockInput>) =>
    api<HostelBlock>(`/hostel/blocks/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteBlock: (tenantId: string, id: string) =>
    api<void>(`/hostel/blocks/${id}`, { method: 'DELETE', tenantId }),

  // Rooms
  listRooms: (tenantId: string, params?: RoomQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.blockId) searchParams.set('blockId', params.blockId);
    if (params?.floor !== undefined) searchParams.set('floor', params.floor.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.isAvailable !== undefined) searchParams.set('isAvailable', params.isAvailable.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: HostelRoom[]; total: number }>(`/hostel/rooms${query ? `?${query}` : ''}`, { tenantId });
  },

  getRoom: (tenantId: string, id: string) =>
    api<HostelRoom>(`/hostel/rooms/${id}`, { tenantId }),

  createRoom: (tenantId: string, data: CreateRoomInput) =>
    api<HostelRoom>('/hostel/rooms', { method: 'POST', body: data, tenantId }),

  bulkCreateRooms: (tenantId: string, blockId: string, rooms: Omit<CreateRoomInput, 'blockId'>[]) =>
    api<HostelRoom[]>('/hostel/rooms/bulk', { method: 'POST', body: { blockId, rooms }, tenantId }),

  updateRoom: (tenantId: string, id: string, data: Partial<CreateRoomInput>) =>
    api<HostelRoom>(`/hostel/rooms/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteRoom: (tenantId: string, id: string) =>
    api<void>(`/hostel/rooms/${id}`, { method: 'DELETE', tenantId }),

  // Allocations
  listAllocations: (tenantId: string, params?: AllocationQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.blockId) searchParams.set('blockId', params.blockId);
    if (params?.roomId) searchParams.set('roomId', params.roomId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: HostelAllocation[]; total: number }>(`/hostel/allocations${query ? `?${query}` : ''}`, { tenantId });
  },

  getAllocation: (tenantId: string, id: string) =>
    api<HostelAllocation>(`/hostel/allocations/${id}`, { tenantId }),

  getStudentAllocation: (tenantId: string, studentId: string) =>
    api<HostelAllocation>(`/hostel/allocations/student/${studentId}`, { tenantId }),

  createAllocation: (tenantId: string, data: CreateAllocationInput) =>
    api<HostelAllocation>('/hostel/allocations', { method: 'POST', body: data, tenantId }),

  updateAllocation: (tenantId: string, id: string, data: Partial<CreateAllocationInput>) =>
    api<HostelAllocation>(`/hostel/allocations/${id}`, { method: 'PATCH', body: data, tenantId }),

  transferAllocation: (tenantId: string, id: string, data: TransferAllocationInput) =>
    api<HostelAllocation>(`/hostel/allocations/${id}/transfer`, { method: 'POST', body: data, tenantId }),

  // Hostel Fees
  listHostelFees: (tenantId: string, params?: HostelFeeQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.feeType) searchParams.set('feeType', params.feeType);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.month !== undefined) searchParams.set('month', params.month.toString());
    if (params?.year !== undefined) searchParams.set('year', params.year.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: HostelFee[]; total: number }>(`/hostel/fees${query ? `?${query}` : ''}`, { tenantId });
  },

  getStudentHostelFees: (tenantId: string, studentId: string) =>
    api<HostelFee[]>(`/hostel/fees/student/${studentId}`, { tenantId }),

  createHostelFee: (tenantId: string, data: CreateHostelFeeInput) =>
    api<HostelFee>('/hostel/fees', { method: 'POST', body: data, tenantId }),

  updateHostelFee: (tenantId: string, id: string, data: Partial<CreateHostelFeeInput>) =>
    api<HostelFee>(`/hostel/fees/${id}`, { method: 'PATCH', body: data, tenantId }),

  // Mess Menu
  listMessMenus: (tenantId: string, params?: { blockId?: string; dayOfWeek?: number; mealType?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.blockId) searchParams.set('blockId', params.blockId);
    if (params?.dayOfWeek !== undefined) searchParams.set('dayOfWeek', params.dayOfWeek.toString());
    if (params?.mealType) searchParams.set('mealType', params.mealType);
    const query = searchParams.toString();
    return api<{ data: MessMenu[]; total: number }>(`/hostel/menu${query ? `?${query}` : ''}`, { tenantId });
  },

  getWeeklyMenu: (tenantId: string, blockId?: string) => {
    const query = blockId ? `?blockId=${blockId}` : '';
    return api<MessMenu[]>(`/hostel/menu/weekly${query}`, { tenantId });
  },

  createMessMenu: (tenantId: string, data: CreateMessMenuInput) =>
    api<MessMenu>('/hostel/menu', { method: 'POST', body: data, tenantId }),

  updateMessMenu: (tenantId: string, id: string, data: Partial<CreateMessMenuInput>) =>
    api<MessMenu>(`/hostel/menu/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteMessMenu: (tenantId: string, id: string) =>
    api<void>(`/hostel/menu/${id}`, { method: 'DELETE', tenantId }),

  // Complaints
  listComplaints: (tenantId: string, params?: ComplaintQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.roomId) searchParams.set('roomId', params.roomId);
    if (params?.blockId) searchParams.set('blockId', params.blockId);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: HostelComplaint[]; total: number }>(`/hostel/complaints${query ? `?${query}` : ''}`, { tenantId });
  },

  getComplaint: (tenantId: string, id: string) =>
    api<HostelComplaint>(`/hostel/complaints/${id}`, { tenantId }),

  getStudentComplaints: (tenantId: string, studentId: string) =>
    api<HostelComplaint[]>(`/hostel/complaints/student/${studentId}`, { tenantId }),

  createComplaint: (tenantId: string, data: CreateComplaintInput) =>
    api<HostelComplaint>('/hostel/complaints', { method: 'POST', body: data, tenantId }),

  updateComplaint: (tenantId: string, id: string, data: Partial<CreateComplaintInput> & { status?: string; assignedTo?: string }) =>
    api<HostelComplaint>(`/hostel/complaints/${id}`, { method: 'PATCH', body: data, tenantId }),

  addComplaintFeedback: (tenantId: string, id: string, data: { feedback: string; rating?: number }) =>
    api<HostelComplaint>(`/hostel/complaints/${id}/feedback`, { method: 'POST', body: data, tenantId }),

  // Stats
  getStats: (tenantId: string) =>
    api<HostelStats>('/hostel/stats', { tenantId }),
};

// =============================================================================
// LIBRARY API
// =============================================================================

export interface BookCategory {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  parent?: BookCategory;
  children?: BookCategory[];
  _count?: { books: number };
  createdAt: string;
  updatedAt: string;
}

export interface LibraryBook {
  id: string;
  tenantId: string;
  title: string;
  isbn?: string;
  authors: string[];
  publisher?: string;
  publishYear?: number;
  edition?: string;
  categoryId?: string;
  category?: BookCategory;
  language?: string;
  pages?: number;
  description?: string;
  coverImage?: string;
  location?: string;
  shelfNumber?: string;
  totalCopies: number;
  availableCopies: number;
  price?: number;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryCard {
  id: string;
  tenantId: string;
  cardNumber: string;
  studentId: string;
  student?: { id: string; user: { firstName: string; lastName: string }; rollNo: string };
  issueDate: string;
  expiryDate: string;
  maxBooks: number;
  currentIssued: number;
  status: 'active' | 'expired' | 'suspended' | 'lost';
  finesDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookIssue {
  id: string;
  tenantId: string;
  cardId: string;
  card?: LibraryCard;
  bookId: string;
  book?: LibraryBook;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  renewCount: number;
  maxRenewals: number;
  fineAmount: number;
  finePaid: boolean;
  status: 'issued' | 'returned' | 'overdue' | 'lost';
  remarks?: string;
  issuedBy?: string;
  returnedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookReservation {
  id: string;
  tenantId: string;
  cardId: string;
  card?: LibraryCard;
  bookId: string;
  book?: LibraryBook;
  reservationDate: string;
  expiryDate: string;
  status: 'pending' | 'ready' | 'collected' | 'cancelled' | 'expired';
  notifiedAt?: string;
  collectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EResource {
  id: string;
  tenantId: string;
  title: string;
  type: 'ebook' | 'journal' | 'article' | 'video' | 'audio' | 'other';
  authors?: string[];
  publisher?: string;
  publishYear?: number;
  description?: string;
  url?: string;
  fileUrl?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  categoryId?: string;
  category?: BookCategory;
  accessLevel: 'public' | 'students' | 'faculty' | 'restricted';
  downloadable: boolean;
  viewCount: number;
  downloadCount: number;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LibrarySettings {
  id: string;
  tenantId: string;
  maxBooksPerCard: number;
  defaultLoanDays: number;
  maxRenewals: number;
  renewalDays: number;
  finePerDay: number;
  maxFineAmount: number;
  reservationExpiryDays: number;
  allowOnlineRenewal: boolean;
  allowOnlineReservation: boolean;
  sendDueReminders: boolean;
  reminderDaysBefore: number;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  overdueBooks: number;
  totalCards: number;
  activeCards: number;
  totalReservations: number;
  pendingReservations: number;
  totalEResources: number;
  totalFinesDue: number;
  totalFinesCollected: number;
}

export interface BookQueryParams {
  search?: string;
  categoryId?: string;
  author?: string;
  publisher?: string;
  language?: string;
  availableOnly?: boolean;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface CardQueryParams {
  search?: string;
  status?: 'active' | 'expired' | 'suspended' | 'lost';
  hasFines?: boolean;
  limit?: number;
  offset?: number;
}

export interface IssueQueryParams {
  cardId?: string;
  bookId?: string;
  status?: 'issued' | 'returned' | 'overdue' | 'lost';
  overdueOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface ReservationQueryParams {
  cardId?: string;
  bookId?: string;
  status?: 'pending' | 'ready' | 'collected' | 'cancelled' | 'expired';
  limit?: number;
  offset?: number;
}

export interface EResourceQueryParams {
  search?: string;
  type?: 'ebook' | 'journal' | 'article' | 'video' | 'audio' | 'other';
  categoryId?: string;
  accessLevel?: 'public' | 'students' | 'faculty' | 'restricted';
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateCategoryInput {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
}

export interface CreateBookInput {
  title: string;
  isbn?: string;
  authors: string[];
  publisher?: string;
  publishYear?: number;
  edition?: string;
  categoryId?: string;
  language?: string;
  pages?: number;
  description?: string;
  coverImage?: string;
  location?: string;
  shelfNumber?: string;
  totalCopies: number;
  price?: number;
  tags?: string[];
  isActive?: boolean;
}

export interface CreateCardInput {
  cardNumber: string;
  studentId: string;
  issueDate: string;
  expiryDate: string;
  maxBooks?: number;
}

export interface IssueBookInput {
  cardId: string;
  bookId: string;
  dueDate?: string;
  remarks?: string;
  issuedBy?: string;
}

export interface ReturnBookInput {
  returnedBy?: string;
  fineAmount?: number;
  finePaid?: boolean;
  remarks?: string;
}

export interface RenewBookInput {
  newDueDate?: string;
  remarks?: string;
}

export interface CreateReservationInput {
  cardId: string;
  bookId: string;
}

export interface CreateEResourceInput {
  title: string;
  type: 'ebook' | 'journal' | 'article' | 'video' | 'audio' | 'other';
  authors?: string[];
  publisher?: string;
  publishYear?: number;
  description?: string;
  url?: string;
  fileUrl?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  categoryId?: string;
  accessLevel?: 'public' | 'students' | 'faculty' | 'restricted';
  downloadable?: boolean;
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateSettingsInput {
  maxBooksPerCard?: number;
  defaultLoanDays?: number;
  maxRenewals?: number;
  renewalDays?: number;
  finePerDay?: number;
  maxFineAmount?: number;
  reservationExpiryDays?: number;
  allowOnlineRenewal?: boolean;
  allowOnlineReservation?: boolean;
  sendDueReminders?: boolean;
  reminderDaysBefore?: number;
}

export const libraryApi = {
  // Categories
  listCategories: (tenantId: string) =>
    api<BookCategory[]>('/library/categories', { tenantId }),

  getCategory: (tenantId: string, id: string) =>
    api<BookCategory>(`/library/categories/${id}`, { tenantId }),

  createCategory: (tenantId: string, data: CreateCategoryInput) =>
    api<BookCategory>('/library/categories', { method: 'POST', body: data, tenantId }),

  updateCategory: (tenantId: string, id: string, data: Partial<CreateCategoryInput>) =>
    api<BookCategory>(`/library/categories/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteCategory: (tenantId: string, id: string) =>
    api<void>(`/library/categories/${id}`, { method: 'DELETE', tenantId }),

  // Books
  listBooks: (tenantId: string, params?: BookQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.author) searchParams.set('author', params.author);
    if (params?.publisher) searchParams.set('publisher', params.publisher);
    if (params?.language) searchParams.set('language', params.language);
    if (params?.availableOnly) searchParams.set('availableOnly', 'true');
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: LibraryBook[]; total: number }>(`/library/books${query ? `?${query}` : ''}`, { tenantId });
  },

  getBook: (tenantId: string, id: string) =>
    api<LibraryBook>(`/library/books/${id}`, { tenantId }),

  createBook: (tenantId: string, data: CreateBookInput) =>
    api<LibraryBook>('/library/books', { method: 'POST', body: data, tenantId }),

  updateBook: (tenantId: string, id: string, data: Partial<CreateBookInput>) =>
    api<LibraryBook>(`/library/books/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteBook: (tenantId: string, id: string) =>
    api<void>(`/library/books/${id}`, { method: 'DELETE', tenantId }),

  // Cards
  listCards: (tenantId: string, params?: CardQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.hasFines) searchParams.set('hasFines', 'true');
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: LibraryCard[]; total: number }>(`/library/cards${query ? `?${query}` : ''}`, { tenantId });
  },

  getCard: (tenantId: string, id: string) =>
    api<LibraryCard>(`/library/cards/${id}`, { tenantId }),

  getStudentCard: (tenantId: string, studentId: string) =>
    api<LibraryCard>(`/library/cards/student/${studentId}`, { tenantId }),

  createCard: (tenantId: string, data: CreateCardInput) =>
    api<LibraryCard>('/library/cards', { method: 'POST', body: data, tenantId }),

  updateCard: (tenantId: string, id: string, data: Partial<CreateCardInput> & { status?: string; maxBooks?: number }) =>
    api<LibraryCard>(`/library/cards/${id}`, { method: 'PATCH', body: data, tenantId }),

  // Issues
  listIssues: (tenantId: string, params?: IssueQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.cardId) searchParams.set('cardId', params.cardId);
    if (params?.bookId) searchParams.set('bookId', params.bookId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.overdueOnly) searchParams.set('overdueOnly', 'true');
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: BookIssue[]; total: number }>(`/library/issues${query ? `?${query}` : ''}`, { tenantId });
  },

  getIssue: (tenantId: string, id: string) =>
    api<BookIssue>(`/library/issues/${id}`, { tenantId }),

  getCardIssues: (tenantId: string, cardId: string) =>
    api<BookIssue[]>(`/library/issues/card/${cardId}`, { tenantId }),

  issueBook: (tenantId: string, data: IssueBookInput) =>
    api<BookIssue>('/library/issues', { method: 'POST', body: data, tenantId }),

  returnBook: (tenantId: string, id: string, data?: ReturnBookInput) =>
    api<BookIssue>(`/library/issues/${id}/return`, { method: 'POST', body: data || {}, tenantId }),

  renewBook: (tenantId: string, id: string, data?: RenewBookInput) =>
    api<BookIssue>(`/library/issues/${id}/renew`, { method: 'POST', body: data || {}, tenantId }),

  // Reservations
  listReservations: (tenantId: string, params?: ReservationQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.cardId) searchParams.set('cardId', params.cardId);
    if (params?.bookId) searchParams.set('bookId', params.bookId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: BookReservation[]; total: number }>(`/library/reservations${query ? `?${query}` : ''}`, { tenantId });
  },

  getReservation: (tenantId: string, id: string) =>
    api<BookReservation>(`/library/reservations/${id}`, { tenantId }),

  createReservation: (tenantId: string, data: CreateReservationInput) =>
    api<BookReservation>('/library/reservations', { method: 'POST', body: data, tenantId }),

  cancelReservation: (tenantId: string, id: string) =>
    api<BookReservation>(`/library/reservations/${id}/cancel`, { method: 'POST', tenantId }),

  collectReservation: (tenantId: string, id: string) =>
    api<BookReservation>(`/library/reservations/${id}/collect`, { method: 'POST', tenantId }),

  // E-Resources
  listEResources: (tenantId: string, params?: EResourceQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.accessLevel) searchParams.set('accessLevel', params.accessLevel);
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: EResource[]; total: number }>(`/library/e-resources${query ? `?${query}` : ''}`, { tenantId });
  },

  getEResource: (tenantId: string, id: string) =>
    api<EResource>(`/library/e-resources/${id}`, { tenantId }),

  createEResource: (tenantId: string, data: CreateEResourceInput) =>
    api<EResource>('/library/e-resources', { method: 'POST', body: data, tenantId }),

  updateEResource: (tenantId: string, id: string, data: Partial<CreateEResourceInput>) =>
    api<EResource>(`/library/e-resources/${id}`, { method: 'PATCH', body: data, tenantId }),

  deleteEResource: (tenantId: string, id: string) =>
    api<void>(`/library/e-resources/${id}`, { method: 'DELETE', tenantId }),

  recordView: (tenantId: string, id: string) =>
    api<{ viewCount: number }>(`/library/e-resources/${id}/view`, { method: 'POST', tenantId }),

  recordDownload: (tenantId: string, id: string) =>
    api<{ downloadCount: number }>(`/library/e-resources/${id}/download`, { method: 'POST', tenantId }),

  // Settings
  getSettings: (tenantId: string) =>
    api<LibrarySettings>('/library/settings', { tenantId }),

  updateSettings: (tenantId: string, data: UpdateSettingsInput) =>
    api<LibrarySettings>('/library/settings', { method: 'PATCH', body: data, tenantId }),

  // Stats
  getStats: (tenantId: string) =>
    api<LibraryStats>('/library/stats', { tenantId }),
};

// ========================
// PARENTS API
// ========================

// Types for Parent module
export interface ParentChild {
  id: string;
  tenantId: string;
  userId: string | null;
  rollNo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  admissionDate?: string | null;
  currentSemester?: number | null;
  enrollmentStatus: string;
  profileImageUrl?: string | null;
  departmentId?: string | null;
  courseId?: string | null;
  batchId?: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
  course?: {
    id: string;
    name: string;
    code: string;
  } | null;
  batch?: {
    id: string;
    name: string;
    startYear: number;
    endYear: number;
  } | null;
  relation: string; // father, mother, guardian
  parentId: string; // The Parent record ID
}

export interface ParentProfile {
  id: string;
  tenantId: string;
  userId: string;
  studentId: string;
  relation: string;
  createdAt: string;
  updatedAt: string;
  student: ParentChild;
}

export const parentsApi = {
  // Get all children linked to a parent user
  getChildren: (tenantId: string, userId: string) =>
    api<ParentChild[]>(`/parents/children/${userId}`, { tenantId }),

  // Get parent profile by user ID
  getProfile: (tenantId: string, userId: string) =>
    api<ParentProfile[]>(`/parents/profile/${userId}`, { tenantId }),

  // Get a specific child's details (validates parent has access)
  getChild: (tenantId: string, userId: string, studentId: string) =>
    api<ParentChild>(`/parents/children/${userId}/${studentId}`, { tenantId }),
};

// ========================
// INVITATIONS API
// ========================

// Types for Invitations module
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';
export type InvitationRole = 'platform_owner' | 'principal' | 'hod' | 'admin_staff' | 'teacher' | 'lab_assistant' | 'student' | 'parent';

export interface Invitation {
  id: string;
  tenantId: string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  token: string;
  message?: string | null;
  expiresAt: string;
  acceptedAt?: string | null;
  invitedBy: string;
  invitedByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationStats {
  totalInvitations: number;
  pendingCount: number;
  acceptedCount: number;
  expiredCount: number;
  cancelledCount: number;
  acceptedThisMonth: number;
  byRole: Record<string, number>;
}

export interface InvitationQueryParams {
  status?: InvitationStatus;
  role?: InvitationRole;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateInvitationInput {
  email: string;
  role: InvitationRole;
  message?: string;
  expiresAt?: string;
}

export interface ResendInvitationInput {
  message?: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  invitation?: {
    email: string;
    role: InvitationRole;
    tenantId: string;
    tenantName?: string;
  };
  error?: string;
}

export const invitationsApi = {
  // List all invitations
  list: (tenantId: string, params?: InvitationQueryParams) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.role) query.append('role', params.role);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const queryString = query.toString();
    return api<{ data: Invitation[]; total: number; page: number; limit: number }>(
      `/invitations${queryString ? `?${queryString}` : ''}`,
      { tenantId }
    );
  },

  // Get a single invitation
  get: (tenantId: string, id: string) =>
    api<Invitation>(`/invitations/${id}`, { tenantId }),

  // Get invitation statistics
  getStats: (tenantId: string) =>
    api<InvitationStats>('/invitations/stats', { tenantId }),

  // Create a new invitation
  create: (tenantId: string, data: CreateInvitationInput) =>
    api<Invitation>('/invitations', { method: 'POST', body: data, tenantId }),

  // Resend an invitation
  resend: (tenantId: string, id: string, data?: ResendInvitationInput) =>
    api<Invitation>(`/invitations/${id}/resend`, { method: 'POST', body: data || {}, tenantId }),

  // Cancel an invitation
  cancel: (tenantId: string, id: string) =>
    api<void>(`/invitations/${id}`, { method: 'DELETE', tenantId }),

  // Validate invitation token (public, no tenant ID needed)
  validateToken: (token: string) =>
    api<ValidateTokenResponse>(`/invitations/validate/${token}`),
};

// ==================== Attendance API ====================
// Note: Backend attendance module needs to be implemented

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface StudentAttendance {
  id: string;
  tenantId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    rollNo: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface AttendanceListParams {
  studentId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: AttendanceStatus;
  subjectId?: string;
  limit?: number;
  offset?: number;
}

export interface AttendanceListResponse {
  data: StudentAttendance[];
  total: number;
}

export interface MarkAttendanceInput {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BulkMarkAttendanceInput {
  date: string;
  subjectId?: string;
  attendance: Array<{
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }>;
}

export interface SubjectAttendance {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export const attendanceApi = {
  // Get attendance records
  list: (tenantId: string, params?: AttendanceListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    if (params?.date) searchParams.set('date', params.date);
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.subjectId) searchParams.set('subjectId', params.subjectId);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<AttendanceListResponse>(`/attendance${query ? `?${query}` : ''}`, { tenantId });
  },

  // Get attendance for a specific student
  getStudentAttendance: (tenantId: string, studentId: string, params?: { fromDate?: string; toDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    const query = searchParams.toString();
    return api<AttendanceListResponse>(`/attendance/student/${studentId}${query ? `?${query}` : ''}`, { tenantId });
  },

  // Get attendance statistics for a student
  getStudentStats: (tenantId: string, studentId: string, params?: { fromDate?: string; toDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    const query = searchParams.toString();
    return api<AttendanceStats>(`/attendance/student/${studentId}/stats${query ? `?${query}` : ''}`, { tenantId });
  },

  // Get subject-wise attendance for a student
  getStudentSubjectAttendance: (tenantId: string, studentId: string) =>
    api<SubjectAttendance[]>(`/attendance/student/${studentId}/subjects`, { tenantId }),

  // Mark attendance for a single student
  mark: (tenantId: string, data: MarkAttendanceInput) =>
    api<StudentAttendance>('/attendance', { method: 'POST', body: data, tenantId }),

  // Bulk mark attendance
  bulkMark: (tenantId: string, data: BulkMarkAttendanceInput) =>
    api<{ marked: number; failed: number }>('/attendance/bulk', { method: 'POST', body: data, tenantId }),

  // Update attendance record
  update: (tenantId: string, id: string, data: { status: AttendanceStatus; remarks?: string }) =>
    api<StudentAttendance>(`/attendance/${id}`, { method: 'PATCH', body: data, tenantId }),

  // Delete attendance record
  delete: (tenantId: string, id: string) =>
    api<void>(`/attendance/${id}`, { method: 'DELETE', tenantId }),

  // Get attendance for a date (for teacher marking)
  getByDate: (tenantId: string, date: string, params?: { departmentId?: string; section?: string; subjectId?: string }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('date', date);
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.section) searchParams.set('section', params.section);
    if (params?.subjectId) searchParams.set('subjectId', params.subjectId);
    return api<AttendanceListResponse>(`/attendance/by-date?${searchParams}`, { tenantId });
  },

  // Get overall stats (for admin dashboard)
  getOverallStats: (tenantId: string, params?: { date?: string; departmentId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.set('date', params.date);
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    const query = searchParams.toString();
    return api<{
      totalStudents: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
      averagePercentage: number;
      lowAttendanceCount: number;
    }>(`/attendance/stats${query ? `?${query}` : ''}`, { tenantId });
  },
};

// ============ ID Cards API ============

export interface IdCard {
  id: string;
  tenantId: string;
  studentId: string;
  cardNumber: string;
  issueDate: string;
  validUntil: string;
  qrCodeData: string;
  qrVerificationToken: string;
  status: 'active' | 'expired' | 'revoked';
  cachedPhotoUrl?: string | null;
  cachedName: string;
  cachedRollNo: string;
  cachedDepartment: string;
  cachedBatch: string;
  cachedBloodGroup?: string | null;
  pdfGeneratedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    rollNo: string;
    batch: string;
    semester: number;
    section?: string;
    user: {
      name: string;
      email: string;
    };
    department: {
      name: string;
      code: string;
    };
  };
}

export interface IdCardVerification {
  valid: boolean;
  message: string;
  card?: {
    cardNumber: string;
    studentName: string;
    rollNo: string;
    department: string;
    batch: string;
    status: string;
    validUntil: string;
    photoUrl?: string;
  };
  collegeName?: string;
}

export interface IdCardStats {
  totalCards: number;
  activeCards: number;
  expiredCards: number;
  revokedCards: number;
  cardsByDepartment: Record<string, number>;
  cardsByBatch: Record<string, number>;
  recentlyGenerated: IdCard[];
  // Aliases for backwards compatibility
  total?: number;
  active?: number;
  expired?: number;
  revoked?: number;
  byDepartment?: Record<string, number>;
  byBatch?: Record<string, number>;
}

export interface GenerateIdCardInput {
  validUntil?: string;
}

export interface BulkGenerateIdCardsInput {
  studentIds?: string[];
  departmentId?: string;
  batch?: string;
  validUntil?: string;
}

export interface BulkGenerateResult {
  total: number;
  generated: number;
  skipped: number;
  errors: Array<{ studentId: string; error: string }>;
  cards: IdCard[];
}

export interface IdCardQueryParams {
  departmentId?: string;
  batch?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const idCardsApi = {
  // Get ID card by student ID
  getByStudentId: (tenantId: string, studentId: string) =>
    api<IdCard>(`/id-cards/student/${studentId}`, { tenantId }),

  // Get ID card by ID
  get: (tenantId: string, id: string) =>
    api<IdCard>(`/id-cards/${id}`, { tenantId }),

  // List all ID cards
  list: (tenantId: string, params?: IdCardQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.batch) searchParams.set('batch', params.batch);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ cards: IdCard[]; total: number }>(`/id-cards${query ? `?${query}` : ''}`, { tenantId });
  },

  // Generate ID card for a student
  generate: (tenantId: string, studentId: string, data?: GenerateIdCardInput) =>
    api<IdCard>(`/id-cards/generate/${studentId}`, { method: 'POST', body: data || {}, tenantId }),

  // Bulk generate ID cards
  bulkGenerate: (tenantId: string, data: BulkGenerateIdCardsInput) =>
    api<BulkGenerateResult>('/id-cards/bulk-generate', { method: 'POST', body: data, tenantId }),

  // Get PDF download URL (returns blob)
  downloadPdf: async (tenantId: string, id: string): Promise<Blob> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/id-cards/${id}/pdf`, {
      headers: {
        'x-tenant-id': tenantId,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }
    return response.blob();
  },

  // Verify ID card (public endpoint)
  verify: (token: string) =>
    api<IdCardVerification>(`/id-cards/verify/${token}`),

  // Revoke ID card
  revoke: (tenantId: string, id: string, reason?: string) =>
    api<IdCard>(`/id-cards/${id}/revoke`, { method: 'PATCH', body: { reason }, tenantId }),

  // Get statistics
  stats: (tenantId: string) =>
    api<IdCardStats>('/id-cards/stats', { tenantId }),
};

// ============ Face Recognition API ============

export type FaceEnrollmentStatus = 'pending' | 'active' | 'failed';
export type FaceSessionStatus = 'pending' | 'processing' | 'review' | 'confirmed' | 'cancelled';
export type DetectedFaceStatus = 'matched' | 'unmatched' | 'manual_override' | 'ignored';
export type FaceAttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FaceEnrollment {
  id: string;
  tenantId: string;
  studentId: string;
  collectionId: string;
  faceId: string;
  sourceImageUrl?: string;
  enrollmentQuality?: number;
  status: FaceEnrollmentStatus;
  failureReason?: string;
  enrolledBy?: string;
  enrolledAt?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    rollNo: string;
    user: { name: string; email?: string };
    department: { id: string; name: string; code: string };
  };
}

export interface EnrollStudentInput {
  studentId: string;
  imageUrl?: string;
  imageBase64?: string;
}

export interface BulkEnrollInput {
  enrollments: EnrollStudentInput[];
}

export interface EnrollmentResult {
  studentId: string;
  success: boolean;
  faceId?: string;
  quality?: number;
  error?: string;
}

export interface BulkEnrollResult {
  total: number;
  successful: number;
  failed: number;
  results: EnrollmentResult[];
}

export interface EnrollmentStats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  byDepartment: Array<{
    departmentId: string;
    departmentName: string;
    enrolled: number;
    total: number;
    percentage: number;
  }>;
}

export interface QueryEnrollmentsParams {
  status?: FaceEnrollmentStatus;
  departmentId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Attendance Session Types
export interface MatchedStudent {
  id: string;
  name: string;
  rollNo: string;
  photoUrl?: string;
}

export interface DetectedFaceResult {
  id: string;
  boundingBox: BoundingBox;
  matchedStudent?: MatchedStudent;
  matchConfidence?: number;
  status: DetectedFaceStatus;
  attendanceStatus: FaceAttendanceStatus;
}

export interface SessionResult {
  id: string;
  status: FaceSessionStatus;
  totalFacesDetected: number;
  matchedFaces: number;
  unmatchedFaces: number;
  detectedFaces: DetectedFaceResult[];
  classPhotoUrl: string;
  date: string;
}

export interface CreateSessionInput {
  departmentId: string;
  section?: string;
  subjectId?: string;
  classPhotoUrl: string;
  date: string;
}

export interface ProcessSessionInput {
  sessionId: string;
  matchThreshold?: number;
}

export interface ConfirmSessionInput {
  sessionId: string;
  overrides?: Array<{
    detectedFaceId: string;
    studentId?: string;
    attendanceStatus?: FaceAttendanceStatus;
  }>;
}

export interface QuerySessionsParams {
  departmentId?: string;
  section?: string;
  status?: FaceSessionStatus;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface AttendanceSessionStats {
  totalSessions: number;
  todaySessions: number;
  averageMatchRate: number;
  totalStudentsMarked: number;
  byDepartment: Array<{
    departmentId: string;
    departmentName: string;
    sessions: number;
    averageMatchRate: number;
  }>;
}

export interface UpdateDetectedFaceInput {
  overrideStudentId?: string;
  status?: DetectedFaceStatus;
  attendanceStatus?: FaceAttendanceStatus;
}

export interface BulkUpdateFacesInput {
  updates: Array<{
    detectedFaceId: string;
    overrideStudentId?: string;
    attendanceStatus?: FaceAttendanceStatus;
  }>;
}

export interface FaceRecognitionConfig {
  isConfigured: boolean;
  collectionId: string;
  matchThreshold: number;
  enrollmentQualityThreshold: number;
  autoConfirmHighConfidence: boolean;
  requireManualReview: boolean;
  maxFacesPerPhoto: number;
}

export interface DetectFacesInput {
  imageUrl?: string;
  imageBase64?: string;
}

export interface SearchFaceInput {
  imageUrl?: string;
  imageBase64?: string;
  threshold?: number;
  maxFaces?: number;
}

export interface FaceMatch {
  faceId: string;
  similarity: number;
  studentId?: string;
}

export interface SectionStudent {
  id: string;
  rollNo: string;
  section?: string;
  user: {
    name: string;
    profile?: { photoUrl?: string };
  };
  faceEnrollment?: { status: FaceEnrollmentStatus };
}

export const faceRecognitionApi = {
  // ============ Enrollment ============

  // Enroll a student's face
  enroll: (tenantId: string, data: EnrollStudentInput) =>
    api<EnrollmentResult>('/face-recognition/enroll', { method: 'POST', body: data, tenantId }),

  // Bulk enroll multiple students
  bulkEnroll: (tenantId: string, data: BulkEnrollInput) =>
    api<BulkEnrollResult>('/face-recognition/enroll/bulk', { method: 'POST', body: data, tenantId }),

  // Re-enroll a student (update face)
  reEnroll: (tenantId: string, studentId: string, imageUrl: string) =>
    api<EnrollmentResult>(`/face-recognition/enroll/${studentId}/re-enroll`, {
      method: 'POST',
      body: { imageUrl },
      tenantId,
    }),

  // Unenroll a student
  unenroll: (tenantId: string, studentId: string) =>
    api<void>(`/face-recognition/enroll/${studentId}`, { method: 'DELETE', tenantId }),

  // Get enrollment for a student
  getEnrollment: (tenantId: string, studentId: string) =>
    api<FaceEnrollment>(`/face-recognition/enrollments/${studentId}`, { tenantId }),

  // Query enrollments
  queryEnrollments: (tenantId: string, params?: QueryEnrollmentsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: FaceEnrollment[]; total: number }>(
      `/face-recognition/enrollments${query ? `?${query}` : ''}`,
      { tenantId }
    );
  },

  // Get enrollment statistics
  getEnrollmentStats: (tenantId: string) =>
    api<EnrollmentStats>('/face-recognition/enrollments/stats', { tenantId }),

  // Get unenrolled students
  getUnenrolledStudents: (tenantId: string, params?: { departmentId?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api<SectionStudent[]>(
      `/face-recognition/enrollments/unenrolled${query ? `?${query}` : ''}`,
      { tenantId }
    );
  },

  // Check enrollment status
  checkEnrollmentStatus: (tenantId: string, studentId: string) =>
    api<{ studentId: string; isEnrolled: boolean }>(
      `/face-recognition/enrollments/${studentId}/status`,
      { tenantId }
    ),

  // ============ Attendance Sessions ============

  // Create a new session
  createSession: (tenantId: string, data: CreateSessionInput) =>
    api<SessionResult>('/face-recognition/sessions', { method: 'POST', body: data, tenantId }),

  // Process a session (detect and match faces)
  processSession: (tenantId: string, sessionId: string, matchThreshold?: number) =>
    api<SessionResult>(`/face-recognition/sessions/${sessionId}/process`, {
      method: 'POST',
      body: { matchThreshold },
      tenantId,
    }),

  // Confirm a session
  confirmSession: (tenantId: string, sessionId: string, overrides?: ConfirmSessionInput['overrides']) =>
    api<SessionResult>(`/face-recognition/sessions/${sessionId}/confirm`, {
      method: 'POST',
      body: { overrides },
      tenantId,
    }),

  // Cancel a session
  cancelSession: (tenantId: string, sessionId: string) =>
    api<void>(`/face-recognition/sessions/${sessionId}/cancel`, { method: 'POST', tenantId }),

  // Get a session by ID
  getSession: (tenantId: string, sessionId: string) =>
    api<SessionResult>(`/face-recognition/sessions/${sessionId}`, { tenantId }),

  // Query sessions
  querySessions: (tenantId: string, params?: QuerySessionsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.section) searchParams.set('section', params.section);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.createdBy) searchParams.set('createdBy', params.createdBy);
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return api<{ data: SessionResult[]; total: number }>(
      `/face-recognition/sessions${query ? `?${query}` : ''}`,
      { tenantId }
    );
  },

  // Get attendance statistics
  getAttendanceStats: (tenantId: string) =>
    api<AttendanceSessionStats>('/face-recognition/sessions/stats', { tenantId }),

  // ============ Detected Faces ============

  // Update a detected face
  updateDetectedFace: (tenantId: string, faceId: string, data: UpdateDetectedFaceInput) =>
    api<DetectedFaceResult>(`/face-recognition/faces/${faceId}`, {
      method: 'PUT',
      body: data,
      tenantId,
    }),

  // Bulk update detected faces
  bulkUpdateFaces: (tenantId: string, data: BulkUpdateFacesInput) =>
    api<{ updated: number }>('/face-recognition/faces/bulk', { method: 'PUT', body: data, tenantId }),

  // ============ Utility ============

  // Get students in a section (for face matching suggestions)
  getSectionStudents: (tenantId: string, params?: { departmentId?: string; section?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId);
    if (params?.section) searchParams.set('section', params.section);
    const query = searchParams.toString();
    return api<SectionStudent[]>(
      `/face-recognition/section-students${query ? `?${query}` : ''}`,
      { tenantId }
    );
  },

  // Detect faces in an image
  detectFaces: (tenantId: string, data: DetectFacesInput) =>
    api<Array<{ boundingBox: BoundingBox; confidence: number }>>(
      '/face-recognition/detect',
      { method: 'POST', body: data, tenantId }
    ),

  // Search for a face in enrolled students
  searchFace: (tenantId: string, data: SearchFaceInput) =>
    api<FaceMatch[]>('/face-recognition/search', { method: 'POST', body: data, tenantId }),

  // Get configuration
  getConfig: (tenantId: string) =>
    api<FaceRecognitionConfig>('/face-recognition/config', { tenantId }),

  // Initialize collection
  initializeCollection: (tenantId: string) =>
    api<{ collectionId: string; status: string }>(
      '/face-recognition/collection/initialize',
      { method: 'POST', tenantId }
    ),
};

export { ApiError };
