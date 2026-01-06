"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const colleges = [
  {
    id: "1",
    name: "ABC Engineering College",
    slug: "abc-engineering",
    location: "Chennai, Tamil Nadu",
    students: 5200,
    staff: 320,
    status: "active",
    subscription: "Premium",
    mrr: 260000,
    onboardedAt: "2025-06-15",
    principalName: "Dr. Rajesh Kumar",
    principalEmail: "principal@abc-engineering.edu",
  },
  {
    id: "2",
    name: "XYZ Institute of Technology",
    slug: "xyz-institute",
    location: "Bangalore, Karnataka",
    students: 4800,
    staff: 280,
    status: "active",
    subscription: "Premium",
    mrr: 240000,
    onboardedAt: "2025-07-20",
    principalName: "Dr. Priya Sharma",
    principalEmail: "principal@xyz-institute.edu",
  },
  {
    id: "3",
    name: "PQR College of Engineering",
    slug: "pqr-college",
    location: "Hyderabad, Telangana",
    students: 3500,
    staff: 200,
    status: "trial",
    subscription: "Trial",
    mrr: 0,
    onboardedAt: "2025-12-01",
    principalName: "Dr. Suresh Reddy",
    principalEmail: "principal@pqr-college.edu",
  },
  {
    id: "4",
    name: "LMN Technical University",
    slug: "lmn-university",
    location: "Mumbai, Maharashtra",
    students: 6100,
    staff: 400,
    status: "active",
    subscription: "Enterprise",
    mrr: 305000,
    onboardedAt: "2025-03-10",
    principalName: "Dr. Amit Patel",
    principalEmail: "principal@lmn-university.edu",
  },
  {
    id: "5",
    name: "RST Engineering Institute",
    slug: "rst-engineering",
    location: "Pune, Maharashtra",
    students: 2800,
    staff: 150,
    status: "suspended",
    subscription: "Premium",
    mrr: 0,
    onboardedAt: "2025-08-05",
    principalName: "Dr. Neha Joshi",
    principalEmail: "principal@rst-engineering.edu",
  },
];

export default function CollegesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredColleges = colleges.filter((college) => {
    const matchesSearch =
      college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || college.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colleges</h1>
          <p className="text-muted-foreground">
            Manage all onboarded colleges and their subscriptions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add College
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Onboard New College</DialogTitle>
              <DialogDescription>
                Add a new college to the platform. They will receive an invitation email.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="collegeName">College Name</Label>
                <Input id="collegeName" placeholder="Enter college name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="City, State" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subscription">Subscription Plan</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial (30 days)</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="principalName">Principal Name</Label>
                <Input id="principalName" placeholder="Dr. Full Name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="principalEmail">Principal Email</Label>
                <Input id="principalEmail" type="email" placeholder="principal@college.edu" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimatedStudents">Estimated Students</Label>
                <Input id="estimatedStudents" type="number" placeholder="e.g., 5000" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{colleges.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {colleges.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Trial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {colleges.filter((c) => c.status === "trial").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(colleges.reduce((sum, c) => sum + c.mrr, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search colleges..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colleges Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>College</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredColleges.map((college) => (
                <TableRow key={college.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Link
                          href={`/platform/colleges/${college.slug}`}
                          className="font-medium hover:underline"
                        >
                          {college.name}
                        </Link>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          {college.location}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{college.principalName}</p>
                      <p className="text-sm text-muted-foreground">
                        {college.principalEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      {college.students.toLocaleString()}
                    </div>
                  </TableCell>
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
                  <TableCell>{formatCurrency(college.mrr)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        college.status === "active"
                          ? "default"
                          : college.status === "trial"
                          ? "secondary"
                          : "destructive"
                      }
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit College</DropdownMenuItem>
                        <DropdownMenuItem>View Billing</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Suspend College
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
