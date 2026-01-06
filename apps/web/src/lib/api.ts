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

export { ApiError };
