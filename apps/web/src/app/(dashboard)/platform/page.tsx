import { Building2, Users, CreditCard, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data - will be replaced with real API calls
const stats = [
  {
    title: "Total Colleges",
    value: "12",
    change: "+2 this month",
    icon: Building2,
    trend: "up",
  },
  {
    title: "Total Students",
    value: "45,230",
    change: "+1,234 this month",
    icon: Users,
    trend: "up",
  },
  {
    title: "Monthly Revenue",
    value: "₹22.6L",
    change: "+12% from last month",
    icon: CreditCard,
    trend: "up",
  },
  {
    title: "Active Users",
    value: "38,450",
    change: "85% of total",
    icon: TrendingUp,
    trend: "neutral",
  },
];

const recentColleges = [
  {
    id: "1",
    name: "ABC Engineering College",
    location: "Chennai",
    students: 5200,
    status: "active",
    subscription: "Premium",
    mrr: "₹2.6L",
  },
  {
    id: "2",
    name: "XYZ Institute of Technology",
    location: "Bangalore",
    students: 4800,
    status: "active",
    subscription: "Premium",
    mrr: "₹2.4L",
  },
  {
    id: "3",
    name: "PQR College of Engineering",
    location: "Hyderabad",
    students: 3500,
    status: "trial",
    subscription: "Trial",
    mrr: "₹0",
  },
  {
    id: "4",
    name: "LMN Technical University",
    location: "Mumbai",
    students: 6100,
    status: "active",
    subscription: "Enterprise",
    mrr: "₹3.05L",
  },
];

const recentTickets = [
  {
    id: "T-1234",
    college: "ABC Engineering College",
    subject: "Payment gateway issue",
    priority: "high",
    status: "open",
  },
  {
    id: "T-1233",
    college: "XYZ Institute of Technology",
    subject: "User sync problem",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: "T-1232",
    college: "PQR College of Engineering",
    subject: "Feature request: Bulk import",
    priority: "low",
    status: "open",
  },
];

export default function PlatformDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all colleges and monitor platform health
          </p>
        </div>
        <Button>
          <Building2 className="mr-2 h-4 w-4" />
          Add New College
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colleges Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Colleges</CardTitle>
            <CardDescription>
              Overview of recently onboarded colleges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>College</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentColleges.map((college) => (
                  <TableRow key={college.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{college.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {college.location}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{college.students.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          college.subscription === "Enterprise"
                            ? "default"
                            : college.subscription === "Premium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {college.subscription}
                      </Badge>
                    </TableCell>
                    <TableCell>{college.mrr}</TableCell>
                    <TableCell>
                      <Badge
                        variant={college.status === "active" ? "default" : "outline"}
                        className={
                          college.status === "active"
                            ? "bg-green-500"
                            : college.status === "trial"
                            ? "bg-yellow-500"
                            : ""
                        }
                      >
                        {college.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription>Recent support requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                {ticket.priority === "high" ? (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{ticket.college}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {ticket.id}
                    </Badge>
                    <Badge
                      variant={
                        ticket.status === "open"
                          ? "destructive"
                          : ticket.status === "in_progress"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Tickets
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col">
              <Building2 className="h-6 w-6 mb-2" />
              <span>Onboard College</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <CreditCard className="h-6 w-6 mb-2" />
              <span>View Invoices</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
