"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Info, AlertTriangle, CheckCircle, MessageSquare, Calendar, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId } from "@/hooks/use-api";
import {
  useStudentNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useNotificationPreferences,
  NotificationItem,
} from "@/hooks/use-student-notifications";

const notificationCategories = [
  { id: "all", label: "All", icon: Bell },
  { id: "academic", label: "Academic", icon: FileText },
  { id: "events", label: "Events", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

function getNotificationIcon(type: string) {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "error":
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    default:
      return <Info className="h-5 w-5 text-blue-600" />;
  }
}

function getNotificationStyle(type: string, read: boolean) {
  const baseStyle = read ? "opacity-60" : "";
  switch (type) {
    case "warning":
      return `${baseStyle} border-yellow-200 bg-yellow-50`;
    case "success":
      return `${baseStyle} border-green-200 bg-green-50`;
    case "error":
      return `${baseStyle} border-red-200 bg-red-50`;
    default:
      return `${baseStyle} border-blue-200 bg-blue-50`;
  }
}

function NotificationCard({
  notification,
  onMarkRead,
  isMarkingRead,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  isMarkingRead: boolean;
}) {
  return (
    <Card className={getNotificationStyle(notification.type, notification.read)}>
      <CardContent className="flex items-start gap-4 pt-6">
        <div className="rounded-full bg-white p-2 shadow-sm">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{notification.title}</h3>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{notification.time}</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs"
              onClick={() => onMarkRead(notification.id)}
              disabled={isMarkingRead}
            >
              {isMarkingRead ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : null}
              Mark as read
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsList({
  notifications,
  isLoading,
  onMarkRead,
  markingReadId,
}: {
  notifications: NotificationItem[];
  isLoading: boolean;
  onMarkRead: (id: string) => void;
  markingReadId: string | null;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-semibold">All caught up!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You'll see new notifications here when they arrive.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          isMarkingRead={markingReadId === notification.id}
        />
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const { user, isLoading: userLoaded } = useAuth();
  const tenantId = useTenantId() || '';
  const [activeCategory, setActiveCategory] = useState("all");
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  // Fetch student data
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');
  const studentId = studentData?.id || '';

  const { data, isLoading, error } = useStudentNotifications(studentId, {
    category: activeCategory === "all" ? undefined : activeCategory,
  });

  const { data: preferences } = useNotificationPreferences(studentId);
  const markRead = useMarkNotificationRead(studentId);
  const markAllRead = useMarkAllNotificationsRead(studentId);

  const handleMarkRead = async (notificationId: string) => {
    setMarkingReadId(notificationId);
    try {
      await markRead.mutateAsync(notificationId);
    } finally {
      setMarkingReadId(null);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync();
  };

  const filteredNotifications = data?.notifications.filter((n) => {
    if (activeCategory === "all") return true;
    return n.category === activeCategory;
  }) || [];

  const unreadCount = data?.unreadCount || 0;

  if (!userLoaded || studentLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Please log in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important announcements and alerts
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || markAllRead.isPending}
        >
          {markAllRead.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Mark all as read
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-4">
        <TabsList>
          {notificationCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="gap-2">
              <category.icon className="h-4 w-4" />
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {notificationCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <NotificationsList
              notifications={filteredNotifications}
              isLoading={isLoading}
              onMarkRead={handleMarkRead}
              markingReadId={markingReadId}
            />
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {preferences ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <Badge variant={preferences.email ? "default" : "secondary"}>
                  {preferences.email ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS notifications</span>
                <Badge variant={preferences.sms ? "default" : "secondary"}>
                  {preferences.sms ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push notifications</span>
                <Badge variant={preferences.push ? "default" : "secondary"}>
                  {preferences.push ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Contact your administrator to change notification preferences.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Loading notification preferences...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
