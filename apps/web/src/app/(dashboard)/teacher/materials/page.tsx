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

// Mock data
const subjects = [
  { id: "cs501", name: "Data Structures", code: "CS501" },
  { id: "cs505", name: "Data Structures Lab", code: "CS505" },
  { id: "cs502", name: "Algorithms", code: "CS502" },
];

const folders = [
  { id: "f1", name: "Unit 1 - Introduction", subject: "CS501", files: 5, lastModified: "2026-01-02" },
  { id: "f2", name: "Unit 2 - Arrays & Strings", subject: "CS501", files: 8, lastModified: "2026-01-05" },
  { id: "f3", name: "Unit 3 - Linked Lists", subject: "CS501", files: 6, lastModified: "2025-12-28" },
  { id: "f4", name: "Unit 4 - Trees", subject: "CS501", files: 7, lastModified: "2026-01-06" },
  { id: "f5", name: "Unit 5 - Graphs", subject: "CS501", files: 4, lastModified: "2026-01-03" },
];

const materials = [
  { id: "m1", name: "Introduction to Data Structures.pdf", type: "pdf", size: "2.4 MB", folder: "Unit 1 - Introduction", uploadedAt: "2025-12-15", downloads: 156, subject: "CS501" },
  { id: "m2", name: "Complexity Analysis Notes.pdf", type: "pdf", size: "1.8 MB", folder: "Unit 1 - Introduction", uploadedAt: "2025-12-18", downloads: 142, subject: "CS501" },
  { id: "m3", name: "Array Operations Demo.mp4", type: "video", size: "145 MB", folder: "Unit 2 - Arrays & Strings", uploadedAt: "2025-12-20", downloads: 98, subject: "CS501" },
  { id: "m4", name: "String Algorithms PPT.pptx", type: "pptx", size: "5.2 MB", folder: "Unit 2 - Arrays & Strings", uploadedAt: "2025-12-22", downloads: 134, subject: "CS501" },
  { id: "m5", name: "Linked List Implementation.pdf", type: "pdf", size: "3.1 MB", folder: "Unit 3 - Linked Lists", uploadedAt: "2025-12-25", downloads: 167, subject: "CS501" },
  { id: "m6", name: "Tree Traversal Visualization.mp4", type: "video", size: "210 MB", folder: "Unit 4 - Trees", uploadedAt: "2026-01-02", downloads: 78, subject: "CS501" },
  { id: "m7", name: "Binary Search Trees Notes.pdf", type: "pdf", size: "2.8 MB", folder: "Unit 4 - Trees", uploadedAt: "2026-01-04", downloads: 89, subject: "CS501" },
  { id: "m8", name: "Graph Algorithms Slides.pptx", type: "pptx", size: "4.5 MB", folder: "Unit 5 - Graphs", uploadedAt: "2026-01-05", downloads: 45, subject: "CS501" },
];

export default function TeacherMaterials() {
  const [selectedSubject, setSelectedSubject] = useState("cs501");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalFiles: materials.length,
    totalFolders: folders.length,
    totalSize: "385 MB",
    totalDownloads: materials.reduce((sum, m) => sum + m.downloads, 0),
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <File className="h-5 w-5 text-red-500" />;
      case "video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "pptx":
        return <FileText className="h-5 w-5 text-orange-500" />;
      case "image":
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      pdf: "bg-red-100 text-red-700",
      video: "bg-blue-100 text-blue-700",
      pptx: "bg-orange-100 text-orange-700",
      image: "bg-green-100 text-green-700",
    };
    return <Badge className={colors[type] || "bg-gray-100 text-gray-700"}>{type.toUpperCase()}</Badge>;
  };

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
          <Dialog>
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
                  <Input id="folderName" placeholder="e.g., Unit 6 - Sorting Algorithms" />
                </div>
                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <Select defaultValue="cs501">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Folder</Button>
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
                  <Select defaultValue="cs501">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Folder</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
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
                <p className="text-2xl font-bold">{stats.totalFiles}</p>
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
                <p className="text-2xl font-bold">{stats.totalFolders}</p>
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
                <p className="text-2xl font-bold">{stats.totalSize}</p>
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
                <p className="text-2xl font-bold">{stats.totalDownloads}</p>
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
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
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
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedFolder(folder.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-lg bg-yellow-50 mb-3">
                      <Folder className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2">{folder.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {folder.files} files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Modified: {new Date(folder.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>All Materials</CardTitle>
              <CardDescription>
                {subjects.find((s) => s.id === selectedSubject)?.name} - All uploaded files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === "list" ? (
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
                    {filteredMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getFileIcon(material.type)}
                            <span className="font-medium">{material.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{material.folder}</Badge>
                        </TableCell>
                        <TableCell>{getTypeBadge(material.type)}</TableCell>
                        <TableCell>{material.size}</TableCell>
                        <TableCell className="text-center">{material.downloads}</TableCell>
                        <TableCell>
                          {new Date(material.uploadedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
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
                  {filteredMaterials.map((material) => (
                    <Card key={material.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="p-4 rounded-lg bg-muted mb-3">
                            {getFileIcon(material.type)}
                          </div>
                          <h3 className="font-medium text-sm line-clamp-2">{material.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            {getTypeBadge(material.type)}
                            <span className="text-xs text-muted-foreground">{material.size}</span>
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
