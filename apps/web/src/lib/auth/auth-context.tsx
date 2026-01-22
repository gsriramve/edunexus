'use client';

import { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthContext as setApiAuthContext, getApiBaseUrl } from '@/lib/api';

// Get auth API URL dynamically (uses same logic as api.ts but without /api suffix for auth routes)
function getAuthApiUrl(): string {
  // Server-side: use env variable
  if (typeof window === 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Remove /api suffix if present (we add it manually in fetch calls)
    return envUrl.replace(/\/api$/, '');
  }

  // Client-side: derive from current origin for production
  const { protocol, hostname } = window.location;

  // If accessing via IP or non-localhost domain, use same origin (nginx proxies /api)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}`;
  }

  // Local development: use localhost:3001 directly (don't rely on env var which may be cached)
  return 'http://localhost:3001';
}

// JWT payload structure
interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  exp: number;
}

// User object structure
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
}

// Auth context state
interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

// Decode JWT without verification (server verifies)
function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(exp: number): boolean {
  return Date.now() >= exp * 1000;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Sync user state to API client
  const syncAuthContext = useCallback((userData: User | null) => {
    if (userData) {
      setApiAuthContext({
        userId: userData.id,
        role: userData.role,
        tenantId: userData.tenantId,
        name: userData.name,
      });
    } else {
      setApiAuthContext(null);
    }
  }, []);

  // Initialize auth state from cookie (on mount)
  const initializeAuth = useCallback(async () => {
    try {
      const response = await fetch(`${getAuthApiUrl()}/api/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const userData: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          tenantId: data.tenantId,
        };
        setUser(userData);
        syncAuthContext(userData);
      } else {
        // Try to refresh token
        const refreshResponse = await fetch(`${getAuthApiUrl()}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const userData: User = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            tenantId: data.user.tenantId,
          };
          setUser(userData);
          syncAuthContext(userData);
        } else {
          setUser(null);
          syncAuthContext(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setUser(null);
      syncAuthContext(null);
    } finally {
      setIsLoading(false);
    }
  }, [syncAuthContext]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getAuthApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        tenantId: data.user.tenantId,
      };
      setUser(userData);
      syncAuthContext(userData);

      // Redirect based on role
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
      router.push(roleRoutes[userData.role] || '/');
    } finally {
      setIsLoading(false);
    }
  }, [router, syncAuthContext]);

  // Register
  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getAuthApiUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        tenantId: data.user.tenantId,
      };
      setUser(userData);
      syncAuthContext(userData);

      // New users are students by default
      router.push('/student');
    } finally {
      setIsLoading(false);
    }
  }, [router, syncAuthContext]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch(`${getAuthApiUrl()}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      syncAuthContext(null);
      router.push('/login');
    }
  }, [router, syncAuthContext]);

  // Refresh auth (can be called manually)
  const refreshAuth = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAuth,
  }), [user, isLoading, login, register, logout, refreshAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to get current user (throws if not authenticated)
export function useUser() {
  const { user, isLoading, isAuthenticated } = useAuth();
  return { user, isLoading, isSignedIn: isAuthenticated };
}

// Hook to get user role
export function useRole() {
  const { user } = useAuth();
  return user?.role || null;
}
