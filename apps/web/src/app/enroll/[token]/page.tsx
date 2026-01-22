"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  GraduationCap,
  Home,
  Send,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { studentEnrollmentApi, type StudentEnrollment } from "@/lib/api";

interface TenantData {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
}

export default function EnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<StudentEnrollment | null>(null);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasSignedUp, setHasSignedUp] = useState(false);

  // Form data
  const [personalDetails, setPersonalDetails] = useState({
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    nationality: "Indian",
    religion: "",
    category: "",
    aadharNumber: "",
    fatherName: "",
    fatherOccupation: "",
    fatherPhone: "",
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  const [academicDetails, setAcademicDetails] = useState({
    previousInstitution: "",
    previousBoard: "",
    passingYear: "",
    percentage: "",
    rollNumber: "",
  });

  const [documents, setDocuments] = useState<Record<string, { url: string; uploadedAt: string }>>({});

  const steps = [
    { id: 1, title: "Personal Details", icon: User },
    { id: 2, title: "Academic Info", icon: GraduationCap },
    { id: 3, title: "Documents", icon: FileText },
    { id: 4, title: "Review & Submit", icon: Send },
  ];

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      const data = await studentEnrollmentApi.verifyToken(token);

      if (!data.valid) {
        throw new Error(data.expired ? "This enrollment link has expired" : "Invalid enrollment link");
      }

      const enrollment = data.enrollment;
      if (enrollment) {
        setEnrollment(enrollment);
        // Extract tenant data from enrollment
        setTenant({
          id: enrollment.tenantId,
          name: "",
          displayName: enrollment.department?.name || "Institution",
        });

        // Pre-fill form with existing data
        if (enrollment.personalDetails) {
          setPersonalDetails((prev) => ({
            ...prev,
            ...enrollment.personalDetails,
          }));
        }
        if (enrollment.academicDetails) {
          setAcademicDetails((prev) => ({
            ...prev,
            ...enrollment.academicDetails,
          }));
        }
        if (enrollment.documents) {
          setDocuments(enrollment.documents);
        }

        // Determine current step based on status
        if (enrollment.status === "SUBMITTED" || enrollment.status === "ADMIN_APPROVED") {
          setCurrentStep(4);
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired enrollment link");
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      await studentEnrollmentApi.updateProfile(token, {
        personalDetails,
        academicDetails,
        documents,
      });
      toast.success("Progress saved");
    } catch (err) {
      toast.error("Failed to save progress");
    }
  };

  const handleNext = async () => {
    // Save progress when moving to next step
    await saveProgress();
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!personalDetails.dateOfBirth || !personalDetails.gender) {
      toast.error("Please fill in all required personal details");
      setCurrentStep(1);
      return;
    }

    if (!documents.photo) {
      toast.error("Please upload your photo");
      setCurrentStep(3);
      return;
    }

    try {
      setSubmitting(true);

      // Save final progress
      await saveProgress();

      // Submit for review
      await studentEnrollmentApi.submit(token);

      toast.success("Application submitted successfully!");

      // Refresh to show submitted status
      await verifyToken();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  // Mock file upload (in real implementation, upload to S3)
  const handleFileUpload = async (docType: string, file: File) => {
    // In real implementation, upload to S3 and get URL
    const mockUrl = URL.createObjectURL(file);
    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        url: mockUrl,
        uploadedAt: new Date().toISOString(),
      },
    }));
    toast.success(`${docType} uploaded`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your enrollment link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Please contact your institution if you need assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!enrollment || !tenant) {
    return null;
  }

  const isSubmitted = enrollment.status === "SUBMITTED" || enrollment.status === "ADMIN_APPROVED";
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                E
              </div>
              <div>
                <h1 className="font-bold">{tenant.displayName}</h1>
                <p className="text-sm text-muted-foreground">Student Enrollment</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {enrollment.department?.name} | {enrollment.academicYear}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Welcome, {enrollment.firstName} {enrollment.lastName}!
                </h2>
                <p className="text-muted-foreground">
                  Complete your enrollment application by filling in the details below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isSubmitted ? (
          /* Submitted Status */
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your enrollment application has been submitted and is under review.
                You will be notified via email once it&apos;s approved.
              </p>
              <div className="p-4 rounded-lg bg-blue-50 text-left max-w-md mx-auto">
                <h4 className="font-medium text-blue-800 mb-2">What&apos;s Next?</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Admin will review your documents</li>
                  <li>HOD/Principal will give final approval</li>
                  <li>You&apos;ll receive your roll number and official email</li>
                  <li>You can then login to the student portal</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        currentStep >= step.id
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          currentStep > step.id ? "bg-primary" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                {steps.map((step) => (
                  <span
                    key={step.id}
                    className={currentStep >= step.id ? "text-primary font-medium" : "text-muted-foreground"}
                  >
                    {step.title}
                  </span>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Fill in your personal information"}
                  {currentStep === 2 && "Provide your previous academic details"}
                  {currentStep === 3 && "Upload required documents"}
                  {currentStep === 4 && "Review your information and submit"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Step 1: Personal Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Birth *</Label>
                        <Input
                          type="date"
                          value={personalDetails.dateOfBirth}
                          onChange={(e) =>
                            setPersonalDetails((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender *</Label>
                        <Select
                          value={personalDetails.gender}
                          onValueChange={(value) =>
                            setPersonalDetails((prev) => ({ ...prev, gender: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Blood Group</Label>
                        <Select
                          value={personalDetails.bloodGroup}
                          onValueChange={(value) =>
                            setPersonalDetails((prev) => ({ ...prev, bloodGroup: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                              <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={personalDetails.category}
                          onValueChange={(value) =>
                            setPersonalDetails((prev) => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="OBC">OBC</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="ST">ST</SelectItem>
                            <SelectItem value="EWS">EWS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Father&apos;s Name</Label>
                        <Input
                          value={personalDetails.fatherName}
                          onChange={(e) =>
                            setPersonalDetails((prev) => ({ ...prev, fatherName: e.target.value }))
                          }
                          placeholder="Enter father's name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Father&apos;s Phone</Label>
                        <Input
                          value={personalDetails.fatherPhone}
                          onChange={(e) =>
                            setPersonalDetails((prev) => ({ ...prev, fatherPhone: e.target.value }))
                          }
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mother&apos;s Name</Label>
                        <Input
                          value={personalDetails.motherName}
                          onChange={(e) =>
                            setPersonalDetails((prev) => ({ ...prev, motherName: e.target.value }))
                          }
                          placeholder="Enter mother's name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mother&apos;s Phone</Label>
                        <Input
                          value={personalDetails.motherPhone}
                          onChange={(e) =>
                            setPersonalDetails((prev) => ({ ...prev, motherPhone: e.target.value }))
                          }
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Address
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                          <Label>Street Address</Label>
                          <Textarea
                            value={personalDetails.address.street}
                            onChange={(e) =>
                              setPersonalDetails((prev) => ({
                                ...prev,
                                address: { ...prev.address, street: e.target.value },
                              }))
                            }
                            placeholder="Enter street address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            value={personalDetails.address.city}
                            onChange={(e) =>
                              setPersonalDetails((prev) => ({
                                ...prev,
                                address: { ...prev.address, city: e.target.value },
                              }))
                            }
                            placeholder="Enter city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input
                            value={personalDetails.address.state}
                            onChange={(e) =>
                              setPersonalDetails((prev) => ({
                                ...prev,
                                address: { ...prev.address, state: e.target.value },
                              }))
                            }
                            placeholder="Enter state"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pincode</Label>
                          <Input
                            value={personalDetails.address.pincode}
                            onChange={(e) =>
                              setPersonalDetails((prev) => ({
                                ...prev,
                                address: { ...prev.address, pincode: e.target.value },
                              }))
                            }
                            placeholder="Enter pincode"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Academic Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label>Previous Institution</Label>
                        <Input
                          value={academicDetails.previousInstitution}
                          onChange={(e) =>
                            setAcademicDetails((prev) => ({ ...prev, previousInstitution: e.target.value }))
                          }
                          placeholder="Name of your previous school/college"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Board/University</Label>
                        <Select
                          value={academicDetails.previousBoard}
                          onValueChange={(value) =>
                            setAcademicDetails((prev) => ({ ...prev, previousBoard: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select board" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CBSE">CBSE</SelectItem>
                            <SelectItem value="ICSE">ICSE</SelectItem>
                            <SelectItem value="State Board">State Board</SelectItem>
                            <SelectItem value="IB">IB</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Year of Passing</Label>
                        <Select
                          value={academicDetails.passingYear}
                          onValueChange={(value) =>
                            setAcademicDetails((prev) => ({ ...prev, passingYear: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {[2024, 2025, 2026].map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Percentage/CGPA</Label>
                        <Input
                          type="number"
                          value={academicDetails.percentage}
                          onChange={(e) =>
                            setAcademicDetails((prev) => ({ ...prev, percentage: e.target.value }))
                          }
                          placeholder="e.g., 85.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Previous Roll Number</Label>
                        <Input
                          value={academicDetails.rollNumber}
                          onChange={(e) =>
                            setAcademicDetails((prev) => ({ ...prev, rollNumber: e.target.value }))
                          }
                          placeholder="12th class roll number"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Documents */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Upload clear, legible copies of the following documents (Max 5MB each, PDF or Image)
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: "photo", label: "Passport Photo *", required: true },
                        { key: "aadharCard", label: "Aadhar Card", required: false },
                        { key: "marksheet10th", label: "10th Marksheet", required: false },
                        { key: "marksheet12th", label: "12th Marksheet", required: false },
                        { key: "transferCertificate", label: "Transfer Certificate", required: false },
                        { key: "communityCertificate", label: "Community Certificate", required: false },
                      ].map((doc) => (
                        <div
                          key={doc.key}
                          className={`p-4 rounded-lg border-2 border-dashed ${
                            documents[doc.key]
                              ? "border-green-300 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Label className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {doc.label}
                            </Label>
                            {documents[doc.key] && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            id={`file-${doc.key}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(doc.key, file);
                            }}
                          />
                          <label
                            htmlFor={`file-${doc.key}`}
                            className="cursor-pointer block text-center"
                          >
                            {documents[doc.key] ? (
                              <span className="text-sm text-green-600">Uploaded - Click to replace</span>
                            ) : (
                              <span className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                <Upload className="h-4 w-4" />
                                Click to upload
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium mb-4">Personal Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Date of Birth:</span>
                          <span className="ml-2 font-medium">{personalDetails.dateOfBirth || "Not provided"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gender:</span>
                          <span className="ml-2 font-medium capitalize">{personalDetails.gender || "Not provided"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Father&apos;s Name:</span>
                          <span className="ml-2 font-medium">{personalDetails.fatherName || "Not provided"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mother&apos;s Name:</span>
                          <span className="ml-2 font-medium">{personalDetails.motherName || "Not provided"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium mb-4">Academic Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Previous Institution:</span>
                          <span className="ml-2 font-medium">{academicDetails.previousInstitution || "Not provided"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Board:</span>
                          <span className="ml-2 font-medium">{academicDetails.previousBoard || "Not provided"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Percentage:</span>
                          <span className="ml-2 font-medium">{academicDetails.percentage ? `${academicDetails.percentage}%` : "Not provided"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium mb-4">Documents</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {["photo", "aadharCard", "marksheet10th", "marksheet12th", "transferCertificate"].map((doc) => (
                          <div key={doc} className="flex items-center gap-2">
                            {documents[doc] ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm capitalize">{doc.replace(/([A-Z])/g, " $1").trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Important:</strong> Please review all information carefully before submitting.
                        Once submitted, you won&apos;t be able to make changes unless requested by the admin.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep < 4 ? (
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by EduNexus</p>
        </div>
      </footer>
    </div>
  );
}
