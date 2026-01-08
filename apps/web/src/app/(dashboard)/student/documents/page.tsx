"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  File,
  Image,
  FileSpreadsheet,
  FileType,
  HardDrive,
  CheckCircle2,
  Clock,
  MoreVertical,
  Plus,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  documentsApi,
  Document as DocType,
  DocumentCategory,
  DocumentVisibility,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId } from "@/hooks/use-api";

const categoryLabels: Record<string, string> = {
  academic: "Academic",
  personal: "Personal",
  certificate: "Certificates",
  identity: "Identity Documents",
  financial: "Financial",
  assignment: "Assignments",
  other: "Other",
};

const getFileIcon = (mimeType: string, size: "sm" | "lg" = "sm") => {
  const className = size === "lg" ? "h-8 w-8" : "h-5 w-5";
  if (mimeType.startsWith("image/")) return <Image className={`${className} text-purple-500`} />;
  if (mimeType.includes("pdf")) return <FileText className={`${className} text-red-500`} />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return <FileSpreadsheet className={`${className} text-green-500`} />;
  if (mimeType.includes("word") || mimeType.includes("document"))
    return <FileType className={`${className} text-blue-500`} />;
  return <File className={`${className} text-gray-500`} />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getCategoryBadgeColor = (category: string): string => {
  const colors: Record<string, string> = {
    academic: "bg-blue-100 text-blue-700",
    personal: "bg-purple-100 text-purple-700",
    certificate: "bg-green-100 text-green-700",
    identity: "bg-orange-100 text-orange-700",
    financial: "bg-emerald-100 text-emerald-700",
    assignment: "bg-indigo-100 text-indigo-700",
    other: "bg-gray-100 text-gray-700",
  };
  return colors[category] || colors.other;
};

export default function StudentDocumentsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth context
  const { user, isLoaded: isUserLoaded } = useUser();
  const tenantId = useTenantId() || '';
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');

  const userId = user?.id || '';
  const userName = studentData?.user?.name || '';
  const studentId = studentData?.id || '';

  // State
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: "personal" as DocumentCategory,
    tags: "",
  });
  const [uploading, setUploading] = useState(false);

  // Load documents
  const loadDocuments = async () => {
    if (!tenantId || !userId) return;
    setLoading(true);
    try {
      const data = await documentsApi.getUserDocuments(tenantId, userId, "student");
      setDocuments(data);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({ title: "Error", description: "Failed to load documents", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId && userId) {
      loadDocuments();
    }
  }, [tenantId, userId]);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group documents by category
  const documentsByCategory = filteredDocuments.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    },
    {} as Record<string, DocType[]>
  );

  // Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadForm((prev) => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, "") }));
      setUploadDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !tenantId || !userId) return;

    setUploading(true);
    try {
      await documentsApi.uploadDocument(tenantId, selectedFile, {
        name: uploadForm.name,
        description: uploadForm.description,
        category: uploadForm.category,
        visibility: "private" as DocumentVisibility,
        tags: uploadForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        uploadedById: userId,
        uploadedByType: "student",
        uploadedByName: userName,
        studentId: studentId,
      });

      toast({ title: "Success", description: "Document uploaded successfully" });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadForm({ name: "", description: "", category: "personal", tags: "" });
      loadDocuments();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: DocType) => {
    if (!tenantId) return;
    try {
      const { url } = await documentsApi.getDownloadUrl(tenantId, doc.id, userId, userName);
      window.open(url, "_blank");
    } catch (error) {
      toast({ title: "Error", description: "Failed to download document", variant: "destructive" });
    }
  };

  const handleView = async (doc: DocType) => {
    if (!tenantId) return;
    try {
      const { url } = await documentsApi.getViewUrl(tenantId, doc.id, userId, userName);
      window.open(url, "_blank");
    } catch (error) {
      toast({ title: "Error", description: "Failed to view document", variant: "destructive" });
    }
  };

  const handleDelete = async (doc: DocType) => {
    if (!tenantId) return;
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await documentsApi.deleteDocument(tenantId, doc.id);
      toast({ title: "Success", description: "Document deleted" });
      loadDocuments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete document", variant: "destructive" });
    }
  };

  // Initial loading state
  if (!isUserLoaded || studentLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Count documents by category
  const categoryCounts = documents.reduce(
    (acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate storage used
  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your personal documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadDocuments}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
            <Progress value={Math.min((totalSize / (100 * 1024 * 1024)) * 100, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">of 100 MB quota</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter((d) => d.isVerified).length}
            </div>
            <p className="text-xs text-muted-foreground">documents verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(categoryCounts).length}</div>
            <p className="text-xs text-muted-foreground">document types</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="certificate">Certificates</SelectItem>
            <SelectItem value="identity">Identity</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              {documents.length === 0
                ? "Upload your first document to get started"
                : "Try changing your search or filter"}
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({filteredDocuments.length})</TabsTrigger>
            {Object.entries(categoryCounts).slice(0, 4).map(([cat, count]) => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {categoryLabels[cat] || cat} ({count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDownload={() => handleDownload(doc)}
                  onView={() => handleView(doc)}
                  onDelete={() => handleDelete(doc)}
                />
              ))}
            </div>
          </TabsContent>

          {Object.keys(categoryCounts).slice(0, 4).map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documentsByCategory[cat]?.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onDownload={() => handleDownload(doc)}
                    onView={() => handleView(doc)}
                    onDelete={() => handleDelete(doc)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Quick Upload Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-dashed cursor-pointer hover:bg-muted/50" onClick={() => {
          setUploadForm((prev) => ({ ...prev, category: "identity" }));
          fileInputRef.current?.click();
        }}>
          <CardContent className="py-6 text-center">
            <FileType className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <h3 className="font-medium">Identity Documents</h3>
            <p className="text-sm text-muted-foreground">Aadhar, PAN, Passport</p>
          </CardContent>
        </Card>
        <Card className="border-dashed cursor-pointer hover:bg-muted/50" onClick={() => {
          setUploadForm((prev) => ({ ...prev, category: "certificate" }));
          fileInputRef.current?.click();
        }}>
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-medium">Certificates</h3>
            <p className="text-sm text-muted-foreground">Marksheets, Degrees</p>
          </CardContent>
        </Card>
        <Card className="border-dashed cursor-pointer hover:bg-muted/50" onClick={() => {
          setUploadForm((prev) => ({ ...prev, category: "academic" }));
          fileInputRef.current?.click();
        }}>
          <CardContent className="py-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-medium">Academic</h3>
            <p className="text-sm text-muted-foreground">Notes, Assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              {selectedFile && (
                <span className="text-sm">
                  File: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Document Name</Label>
              <Input
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="Enter document name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Add a description for this document"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(v) => setUploadForm({ ...uploadForm, category: v as DocumentCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="identity">Identity Document</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tags (comma separated, optional)</Label>
              <Input
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                placeholder="e.g., important, semester-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !uploadForm.name}>
              {uploading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Document Card Component
function DocumentCard({
  doc,
  onDownload,
  onView,
  onDelete,
}: {
  doc: DocType;
  onDownload: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              {getFileIcon(doc.mimeType, "lg")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{doc.name}</h3>
                {doc.isVerified && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{doc.originalName}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className={getCategoryBadgeColor(doc.category)}>
                  {categoryLabels[doc.category] || doc.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
