"use client";

import { useState, useEffect } from "react";
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
  Inbox,
  SendHorizontal,
  Star,
  Archive,
  Trash2,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useInbox,
  useSentMessages,
  useMessageStats,
  useTeacherClassesForMessages,
  useSearchRecipients,
  useSendMessage,
  useReplyToMessage,
  useMarkAsRead,
  useToggleStar,
  useDeleteMessages,
  type InboxMessage,
  type SentMessage,
  type MessageDetail,
} from "@/hooks/use-teacher-messages";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  query: "bg-blue-100 text-blue-800",
  announcement: "bg-purple-100 text-purple-800",
  request: "bg-yellow-100 text-yellow-800",
  reply: "bg-green-100 text-green-800",
  general: "bg-gray-100 text-gray-800",
};

export default function TeacherMessagesPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | SentMessage | null>(null);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [composeForm, setComposeForm] = useState({
    recipientType: "class" as "class" | "individual" | "custom",
    recipient: "",
    recipientName: "",
    recipientUserType: "",
    subject: "",
    message: "",
  });

  const tenantId = useTenantId();

  // Data fetching hooks
  const { data: inboxData, isLoading: inboxLoading, refetch: refetchInbox } = useInbox(tenantId || "", {
    search: searchQuery || undefined,
  });
  const { data: sentData, isLoading: sentLoading, refetch: refetchSent } = useSentMessages(tenantId || "", {
    search: searchQuery || undefined,
  });
  const { data: stats, isLoading: statsLoading } = useMessageStats(tenantId || "");
  const { data: classes } = useTeacherClassesForMessages(tenantId || "");
  const { data: searchResults } = useSearchRecipients(
    tenantId || "",
    recipientSearch,
    composeForm.recipientType === "individual" ? undefined : undefined
  );

  // Mutation hooks
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(tenantId || "");
  const { mutate: markAsRead } = useMarkAsRead(tenantId || "");
  const { mutate: toggleStar } = useToggleStar(tenantId || "");
  const { mutate: deleteMessages } = useDeleteMessages(tenantId || "");

  const isLoading = inboxLoading || sentLoading || statsLoading;

  // Filter inbox based on search (client-side for immediate feedback)
  const filteredInbox = inboxData?.messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredSent = sentData?.messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.to.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  ) || [];

  const handleSendMessage = () => {
    if (!composeForm.subject.trim() || !composeForm.message.trim()) {
      toast.error("Please fill in subject and message");
      return;
    }

    if (!composeForm.recipient && composeForm.recipientType !== "custom") {
      toast.error("Please select a recipient");
      return;
    }

    sendMessage(
      {
        recipientType: composeForm.recipientType,
        recipientId: composeForm.recipient,
        recipientName: composeForm.recipientName,
        recipientUserType: composeForm.recipientUserType || undefined,
        subject: composeForm.subject,
        content: composeForm.message,
        messageType: "general",
      },
      {
        onSuccess: (response) => {
          toast.success(response.message);
          setShowComposeDialog(false);
          setComposeForm({
            recipientType: "class",
            recipient: "",
            recipientName: "",
            recipientUserType: "",
            subject: "",
            message: "",
          });
          refetchSent();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to send message");
        },
      }
    );
  };

  const handleMessageClick = (message: InboxMessage | SentMessage) => {
    setSelectedMessage(message);

    // Mark as read if it's an inbox message and unread
    if ("from" in message && !message.isRead) {
      markAsRead([message.id]);
    }
  };

  const handleStarToggle = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    toggleStar(messageId);
  };

  const handleDelete = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMessages([messageId], {
        onSuccess: () => {
          toast.success("Message deleted");
          refetchInbox();
          refetchSent();
        },
      });
    }
  };

  const handleRefresh = () => {
    refetchInbox();
    refetchSent();
    toast.success("Messages refreshed");
  };

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
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
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
                      onValueChange={(value: "class" | "individual" | "custom") =>
                        setComposeForm({ ...composeForm, recipientType: value, recipient: "", recipientName: "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class">Class</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient</label>
                    {composeForm.recipientType === "class" ? (
                      <Select
                        value={composeForm.recipient}
                        onValueChange={(value) => {
                          const cls = classes?.find((c) => c.id === value);
                          setComposeForm({
                            ...composeForm,
                            recipient: value,
                            recipientName: cls?.name || "",
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} ({cls.studentCount} students)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Search students, parents..."
                          value={recipientSearch}
                          onChange={(e) => setRecipientSearch(e.target.value)}
                        />
                        {searchResults && searchResults.length > 0 && (
                          <div className="max-h-32 overflow-y-auto border rounded-md">
                            {searchResults.map((result) => (
                              <div
                                key={result.id}
                                className="p-2 hover:bg-muted cursor-pointer text-sm"
                                onClick={() => {
                                  setComposeForm({
                                    ...composeForm,
                                    recipient: result.id,
                                    recipientName: result.name,
                                    recipientUserType: result.type,
                                  });
                                  setRecipientSearch("");
                                }}
                              >
                                <div className="font-medium">{result.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {result.type} {result.subtitle && `- ${result.subtitle}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {composeForm.recipientName && (
                          <Badge variant="secondary">
                            {composeForm.recipientName}
                          </Badge>
                        )}
                      </div>
                    )}
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
                <Button onClick={handleSendMessage} disabled={isSending}>
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
                {stats?.unreadCount || 0}
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
              <span className="text-2xl font-bold">{stats?.totalInbox || 0}</span>
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
              <span className="text-2xl font-bold">{stats?.totalSent || 0}</span>
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
            Inbox ({inboxData?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="sent">
            <SendHorizontal className="h-4 w-4 mr-2" />
            Sent ({sentData?.total || 0})
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
                onClick={() => handleMessageClick(message)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
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
                          {message.from.type}
                        </Badge>
                        <Badge className={typeColors[message.messageType] || typeColors.general}>
                          {message.messageType}
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
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => handleStarToggle(e, message.id)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              message.isStarred ? "fill-yellow-400 text-yellow-400" : ""
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => handleDelete(e, message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
          {filteredSent.length > 0 ? (
            filteredSent.map((message) => (
              <Card
                key={message.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleMessageClick(message)}
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
                        <span className="font-medium">{message.to.name || "Unknown"}</span>
                        {message.totalRecipients > 1 && (
                          <Badge variant="secondary">
                            {message.totalRecipients} recipients
                          </Badge>
                        )}
                        <Badge className={typeColors[message.messageType] || typeColors.general}>
                          {message.messageType}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{message.subject}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.preview}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.totalRecipients > 1 && (
                        <span className="text-xs text-green-600">
                          {message.readCount}/{message.totalRecipients} read
                        </span>
                      )}
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
                    <AvatarFallback>
                      {"from" in selectedMessage
                        ? selectedMessage.from.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                        : selectedMessage.to.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedMessage.subject}</DialogTitle>
                    <DialogDescription>
                      {"from" in selectedMessage
                        ? `From: ${selectedMessage.from.name} (${selectedMessage.from.type})`
                        : `To: ${selectedMessage.to.name}`}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Close
                </Button>
                {"from" in selectedMessage && (
                  <Button
                    onClick={() => {
                      setShowComposeDialog(true);
                      setComposeForm({
                        recipientType: "individual",
                        recipient: selectedMessage.from.id,
                        recipientName: selectedMessage.from.name,
                        recipientUserType: selectedMessage.from.type,
                        subject: `Re: ${selectedMessage.subject}`,
                        message: "",
                      });
                      setSelectedMessage(null);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
