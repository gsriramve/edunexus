"use client";

import { useState, useEffect, useId } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Loader2,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { useTenant, useUpdateTenantSettings } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic import Tabs to avoid hydration mismatch with Radix UI
const Tabs = dynamic(
  () => import("@/components/ui/tabs").then((mod) => mod.Tabs),
  { ssr: false }
);
const TabsContent = dynamic(
  () => import("@/components/ui/tabs").then((mod) => mod.TabsContent),
  { ssr: false }
);
const TabsList = dynamic(
  () => import("@/components/ui/tabs").then((mod) => mod.TabsList),
  { ssr: false }
);
const TabsTrigger = dynamic(
  () => import("@/components/ui/tabs").then((mod) => mod.TabsTrigger),
  { ssr: false }
);

export default function PrincipalSettingsPage() {
  const tenantId = useTenantId();
  const { data: tenant, isLoading, error } = useTenant(tenantId || "");
  const updateSettings = useUpdateTenantSettings(tenantId || "");
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Ensure client-side only rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form state - initialized from tenant data
  const [institution, setInstitution] = useState({
    displayName: "",
    shortName: "",
    tagline: "",
    established: "",
    accreditation: "",
    affiliatedTo: "",
    logo: null as string | null,
    website: "",
    email: "",
    phone: "",
    address: "",
    primaryColor: "#1e40af",
    secondaryColor: "#3b82f6",
  });

  const [academic, setAcademic] = useState({
    academicYear: "2025-26",
    semesterSystem: "semester",
    oddSemStart: "",
    oddSemEnd: "",
    evenSemStart: "",
    evenSemEnd: "",
    classStartTime: "09:00",
    classEndTime: "17:00",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    attendanceAlerts: true,
    feeReminders: true,
    examNotifications: true,
    resultPublishing: true,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  // Populate form from tenant data when it loads
  useEffect(() => {
    if (tenant) {
      const config = (tenant.config as Record<string, any>) || {};
      const theme = (tenant.theme as Record<string, any>) || {};

      setInstitution({
        displayName: tenant.displayName || tenant.name || "",
        shortName: config.shortName || "",
        tagline: config.tagline || "",
        established: config.established || "",
        accreditation: config.accreditation || "",
        affiliatedTo: config.affiliatedTo || "",
        logo: tenant.logo || null,
        website: config.website || "",
        email: config.email || "",
        phone: config.phone || "",
        address: config.address || "",
        primaryColor: theme.primaryColor || "#1e40af",
        secondaryColor: theme.secondaryColor || "#3b82f6",
      });

      setAcademic({
        academicYear: config.academicYear || "2025-26",
        semesterSystem: config.semesterSystem || "semester",
        oddSemStart: config.oddSemStart || "",
        oddSemEnd: config.oddSemEnd || "",
        evenSemStart: config.evenSemStart || "",
        evenSemEnd: config.evenSemEnd || "",
        classStartTime: config.classStartTime || "09:00",
        classEndTime: config.classEndTime || "17:00",
      });

      setNotifications({
        emailNotifications: config.emailNotifications ?? true,
        smsNotifications: config.smsNotifications ?? true,
        attendanceAlerts: config.attendanceAlerts ?? true,
        feeReminders: config.feeReminders ?? true,
        examNotifications: config.examNotifications ?? true,
        resultPublishing: config.resultPublishing ?? true,
      });

      if (tenant.logo) {
        setLogoPreview(tenant.logo);
      }
    }
  }, [tenant]);

  const compressImage = (file: File, maxWidth: number = 200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Scale down if larger than maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL("image/jpeg", quality);
          resolve(base64);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress image to reduce size
        const compressedBase64 = await compressImage(file, 200, 0.8);
        setLogoPreview(compressedBase64);
        setInstitution(prev => ({ ...prev, logo: compressedBase64 }));
      } catch (err) {
        console.error("Logo compression error:", err);
        toast({
          title: "Error uploading logo",
          description: "Failed to process the image. Please try a different file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = async (section: string) => {
    try {
      let settingsToUpdate: Parameters<typeof updateSettings.mutateAsync>[0] = {};

      if (section === "branding") {
        settingsToUpdate = {
          displayName: institution.displayName,
          logo: institution.logo || undefined,
          theme: {
            primaryColor: institution.primaryColor,
            secondaryColor: institution.secondaryColor,
          },
          config: {
            shortName: institution.shortName,
            tagline: institution.tagline,
            established: institution.established,
            accreditation: institution.accreditation,
            affiliatedTo: institution.affiliatedTo,
          },
        };
      } else if (section === "academic") {
        settingsToUpdate = {
          config: {
            academicYear: academic.academicYear,
            semesterSystem: academic.semesterSystem,
            oddSemStart: academic.oddSemStart,
            oddSemEnd: academic.oddSemEnd,
            evenSemStart: academic.evenSemStart,
            evenSemEnd: academic.evenSemEnd,
            classStartTime: academic.classStartTime,
            classEndTime: academic.classEndTime,
          },
        };
      } else if (section === "notifications") {
        settingsToUpdate = {
          config: {
            emailNotifications: notifications.emailNotifications,
            smsNotifications: notifications.smsNotifications,
            attendanceAlerts: notifications.attendanceAlerts,
            feeReminders: notifications.feeReminders,
            examNotifications: notifications.examNotifications,
            resultPublishing: notifications.resultPublishing,
          },
        };
      } else if (section === "contact") {
        settingsToUpdate = {
          config: {
            website: institution.website,
            email: institution.email,
            phone: institution.phone,
            address: institution.address,
          },
        };
      }

      await updateSettings.mutateAsync(settingsToUpdate);
      setSavedSection(section);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
      setTimeout(() => setSavedSection(null), 3000);
    } catch (err: any) {
      console.error("Save settings error:", err);
      const errorMessage = err?.message || err?.data?.message || "Failed to save settings. Please try again.";

      // Check if it's a payload too large error
      const isPayloadTooLarge = err?.status === 413 || errorMessage.includes("too large");

      toast({
        title: "Error saving settings",
        description: isPayloadTooLarge
          ? "Logo file is too large. Please use an image smaller than 1MB."
          : errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Failed to load tenant settings. Please try again.</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSaving = updateSettings.isPending;

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
                    {logoPreview ? (
                      <img
                        src={logoPreview}
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
                        onClick={() => {
                          setLogoPreview(null);
                          setInstitution(prev => ({ ...prev, logo: null }));
                        }}
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
                  <Label htmlFor="displayName">Institution Name</Label>
                  <Input
                    id="displayName"
                    value={institution.displayName}
                    onChange={(e) => setInstitution({ ...institution, displayName: e.target.value })}
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
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
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
                  <Label htmlFor="academicYear">Current Academic Year</Label>
                  <Select
                    value={academic.academicYear}
                    onValueChange={(value) => setAcademic({ ...academic, academicYear: value })}
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
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
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
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
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
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
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
