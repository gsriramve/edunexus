"use client";

import { useState } from "react";
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
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Plus,
  FileText,
  MoreHorizontal,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
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

// Mock data
const communicationStats = {
  totalSMSSent: 15420,
  totalEmailSent: 8750,
  smsThisMonth: 1250,
  emailThisMonth: 560,
  pendingNotifications: 45,
  scheduledMessages: 8,
  smsBalance: 5000,
  deliveryRate: 98.5,
};

const recentCommunications = [
  {
    id: "COM-001",
    type: "sms",
    subject: "Fee Payment Reminder",
    recipients: "Semester 4 Students (120)",
    sentBy: "Admin Office",
    sentOn: "Jan 6, 2026 10:30 AM",
    status: "delivered",
    delivered: 118,
    failed: 2,
  },
  {
    id: "COM-002",
    type: "email",
    subject: "Exam Schedule - January 2026",
    recipients: "All Students (4850)",
    sentBy: "Examination Cell",
    sentOn: "Jan 5, 2026 3:45 PM",
    status: "delivered",
    delivered: 4823,
    failed: 27,
  },
  {
    id: "COM-003",
    type: "sms",
    subject: "Holiday Announcement - Republic Day",
    recipients: "All Students & Parents",
    sentBy: "Admin Office",
    sentOn: "Jan 5, 2026 11:00 AM",
    status: "delivered",
    delivered: 9650,
    failed: 50,
  },
  {
    id: "COM-004",
    type: "push",
    subject: "New Assignment Posted - Data Structures",
    recipients: "CSE Semester 3 (60)",
    sentBy: "Dr. Sharma",
    sentOn: "Jan 4, 2026 2:30 PM",
    status: "delivered",
    delivered: 58,
    failed: 2,
  },
  {
    id: "COM-005",
    type: "whatsapp",
    subject: "PTM Reminder",
    recipients: "Parents of Semester 2 (240)",
    sentBy: "Admin Office",
    sentOn: "Jan 4, 2026 9:00 AM",
    status: "delivered",
    delivered: 235,
    failed: 5,
  },
];

const scheduledMessages = [
  {
    id: "SCH-001",
    type: "sms",
    subject: "Fee Due Reminder - Final",
    recipients: "Students with Pending Fees (312)",
    scheduledFor: "Jan 10, 2026 9:00 AM",
    createdBy: "Mrs. Lakshmi",
    status: "scheduled",
  },
  {
    id: "SCH-002",
    type: "email",
    subject: "Placement Drive Announcement - TCS",
    recipients: "Final Year Eligible Students (450)",
    scheduledFor: "Jan 12, 2026 10:00 AM",
    createdBy: "Placement Cell",
    status: "scheduled",
  },
  {
    id: "SCH-003",
    type: "sms",
    subject: "Internal Exam Reminder",
    recipients: "All Students",
    scheduledFor: "Jan 15, 2026 8:00 AM",
    createdBy: "Examination Cell",
    status: "scheduled",
  },
];

const messageTemplates = [
  { id: "TPL-001", name: "Fee Payment Reminder", type: "sms", usage: 45, lastUsed: "Jan 6, 2026" },
  { id: "TPL-002", name: "Attendance Warning", type: "sms", usage: 32, lastUsed: "Jan 5, 2026" },
  { id: "TPL-003", name: "Exam Schedule", type: "email", usage: 12, lastUsed: "Jan 5, 2026" },
  { id: "TPL-004", name: "Holiday Announcement", type: "sms", usage: 8, lastUsed: "Jan 5, 2026" },
  { id: "TPL-005", name: "PTM Invitation", type: "whatsapp", usage: 6, lastUsed: "Jan 4, 2026" },
  { id: "TPL-006", name: "Assignment Reminder", type: "push", usage: 28, lastUsed: "Jan 4, 2026" },
  { id: "TPL-007", name: "Placement Drive Notice", type: "email", usage: 15, lastUsed: "Jan 3, 2026" },
  { id: "TPL-008", name: "Fee Overdue Warning", type: "sms", usage: 22, lastUsed: "Jan 2, 2026" },
];

const recipientGroups = [
  { id: "all-students", name: "All Students", count: 4850 },
  { id: "all-parents", name: "All Parents", count: 4850 },
  { id: "all-staff", name: "All Staff", count: 320 },
  { id: "cse-students", name: "CSE Students", count: 960 },
  { id: "ece-students", name: "ECE Students", count: 840 },
  { id: "final-year", name: "Final Year Students", count: 1200 },
  { id: "fee-pending", name: "Students with Pending Fees", count: 312 },
  { id: "low-attendance", name: "Low Attendance Students", count: 156 },
];

