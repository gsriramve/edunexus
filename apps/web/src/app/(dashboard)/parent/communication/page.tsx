"use client";

import { useState } from "react";
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

// Mock data for children
const children = [
  { id: "child-1", name: "Rahul Sharma", rollNo: "21CSE101", department: "Computer Science", semester: 5 },
  { id: "child-2", name: "Priya Sharma", rollNo: "23ECE045", department: "Electronics", semester: 3 },
];

// Mock teachers data
const teachers = [
  { id: "t1", name: "Dr. Ramesh Kumar", subject: "Data Structures", email: "ramesh.k@college.edu", phone: "+91 98765 43210" },
  { id: "t2", name: "Dr. Priya Sharma", subject: "Computer Networks", email: "priya.s@college.edu", phone: "+91 98765 43211" },
  { id: "t3", name: "Dr. Arun Menon", subject: "Operating Systems", email: "arun.m@college.edu", phone: "+91 98765 43212" },
  { id: "t4", name: "Prof. Kavitha Nair", subject: "Software Engineering", email: "kavitha.n@college.edu", phone: "+91 98765 43213" },
  { id: "t5", name: "Prof. Mentor", subject: "Class Mentor", email: "mentor@college.edu", phone: "+91 98765 43214" },
];

// Mock communication data
const announcements = [
  {
    id: "ann-1",
    title: "Semester 5 Exam Schedule Released",
    content: "The end-semester examination schedule for Semester 5 has been released. Students are advised to check the exam portal for detailed timetable. Exams will commence from March 15, 2026.",
    date: "Jan 5, 2026",
    type: "exam",
    priority: "high",
  },
  {
    id: "ann-2",
    title: "Annual Day Celebration - Jan 26",
    content: "Annual Day celebrations will be held on January 26, 2026. Parents are cordially invited to attend. Please confirm your attendance at the office by January 20.",
    date: "Jan 3, 2026",
    type: "event",
    priority: "medium",
  },
  {
    id: "ann-3",
    title: "Fee Payment Deadline Extended",
    content: "Due to technical issues with the payment gateway, the fee payment deadline has been extended to January 31, 2026. Students with pending fees are requested to clear dues before the new deadline.",
    date: "Jan 2, 2026",
    type: "fee",
    priority: "high",
  },
  {
    id: "ann-4",
    title: "Campus Placement Drive - TechCorp",
    content: "TechCorp will be conducting campus placements on February 10, 2026. Eligible students can register through the placement portal. Minimum CGPA requirement: 7.5",
    date: "Dec 28, 2025",
    type: "placement",
    priority: "medium",
  },
  {
    id: "ann-5",
    title: "Library Hours Extended",
    content: "The library will remain open until 10 PM during the exam period (March 1 - March 30). Students can use this facility for extended study hours.",
    date: "Dec 26, 2025",
    type: "general",
    priority: "low",
  },
];

const messages = [
  {
    id: "msg-1",
    from: "Dr. Ramesh Kumar",
    subject: "Data Structures",
    message: "Rahul has shown excellent improvement in the recent assignments. His problem-solving approach has become more structured. Keep encouraging this progress!",
    date: "Jan 5, 2026",
    time: "10:30 AM",
    read: false,
    child: "child-1",
  },
  {
    id: "msg-2",
    from: "Dr. Priya Sharma",
    subject: "Computer Networks",
    message: "I'd like to discuss Rahul's attendance in my class. He has missed several sessions recently. Please ensure he attends regularly as we have important labs coming up.",
    date: "Jan 3, 2026",
    time: "2:15 PM",
    read: true,
    child: "child-1",
  },
  {
    id: "msg-3",
    from: "Prof. Mentor",
    subject: "Class Mentor",
    message: "Reminder: Parent-Teacher Meeting is scheduled for January 15, 2026 at 3:00 PM. Please confirm your availability.",
    date: "Jan 1, 2026",
    time: "11:00 AM",
    read: true,
    child: "child-1",
  },
  {
    id: "msg-4",
    from: "Dr. Meera Nair",
    subject: "Digital Electronics",
    message: "Priya has been doing exceptionally well in both theory and lab sessions. She secured the highest marks in the recent internal exam. Great work!",
    date: "Jan 4, 2026",
    time: "4:00 PM",
    read: false,
    child: "child-2",
  },
];

const sentMessages = [
  {
    id: "sent-1",
    to: "Dr. Priya Sharma",
    subject: "Re: Attendance Concern",
    message: "Thank you for bringing this to my notice. I will ensure Rahul attends all classes regularly. Could you please share the lab schedule so we can plan accordingly?",
    date: "Jan 3, 2026",
    time: "5:30 PM",
    status: "delivered",
  },
  {
    id: "sent-2",
    to: "Prof. Mentor",
    subject: "PTM Confirmation",
    message: "I confirm my attendance for the Parent-Teacher Meeting on January 15, 2026 at 3:00 PM. Looking forward to discussing my child's progress.",
    date: "Jan 1, 2026",
    time: "12:30 PM",
    status: "read",
  },
];

export default function ParentCommunication() {
  const [selectedChild, setSelectedChild] = useState(children[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<typeof messages[0] | null>(null);
  const [newMessage, setNewMessage] = useState({ to: "", subject: "", content: "" });

  const currentChild = children.find((c) => c.id === selectedChild)!;

  // Filter messages by selected child
  const filteredMessages = messages.filter(
    (msg) => msg.child === selectedChild &&
    (msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
     msg.message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const unreadCount = filteredMessages.filter((m) => !m.read).length;

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
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} ({child.rollNo})
                </SelectItem>
              ))}
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
