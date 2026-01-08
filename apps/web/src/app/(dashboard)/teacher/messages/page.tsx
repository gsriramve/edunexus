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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Bell,
  Users,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Inbox,
  SendHorizontal,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";

// Mock data - will be replaced with API calls
const mockMessagesData = {
  inbox: [
    {
      id: "1",
      from: { name: "Priya Patel", role: "Student", avatar: null },
      subject: "Doubt in DSA Assignment",
      preview: "Sir, I have a doubt regarding the binary tree traversal question...",
      date: "2026-01-08T10:30:00",
      isRead: false,
      type: "query",
    },
    {
      id: "2",
      from: { name: "Dr. Sharma", role: "HoD", avatar: null },
      subject: "Department Meeting Tomorrow",
      preview: "Please note that there's a department meeting scheduled for tomorrow at 3 PM...",
      date: "2026-01-08T09:15:00",
      isRead: true,
      type: "announcement",
    },
    {
      id: "3",
      from: { name: "Rahul Kumar", role: "Student", avatar: null },
      subject: "Request for Extra Classes",
      preview: "Sir, I wanted to request if you could arrange extra classes before the...",
      date: "2026-01-07T16:45:00",
      isRead: true,
      type: "request",
    },
    {
      id: "4",
      from: { name: "Parent - Mrs. Gupta", role: "Parent", avatar: null },
      subject: "Query about Child's Performance",
      preview: "Good morning sir, I wanted to discuss about my son Amit's performance in...",
      date: "2026-01-07T11:20:00",
      isRead: true,
      type: "query",
    },
  ],
  sent: [
    {
      id: "s1",
      to: { name: "CS301 - Section A", type: "class" },
      subject: "Assignment Submission Deadline Extended",
      preview: "The deadline for assignment 3 has been extended to January 15th...",
      date: "2026-01-08T08:00:00",
      type: "announcement",
    },
    {
      id: "s2",
      to: { name: "Amit Kumar", type: "student" },
      subject: "Re: Extra Class Request",
      preview: "Hi Amit, I've scheduled extra doubt clearing sessions for next week...",
      date: "2026-01-07T17:30:00",
      type: "reply",
    },
  ],
  unreadCount: 1,
  classes: [
    { id: "1", name: "CS301 - Section A", studentCount: 45 },
    { id: "2", name: "CS301 - Section B", studentCount: 42 },
    { id: "3", name: "CS302 - Section A", studentCount: 45 },
    { id: "4", name: "CS401 - Section A", studentCount: 38 },
  ],
};

const typeColors: Record<string, string> = {
  query: "bg-blue-100 text-blue-800",
  announcement: "bg-purple-100 text-purple-800",
  request: "bg-yellow-100 text-yellow-800",
  reply: "bg-green-100 text-green-800",
};

export default function TeacherMessagesPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [composeForm, setComposeForm] = useState({
    recipientType: "class",
    recipient: "",
    subject: "",
    message: "",
  });

  const tenantId = useTenantId();

  const isLoading = false;
  const data = mockMessagesData;

  const filteredInbox = data.inbox.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with students, parents, and staff
          </p>
        </div>
        <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>
                Send a message to students, classes, or parents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Send to</label>
                  <Select
                    value={composeForm.recipientType}
                    onValueChange={(value) =>
                      setComposeForm({ ...composeForm, recipientType: value, recipient: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="student">Individual Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient</label>
                  <Select
                    value={composeForm.recipient}
                    onValueChange={(value) =>
                      setComposeForm({ ...composeForm, recipient: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {composeForm.recipientType === "class" &&
                        data.classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.studentCount} students)
                          </SelectItem>
                        ))}
                      {composeForm.recipientType === "student" && (
                        <>
                          <SelectItem value="stu1">Rahul Sharma</SelectItem>
                          <SelectItem value="stu2">Priya Patel</SelectItem>
                          <SelectItem value="stu3">Amit Kumar</SelectItem>
                        </>
                      )}
                      {composeForm.recipientType === "parent" && (
                        <>
                          <SelectItem value="par1">Mr. Sharma (Rahul's parent)</SelectItem>
                          <SelectItem value="par2">Mrs. Patel (Priya's parent)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={composeForm.subject}
                  onChange={(e) =>
                    setComposeForm({ ...composeForm, subject: e.target.value })
                  }
                  placeholder="Enter subject"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={composeForm.message}
                  onChange={(e) =>
                    setComposeForm({ ...composeForm, message: e.target.value })
                  }
                  placeholder="Type your message..."
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowComposeDialog(false)}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {data.unreadCount}
              </span>
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inbox
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{data.inbox.length}</span>
              <Inbox className="h-5 w-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{data.sent.length}</span>
              <SendHorizontal className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox">
            <Inbox className="h-4 w-4 mr-2" />
            Inbox ({data.inbox.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            <SendHorizontal className="h-4 w-4 mr-2" />
            Sent ({data.sent.length})
          </TabsTrigger>
        </TabsList>

        {/* Inbox */}
        <TabsContent value="inbox" className="space-y-2">
          {filteredInbox.length > 0 ? (
            filteredInbox.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  !message.isRead ? "border-l-4 border-l-primary" : ""
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={message.from.avatar || undefined} />
                      <AvatarFallback>
                        {message.from.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${!message.isRead ? "font-semibold" : ""}`}>
                          {message.from.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {message.from.role}
                        </Badge>
                        <Badge className={typeColors[message.type]}>
                          {message.type}
                        </Badge>
                      </div>
                      <p className={`text-sm ${!message.isRead ? "font-medium" : ""}`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.preview}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Messages</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery ? "No messages match your search" : "Your inbox is empty"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sent */}
        <TabsContent value="sent" className="space-y-2">
          {data.sent.length > 0 ? (
            data.sent.map((message) => (
              <Card
                key={message.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      {message.to.type === "class" ? (
                        <Users className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-medium">{message.to.name}</span>
                        <Badge className={typeColors[message.type]}>
                          {message.type}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{message.subject}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.preview}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <SendHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Sent Messages</h3>
                <p className="text-muted-foreground text-center">
                  You haven't sent any messages yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Message Detail Dialog */}
      <Dialog open={selectedMessage !== null} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedMessage.from.avatar || undefined} />
                    <AvatarFallback>
                      {selectedMessage.from.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedMessage.subject}</DialogTitle>
                    <DialogDescription>
                      From: {selectedMessage.from.name} ({selectedMessage.from.role})
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {new Date(selectedMessage.date).toLocaleString()}
                </p>
                <p className="text-sm whitespace-pre-wrap">{selectedMessage.preview}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Close
                </Button>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
