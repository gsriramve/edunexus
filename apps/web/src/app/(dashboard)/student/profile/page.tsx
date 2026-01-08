"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
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
  Loader2,
  CreditCard,
  FileText,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId, useUpdateStudent, useStudentIdCard, useGenerateIdCard, useDownloadIdCardPdf, useTenant } from "@/hooks/use-api";
import { StudentIDCard } from "@/components/student/StudentIDCard";
import { toast } from "sonner";

export default function StudentProfile() {
  const { user, isLoaded: userLoaded } = useUser();
  const tenantId = useTenantId() || '';
  const [isEditing, setIsEditing] = useState(false);

  // Fetch student data
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');
  const updateStudentMutation = useUpdateStudent(tenantId);

  // Fetch tenant data for college name
  const { data: tenantData } = useTenant(tenantId);

  // Fetch ID card data
  const { data: idCard, isLoading: idCardLoading, error: idCardError } = useStudentIdCard(
    tenantId,
    studentData?.id || ''
  );
  const generateIdCardMutation = useGenerateIdCard(tenantId);
  const downloadPdfMutation = useDownloadIdCardPdf(tenantId);

  const handleGenerateIdCard = async () => {
    if (!studentData?.id) return;
    try {
      await generateIdCardMutation.mutateAsync({ studentId: studentData.id });
      toast.success('ID card generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate ID card');
    }
  };

  const handleDownloadPdf = async () => {
    if (!idCard?.id) return;
    try {
      await downloadPdfMutation.mutateAsync(idCard.id);
      toast.success('ID card PDF downloaded!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download PDF');
    }
  };

  // Form state for editable fields
  const [editedPhone, setEditedPhone] = useState('');

  // Initialize edit state when entering edit mode
  const startEditing = () => {
    setEditedPhone(user?.primaryPhoneNumber?.phoneNumber || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    // TODO: Implement profile update when backend supports it
    // Currently, student profile updates are limited
    // Phone number updates would go through Clerk
    setIsEditing(false);
  };

  const isLoading = !userLoaded || studentLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Derive display data from student and Clerk user
  const firstName = user?.firstName || studentData?.user?.name?.split(' ')[0] || '';
  const lastName = user?.lastName || studentData?.user?.name?.split(' ').slice(1).join(' ') || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Student';
  const email = user?.primaryEmailAddress?.emailAddress || studentData?.user?.email || '';
  const phone = user?.primaryPhoneNumber?.phoneNumber || '';
  const photoUrl = user?.imageUrl || studentData?.user?.profile?.photoUrl || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'S';

  // Student academic data
  const rollNo = studentData?.rollNo || 'N/A';
  const batch = studentData?.batch || 'N/A';
  const semester = studentData?.semester || 0;
  const section = studentData?.section || '';
  const status = studentData?.status || 'N/A';
  const admissionDate = studentData?.admissionDate;
  const departmentName = studentData?.department?.name || 'N/A';
  const departmentCode = studentData?.department?.code || '';

  // Profile data (from user profile if available)
  const profile = studentData?.user?.profile;
  const dob = profile?.dob;
  const gender = profile?.gender || 'N/A';
  const bloodGroup = profile?.bloodGroup || 'N/A';
  const nationality = profile?.nationality || 'Indian';

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
            <Button onClick={handleSave} disabled={updateStudentMutation.isPending}>
              {updateStudentMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        ) : (
          <Button onClick={startEditing}>
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
                <AvatarImage src={photoUrl} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {initials}
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
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <p className="text-muted-foreground">{email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                <Badge variant="default">{rollNo}</Badge>
                {departmentCode && <Badge variant="secondary">{departmentCode}</Badge>}
                {semester > 0 && <Badge variant="outline">Semester {semester}</Badge>}
                <Badge className={status === 'enrolled' ? 'bg-green-500' : 'bg-yellow-500'}>
                  {status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">Batch</p>
              <p className="font-mono font-medium">{batch}</p>
              {admissionDate && (
                <>
                  <p className="text-sm text-muted-foreground mt-2">Admission Date</p>
                  <p className="font-medium">
                    {new Date(admissionDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student ID Card Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Student ID Card
          </CardTitle>
          <CardDescription>
            Your digital student identification card with QR verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentIDCard
            idCard={idCardError ? null : idCard ? {
              id: idCard.id,
              cardNumber: idCard.cardNumber,
              status: idCard.status,
              issueDate: idCard.issueDate,
              validUntil: idCard.validUntil,
              qrVerificationToken: idCard.qrVerificationToken,
              cachedName: idCard.cachedName,
              cachedRollNo: idCard.cachedRollNo,
              cachedDepartment: idCard.cachedDepartment,
              cachedBatch: idCard.cachedBatch,
              cachedBloodGroup: idCard.cachedBloodGroup,
              cachedPhotoUrl: idCard.cachedPhotoUrl,
            } : null}
            collegeName={tenantData?.displayName || tenantData?.name || 'EduNexus College'}
            collegeLogo={tenantData?.logo || undefined}
            isLoading={idCardLoading || studentLoading}
            onGenerateCard={handleGenerateIdCard}
            onDownloadPdf={handleDownloadPdf}
            isGenerating={generateIdCardMutation.isPending}
            isDownloading={downloadPdfMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Profile Details Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="parent">Parent/Guardian</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
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
                  <p className="text-sm font-medium">{firstName || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <p className="text-sm font-medium">{lastName || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-sm font-medium">{email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-sm font-medium">{phone || 'Not provided'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </Label>
                  <p className="text-sm font-medium">
                    {dob ? new Date(dob).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }) : 'Not provided'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <p className="text-sm font-medium">{gender}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Blood Group
                  </Label>
                  {bloodGroup !== 'N/A' ? (
                    <Badge variant="outline">{bloodGroup}</Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not provided</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Nationality
                  </Label>
                  <p className="text-sm font-medium">{nationality}</p>
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
                  <p className="text-sm font-medium font-mono">{rollNo}</p>
                </div>
                <div className="space-y-2">
                  <Label>Batch</Label>
                  <p className="text-sm font-medium font-mono">{batch}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Department
                  </Label>
                  <p className="text-sm font-medium">{departmentName}</p>
                </div>
                <div className="space-y-2">
                  <Label>Department Code</Label>
                  {departmentCode ? (
                    <Badge variant="secondary">{departmentCode}</Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">N/A</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Current Semester</Label>
                  {semester > 0 ? (
                    <Badge>{semester}</Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">N/A</p>
                  )}
                </div>
                {section && (
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Badge variant="outline">{section}</Badge>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Enrollment Status
                  </Label>
                  <Badge className={status === 'enrolled' ? 'bg-green-500' : 'bg-yellow-500'}>
                    {status.toUpperCase()}
                  </Badge>
                </div>
                {admissionDate && (
                  <div className="space-y-2">
                    <Label>Admission Date</Label>
                    <p className="text-sm font-medium">
                      {new Date(admissionDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parent/Guardian Information */}
        <TabsContent value="parent">
          <Card>
            <CardHeader>
              <CardTitle>Parent/Guardian Information</CardTitle>
              <CardDescription>Your registered parents and guardians</CardDescription>
            </CardHeader>
            <CardContent>
              {studentData?.parent && studentData.parent.length > 0 ? (
                <div className="space-y-6">
                  {studentData.parent.map((parent: any) => (
                    <div key={parent.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={parent.user?.profile?.photoUrl} />
                          <AvatarFallback className="text-lg bg-secondary">
                            {parent.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'PG'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{parent.user?.name || 'N/A'}</h3>
                          <Badge variant="outline" className="capitalize">{parent.relation}</Badge>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            Email
                          </Label>
                          <p className="text-sm font-medium">{parent.user?.email || 'Not provided'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            Phone
                          </Label>
                          <p className="text-sm font-medium">
                            {parent.user?.profile?.contacts?.[0]?.value || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No parent/guardian information on record.</p>
                  <p className="text-sm mt-2">Contact your administrator to update this information.</p>
                </div>
              )}
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
              <CardDescription>Your registered addresses</CardDescription>
            </CardHeader>
            <CardContent>
              {studentData?.user?.profile?.addresses && studentData.user.profile.addresses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {studentData.user.profile.addresses.map((address: any) => (
                    <div key={address.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">{address.type} Address</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{address.line1}</p>
                        {address.line2 && <p className="text-muted-foreground">{address.line2}</p>}
                        <p>
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-muted-foreground">{address.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No address information on record.</p>
                  <p className="text-sm mt-2">Contact your administrator to update this information.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription>Your uploaded documents and certificates</CardDescription>
            </CardHeader>
            <CardContent>
              {studentData?.user?.profile?.documents && studentData.user.profile.documents.length > 0 ? (
                <div className="space-y-4">
                  {studentData.user.profile.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{doc.type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {doc.verifiedAt ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet.</p>
                  <p className="text-sm mt-2">Contact your administrator to upload documents.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          {studentData?.user?.profile?.emergency && studentData.user.profile.emergency.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>People to contact in case of emergency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {studentData.user.profile.emergency.map((contact: any) => (
                    <div key={contact.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{contact.name}</h4>
                        <Badge variant="outline" className="capitalize">{contact.relationship}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
