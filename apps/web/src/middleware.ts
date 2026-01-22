import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// JWT secret - same as backend
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/sign-in',
  '/sign-up',
  '/privacy',
  '/terms',
  '/contact',
  '/unauthorized',
  '/verify',
  '/forgot-password',
  '/reset-password',
  '/enroll',
];

// API routes that are public
const PUBLIC_API_ROUTES = [
  '/api/webhooks',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/leads',
];

// Role-based route access mapping
const ROLE_ROUTES: Record<string, string[]> = {
  '/platform': ['platform_owner'],
  '/principal': ['platform_owner', 'principal'],
  '/hod': ['platform_owner', 'principal', 'hod'],
  '/admin': ['platform_owner', 'principal', 'admin_staff'],
  '/teacher': ['platform_owner', 'principal', 'hod', 'teacher'],
  '/lab-assistant': ['platform_owner', 'principal', 'hod', 'lab_assistant'],
  '/student': ['platform_owner', 'principal', 'hod', 'teacher', 'student'],
  '/parent': ['platform_owner', 'principal', 'parent'],
  '/alumni': ['platform_owner', 'principal', 'alumni'],
};

// Check if a path is public
function isPublicPath(pathname: string): boolean {
  // Check exact matches first
  if (PUBLIC_ROUTES.includes(pathname)) return true;

  // Check prefix matches
  return PUBLIC_ROUTES.some(route =>
    pathname.startsWith(route + '/') || pathname.startsWith(route + '?')
  );
}

// Check if an API route is public
function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
}

// Get role requirement for a path
function getRoleRequirement(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

// Verify JWT token
async function verifyToken(token: string): Promise<{
  sub: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
} | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      tenantId: payload.tenantId as string | null,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (pathname.startsWith('/api') && isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Get access token from cookie
  const accessToken = request.cookies.get('access_token')?.value;

  // If no token, redirect to login
  if (!accessToken) {
    // For API routes, return 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // For regular routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const payload = await verifyToken(accessToken);

  if (!payload) {
    // Token invalid or expired - try to let client refresh
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Token expired', code: 'TOKEN_EXPIRED' },
        { status: 401 }
      );
    }
    // For regular routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from home to their dashboard
  if (pathname === '/') {
    const roleRoutes: Record<string, string> = {
      platform_owner: '/platform',
      principal: '/principal',
      hod: '/hod',
      admin_staff: '/admin',
      teacher: '/teacher',
      lab_assistant: '/lab-assistant',
      student: '/student',
      parent: '/parent',
      alumni: '/alumni',
    };
    const dashboardUrl = roleRoutes[payload.role] || '/student';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Check role-based access
  const requiredRoles = getRoleRequirement(pathname);
  if (requiredRoles && !requiredRoles.includes(payload.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Add user info to headers for server components
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.sub);
  response.headers.set('x-user-role', payload.role);
  response.headers.set('x-user-email', payload.email);
  response.headers.set('x-user-name', payload.name);
  if (payload.tenantId) {
    response.headers.set('x-tenant-id', payload.tenantId);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
