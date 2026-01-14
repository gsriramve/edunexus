"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  Megaphone,
  Pin,
  Clock,
  Calendar,
  MessageCircle,
  CheckCircle2,
  Bell,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Send,
  AlertTriangle,
  GraduationCap,
  CalendarDays,
  DollarSign,
  Trophy,
  PartyPopper,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  communicationApi,
  AnnouncementWithReadStatus,
  AnnouncementComment,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId } from "@/hooks/use-api";

export default function StudentAnnouncementsPage() {
  const { toast } = useToast();

  // Auth context
  const { user, isLoading: authLoading } = useAuth();
  const tenantId = useTenantId() || '';
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');

  const userId = user?.id || '';
  const userName = studentData?.user?.name || '';
  const userType = "student";

  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<AnnouncementWithReadStatus[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementWithReadStatus | null>(null);
  const [comments, setComments] = useState<AnnouncementComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (tenantId && userId) {
      loadAnnouncements();
    }
  }, [tenantId, userId]);

  const loadAnnouncements = async () => {
    if (!tenantId || !userId) return;
    setLoading(true);
    try {
      const data = await communicationApi.getAnnouncementsForUser(
        tenantId,
        userId,
        userType
      );
      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    if (!tenantId) return;
    try {
      await communicationApi.markAnnouncementRead(tenantId, {
        announcementId,
        userId,
        userType,
      });
      // Update local state
      setAnnouncements(prev =>
        prev.map(a => a.id === announcementId ? { ...a, isRead: true } : a)
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleAcknowledge = async (announcementId: string) => {
    if (!tenantId) return;
    try {
      await communicationApi.acknowledgeAnnouncement(tenantId, {
        announcementId,
        userId,
      });
      setAnnouncements(prev =>
        prev.map(a => a.id === announcementId ? { ...a, isAcknowledged: true } : a)
      );
      toast({ title: "Success", description: "Announcement acknowledged" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to acknowledge", variant: "destructive" });
    }
  };

  const loadComments = async (announcementId: string) => {
    if (!tenantId) return;
    try {
      const data = await communicationApi.getComments(tenantId, announcementId);
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedAnnouncement || !newComment.trim() || !tenantId) return;

    try {
      await communicationApi.createComment(tenantId, {
        announcementId: selectedAnnouncement.id,
        userId,
        userType,
        userName,
        content: newComment,
      });
      setNewComment("");
      loadComments(selectedAnnouncement.id);
      toast({ title: "Success", description: "Comment posted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to post comment", variant: "destructive" });
    }
  };

  const handleExpandAnnouncement = async (announcement: AnnouncementWithReadStatus) => {
    if (expandedId === announcement.id) {
      setExpandedId(null);
      setSelectedAnnouncement(null);
      setComments([]);
    } else {
      setExpandedId(announcement.id);
      setSelectedAnnouncement(announcement);
      if (!announcement.isRead) {
        handleMarkAsRead(announcement.id);
      }
      if (announcement.allowComments) {
        loadComments(announcement.id);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "urgent": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "academic": return <GraduationCap className="h-5 w-5 text-blue-500" />;
      case "exam": return <CalendarDays className="h-5 w-5 text-orange-500" />;
      case "fee": return <DollarSign className="h-5 w-5 text-yellow-600" />;
      case "placement": return <Trophy className="h-5 w-5 text-indigo-500" />;
      case "event": return <PartyPopper className="h-5 w-5 text-purple-500" />;
      case "holiday": return <Calendar className="h-5 w-5 text-green-500" />;
      default: return <Megaphone className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-100 text-gray-700",
      academic: "bg-blue-100 text-blue-700",
      event: "bg-purple-100 text-purple-700",
      urgent: "bg-red-100 text-red-700",
      holiday: "bg-green-100 text-green-700",
      exam: "bg-orange-100 text-orange-700",
      fee: "bg-yellow-100 text-yellow-700",
      placement: "bg-indigo-100 text-indigo-700",
    };
    return (
      <Badge variant="secondary" className={colors[type] || "bg-gray-100 text-gray-700"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "urgent") {
      return <Badge variant="destructive">Urgent</Badge>;
    }
    if (priority === "high") {
      return <Badge className="bg-orange-500">High Priority</Badge>;
    }
    return null;
  };

  const filteredAnnouncements = announcements.filter(a => {
    if (filterType === "all") return true;
    if (filterType === "unread") return !a.isRead;
    return a.type === filterType;
  });

  const unreadCount = announcements.filter(a => !a.isRead).length;

  // Initial auth loading state
  if (authLoading || studentLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Loading announcements
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with important college announcements
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-sm">
              {unreadCount} unread
            </Badge>
          )}
          <Button variant="outline" onClick={loadAnnouncements}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Announcements</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
            <SelectItem value="fee">Fee</SelectItem>
            <SelectItem value="event">Events</SelectItem>
            <SelectItem value="holiday">Holidays</SelectItem>
            <SelectItem value="placement">Placement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No announcements</h3>
              <p className="text-muted-foreground">
                {filterType === "unread"
                  ? "You're all caught up! No unread announcements."
                  : "There are no announcements at this time."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`transition-all ${
                !announcement.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
              } ${announcement.isPinned ? "border-2 border-orange-200" : ""}`}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => handleExpandAnnouncement(announcement)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getTypeIcon(announcement.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {announcement.isPinned && (
                          <Pin className="h-4 w-4 text-orange-500" />
                        )}
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        {!announcement.isRead && (
                          <Badge className="bg-blue-500">New</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTypeBadge(announcement.type)}
                        {getPriorityBadge(announcement.priority)}
                        {announcement.allowComments && (
                          <Badge variant="outline" className="text-xs">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Comments enabled
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(announcement.publishedAt || announcement.createdAt), { addSuffix: true })}
                        {announcement.expiresAt && (
                          <span className="text-xs text-muted-foreground">
                            (Expires: {new Date(announcement.expiresAt).toLocaleDateString()})
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    {expandedId === announcement.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {expandedId === announcement.id && (
                <CardContent className="pt-0 space-y-4">
                  {/* Announcement Content */}
                  <div className="prose prose-sm max-w-none bg-muted/50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{announcement.content}</p>
                  </div>

                  {/* Acknowledge Button */}
                  {announcement.isAcknowledged ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">You've acknowledged this announcement</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledge(announcement.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Acknowledge
                    </Button>
                  )}

                  {/* Comments Section */}
                  {announcement.allowComments && (
                    <div className="border-t pt-4 space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Comments
                      </h4>

                      {comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                      ) : (
                        <div className="space-y-3">
                          {comments.map((comment) => (
                            <div key={comment.id} className="bg-muted p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{comment.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Write a comment..."
                          rows={2}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="resize-none"
                        />
                        <Button
                          size="sm"
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
