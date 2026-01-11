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
import { Skeleton } from "@/components/ui/skeleton";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Handshake,
  Search,
  Building2,
  Briefcase,
  GraduationCap,
  Linkedin,
  Mail,
  Star,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Users,
  Filter,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useAlumniMentors,
  useRequestMentorship,
  useMyMentorshipsAsStudent,
  type FocusArea,
} from "@/hooks/use-api";
import { useAuth } from "@/lib/auth";

// Focus area options - must match FocusArea type
const focusAreas: { value: FocusArea; label: string }[] = [
  { value: "career_guidance", label: "Career Guidance" },
  { value: "interview_prep", label: "Interview Preparation" },
  { value: "technical", label: "Technical Skills" },
  { value: "resume_review", label: "Resume Review" },
  { value: "general", label: "General Guidance" },
  { value: "higher_studies", label: "Higher Studies" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
];

export default function StudentMentorshipPage() {
  const [activeTab, setActiveTab] = useState("find");
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>("");

  const tenantId = useTenantId();
  const { user } = useAuth();

  const { data: mentors, isLoading: mentorsLoading } = useAlumniMentors(tenantId || "");
  const { data: myMentorships, isLoading: myMentorshipsLoading } = useMyMentorshipsAsStudent(tenantId || "");
  const requestMentorship = useRequestMentorship(tenantId || "");

  const isLoading = mentorsLoading;

  // Filter mentors
  const filteredMentors = mentors?.filter((mentor: any) => {
    const matchesSearch = searchQuery === "" ||
      `${mentor.firstName} ${mentor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.currentRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.currentCompany?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = industryFilter === "all" ||
      mentor.industry?.toLowerCase() === industryFilter.toLowerCase();

    return matchesSearch && matchesIndustry;
  }) || [];

  // Get unique industries
  const industries = Array.from(
    new Set(mentors?.map((m: any) => m.industry).filter(Boolean) || [])
  );

  const handleRequestMentorship = () => {
    if (selectedMentor && selectedFocusArea) {
      requestMentorship.mutate(
        {
          alumniId: selectedMentor.id,
          focusArea: selectedFocusArea as FocusArea,
          requestMessage: requestMessage || undefined,
        },
        {
          onSuccess: () => {
            setSelectedMentor(null);
            setRequestMessage("");
            setSelectedFocusArea("");
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find a Mentor</h1>
          <p className="text-muted-foreground">
            Connect with alumni mentors who can guide your career journey
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="find">
            <Search className="h-4 w-4 mr-2" />
            Find Mentors
          </TabsTrigger>
          <TabsTrigger value="my-mentors">
            <Handshake className="h-4 w-4 mr-2" />
            My Mentorships
          </TabsTrigger>
        </TabsList>

        {/* Find Mentors Tab */}
        <TabsContent value="find" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or company..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry.toLowerCase()}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mentors Grid */}
          {filteredMentors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMentors.map((mentor: any) => (
                <Card key={mentor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={mentor.photoUrl} alt={`${mentor.firstName} ${mentor.lastName}`} />
                        <AvatarFallback>
                          {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {mentor.firstName} {mentor.lastName}
                        </CardTitle>
                        <CardDescription>
                          {mentor.currentRole || "Professional"}
                        </CardDescription>
                        {mentor.currentCompany && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Building2 className="h-3 w-3" />
                            {mentor.currentCompany}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <GraduationCap className="h-4 w-4" />
                          {mentor.graduationYear}
                        </div>
                        {mentor.rating && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="h-4 w-4 fill-current" />
                            {mentor.rating.toFixed(1)}
                          </div>
                        )}
                        {mentor.activeMentees !== undefined && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {mentor.activeMentees} mentees
                          </div>
                        )}
                      </div>

                      {/* Focus Areas */}
                      {mentor.focusAreas && mentor.focusAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {mentor.focusAreas.slice(0, 3).map((area: string) => (
                            <Badge key={area} variant="secondary" className="text-xs">
                              {focusAreas.find(f => f.value === area)?.label || area}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* LinkedIn */}
                      {mentor.linkedinUrl && (
                        <a
                          href={mentor.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn Profile
                        </a>
                      )}

                      {/* Connect Button */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full mt-2"
                            onClick={() => setSelectedMentor(mentor)}
                          >
                            <Handshake className="h-4 w-4 mr-2" />
                            Request Mentorship
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Mentorship</DialogTitle>
                            <DialogDescription>
                              Send a mentorship request to {mentor.firstName} {mentor.lastName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Focus Area</label>
                              <Select value={selectedFocusArea} onValueChange={setSelectedFocusArea}>
                                <SelectTrigger>
                                  <SelectValue placeholder="What do you need help with?" />
                                </SelectTrigger>
                                <SelectContent>
                                  {focusAreas.map((area) => (
                                    <SelectItem key={area.value} value={area.value}>
                                      {area.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Message (Optional)</label>
                              <Textarea
                                placeholder="Introduce yourself and explain what guidance you're seeking..."
                                value={requestMessage}
                                onChange={(e) => setRequestMessage(e.target.value)}
                                rows={4}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedMentor(null);
                                setRequestMessage("");
                                setSelectedFocusArea("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleRequestMentorship}
                              disabled={!selectedFocusArea || requestMentorship.isPending}
                            >
                              {requestMentorship.isPending ? "Sending..." : "Send Request"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Handshake className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Mentors Found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery || industryFilter !== "all"
                    ? "Try adjusting your search filters."
                    : "No alumni mentors are available at this time."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Mentorships Tab */}
        <TabsContent value="my-mentors" className="space-y-4">
          {myMentorshipsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : myMentorships && myMentorships.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {myMentorships.map((mentorship: any) => (
                <Card key={mentorship.id}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={mentorship.alumni?.photoUrl}
                          alt={`${mentorship.alumni?.firstName} ${mentorship.alumni?.lastName}`}
                        />
                        <AvatarFallback>
                          {mentorship.alumni?.firstName?.[0]}{mentorship.alumni?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {mentorship.alumni?.firstName} {mentorship.alumni?.lastName}
                        </CardTitle>
                        <CardDescription>
                          {mentorship.alumni?.currentRole} at {mentorship.alumni?.currentCompany}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          mentorship.status === "active"
                            ? "default"
                            : mentorship.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {mentorship.status === "active" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {mentorship.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {mentorship.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>Focus: {focusAreas.find(f => f.value === mentorship.focusArea)?.label || mentorship.focusArea}</span>
                      </div>

                      {mentorship.startDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Started: {new Date(mentorship.startDate).toLocaleDateString()}
                        </div>
                      )}

                      {mentorship.meetingsCount !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          {mentorship.meetingsCount} meetings
                        </div>
                      )}

                      {mentorship.status === "active" && (
                        <Button variant="outline" className="w-full mt-2" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Mentorships</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't connected with any mentors yet.
                </p>
                <Button onClick={() => setActiveTab("find")}>
                  <Search className="h-4 w-4 mr-2" />
                  Find Mentors
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
