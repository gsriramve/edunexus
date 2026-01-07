"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Upload,
  Palette,
  Globe,
  Bell,
  Calendar,
  Shield,
  CheckCircle,
  ImageIcon,
  Save,
  RotateCcw,
} from "lucide-react";

// Mock data - Replace with real API calls
const institutionData = {
  name: "Demo Engineering College",
  shortName: "DEC",
  tagline: "Excellence in Engineering Education",
  established: "1985",
  accreditation: "NAAC A+",
  affiliatedTo: "Anna University",
  logo: null as string | null,
  website: "https://www.demoengg.edu",
  email: "info@demoengg.edu",
  phone: "+91 44 2345 6789",
  address: "123 College Road, Chennai, Tamil Nadu - 600001",
  primaryColor: "#1e40af",
  secondaryColor: "#3b82f6",
};

const academicSettings = {
  currentYear: "2025-26",
  semesterSystem: "semester", // semester or annual
  oddSemStart: "2025-07-01",
  oddSemEnd: "2025-12-15",
  evenSemStart: "2026-01-05",
  evenSemEnd: "2026-05-30",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  classStartTime: "09:00",
  classEndTime: "17:00",
};

const notificationSettings = {
  emailNotifications: true,
  smsNotifications: true,
  attendanceAlerts: true,
  feeReminders: true,
  examNotifications: true,
  resultPublishing: true,
};

