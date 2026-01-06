"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building2,
  Heart,
  Globe,
  Shield,
  Pencil,
  Camera,
  Save,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Mock data
const studentProfile = {
  // Personal Info
  firstName: "Rahul",
  lastName: "Sharma",
  email: "rahul.sharma@college.edu",
  phone: "+91 98765 43210",
  dateOfBirth: "2003-05-15",
  gender: "Male",
  bloodGroup: "B+",
  nationality: "Indian",

  // Academic Info
  rollNo: "21CSE101",
  registrationNo: "REG2021CSE101",
  department: "Computer Science & Engineering",
  departmentCode: "CSE",
  batchYear: 2021,
  currentSemester: 5,
  status: "ACTIVE",

  // Parent Info
  fatherName: "Rajesh Sharma",
  motherName: "Sunita Sharma",
  parentPhone: "+91 98765 12345",
  parentEmail: "rajesh.sharma@email.com",

  // Address
  address: "123, MG Road, Sector 15",
  city: "Gurugram",
  state: "Haryana",
  pincode: "122001",
};

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(studentProfile);

  const handleSave = () => {
    // TODO: API call to save profile
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {formData.firstName[0]}{formData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-muted-foreground">{formData.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                <Badge variant="default">{formData.rollNo}</Badge>
                <Badge variant="secondary">{formData.departmentCode}</Badge>
                <Badge variant="outline">Semester {formData.currentSemester}</Badge>
                <Badge className="bg-green-500">{formData.status}</Badge>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">Registration No.</p>
              <p className="font-mono font-medium">{formData.registrationNo}</p>
              <p className="text-sm text-muted-foreground mt-2">Batch Year</p>
              <p className="font-medium">{formData.batchYear}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="parent">Parent/Guardian</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-sm font-medium">{formData.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </Label>
                  <p className="text-sm font-medium">
                    {new Date(formData.dateOfBirth).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <p className="text-sm font-medium">{formData.gender}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Blood Group
                  </Label>
                  <Badge variant="outline">{formData.bloodGroup}</Badge>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Nationality
                  </Label>
                  <p className="text-sm font-medium">{formData.nationality}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Information */}
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
              <CardDescription>Your academic enrollment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <p className="text-sm font-medium font-mono">{formData.rollNo}</p>
                </div>
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <p className="text-sm font-medium font-mono">{formData.registrationNo}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Department
                  </Label>
                  <p className="text-sm font-medium">{formData.department}</p>
                </div>
                <div className="space-y-2">
                  <Label>Department Code</Label>
                  <Badge variant="secondary">{formData.departmentCode}</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Batch Year</Label>
                  <p className="text-sm font-medium">{formData.batchYear}</p>
                </div>
                <div className="space-y-2">
                  <Label>Current Semester</Label>
                  <Badge>{formData.currentSemester}</Badge>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Enrollment Status
                  </Label>
                  <Badge className="bg-green-500">{formData.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parent/Guardian Information */}
        <TabsContent value="parent">
          <Card>
            <CardHeader>
              <CardTitle>Parent/Guardian Information</CardTitle>
              <CardDescription>Emergency contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Father's Name</Label>
                  <p className="text-sm font-medium">{formData.fatherName}</p>
                </div>
                <div className="space-y-2">
                  <Label>Mother's Name</Label>
                  <p className="text-sm font-medium">{formData.motherName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Parent's Phone
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.parentPhone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Parent's Email
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.parentEmail}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Information */}
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
              <CardDescription>Your residential address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Street Address</Label>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.address}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  {isEditing ? (
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  {isEditing ? (
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.state}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  {isEditing ? (
                    <Input
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.pincode}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
