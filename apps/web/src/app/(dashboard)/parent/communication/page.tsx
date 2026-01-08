"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquare,
  Bell,
  Send,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCheck,
  Megaphone,
  User,
  Filter,
  PlusCircle,
  Paperclip,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useParentChildren } from "@/hooks/use-parents";
import { useUserAnnouncements } from "@/hooks/use-communication";
import { useStudentTeachers, TeacherInfo } from "@/hooks/use-parent-dashboard";

// TODO: Replace with real messaging API when available
const mockMessages: Array<{
  id: string;
  from: string;
  subject: string;
  message: string;
  date: string;
  time: string;
  read: boolean;
  child: string;
}> = [];

const mockSentMessages: Array<{
  id: string;
  to: string;
  subject: string;
  message: string;
  date: string;
  time: string;
  status: string;
}> = [];

export default function ParentCommunication() {
  const { user } = useUser();
  const tenantId = useTenantId() || '';
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<typeof mockMessages[0] | null>(null);
  const [newMessage, setNewMessage] = useState({ to: "", subject: "", content: "" });

  // Fetch parent's children
  const { data: childrenData, isLoading: childrenLoading } = useParentChildren(tenantId, user?.id || '');
  const children = childrenData || [];

  // Set first child as default when children load
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Get selected child info
  const currentChild = useMemo(() => {
    const childRecord = children.find((c) => c.id === selectedChildId);
    if (!childRecord) return null;
    return {
      id: childRecord.id,
      name: `${childRecord.firstName} ${childRecord.lastName}`.trim() || 'Unknown',
      rollNo: childRecord.rollNo || 'N/A',
      department: 'N/A',
      semester: childRecord.currentSemester || 0,
    };
  }, [children, selectedChildId]);

  // Fetch announcements for parent
  const { data: announcementsData, isLoading: announcementsLoading } = useUserAnnouncements(
    tenantId,
    user?.id || '',
    'parent'
  );

  // Fetch teachers for selected child
  const { data: teachersData, isLoading: teachersLoading } = useStudentTeachers(
    tenantId,
    selectedChildId
  );

  // Derive announcements list
  const announcements = useMemo(() => {
    if (announcementsData && Array.isArray(announcementsData)) {
      return announcementsData.map((ann) => ({
        id: ann.id,
        title: ann.title || 'Announcement',
        content: ann.content || '',
        date: ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) : 'N/A',
        type: ann.priority === 'urgent' ? 'exam' : ann.priority === 'high' ? 'fee' : 'general',
        priority: ann.priority || 'low',
      }));
    }
    return [];
  }, [announcementsData]);

  // Use mock data for messages (would need separate API)
  const messages = mockMessages;
  const sentMessages = mockSentMessages;

  // Use real API for teachers
  const teachers = teachersData || [];

  // Filter messages by selected child
  const filteredMessages = messages.filter(
    (msg) => msg.child === selectedChildId &&
    (msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
     msg.message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const unreadCount = filteredMessages.filter((m) => !m.read).length;

  // Loading state
  if (childrenLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // No children state
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication</h1>
          <p className="text-muted-foreground">
            Messages, announcements, and teacher contact
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Children Linked</h3>
              <p>No children are currently linked to your account.</p>
              <p className="text-sm mt-2">Please contact the school administration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentChild) return null;

  const getAnnouncementBadge = (type: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      exam: { color: "bg-red-500", label: "Exam" },
      event: { color: "bg-purple-500", label: "Event" },
      fee: { color: "bg-orange-500", label: "Fee" },
      placement: { color: "bg-blue-500", label: "Placement" },
      general: { color: "bg-gray-500", label: "General" },
    };
    const badge = badges[type] || badges.general;
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const getPriorityIndicator = (priority: string) => {
    if (priority === "high") return <span className="w-2 h-2 rounded-full bg-red-500" />;
    if (priority === "medium") return <span className="w-2 h-2 rounded-full bg-yellow-500" />;
    return <span className="w-2 h-2 rounded-full bg-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication</h1>
          <p className="text-muted-foreground">
            Messages, announcements, and teacher contact
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((childRecord) => {
                const childName = `${childRecord.firstName} ${childRecord.lastName}`.trim() || 'Unknown';
                return (
                  <SelectItem key={childRecord.id} value={childRecord.id}>
                    {childName} ({childRecord.rollNo || 'N/A'})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Compose Message</DialogTitle>
                <DialogDescription>
                  Send a message to {currentChild.name}'s teacher
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <Select
                    value={newMessage.to}
                    onValueChange={(v) => setNewMessage({ ...newMessage, to: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.subject})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="Message subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Type your message here..."
                    rows={5}
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4 mr-1" />
                    Attach File
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setComposeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setComposeOpen(false)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Megaphone className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Announcements</p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent Messages</p>
                <p className="text-2xl font-bold">{sentMessages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teachers</p>
                <p className="text-2xl font-bold">{teachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages" className="relative">
            Messages
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="teachers">Teacher Contact</TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Message List */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedMessage?.id === msg.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted"
                        } ${!msg.read ? "border-l-4 border-l-blue-500" : ""}`}
                        onClick={() => setSelectedMessage(msg)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">
                              {msg.from.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium truncate ${!msg.read ? "font-bold" : ""}`}>
                                {msg.from}
                              </p>
                              <span className="text-xs text-muted-foreground">{msg.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{msg.subject}</p>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredMessages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No messages found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Message Detail */}
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {selectedMessage.from.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{selectedMessage.from}</p>
                          <p className="text-sm text-muted-foreground">{selectedMessage.subject}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedMessage.date} • {selectedMessage.time}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm leading-relaxed">{selectedMessage.message}</p>
                    </div>
                    <div className="border-t pt-4 flex gap-2">
                      <Button onClick={() => setComposeOpen(true)}>
                        <Send className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                      <Button variant="outline">
                        <Phone className="mr-2 h-4 w-4" />
                        Call Teacher
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                    <Mail className="h-12 w-12 mb-4" />
                    <p>Select a message to view</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>College Announcements</CardTitle>
                  <CardDescription>Important notices and updates</CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                    <SelectItem value="placement">Placement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getPriorityIndicator(announcement.priority)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getAnnouncementBadge(announcement.type)}
                          <span className="text-xs text-muted-foreground">{announcement.date}</span>
                        </div>
                        <h3 className="font-semibold mb-1">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground">{announcement.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Messages Tab */}
        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>Sent Messages</CardTitle>
              <CardDescription>Messages you have sent to teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentMessages.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">To: {msg.to}</p>
                        <p className="text-sm text-muted-foreground">Subject: {msg.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{msg.date}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <CheckCheck className={`h-3 w-3 ${msg.status === "read" ? "text-blue-500" : ""}`} />
                          <span className="capitalize">{msg.status}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teacher Contact Tab */}
        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Directory</CardTitle>
              <CardDescription>
                Contact information for {currentChild.name}'s teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {teachers.map((teacher) => (
                  <Card key={teacher.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {teacher.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{teacher.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{teacher.subject}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a href={`mailto:${teacher.email}`} className="text-blue-600 hover:underline">
                                {teacher.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{teacher.phone}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewMessage({ ...newMessage, to: teacher.id });
                            setComposeOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="flex-shrink-0 w-48 p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Jan 15, 2026</span>
              </div>
              <p className="font-medium text-purple-800">Parent-Teacher Meeting</p>
              <p className="text-xs text-purple-600 mt-1">3:00 PM - College Hall</p>
            </div>
            <div className="flex-shrink-0 w-48 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Jan 26, 2026</span>
              </div>
              <p className="font-medium text-blue-800">Annual Day</p>
              <p className="text-xs text-blue-600 mt-1">10:00 AM - Auditorium</p>
            </div>
            <div className="flex-shrink-0 w-48 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Mar 15, 2026</span>
              </div>
              <p className="font-medium text-red-800">End Sem Exams Begin</p>
              <p className="text-xs text-red-600 mt-1">Check portal for schedule</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