export default function PrincipalSettingsPage() {
  const [institution, setInstitution] = useState(institutionData);
  const [academic, setAcademic] = useState(academicSettings);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (section: string) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 3000);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institution Settings</h1>
          <p className="text-muted-foreground">
            Manage your college branding, academic calendar, and preferences
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Shield className="w-3 h-3 mr-1" />
          Principal Access
        </Badge>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Academic</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* College Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  College Logo
                </CardTitle>
                <CardDescription>
                  Upload your institution logo. Recommended size: 200x200px, PNG or SVG.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
                    {logoPreview || institution.logo ? (
                      <img
                        src={logoPreview || institution.logo || ""}
                        alt="College Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-xs">No logo</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </div>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/png,image/svg+xml,image/jpeg"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </Label>
                    {logoPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLogoPreview(null)}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This logo will appear in the sidebar, reports, and student ID cards.
                </p>
              </CardContent>
            </Card>

            {/* Brand Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Brand Colors
                </CardTitle>
                <CardDescription>
                  Set your institution&apos;s primary and secondary colors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={institution.primaryColor}
                        onChange={(e) =>
                          setInstitution({ ...institution, primaryColor: e.target.value })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={institution.primaryColor}
                        onChange={(e) =>
                          setInstitution({ ...institution, primaryColor: e.target.value })
                        }
                        className="flex-1 font-mono"
                        placeholder="#1e40af"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={institution.secondaryColor}
                        onChange={(e) =>
                          setInstitution({ ...institution, secondaryColor: e.target.value })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={institution.secondaryColor}
                        onChange={(e) =>
                          setInstitution({ ...institution, secondaryColor: e.target.value })
                        }
                        className="flex-1 font-mono"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Preview</p>
                  <div className="flex gap-2">
                    <div
                      className="w-20 h-10 rounded flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: institution.primaryColor }}
                    >
                      Primary
                    </div>
                    <div
                      className="w-20 h-10 rounded flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: institution.secondaryColor }}
                    >
                      Secondary
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Institution Details */}
          <Card>
            <CardHeader>
              <CardTitle>Institution Details</CardTitle>
              <CardDescription>
                Basic information about your college that appears across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Institution Name</Label>
                  <Input
                    id="name"
                    value={institution.name}
                    onChange={(e) => setInstitution({ ...institution, name: e.target.value })}
                    placeholder="Enter college name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name / Abbreviation</Label>
                  <Input
                    id="shortName"
                    value={institution.shortName}
                    onChange={(e) => setInstitution({ ...institution, shortName: e.target.value })}
                    placeholder="e.g., DEC"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tagline">Tagline / Motto</Label>
                  <Input
                    id="tagline"
                    value={institution.tagline}
                    onChange={(e) => setInstitution({ ...institution, tagline: e.target.value })}
                    placeholder="e.g., Excellence in Engineering Education"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="established">Year Established</Label>
                  <Input
                    id="established"
                    value={institution.established}
                    onChange={(e) => setInstitution({ ...institution, established: e.target.value })}
                    placeholder="e.g., 1985"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accreditation">Accreditation</Label>
                  <Input
                    id="accreditation"
                    value={institution.accreditation}
                    onChange={(e) => setInstitution({ ...institution, accreditation: e.target.value })}
                    placeholder="e.g., NAAC A+"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="affiliatedTo">Affiliated To</Label>
                  <Input
                    id="affiliatedTo"
                    value={institution.affiliatedTo}
                    onChange={(e) => setInstitution({ ...institution, affiliatedTo: e.target.value })}
                    placeholder="e.g., Anna University"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => handleSave("branding")} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : savedSection === "branding" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Year Configuration</CardTitle>
              <CardDescription>
                Set up your academic calendar and semester dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentYear">Current Academic Year</Label>
                  <Select
                    value={academic.currentYear}
                    onValueChange={(value) => setAcademic({ ...academic, currentYear: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                      <SelectItem value="2026-27">2026-27</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semesterSystem">Academic System</Label>
                  <Select
                    value={academic.semesterSystem}
                    onValueChange={(value) => setAcademic({ ...academic, semesterSystem: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semester">Semester System</SelectItem>
                      <SelectItem value="annual">Annual System</SelectItem>
                      <SelectItem value="trimester">Trimester System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-4">Semester Dates</h4>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-muted-foreground">Odd Semester</h5>
                    <div className="grid gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="oddStart">Start Date</Label>
                        <Input
                          id="oddStart"
                          type="date"
                          value={academic.oddSemStart}
                          onChange={(e) => setAcademic({ ...academic, oddSemStart: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="oddEnd">End Date</Label>
                        <Input
                          id="oddEnd"
                          type="date"
                          value={academic.oddSemEnd}
                          onChange={(e) => setAcademic({ ...academic, oddSemEnd: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-muted-foreground">Even Semester</h5>
                    <div className="grid gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="evenStart">Start Date</Label>
                        <Input
                          id="evenStart"
                          type="date"
                          value={academic.evenSemStart}
                          onChange={(e) => setAcademic({ ...academic, evenSemStart: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="evenEnd">End Date</Label>
                        <Input
                          id="evenEnd"
                          type="date"
                          value={academic.evenSemEnd}
                          onChange={(e) => setAcademic({ ...academic, evenSemEnd: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="classStart">Class Start Time</Label>
                  <Input
                    id="classStart"
                    type="time"
                    value={academic.classStartTime}
                    onChange={(e) => setAcademic({ ...academic, classStartTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classEnd">Class End Time</Label>
                  <Input
                    id="classEnd"
                    type="time"
                    value={academic.classEndTime}
                    onChange={(e) => setAcademic({ ...academic, classEndTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => handleSave("academic")} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : savedSection === "academic" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when notifications are sent to users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email to users
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS to users
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, smsNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Attendance Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Notify parents when student is absent
                    </p>
                  </div>
                  <Switch
                    checked={notifications.attendanceAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, attendanceAlerts: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Fee Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Send reminders for pending fee payments
                    </p>
                  </div>
                  <Switch
                    checked={notifications.feeReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, feeReminders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Exam Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Notify about upcoming exams and schedules
                    </p>
                  </div>
                  <Switch
                    checked={notifications.examNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, examNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Result Publishing</p>
                    <p className="text-sm text-muted-foreground">
                      Notify when exam results are published
                    </p>
                  </div>
                  <Switch
                    checked={notifications.resultPublishing}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, resultPublishing: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("notifications")} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : savedSection === "notifications" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Official contact details displayed to students and parents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={institution.website}
                    onChange={(e) => setInstitution({ ...institution, website: e.target.value })}
                    placeholder="https://www.college.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Official Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={institution.email}
                    onChange={(e) => setInstitution({ ...institution, email: e.target.value })}
                    placeholder="info@college.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={institution.phone}
                    onChange={(e) => setInstitution({ ...institution, phone: e.target.value })}
                    placeholder="+91 44 2345 6789"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={institution.address}
                    onChange={(e) => setInstitution({ ...institution, address: e.target.value })}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => handleSave("contact")} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : savedSection === "contact" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
