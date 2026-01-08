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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Building2,
  Briefcase,
  GraduationCap,
  Linkedin,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useAlumniDirectory,
  useDirectoryFilters,
  type AlumniProfile,
  type CurrentStatus,
  type QueryAlumniParams,
} from "@/hooks/use-alumni";

const statusLabels: Record<CurrentStatus, string> = {
  employed: "Employed",
  entrepreneur: "Entrepreneur",
  higher_studies: "Higher Studies",
  unemployed: "Looking for Opportunities",
  other: "Other",
};

const statusColors: Record<CurrentStatus, string> = {
  employed: "bg-green-100 text-green-800",
  entrepreneur: "bg-purple-100 text-purple-800",
  higher_studies: "bg-blue-100 text-blue-800",
  unemployed: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-800",
};

export default function AlumniDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<QueryAlumniParams>({});
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);

  const tenantId = useTenantId();

  const { data: directoryData, isLoading: directoryLoading } = useAlumniDirectory(
    tenantId || "",
    {
      search: searchQuery || undefined,
      ...filters,
      limit: 50,
    }
  );
  const { data: filterOptions, isLoading: filtersLoading } = useDirectoryFilters(tenantId || "");

  const isLoading = directoryLoading || filtersLoading;
  const alumni = directoryData?.data || [];
  const totalCount = directoryData?.total || 0;

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alumni Directory</h1>
        <p className="text-muted-foreground">
          Connect with {totalCount.toLocaleString()} alumni from your institution
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, or role..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filterOptions?.batches && filterOptions.batches.length > 0 && (
            <Select
              value={filters.batch || ""}
              onValueChange={(value) =>
                setFilters({ ...filters, batch: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="w-[140px]">
                <GraduationCap className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {filterOptions.batches.map((batch) => (
                  <SelectItem key={batch} value={batch}>
                    {batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {filterOptions?.departments && filterOptions.departments.length > 0 && (
            <Select
              value={filters.departmentId || ""}
              onValueChange={(value) =>
                setFilters({ ...filters, departmentId: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="w-[160px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {filterOptions.departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {filterOptions?.industries && filterOptions.industries.length > 0 && (
            <Select
              value={filters.industry || ""}
              onValueChange={(value) =>
                setFilters({ ...filters, industry: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="w-[160px]">
                <Briefcase className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {filterOptions.industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={filters.currentStatus || ""}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                currentStatus: value === "all" ? undefined : (value as CurrentStatus),
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalCount} results
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Alumni Grid */}
      {alumni.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alumni.map((profile) => (
            <Card
              key={profile.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAlumni(profile)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={profile.photoUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                    <AvatarFallback>
                      {profile.firstName?.[0]}
                      {profile.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {profile.firstName} {profile.lastName}
                    </CardTitle>
                    {profile.employmentHistory?.[0] && (
                      <CardDescription className="truncate">
                        {profile.employmentHistory[0].role}
                      </CardDescription>
                    )}
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {profile.batch}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {profile.employmentHistory?.[0] && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{profile.employmentHistory[0].companyName}</span>
                    </div>
                  )}

                  {profile.department && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{profile.department.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Badge className={statusColors[profile.currentStatus]}>
                      {statusLabels[profile.currentStatus]}
                    </Badge>
                    {profile.openToMentoring && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Open to Mentor
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Alumni Found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || activeFiltersCount > 0
                ? "Try adjusting your search or filters"
                : "No alumni profiles are available"}
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alumni Profile Dialog */}
      <Dialog open={selectedAlumni !== null} onOpenChange={() => setSelectedAlumni(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedAlumni && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedAlumni.photoUrl}
                      alt={`${selectedAlumni.firstName} ${selectedAlumni.lastName}`}
                    />
                    <AvatarFallback className="text-lg">
                      {selectedAlumni.firstName?.[0]}
                      {selectedAlumni.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>
                      {selectedAlumni.firstName} {selectedAlumni.lastName}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedAlumni.department?.name} • {selectedAlumni.batch}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusColors[selectedAlumni.currentStatus]}>
                    {statusLabels[selectedAlumni.currentStatus]}
                  </Badge>
                  {selectedAlumni.openToMentoring && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Open to Mentoring
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                {selectedAlumni.bio && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">{selectedAlumni.bio}</p>
                  </div>
                )}

                {/* Current Employment */}
                {selectedAlumni.employmentHistory?.[0] && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Current Position</h4>
                    <div className="p-3 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {selectedAlumni.employmentHistory[0].role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {selectedAlumni.employmentHistory[0].companyName}
                      </div>
                      {selectedAlumni.employmentHistory[0].location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {selectedAlumni.employmentHistory[0].location}
                        </div>
                      )}
                      {selectedAlumni.employmentHistory[0].industry && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedAlumni.employmentHistory[0].industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Academic Details */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Academic Background</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      {selectedAlumni.degree && `${selectedAlumni.degree}, `}
                      {selectedAlumni.department?.name}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Batch {selectedAlumni.batch} ({selectedAlumni.graduationYear})
                    </div>
                    {selectedAlumni.finalCgpa && (
                      <div className="text-muted-foreground">
                        Final CGPA: {selectedAlumni.finalCgpa.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mentorship Areas */}
                {selectedAlumni.mentorshipAreas && selectedAlumni.mentorshipAreas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Mentorship Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlumni.mentorshipAreas.map((area) => (
                        <Badge key={area} variant="secondary">
                          {area.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact & Social */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Connect</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlumni.linkedinUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={selectedAlumni.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {selectedAlumni.websiteUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={selectedAlumni.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                    {selectedAlumni.email && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${selectedAlumni.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </a>
                      </Button>
                    )}
                    {selectedAlumni.phone && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${selectedAlumni.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Achievements */}
                {selectedAlumni.achievements && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Achievements</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAlumni.achievements}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
