"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Building2,
  Briefcase,
  Calendar,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Edit2,
  Plus,
  Trash2,
  Save,
  GraduationCap,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useMyAlumniProfile,
  useUpdateMyAlumniProfile,
  useAddEmployment,
  useDeleteEmployment,
  useUploadAlumniPhoto,
  useRegisterAlumni,
  type CurrentStatus,
  type CreateEmploymentInput,
  type CreateAlumniProfileInput,
} from "@/hooks/use-alumni";
import { PhotoUpload } from "@/components/profile/photo-upload";
import { useAuth } from "@/lib/auth";

const currentStatusOptions: { value: CurrentStatus; label: string }[] = [
  { value: "employed", label: "Employed" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "higher_studies", label: "Higher Studies" },
  { value: "unemployed", label: "Looking for Opportunities" },
  { value: "other", label: "Other" },
];

const focusAreaOptions = [
  { value: "career_guidance", label: "Career Guidance" },
  { value: "technical", label: "Technical Skills" },
  { value: "interview_prep", label: "Interview Preparation" },
  { value: "resume_review", label: "Resume Review" },
  { value: "higher_studies", label: "Higher Studies" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "general", label: "General Guidance" },
];

export default function AlumniProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddEmployment, setShowAddEmployment] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [newEmployment, setNewEmployment] = useState<Partial<CreateEmploymentInput>>({});
  const [registerForm, setRegisterForm] = useState<Partial<CreateAlumniProfileInput>>({
    currentStatus: "employed",
    openToMentoring: true,
  });

  const tenantId = useTenantId();
  const { user } = useAuth();

  const { data: profile, isLoading, refetch } = useMyAlumniProfile(tenantId || "");
  const updateProfile = useUpdateMyAlumniProfile(tenantId || "");
  const addEmployment = useAddEmployment(tenantId || "");
  const deleteEmployment = useDeleteEmployment(tenantId || "");
  const uploadPhoto = useUploadAlumniPhoto(tenantId || "");
  const registerAlumni = useRegisterAlumni(tenantId || "");

  const handleRegister = () => {
    if (!registerForm.firstName || !registerForm.lastName || !registerForm.email || !registerForm.graduationYear || !registerForm.batch) {
      return;
    }
    registerAlumni.mutate(registerForm as CreateAlumniProfileInput, {
      onSuccess: () => {
        setShowRegisterDialog(false);
        setRegisterForm({ currentStatus: "employed", openToMentoring: true });
        refetch();
      },
    });
  };

  const handleEditStart = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || "",
        linkedinUrl: profile.linkedinUrl || "",
        twitterUrl: profile.twitterUrl || "",
        websiteUrl: profile.websiteUrl || "",
        currentStatus: profile.currentStatus,
        visibleInDirectory: profile.visibleInDirectory,
        openToMentoring: profile.openToMentoring,
        mentorshipAreas: profile.mentorshipAreas || [],
        bio: profile.bio || "",
        achievements: profile.achievements || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateProfile.mutate(formData, {
      onSuccess: () => {
        setIsEditing(false);
        refetch();
      },
    });
  };

  const handleAddEmployment = () => {
    if (newEmployment.companyName && newEmployment.role && newEmployment.startDate) {
      addEmployment.mutate(newEmployment as CreateEmploymentInput, {
        onSuccess: () => {
          setShowAddEmployment(false);
          setNewEmployment({});
          refetch();
        },
      });
    }
  };

  const handleDeleteEmployment = (id: string) => {
    deleteEmployment.mutate(id, {
      onSuccess: () => refetch(),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Complete Your Alumni Profile</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Welcome! To access all alumni features like mentorship, events, and networking,
              please complete your profile setup.
            </p>
            <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Alumni Registration</DialogTitle>
                  <DialogDescription>
                    Fill in your details to create your alumni profile
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name *</label>
                      <Input
                        value={registerForm.firstName || ""}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name *</label>
                      <Input
                        value={registerForm.lastName || ""}
                        onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={registerForm.email || user?.email || ""}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={registerForm.phone || ""}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Graduation Year *</label>
                      <Input
                        type="number"
                        value={registerForm.graduationYear || ""}
                        onChange={(e) => setRegisterForm({ ...registerForm, graduationYear: parseInt(e.target.value) || undefined })}
                        placeholder="2020"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Batch *</label>
                      <Input
                        value={registerForm.batch || ""}
                        onChange={(e) => setRegisterForm({ ...registerForm, batch: e.target.value })}
                        placeholder="2016-2020"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Degree</label>
                    <Input
                      value={registerForm.degree || ""}
                      onChange={(e) => setRegisterForm({ ...registerForm, degree: e.target.value })}
                      placeholder="B.Tech in Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Status</label>
                    <Select
                      value={registerForm.currentStatus}
                      onValueChange={(value: CurrentStatus) => setRegisterForm({ ...registerForm, currentStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentStatusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">LinkedIn Profile</label>
                    <Input
                      value={registerForm.linkedinUrl || ""}
                      onChange={(e) => setRegisterForm({ ...registerForm, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      value={registerForm.bio || ""}
                      onChange={(e) => setRegisterForm({ ...registerForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Open to Mentoring</label>
                      <p className="text-xs text-muted-foreground">
                        Allow students to request mentorship from you
                      </p>
                    </div>
                    <Switch
                      checked={registerForm.openToMentoring || false}
                      onCheckedChange={(checked) => setRegisterForm({ ...registerForm, openToMentoring: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={!registerForm.firstName || !registerForm.lastName || !registerForm.email || !registerForm.graduationYear || !registerForm.batch || registerAlumni.isPending}
                  >
                    {registerAlumni.isPending ? "Creating..." : "Create Profile"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your alumni profile and settings
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEditStart}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <PhotoUpload
              currentPhoto={profile.photoUrl}
              name={`${profile.firstName} ${profile.lastName}`}
              size="lg"
              onUpload={async (formData) => {
                const result = await uploadPhoto.mutateAsync(formData);
                refetch();
                return result;
              }}
            />
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Status</label>
                    <Select
                      value={formData.currentStatus}
                      onValueChange={(value) => setFormData({ ...formData, currentStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentStatusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        Class of {profile.graduationYear}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {profile.department?.name || profile.batch}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{currentStatusOptions.find(s => s.value === profile.currentStatus)?.label}</Badge>
                    {profile.openToMentoring && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Open to Mentoring
                      </Badge>
                    )}
                  </div>
                  {(profile.email || profile.phone) && (
                    <div className="flex gap-4 text-sm">
                      {profile.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {profile.email}
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {profile.phone}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social & Links</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </label>
                <Input
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Website
                </label>
                <Input
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {profile.linkedinUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {profile.websiteUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {!profile.linkedinUrl && !profile.websiteUrl && (
                <p className="text-muted-foreground text-sm">No social links added</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bio & Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Bio & Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Achievements</label>
                <Textarea
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  placeholder="List your notable achievements..."
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              {profile.bio && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Bio</h4>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}
              {profile.achievements && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Achievements</h4>
                  <p className="text-muted-foreground">{profile.achievements}</p>
                </div>
              )}
              {!profile.bio && !profile.achievements && (
                <p className="text-muted-foreground text-sm">No bio or achievements added</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Employment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employment History</CardTitle>
            <Dialog open={showAddEmployment} onOpenChange={setShowAddEmployment}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Employment</DialogTitle>
                  <DialogDescription>Add a new position to your profile</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name *</label>
                    <Input
                      value={newEmployment.companyName || ""}
                      onChange={(e) => setNewEmployment({ ...newEmployment, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role *</label>
                    <Input
                      value={newEmployment.role || ""}
                      onChange={(e) => setNewEmployment({ ...newEmployment, role: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date *</label>
                      <Input
                        type="date"
                        value={newEmployment.startDate || ""}
                        onChange={(e) => setNewEmployment({ ...newEmployment, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={newEmployment.endDate || ""}
                        onChange={(e) => setNewEmployment({ ...newEmployment, endDate: e.target.value })}
                        disabled={newEmployment.isCurrent}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newEmployment.isCurrent || false}
                      onCheckedChange={(checked) => setNewEmployment({ ...newEmployment, isCurrent: checked })}
                    />
                    <span className="text-sm">Current Position</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={newEmployment.location || ""}
                      onChange={(e) => setNewEmployment({ ...newEmployment, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <Input
                      value={newEmployment.industry || ""}
                      onChange={(e) => setNewEmployment({ ...newEmployment, industry: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddEmployment(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEmployment} disabled={addEmployment.isPending}>
                    {addEmployment.isPending ? "Adding..." : "Add Position"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {profile.employmentHistory && profile.employmentHistory.length > 0 ? (
            <div className="space-y-4">
              {profile.employmentHistory.map((emp) => (
                <div key={emp.id} className="flex items-start justify-between p-4 rounded-lg border">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{emp.role}</h4>
                      {emp.isCurrent && <Badge>Current</Badge>}
                    </div>
                    <p className="text-muted-foreground">{emp.companyName}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(emp.startDate).toLocaleDateString()} -
                        {emp.isCurrent ? " Present" : emp.endDate ? ` ${new Date(emp.endDate).toLocaleDateString()}` : ""}
                      </div>
                      {emp.location && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {emp.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDeleteEmployment(emp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">
              No employment history added
            </p>
          )}
        </CardContent>
      </Card>

      {/* Mentorship Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Mentorship Settings</CardTitle>
          <CardDescription>Configure your mentorship preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Open to Mentoring</h4>
              <p className="text-sm text-muted-foreground">
                Allow students to request mentorship from you
              </p>
            </div>
            <Switch
              checked={isEditing ? formData.openToMentoring : profile.openToMentoring}
              onCheckedChange={(checked) => {
                if (isEditing) {
                  setFormData({ ...formData, openToMentoring: checked });
                }
              }}
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Visible in Directory</h4>
              <p className="text-sm text-muted-foreground">
                Show your profile in the alumni directory
              </p>
            </div>
            <Switch
              checked={isEditing ? formData.visibleInDirectory : profile.visibleInDirectory}
              onCheckedChange={(checked) => {
                if (isEditing) {
                  setFormData({ ...formData, visibleInDirectory: checked });
                }
              }}
              disabled={!isEditing}
            />
          </div>

          {(isEditing ? formData.openToMentoring : profile.openToMentoring) && (
            <div className="space-y-2">
              <h4 className="font-medium">Mentorship Areas</h4>
              <div className="flex flex-wrap gap-2">
                {focusAreaOptions.map((area) => {
                  const isSelected = isEditing
                    ? formData.mentorshipAreas?.includes(area.value)
                    : profile.mentorshipAreas?.includes(area.value);
                  return (
                    <Badge
                      key={area.value}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer ${isEditing ? "" : "cursor-default"}`}
                      onClick={() => {
                        if (isEditing) {
                          const current = formData.mentorshipAreas || [];
                          setFormData({
                            ...formData,
                            mentorshipAreas: isSelected
                              ? current.filter((a: string) => a !== area.value)
                              : [...current, area.value],
                          });
                        }
                      }}
                    >
                      {area.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
