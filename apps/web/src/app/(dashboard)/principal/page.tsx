import Link from "next/link";
import {
  Building2,
  Users,
  GraduationCap,
  Wallet,
  Calendar,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock data
const stats = [
  {
    title: "Total Departments",
    value: "8",
    change: "+1 this year",
    icon: Building2,
    href: "/principal/departments",
  },
  {
    title: "Total Staff",
    value: "186",
    change: "+12 this semester",
    icon: Users,
    href: "/principal/staff",
  },
  {
    title: "Total Students",
    value: "2,840",
    change: "+320 new admissions",
    icon: GraduationCap,
    href: "/principal/students",
  },
  {
    title: "Fee Collection",
    value: "₹1.2Cr",
    change: "78% collected",
    icon: Wallet,
    href: "/principal/fees",
  },
];

const recentActivities = [
  {
    id: 1,
    type: "admission",
    message: "45 new students admitted to CSE department",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "staff",
    message: "Dr. Priya Sharma appointed as HOD - ECE",
    time: "1 day ago",
  },
  {
    id: 3,
    type: "exam",
    message: "Mid-semester exams scheduled for Nov 15-25",
    time: "2 days ago",
  },
  {
    id: 4,
    type: "fee",
    message: "Fee payment deadline extended to Dec 15",
    time: "3 days ago",
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Faculty Meeting",
    date: "Jan 10, 2026",
    time: "10:00 AM",
    type: "meeting",
  },
  {
    id: 2,
    title: "Annual Day Preparations",
    date: "Jan 15, 2026",
    time: "All Day",
    type: "event",
  },
  {
    id: 3,
    title: "Placement Drive - TCS",
    date: "Jan 20, 2026",
    time: "9:00 AM",
    type: "placement",
  },
];

const alerts = [
  {
    id: 1,
    title: "Low Attendance Alert",
    description: "15 students in CSE have attendance below 75%",
    severity: "warning",
  },
  {
    id: 2,
    title: "Fee Defaulters",
    description: "32 students have pending fees beyond due date",
    severity: "error",
  },
  {
    id: 3,
    title: "AICTE Report Due",
    description: "Annual report submission deadline: Jan 31",
    severity: "info",
  },
];

const departmentPerformance = [
  { name: "CSE", students: 480, attendance: 92, placement: 95 },
  { name: "ECE", students: 420, attendance: 88, placement: 85 },
  { name: "MECH", students: 380, attendance: 85, placement: 78 },
  { name: "CIVIL", students: 240, attendance: 90, placement: 72 },
  { name: "EEE", students: 320, attendance: 87, placement: 80 },
];

export default function PrincipalDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">College Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your college
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Academic Calendar
          </Button>
          <Button>
            <Bell className="mr-2 h-4 w-4" />
            Announcements
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Overview of all departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentPerformance.map((dept) => (
                <div
                  key={dept.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {dept.name}
                    </div>
                    <div>
                      <p className="font-medium">{dept.name} Department</p>
                      <p className="text-sm text-muted-foreground">
                        {dept.students} students
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{dept.attendance}%</p>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-600">
                        {dept.placement}%
                      </p>
                      <p className="text-xs text-muted-foreground">Placement</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.severity === "error"
                    ? "border-red-200 bg-red-50"
                    : alert.severity === "warning"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <AlertCircle
                  className={`h-5 w-5 mt-0.5 ${
                    alert.severity === "error"
                      ? "text-red-500"
                      : alert.severity === "warning"
                      ? "text-yellow-500"
                      : "text-blue-500"
                  }`}
                />
                <div>
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your college</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled events this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date} • {event.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{event.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <Link href="/principal/departments">
              <Button variant="outline" className="h-auto py-4 w-full flex-col">
                <Building2 className="h-6 w-6 mb-2" />
                <span>Departments</span>
              </Button>
            </Link>
            <Link href="/principal/staff">
              <Button variant="outline" className="h-auto py-4 w-full flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span>Staff</span>
              </Button>
            </Link>
            <Link href="/principal/students">
              <Button variant="outline" className="h-auto py-4 w-full flex-col">
                <GraduationCap className="h-6 w-6 mb-2" />
                <span>Students</span>
              </Button>
            </Link>
            <Link href="/principal/academics">
              <Button variant="outline" className="h-auto py-4 w-full flex-col">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Academics</span>
              </Button>
            </Link>
            <Link href="/principal/reports">
              <Button variant="outline" className="h-auto py-4 w-full flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>Reports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
