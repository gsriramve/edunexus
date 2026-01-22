"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Mail, Phone, Building, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInitiateEnrollment, useDepartments } from "@/hooks/use-api";
import { useTenantId } from "@/hooks/use-tenant";
import { toast } from "sonner";

export default function NewEnrollmentPage() {
  const router = useRouter();
  const tenantId = useTenantId();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    departmentId: "",
    academicYear: "2025-26",
  });

  // Queries
  const { data: departmentsData } = useDepartments(tenantId || "");
  const departments = departmentsData?.data || [];

  // Mutations
  const initiateEnrollment = useInitiateEnrollment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email ||
        !formData.mobileNumber || !formData.departmentId) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate mobile number (Indian format)
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      const response = await initiateEnrollment.mutateAsync(formData);
      toast.success("Enrollment initiated successfully");
      router.push(`/admin/enrollments/${response.id}`);
    } catch (error: any) {
      console.error("Failed to create enrollment:", error);
      toast.error(error.message || "Failed to create enrollment");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate academic year options
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear}-${String(currentYear + 1).slice(2)}`,
    `${currentYear + 1}-${String(currentYear + 2).slice(2)}`,
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Student Enrollment</h1>
          <p className="text-muted-foreground">
            Initiate a new student enrollment application
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Student Information
          </CardTitle>
          <CardDescription>
            Enter the basic details to initiate enrollment. The student will receive
            an email invitation to complete their profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Invitation link will be sent to this email
              </p>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="mobileNumber"
                  placeholder="9876543210"
                  className="pl-10"
                  value={formData.mobileNumber}
                  onChange={(e) => handleChange("mobileNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  maxLength={10}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                10-digit Indian mobile number
              </p>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department *</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => handleChange("departmentId", value)}
              >
                <SelectTrigger id="departmentId">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select department" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year *</Label>
              <Select
                value={formData.academicYear}
                onValueChange={(value) => handleChange("academicYear", value)}
              >
                <SelectTrigger id="academicYear">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select academic year" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Enrollment record will be created</li>
                <li>Click &quot;Send Invitation&quot; to email the student</li>
                <li>Student clicks the link, creates account, and fills profile</li>
                <li>Student submits for your review</li>
                <li>You review and approve, then HOD/Principal gives final approval</li>
                <li>Roll number and official email are generated automatically</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={initiateEnrollment.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={initiateEnrollment.isPending}>
                {initiateEnrollment.isPending ? "Creating..." : "Create Enrollment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
