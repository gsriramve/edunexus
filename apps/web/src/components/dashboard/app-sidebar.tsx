"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Wallet,
  Bus,
  Home,
  Library,
  Trophy,
  Bell,
  FileText,
  Brain,
  Briefcase,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRole, UserRole } from "@/lib/auth";
import { useTenantId } from "@/hooks/use-tenant";
import { useTenant } from "@/hooks/use-api";

// Navigation items by role
const platformOwnerNav = [
  { title: "Dashboard", href: "/platform", icon: LayoutDashboard },
  { title: "Colleges", href: "/platform/colleges", icon: Building2 },
];

const principalNav = [
  { title: "Dashboard", href: "/principal", icon: LayoutDashboard },
  { title: "Departments", href: "/principal/departments", icon: Building2 },
  { title: "Staff", href: "/principal/staff", icon: Users },
  { title: "Students", href: "/principal/students", icon: GraduationCap },
  { title: "Academics", href: "/principal/academics", icon: BookOpen },
  { title: "Exams", href: "/principal/exams", icon: CalendarDays },
  { title: "Fees", href: "/principal/fees", icon: Wallet },
  { title: "Reports", href: "/principal/reports", icon: FileText },
  { title: "Settings", href: "/principal/settings", icon: Settings },
];

const hodNav = [
  { title: "Dashboard", href: "/hod", icon: LayoutDashboard },
  { title: "Faculty", href: "/hod/faculty", icon: Users },
  { title: "Students", href: "/hod/students", icon: GraduationCap },
  { title: "Subjects", href: "/hod/subjects", icon: BookOpen },
  { title: "Attendance", href: "/hod/attendance", icon: CalendarDays },
  { title: "Exams", href: "/hod/exams", icon: FileText },
  { title: "Reports", href: "/hod/reports", icon: BarChart3 },
];

const teacherNav = [
  { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { title: "My Classes", href: "/teacher/classes", icon: BookOpen },
  { title: "Attendance", href: "/teacher/attendance", icon: CalendarDays },
  { title: "Assignments", href: "/teacher/assignments", icon: FileText },
  { title: "Results", href: "/teacher/results", icon: BarChart3 },
  { title: "Messages", href: "/teacher/messages", icon: Bell },
];

const studentNav = [
  { title: "Dashboard", href: "/student", icon: LayoutDashboard },
  { title: "Academics", href: "/student/academics", icon: BookOpen },
  { title: "Attendance", href: "/student/attendance", icon: CalendarDays },
  { title: "Exams", href: "/student/exams", icon: FileText },
  { title: "Fees", href: "/student/fees", icon: Wallet },
  { title: "Practice Zone", href: "/student/practice", icon: Brain },
  { title: "Career Hub", href: "/student/career", icon: Briefcase },
  { title: "Library", href: "/student/library", icon: Library },
  { title: "Transport", href: "/student/transport", icon: Bus },
  { title: "Hostel", href: "/student/hostel", icon: Home },
  { title: "Sports", href: "/student/sports", icon: Trophy },
];

const parentNav = [
  { title: "Dashboard", href: "/parent", icon: LayoutDashboard },
  { title: "Academics", href: "/parent/academics", icon: BookOpen },
  { title: "Attendance", href: "/parent/attendance", icon: CalendarDays },
  { title: "Fees", href: "/parent/fees", icon: Wallet },
  { title: "Transport", href: "/parent/transport", icon: Bus },
  { title: "Messages", href: "/parent/messages", icon: Bell },
];

const NAV_BY_ROLE: Record<string, typeof platformOwnerNav> = {
  [UserRole.PLATFORM_OWNER]: platformOwnerNav,
  [UserRole.PRINCIPAL]: principalNav,
  [UserRole.HOD]: hodNav,
  [UserRole.ADMIN_STAFF]: principalNav, // Similar to principal with some restrictions
  [UserRole.TEACHER]: teacherNav,
  [UserRole.LAB_ASSISTANT]: teacherNav.slice(0, 4), // Subset of teacher nav
  [UserRole.STUDENT]: studentNav,
  [UserRole.PARENT]: parentNav,
};

export function AppSidebar() {
  const pathname = usePathname();
  const { role, roleName } = useRole();
  const tenantId = useTenantId();
  const { data: tenant } = useTenant(tenantId || "");

  const navItems = role ? NAV_BY_ROLE[role] || studentNav : [];

  // Determine branding - use tenant if available, otherwise default EduNexus
  const isPlatformOwner = role === UserRole.PLATFORM_OWNER;
  const showTenantBranding = !isPlatformOwner && tenant;
  const brandName = showTenantBranding ? (tenant.displayName || tenant.name) : "EduNexus";
  const brandLogo = showTenantBranding ? tenant.logo : null;

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName}
              className="h-8 w-8 object-contain rounded"
            />
          ) : (
            <GraduationCap className="h-8 w-8 text-primary" />
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-lg truncate" title={brandName}>
              {brandName}
            </span>
            <span className="text-xs text-muted-foreground">{roleName}</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/help">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
