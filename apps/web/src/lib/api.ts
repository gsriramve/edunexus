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
  name: string;
  code: string;
  description?: string;
  hodId?: string;
  hod?: {
    id: string;
    employeeId: string;
    designation: string;
    user: {
      id: string;
      email: string;
      profile: { firstName: string; lastName: string };
    };
  };
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
  description?: string;
  hodId?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  description?: string;
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
  employeeId: string;
  designation: string;
  departmentId: string;
  joiningDate: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  status: string;
  user: {
    id: string;
    email: string;
    role: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
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
  qualification?: string;
  specialization?: string;
  experience?: number;
}

export interface UpdateStaffInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  designation?: string;
  departmentId?: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'resigned';
  qualification?: string;
  specialization?: string;
  experience?: number;
}

export interface StaffListParams {
  search?: string;
  departmentId?: string;
  role?: string;
  status?: string;
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
  slug: string;
  domain: string;
  logo?: string;
  config: any;
  status: string;
  subscriptions?: Array<{
    id: string;
    plan: string;
    studentCount: number;
    amount: number;
    status: string;
  }>;
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
    if (params?.batchYear) searchParams.set('batchYear', params.batchYear.toString());
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
  rollNo: string;
  registrationNo: string;
  departmentId: string;
  batchYear: number;
  currentSemester: number;
  status: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
      gender?: string;
      dateOfBirth?: string;
      bloodGroup?: string;
      nationality?: string;
    };
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
  registrationNo: string;
  departmentId: string;
  batchYear: number;
  currentSemester: number;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  bloodGroup?: string;
  nationality?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  currentSemester?: number;
  status?: 'active' | 'inactive' | 'graduated' | 'dropped' | 'suspended';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  parentPhone?: string;
  parentEmail?: string;
}

export interface StudentListParams {
  search?: string;
  departmentId?: string;
  batchYear?: number;
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
  byBatch: Array<{ batchYear: number; _count: number }>;
  bySemester: Array<{ currentSemester: number; _count: number }>;
}

export interface StudentDashboard {
  studentId: string;
  name: string;
  rollNo: string;
  department: string;
  departmentCode: string;
  semester: number;
  batchYear: number;
  cgpa: number;
  attendancePercentage: number;
  pendingFees: number;
  upcomingExams: number;
  notifications: number;
  email: string;
  phone?: string;
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

export { ApiError };
