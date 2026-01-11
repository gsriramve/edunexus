"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import {
  MessageSquare,
  Bell,
  Send,
  Search,
  Mail,
  Phone,
  Clock,
  CheckCheck,
  Megaphone,
  User,
  PlusCircle,
  Paperclip,
  Users,
  Inbox,
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
import { useStudentTeachers } from "@/hooks/use-parent-dashboard";

export default function ParentMessages() {
  const { user } = useAuth();
  const tenantId = useTenantId() || '';
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
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
        type: ann.priority === 'urgent' ? 'urgent' : ann.priority === 'high' ? 'important' : 'general',
        priority: ann.priority || 'low',
      }));
    }
    return [];
  }, [announcementsData]);

  const teachers = teachersData || [];

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
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            View announcements and communicate with teachers
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

  const getPriorityBadge = (type: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      urgent: { color: "bg-red-500", label: "Urgent" },
      important: { color: "bg-orange-500", label: "Important" },
      general: { color: "bg-blue-500", label: "General" },
    };
    const badge = badges[type] || badges.general;
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            View announcements and communicate with teachers
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
      <div className="grid gap-4 md:grid-cols-3">
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
              <div className="p-3 rounded-lg bg-blue-50">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inbox</p>
                <p className="text-2xl font-bold">0</p>
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
      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="announcements">
            Announcements
            {announcements.length > 0 && (
              <span className="ml-2 bg-purple-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {announcements.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="teachers">Teacher Contact</TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>College Announcements</CardTitle>
              <CardDescription>Important notices and updates from the college</CardDescription>
            </CardHeader>
            <CardContent>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getPriorityBadge(announcement.type)}
                            <span className="text-xs text-muted-foreground">{announcement.date}</span>
                          </div>
                          <h3 className="font-semibold mb-1">{announcement.title}</h3>
                          <p className="text-sm text-muted-foreground">{announcement.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Announcements</p>
                  <p className="text-sm">There are no announcements at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inbox Tab */}
        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inbox</CardTitle>
                  <CardDescription>Messages from teachers</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Messages</p>
                <p className="text-sm">Your inbox is empty. Messages from teachers will appear here.</p>
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
              {teachers.length > 0 ? (
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
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Teachers Found</p>
                  <p className="text-sm">Teacher information is not available at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
