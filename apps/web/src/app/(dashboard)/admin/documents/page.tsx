"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  FileText,
  Folder,
  Upload,
  Download,
  Trash2,
  Eye,
  Share2,
  Settings,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  FolderPlus,
  ChevronRight,
  Home,
  File,
  Image,
  FileSpreadsheet,
  FileType,
  HardDrive,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Grid,
  List,
  Loader2,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
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
  DocumentStats,
  Document as DocType,
  DocumentFolder,
  DocumentFolderWithCount,
  DocumentCategory,
  DocumentVisibility,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const categoryIcons: Record<string, React.ReactNode> = {
  academic: <FileText className="h-4 w-4 text-blue-500" />,
  administrative: <File className="h-4 w-4 text-gray-500" />,
  personal: <User className="h-4 w-4 text-purple-500" />,
  certificate: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  identity: <FileType className="h-4 w-4 text-orange-500" />,
  financial: <FileSpreadsheet className="h-4 w-4 text-emerald-500" />,
  assignment: <FileText className="h-4 w-4 text-indigo-500" />,
  syllabus: <FileText className="h-4 w-4 text-cyan-500" />,
  notice: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  report: <FileText className="h-4 w-4 text-red-500" />,
  other: <File className="h-4 w-4 text-gray-400" />,
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <Image className="h-5 w-5 text-purple-500" />;
  if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (mimeType.includes("word") || mimeType.includes("document"))
    return <FileType className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function AdminDocumentsPage() {
  const { toast } = useToast();
  const { user, isLoaded: isUserLoaded } = useUser();
  const tenantId = useTenantId() || '';
  const userId = user?.id || '';
  const userName = user?.fullName || user?.firstName || 'Admin User';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [folders, setFolders] = useState<DocumentFolderWithCount[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string; name: string; path: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: "academic" as DocumentCategory,
    visibility: "private" as DocumentVisibility,
    tags: "",
  });
  const [folderForm, setFolderForm] = useState({ name: "", description: "" });
  const [uploading, setUploading] = useState(false);

  // Load data
  const loadStats = async () => {
    if (!tenantId) return;
    try {
      const data = await documentsApi.getStats(tenantId);
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadDocuments = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const params: any = {};
      if (currentFolderId) params.folderId = currentFolderId;
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter !== "all") params.category = categoryFilter;

      const result = await documentsApi.listDocuments(tenantId, params);
      setDocuments(result.data);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({ title: "Error", description: "Failed to load documents", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async (parentId?: string | null) => {
    if (!tenantId) return;
    try {
      const data = await documentsApi.listFolders(tenantId, parentId || undefined);
      setFolders(data);
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };

  const loadBreadcrumb = async (folderId: string) => {
    try {
      const data = await documentsApi.getFolderBreadcrumb(tenantId, folderId);
      setBreadcrumb(data);
    } catch (error) {
      console.error("Error loading breadcrumb:", error);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadStats();
      loadDocuments();
    }
    loadFolders(currentFolderId);
    if (currentFolderId) {
      loadBreadcrumb(currentFolderId);
    } else {
      setBreadcrumb([]);
    }
  }, [currentFolderId, searchQuery, categoryFilter]);

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
    if (!selectedFile) return;

    setUploading(true);
    try {
      await documentsApi.uploadDocument(tenantId, selectedFile, {
        name: uploadForm.name,
        description: uploadForm.description,
        category: uploadForm.category,
        visibility: uploadForm.visibility,
        tags: uploadForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        uploadedById: userId,
        uploadedByType: "admin",
        uploadedByName: userName,
        folderId: currentFolderId || undefined,
      });

      toast({ title: "Success", description: "Document uploaded successfully" });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadForm({ name: "", description: "", category: "academic", visibility: "private", tags: "" });
      loadDocuments();
      loadStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderForm.name) return;

    try {
      await documentsApi.createFolder(tenantId, {
        name: folderForm.name,
        description: folderForm.description,
        parentId: currentFolderId || undefined,
        ownerId: userId,
        ownerType: "admin",
      });

      toast({ title: "Success", description: "Folder created successfully" });
      setFolderDialogOpen(false);
      setFolderForm({ name: "", description: "" });
      loadFolders(currentFolderId);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create folder", variant: "destructive" });
    }
  };

  const handleDownload = async (doc: DocType) => {
    try {
      const { url } = await documentsApi.getDownloadUrl(tenantId, doc.id, userId, userName);
      window.open(url, "_blank");
    } catch (error) {
      toast({ title: "Error", description: "Failed to get download URL", variant: "destructive" });
    }
  };

  const handleDelete = async (doc: DocType) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await documentsApi.deleteDocument(tenantId, doc.id);
      toast({ title: "Success", description: "Document deleted" });
      loadDocuments();
      loadStats();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete document", variant: "destructive" });
    }
  };

  const handleFolderClick = (folder: DocumentFolderWithCount) => {
    setCurrentFolderId(folder.id);
    setSelectedDocs(new Set());
  };

  const navigateToRoot = () => {
    setCurrentFolderId(null);
    setBreadcrumb([]);
    setSelectedDocs(new Set());
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      navigateToRoot();
    } else {
      setCurrentFolderId(breadcrumb[index].id);
    }
    setSelectedDocs(new Set());
  };

  const toggleDocSelection = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedDocs.size === 0) return;
    if (!confirm(`Delete ${selectedDocs.size} documents?`)) return;

    try {
      await documentsApi.bulkDelete(tenantId, Array.from(selectedDocs));
      toast({ title: "Success", description: `Deleted ${selectedDocs.size} documents` });
      setSelectedDocs(new Set());
      loadDocuments();
      loadStats();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete documents", variant: "destructive" });
    }
  };

  // Auth loading state
  if (!isUserLoaded || !tenantId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">Upload, organize, and manage college documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { loadDocuments(); loadStats(); loadFolders(currentFolderId); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setFolderDialogOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
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

      <Tabs defaultValue="files">
        <TabsList>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Files
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" /> Storage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm">
            <Button variant="ghost" size="sm" onClick={navigateToRoot} className="h-8 px-2">
              <Home className="h-4 w-4" />
            </Button>
            {breadcrumb.map((item, index) => (
              <div key={item.id} className="flex items-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateToBreadcrumb(index)}
                  className="h-8 px-2"
                >
                  {item.name}
                </Button>
              </div>
            ))}
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
                <SelectItem value="administrative">Administrative</SelectItem>
                <SelectItem value="certificate">Certificates</SelectItem>
                <SelectItem value="identity">Identity</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="notice">Notices</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDocs.size > 0 && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <span className="text-sm font-medium">{selectedDocs.size} selected</span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDocs(new Set())}>
                Clear
              </Button>
            </div>
          )}

          {/* Folders */}
          {folders.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleFolderClick(folder)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Folder className="h-12 w-12 text-yellow-500 mb-2" />
                    <span className="font-medium text-sm truncate w-full">{folder.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {folder._count.documents} files, {folder._count.children} folders
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Documents */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No documents</h3>
                <p className="text-muted-foreground mb-4">
                  {currentFolderId ? "This folder is empty" : "Upload your first document to get started"}
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "list" ? (
            <Card>
              <div className="divide-y">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 ${
                      selectedDocs.has(doc.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.has(doc.id)}
                      onChange={() => toggleDocSelection(doc.id)}
                      className="h-4 w-4"
                    />
                    <div className="flex-shrink-0">{getFileIcon(doc.mimeType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{doc.name}</span>
                        {doc.isVerified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{doc.uploadedByName}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {categoryIcons[doc.category]}
                      <Badge variant="outline" className="capitalize">{doc.visibility}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(doc)}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedDocs.has(doc.id) ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => toggleDocSelection(doc.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="mb-2">{getFileIcon(doc.mimeType)}</div>
                    <span className="font-medium text-sm truncate w-full">{doc.name}</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                    <Badge variant="outline" className="mt-2 text-xs capitalize">{doc.category}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <>
              {/* Storage Overview */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatFileSize(stats.storage.used)}</div>
                    <Progress value={stats.storage.percentage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.storage.percentage}% of {formatFileSize(stats.storage.quota)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Uploaders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.topUploaders.slice(0, 3).map((u, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="truncate">{u.name}</span>
                          <Badge variant="secondary">{u.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* By Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Documents by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.byCategory.map((cat) => (
                      <div key={cat.category} className="flex items-center gap-3 p-3 border rounded-lg">
                        {categoryIcons[cat.category] || <File className="h-4 w-4" />}
                        <div>
                          <p className="font-medium capitalize">{cat.category}</p>
                          <p className="text-sm text-muted-foreground">{cat.count} files</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Uploads */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Uploads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentUploads.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {categoryIcons[doc.category]}
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.uploadedByName} • {formatFileSize(doc.fileSize)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

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
              <Label>Name</Label>
              <Input
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="Document name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="identity">Identity</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="notice">Notice</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Visibility</Label>
                <Select
                  value={uploadForm.visibility}
                  onValueChange={(v) => setUploadForm({ ...uploadForm, visibility: v as DocumentVisibility })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tags (comma separated)</Label>
              <Input
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                placeholder="e.g., important, semester-1, cs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !uploadForm.name}>
              {uploading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Folder Name</Label>
              <Input
                value={folderForm.name}
                onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                placeholder="Enter folder name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={folderForm.description}
                onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!folderForm.name}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