export default function CommunicationPage() {
  const [selectedTab, setSelectedTab] = useState("compose");
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("sms");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "sms":
        return <Badge className="bg-blue-500">SMS</Badge>;
      case "email":
        return <Badge className="bg-purple-500">Email</Badge>;
      case "push":
        return <Badge className="bg-green-500">Push</Badge>;
      case "whatsapp":
        return <Badge className="bg-emerald-500">WhatsApp</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-500">Delivered</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "sending":
        return <Badge className="bg-yellow-500">Sending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleToggleRecipient = (groupId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const getTotalRecipients = () => {
    return selectedRecipients.reduce((sum, groupId) => {
      const group = recipientGroups.find((g) => g.id === groupId);
      return sum + (group?.count || 0);
    }, 0);
  };

  const handleUseTemplate = (template: typeof messageTemplates[0]) => {
    setSelectedTemplate(template.id);
    setSelectedType(template.type);
    setMessageSubject(template.name);
    // In a real app, this would load the actual template content
    setMessageContent(`This is the template content for: ${template.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication</h1>
          <p className="text-muted-foreground">Send SMS, emails, and notifications to students and parents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => setComposeDialogOpen(true)}>
            <Send className="mr-2 h-4 w-4" />
            Compose Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SMS This Month</p>
                <p className="text-2xl font-bold">{communicationStats.smsThisMonth.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Balance: {communicationStats.smsBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emails This Month</p>
                <p className="text-2xl font-bold">{communicationStats.emailThisMonth}</p>
                <p className="text-xs text-muted-foreground">Unlimited</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-orange-600">{communicationStats.scheduledMessages}</p>
                <p className="text-xs text-muted-foreground">Messages pending</p>
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
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">{communicationStats.deliveryRate}%</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose">Quick Compose</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Quick Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Compose Form */}
            <Card>
              <CardHeader>
                <CardTitle>Compose New Message</CardTitle>
                <CardDescription>Select recipients and compose your message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <div className="flex gap-2">
                    {["sms", "email", "whatsapp", "push"].map((type) => (
                      <Button
                        key={type}
                        variant={selectedType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                      >
                        {type.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Recipients</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                    {recipientGroups.map((group) => (
                      <div key={group.id} className="flex items-center gap-2">
                        <Checkbox
                          id={group.id}
                          checked={selectedRecipients.includes(group.id)}
                          onCheckedChange={() => handleToggleRecipient(group.id)}
                        />
                        <Label htmlFor={group.id} className="text-sm cursor-pointer">
                          {group.name} ({group.count})
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedRecipients.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Total Recipients: <strong>{getTotalRecipients().toLocaleString()}</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Enter message subject..."
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea
                    placeholder="Type your message here..."
                    rows={5}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                  {selectedType === "sms" && (
                    <p className="text-xs text-muted-foreground">
                      Characters: {messageContent.length} / 160 | SMS Count: {Math.ceil(messageContent.length / 160) || 1}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="schedule"
                    checked={scheduleMessage}
                    onCheckedChange={(checked) => setScheduleMessage(checked as boolean)}
                  />
                  <Label htmlFor="schedule">Schedule for later</Label>
                </div>

                {scheduleMessage && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button className="flex-1" disabled={!selectedRecipients.length || !messageContent}>
                    <Send className="mr-2 h-4 w-4" />
                    {scheduleMessage ? "Schedule Message" : "Send Now"}
                  </Button>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
                <CardDescription>Use a template to quickly compose messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messageTemplates.slice(0, 6).map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted cursor-pointer"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <div className="flex items-center gap-3">
                        {getTypeBadge(template.type)}
                        <div>
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground">Used {template.usage} times</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Message History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Message History</CardTitle>
                  <CardDescription>All sent communications</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Sent By</TableHead>
                    <TableHead>Sent On</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCommunications.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell>{getTypeBadge(comm.type)}</TableCell>
                      <TableCell>
                        <p className="font-medium">{comm.subject}</p>
                      </TableCell>
                      <TableCell className="text-sm">{comm.recipients}</TableCell>
                      <TableCell className="text-sm">{comm.sentBy}</TableCell>
                      <TableCell className="text-sm">{comm.sentOn}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600">{comm.delivered}</span>
                          {comm.failed > 0 && (
                            <span className="text-red-600"> / {comm.failed} failed</span>
                          )}
                        </div>
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
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Messages Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scheduled Messages</CardTitle>
                  <CardDescription>Messages scheduled to be sent later</CardDescription>
                </div>
                <Button onClick={() => setComposeDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledMessages.map((message) => (
                  <div key={message.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-muted">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeBadge(message.type)}
                            <h4 className="font-semibold">{message.subject}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{message.recipients}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {message.scheduledFor}
                            </span>
                            <span>Created by: {message.createdBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(message.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Send Now
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  <CardDescription>Manage reusable message templates</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messageTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-muted">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{template.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(template.type)}</TableCell>
                      <TableCell>{template.usage} times</TableCell>
                      <TableCell>{template.lastUsed}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleUseTemplate(template)}>
                            Use
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Dialog */}
      <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>Send a new message to students, parents, or staff</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
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
              <Label>Recipients</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient group" />
                </SelectTrigger>
                <SelectContent>
                  {recipientGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(selectedType === "email" || selectedType === "push") && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Enter subject..." />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Type your message here..." rows={5} />
              {selectedType === "sms" && (
                <p className="text-xs text-muted-foreground">
                  Characters: 0 / 160 | SMS Count: 1
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="schedule-dialog" />
              <Label htmlFor="schedule-dialog">Schedule for later</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
