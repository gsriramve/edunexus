"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Upload,
  Folder,
  File,
  Video,
  Image,
  Download,
  Eye,
  Trash2,
  MoreHorizontal,
  Search,
  Grid,
  List,
  FolderPlus,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useTeacherMaterials,
  useTeacherFolders,
  useTeacherSubjectsForMaterials,
  useCreateFolder,
  useCreateMaterial,
  useDeleteFolder,
  useDeleteMaterial,
  useTrackDownload,
  Material,
  MaterialFolder,
} from "@/hooks/use-teacher-materials";

export default function TeacherMaterials() {
  const tenantIdValue = useTenantId();
  const tenantId = tenantIdValue || "";
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Form states
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderSubject, setNewFolderSubject] = useState("");
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialSubject, setNewMaterialSubject] = useState("");
  const [newMaterialFolder, setNewMaterialFolder] = useState("");
  const [newMaterialDescription, setNewMaterialDescription] = useState("");

  // Queries
  const { data: subjectsData, isLoading: subjectsLoading } = useTeacherSubjectsForMaterials(tenantId);
  const { data: materialsData, isLoading: materialsLoading, error: materialsError } = useTeacherMaterials(
    tenantId,
    {
      subjectCode: selectedSubject !== "all" ? selectedSubject : undefined,
      search: searchQuery || undefined,
      folderId: selectedFolder || undefined,
    }
  );
  const { data: foldersData, isLoading: foldersLoading } = useTeacherFolders(
    tenantId,
    {
      subjectCode: selectedSubject !== "all" ? selectedSubject : undefined,
    }
  );

  // Mutations
  const createFolderMutation = useCreateFolder(tenantId);
  const createMaterialMutation = useCreateMaterial(tenantId);
  const deleteFolderMutation = useDeleteFolder(tenantId);
  const deleteMaterialMutation = useDeleteMaterial(tenantId);
  const trackDownloadMutation = useTrackDownload(tenantId);

  const subjects = subjectsData || [];
  const materials = materialsData?.materials || [];
  const folders = foldersData?.folders || [];
  const stats = materialsData?.stats || {
    totalFiles: 0,
    totalFolders: 0,
    totalSizeFormatted: "0 B",
    totalDownloads: 0,
  };

  const isLoading = subjectsLoading || materialsLoading || foldersLoading;

  const handleCreateFolder = async () => {
    if (!newFolderName || !newFolderSubject) return;

    try {
      await createFolderMutation.mutateAsync({
        teacherSubjectId: newFolderSubject,
        name: newFolderName,
      });
      setNewFolderName("");
      setNewFolderSubject("");
      setIsFolderDialogOpen(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder? Materials will be moved to root.")) return;

    try {
      await deleteFolderMutation.mutateAsync(folderId);
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      await deleteMaterialMutation.mutateAsync(materialId);
    } catch (error) {
      console.error("Failed to delete material:", error);
    }
  };

  const handleDownload = async (material: Material) => {
    try {
      await trackDownloadMutation.mutateAsync(material.id);
      window.open(material.fileUrl, "_blank");
    } catch (error) {
      console.error("Failed to track download:", error);
      window.open(material.fileUrl, "_blank");
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <File className="h-5 w-5 text-red-500" />;
      case "video":
      case "mp4":
      case "webm":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "pptx":
      case "ppt":
        return <FileText className="h-5 w-5 text-orange-500" />;
      case "image":
      case "png":
      case "jpg":
      case "jpeg":
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      pdf: "bg-red-100 text-red-700",
      video: "bg-blue-100 text-blue-700",
      mp4: "bg-blue-100 text-blue-700",
      webm: "bg-blue-100 text-blue-700",
      pptx: "bg-orange-100 text-orange-700",
      ppt: "bg-orange-100 text-orange-700",
      image: "bg-green-100 text-green-700",
      png: "bg-green-100 text-green-700",
      jpg: "bg-green-100 text-green-700",
      jpeg: "bg-green-100 text-green-700",
      doc: "bg-blue-100 text-blue-700",
      docx: "bg-blue-100 text-blue-700",
      zip: "bg-purple-100 text-purple-700",
    };
    return <Badge className={colors[type] || "bg-gray-100 text-gray-700"}>{type.toUpperCase()}</Badge>;
  };

  if (materialsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground">
            Upload and manage course materials for your students
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load materials. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground">
            Upload and manage course materials for your students
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Organize your materials into folders
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    placeholder="e.g., Unit 6 - Sorting Algorithms"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <Select value={newFolderSubject} onValueChange={setNewFolderSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.subjectName} ({subject.subjectCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={createFolderMutation.isPending || !newFolderName || !newFolderSubject}
                >
                  {createFolderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Study Materials</DialogTitle>
                <DialogDescription>
                  Upload files for your students to access
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <Select value={newMaterialSubject} onValueChange={setNewMaterialSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.subjectName} ({subject.subjectCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Folder (Optional)</Label>
                  <Select value={newMaterialFolder} onValueChange={setNewMaterialFolder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No folder (root)</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Files</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Drag & drop files here</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, PPT, DOC, MP4, ZIP (max 500MB)
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the uploaded materials..."
                    rows={2}
                    value={newMaterialDescription}
                    onChange={(e) => setNewMaterialDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsUploadDialogOpen(false)}>
                  Upload Files
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <File className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalFiles}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <Folder className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Folders</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalFolders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalSizeFormatted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalDownloads}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.subjectCode}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="files">All Files</TabsTrigger>
        </TabsList>

        {/* Folders Tab */}
        <TabsContent value="folders">
          {foldersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : folders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No folders yet</h3>
                <p className="text-muted-foreground mt-1">
                  Create folders to organize your study materials
                </p>
                <Button className="mt-4" onClick={() => setIsFolderDialogOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create First Folder
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className="cursor-pointer hover:shadow-md transition-shadow relative group"
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <CardContent className="pt-6">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 rounded-lg bg-yellow-50 mb-3">
                        <Folder className="h-10 w-10 text-yellow-600" />
                      </div>
                      <h3 className="font-medium text-sm line-clamp-2">{folder.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {folder.fileCount} files
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Modified: {new Date(folder.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>All Materials</CardTitle>
              <CardDescription>
                {selectedSubject === "all"
                  ? "All uploaded files across subjects"
                  : `${subjects.find((s) => s.subjectCode === selectedSubject)?.subjectName || selectedSubject} - All uploaded files`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {materialsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : materials.length === 0 ? (
                <div className="py-12 text-center">
                  <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No materials yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Upload study materials for your students
                  </p>
                  <Button className="mt-4" onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload First Material
                  </Button>
                </div>
              ) : viewMode === "list" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Folder</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-center">Downloads</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getFileIcon(material.fileType)}
                            <span className="font-medium">{material.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {material.folderName ? (
                            <Badge variant="outline">{material.folderName}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getTypeBadge(material.fileType)}</TableCell>
                        <TableCell>{material.fileSizeFormatted}</TableCell>
                        <TableCell className="text-center">{material.downloads}</TableCell>
                        <TableCell>
                          {new Date(material.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(material.fileUrl, "_blank")}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(material)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(material.fileUrl)}>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteMaterial(material.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {materials.map((material) => (
                    <Card key={material.id} className="hover:shadow-md transition-shadow relative group">
                      <CardContent className="pt-6">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(material)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteMaterial(material.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="p-4 rounded-lg bg-muted mb-3">
                            {getFileIcon(material.fileType)}
                          </div>
                          <h3 className="font-medium text-sm line-clamp-2">{material.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            {getTypeBadge(material.fileType)}
                            <span className="text-xs text-muted-foreground">{material.fileSizeFormatted}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {material.downloads} downloads
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
