"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  Send,
  MessageSquare,
  Bell,
  Mail,
  Smartphone,
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Plus,
  FileText,
  MoreHorizontal,
  Copy,
  RefreshCw,
  Megaphone,
  Pin,
  AlertTriangle,
  Archive,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  communicationApi,
  Announcement,
  MessageTemplate,
  BulkCommunication,
  CommunicationStats,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementAudience,
  AnnouncementStatus,
  MessageType,
  TemplateCategory,
  CommunicationStatus,
} from "@/lib/api";

export default function CommunicationPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const tenantId = useTenantId() || '';

  const [selectedTab, setSelectedTab] = useState("announcements");
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState<CommunicationStats | null>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsTotal, setAnnouncementsTotal] = useState(0);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    type: "general" as AnnouncementType,
    priority: "normal" as AnnouncementPriority,
    audience: "all" as AnnouncementAudience,
    isPinned: false,
    allowComments: false,
    expiresAt: "",
  });

  // Templates state
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [templatesTotal, setTemplatesTotal] = useState(0);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    code: "",
    type: "sms" as MessageType,
    category: "general" as TemplateCategory,
    subject: "",
    content: "",
  });

  // Bulk Communications state
  const [bulkCommunications, setBulkCommunications] = useState<BulkCommunication[]>([]);
  const [bulkTotal, setBulkTotal] = useState(0);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    name: "",
    type: "sms" as MessageType,
    subject: "",
    content: "",
    audience: "students",
    scheduledAt: "",
  });

  // Load data
  useEffect(() => {
    if (tenantId) {
      loadData();
    }
  }, [tenantId]);

  const loadData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [statsRes, announcementsRes, templatesRes, bulkRes] = await Promise.all([
        communicationApi.getStats(tenantId),
        communicationApi.listAnnouncements(tenantId, { limit: 20 }),
        communicationApi.listTemplates(tenantId, { limit: 50 }),
        communicationApi.listBulkCommunications(tenantId, { limit: 20 }),
      ]);

      setStats(statsRes);
      setAnnouncements(announcementsRes.announcements);
      setAnnouncementsTotal(announcementsRes.total);
      setTemplates(templatesRes.templates);
      setTemplatesTotal(templatesRes.total);
      setBulkCommunications(bulkRes.communications);
      setBulkTotal(bulkRes.total);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load communication data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Announcement handlers
  const handleCreateAnnouncement = async () => {
    try {
      const data = {
        ...announcementForm,
        createdById: "admin-user", // TODO: Get from auth context
        expiresAt: announcementForm.expiresAt || undefined,
      };

      if (editingAnnouncement) {
        await communicationApi.updateAnnouncement(tenantId, editingAnnouncement.id, data);
        toast({ title: "Success", description: "Announcement updated successfully" });
      } else {
        await communicationApi.createAnnouncement(tenantId, data);
        toast({ title: "Success", description: "Announcement created successfully" });
      }

      setAnnouncementDialogOpen(false);
      resetAnnouncementForm();
      loadData();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    }
  };

  const handlePublishAnnouncement = async (id: string) => {
    try {
      await communicationApi.publishAnnouncement(tenantId, id);
      toast({ title: "Success", description: "Announcement published" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to publish announcement", variant: "destructive" });
    }
  };

  const handleArchiveAnnouncement = async (id: string) => {
    try {
      await communicationApi.archiveAnnouncement(tenantId, id);
      toast({ title: "Success", description: "Announcement archived" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to archive announcement", variant: "destructive" });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await communicationApi.deleteAnnouncement(tenantId, id);
      toast({ title: "Success", description: "Announcement deleted" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" });
    }
  };

  const openEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      audience: announcement.audience,
      isPinned: announcement.isPinned,
      allowComments: announcement.allowComments,
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : "",
    });
    setAnnouncementDialogOpen(true);
  };

  const resetAnnouncementForm = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: "",
      content: "",
      type: "general",
      priority: "normal",
      audience: "all",
      isPinned: false,
      allowComments: false,
      expiresAt: "",
    });
  };

  // Template handlers
  const handleCreateTemplate = async () => {
    try {
      const data = {
        ...templateForm,
        subject: templateForm.subject || undefined,
      };

      if (editingTemplate) {
        await communicationApi.updateTemplate(tenantId, editingTemplate.id, {
          name: data.name,
          subject: data.subject,
          content: data.content,
        });
        toast({ title: "Success", description: "Template updated successfully" });
      } else {
        await communicationApi.createTemplate(tenantId, data);
        toast({ title: "Success", description: "Template created successfully" });
      }

      setTemplateDialogOpen(false);
      resetTemplateForm();
      loadData();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await communicationApi.deleteTemplate(tenantId, id);
      toast({ title: "Success", description: "Template deleted" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete template", variant: "destructive" });
    }
  };

  const openEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      code: template.code,
      type: template.type,
      category: template.category,
      subject: template.subject || "",
      content: template.content,
    });
    setTemplateDialogOpen(true);
  };

  const resetTemplateForm = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: "",
      code: "",
      type: "sms",
      category: "general",
      subject: "",
      content: "",
    });
  };

  // Bulk communication handlers
  const handleCreateBulkCommunication = async () => {
    try {
      await communicationApi.createBulkCommunication(tenantId, {
        ...bulkForm,
        subject: bulkForm.subject || undefined,
        scheduledAt: bulkForm.scheduledAt || undefined,
        createdById: "admin-user", // TODO: Get from auth context
      });

      toast({ title: "Success", description: "Bulk communication created" });
      setBulkDialogOpen(false);
      setBulkForm({
        name: "",
        type: "sms",
        subject: "",
        content: "",
        audience: "students",
        scheduledAt: "",
      });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create bulk communication", variant: "destructive" });
    }
  };

  const handleStartBulkCommunication = async (id: string) => {
    try {
      await communicationApi.startBulkCommunication(tenantId, id);
      toast({ title: "Success", description: "Bulk communication started" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to start bulk communication", variant: "destructive" });
    }
  };

  const handleCancelBulkCommunication = async (id: string) => {
    try {
      await communicationApi.cancelBulkCommunication(tenantId, id);
      toast({ title: "Success", description: "Bulk communication cancelled" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel bulk communication", variant: "destructive" });
    }
  };

  // Badge helpers
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "sms": return <Badge className="bg-blue-500">SMS</Badge>;
      case "email": return <Badge className="bg-purple-500">Email</Badge>;
      case "push": return <Badge className="bg-green-500">Push</Badge>;
      case "whatsapp": return <Badge className="bg-emerald-500">WhatsApp</Badge>;
      default: return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="outline">Draft</Badge>;
      case "published": return <Badge className="bg-green-500">Published</Badge>;
      case "archived": return <Badge variant="secondary">Archived</Badge>;
      case "scheduled": return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "processing": return <Badge className="bg-yellow-500">Processing</Badge>;
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      case "cancelled": return <Badge variant="secondary">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent": return <Badge variant="destructive">Urgent</Badge>;
      case "high": return <Badge className="bg-orange-500">High</Badge>;
      case "normal": return <Badge variant="outline">Normal</Badge>;
      case "low": return <Badge variant="secondary">Low</Badge>;
      default: return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getAnnouncementTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-500",
      academic: "bg-blue-500",
      event: "bg-purple-500",
      urgent: "bg-red-500",
      holiday: "bg-green-500",
      exam: "bg-orange-500",
      fee: "bg-yellow-600",
      placement: "bg-indigo-500",
    };
    return <Badge className={colors[type] || "bg-gray-500"}>{type}</Badge>;
  };

  // Auth loading state
  if (authLoading || !tenantId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading communication data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication</h1>
          <p className="text-muted-foreground">Manage announcements, templates, and bulk messaging</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Megaphone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Announcements</p>
                <p className="text-2xl font-bold">{stats?.activeAnnouncements || 0}</p>
                <p className="text-xs text-muted-foreground">of {stats?.totalAnnouncements || 0} total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{stats?.totalTemplates || 0}</p>
                <p className="text-xs text-muted-foreground">Active templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Send className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bulk Campaigns</p>
                <p className="text-2xl font-bold">{stats?.totalBulkCommunications || 0}</p>
                <p className="text-xs text-muted-foreground">Total campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recent Messages</p>
                <p className="text-2xl font-bold">{stats?.recentMessages || 0}</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Messaging</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Create and manage announcements for students, staff, and parents</CardDescription>
                </div>
                <Button onClick={() => { resetAnnouncementForm(); setAnnouncementDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Announcement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No announcements yet. Create your first announcement.
                      </TableCell>
                    </TableRow>
                  ) : (
                    announcements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {announcement.isPinned && <Pin className="h-4 w-4 text-orange-500" />}
                            <span className="font-medium">{announcement.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getAnnouncementTypeBadge(announcement.type)}</TableCell>
                        <TableCell>{getPriorityBadge(announcement.priority)}</TableCell>
                        <TableCell className="capitalize">{announcement.audience}</TableCell>
                        <TableCell>{getStatusBadge(announcement.status)}</TableCell>
                        <TableCell>{new Date(announcement.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditAnnouncement(announcement)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {announcement.status === "draft" && (
                                <DropdownMenuItem onClick={() => handlePublishAnnouncement(announcement.id)}>
                                  <Megaphone className="mr-2 h-4 w-4" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {announcement.status === "published" && (
                                <DropdownMenuItem onClick={() => handleArchiveAnnouncement(announcement.id)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Messaging Tab */}
        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bulk Communications</CardTitle>
                  <CardDescription>Send SMS, emails, or push notifications to groups</CardDescription>
                </div>
                <Button onClick={() => setBulkDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Sent/Failed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkCommunications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bulk communications yet. Create your first campaign.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bulkCommunications.map((comm) => (
                      <TableRow key={comm.id}>
                        <TableCell className="font-medium">{comm.name}</TableCell>
                        <TableCell>{getTypeBadge(comm.type)}</TableCell>
                        <TableCell className="capitalize">{comm.audience}</TableCell>
                        <TableCell>{comm.recipientCount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="text-green-600">{comm.sentCount}</span>
                          {comm.failedCount > 0 && (
                            <span className="text-red-600"> / {comm.failedCount}</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(comm.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {(comm.status === "draft" || comm.status === "scheduled") && (
                                <>
                                  <DropdownMenuItem onClick={() => handleStartBulkCommunication(comm.id)}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Now
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleCancelBulkCommunication(comm.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Message Templates</CardTitle>
                  <CardDescription>Reusable templates for SMS, email, and notifications</CardDescription>
                </div>
                <Button onClick={() => { resetTemplateForm(); setTemplateDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No templates yet. Create your first template.
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">{template.code}</code>
                        </TableCell>
                        <TableCell>{getTypeBadge(template.type)}</TableCell>
                        <TableCell className="capitalize">{template.category.replace("_", " ")}</TableCell>
                        <TableCell>
                          <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditTemplate(template)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!template.isSystem && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => handleDeleteTemplate(template.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Message History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
              <CardDescription>View all sent messages and their delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Message history will appear here once you start sending communications.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Announcement Dialog */}
      <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
            </DialogTitle>
            <DialogDescription>
              Create an announcement to notify students, staff, or parents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Enter announcement title..."
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={announcementForm.type}
                  onValueChange={(v) => setAnnouncementForm({ ...announcementForm, type: v as AnnouncementType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                    <SelectItem value="placement">Placement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={announcementForm.priority}
                  onValueChange={(v) => setAnnouncementForm({ ...announcementForm, priority: v as AnnouncementPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Audience</Label>
              <Select
                value={announcementForm.audience}
                onValueChange={(v) => setAnnouncementForm({ ...announcementForm, audience: v as AnnouncementAudience })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="staff">Staff Only</SelectItem>
                  <SelectItem value="parents">Parents Only</SelectItem>
                  <SelectItem value="department">Specific Department</SelectItem>
                  <SelectItem value="course">Specific Course</SelectItem>
                  <SelectItem value="batch">Specific Batch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                placeholder="Enter announcement content..."
                rows={5}
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Expires At (Optional)</Label>
              <Input
                type="datetime-local"
                value={announcementForm.expiresAt}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pinned"
                  checked={announcementForm.isPinned}
                  onCheckedChange={(checked) => setAnnouncementForm({ ...announcementForm, isPinned: checked as boolean })}
                />
                <Label htmlFor="pinned">Pin to top</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="comments"
                  checked={announcementForm.allowComments}
                  onCheckedChange={(checked) => setAnnouncementForm({ ...announcementForm, allowComments: checked as boolean })}
                />
                <Label htmlFor="comments">Allow comments</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAnnouncement}
              disabled={!announcementForm.title || !announcementForm.content}
            >
              {editingAnnouncement ? "Update" : "Create"} Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              Create a reusable message template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Template name..."
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  placeholder="unique_code"
                  value={templateForm.code}
                  onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
                  disabled={!!editingTemplate}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={templateForm.type}
                  onValueChange={(v) => setTemplateForm({ ...templateForm, type: v as MessageType })}
                  disabled={!!editingTemplate}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={templateForm.category}
                  onValueChange={(v) => setTemplateForm({ ...templateForm, category: v as TemplateCategory })}
                  disabled={!!editingTemplate}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="fee_reminder">Fee Reminder</SelectItem>
                    <SelectItem value="attendance_alert">Attendance Alert</SelectItem>
                    <SelectItem value="exam_notification">Exam Notification</SelectItem>
                    <SelectItem value="result_notification">Result Notification</SelectItem>
                    <SelectItem value="event_invitation">Event Invitation</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="password_reset">Password Reset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(templateForm.type === "email") && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject..."
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                placeholder="Template content... Use {{variable}} for dynamic values"
                rows={5}
                value={templateForm.content}
                onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{variable}}"} syntax for dynamic content. E.g., {"{{studentName}}"}, {"{{amount}}"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={!templateForm.name || !templateForm.code || !templateForm.content}
            >
              {editingTemplate ? "Update" : "Create"} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Communication Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Bulk Communication</DialogTitle>
            <DialogDescription>
              Send messages to a group of recipients
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input
                placeholder="e.g., Fee Reminder - January 2026"
                value={bulkForm.name}
                onChange={(e) => setBulkForm({ ...bulkForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={bulkForm.type}
                  onValueChange={(v) => setBulkForm({ ...bulkForm, type: v as MessageType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select
                  value={bulkForm.audience}
                  onValueChange={(v) => setBulkForm({ ...bulkForm, audience: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="students">All Students</SelectItem>
                    <SelectItem value="staff">All Staff</SelectItem>
                    <SelectItem value="parents">All Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {bulkForm.type === "email" && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject..."
                  value={bulkForm.subject}
                  onChange={(e) => setBulkForm({ ...bulkForm, subject: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message Content *</Label>
              <Textarea
                placeholder="Enter your message..."
                rows={5}
                value={bulkForm.content}
                onChange={(e) => setBulkForm({ ...bulkForm, content: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Schedule (Optional)</Label>
              <Input
                type="datetime-local"
                value={bulkForm.scheduledAt}
                onChange={(e) => setBulkForm({ ...bulkForm, scheduledAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Leave empty to save as draft</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBulkCommunication}
              disabled={!bulkForm.name || !bulkForm.content}
            >
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
