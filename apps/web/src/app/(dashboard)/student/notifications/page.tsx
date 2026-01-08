"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Info, AlertTriangle, CheckCircle, MessageSquare, Calendar, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sample notification structure for future implementation
const sampleNotifications = [
  {
    id: "1",
    type: "info",
    title: "Notification Center Coming Soon",
    message: "We're building a comprehensive notification system to keep you updated on academics, fees, events, and more.",
    timestamp: new Date().toISOString(),
    read: false,
    category: "system",
  },
];

const notificationCategories = [
  { id: "all", label: "All", icon: Bell },
  { id: "academic", label: "Academic", icon: FileText },
  { id: "events", label: "Events", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important announcements and alerts
          </p>
        </div>
        <Button variant="outline" disabled>
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          {notificationCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="gap-2">
              <category.icon className="h-4 w-4" />
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-900">Coming Soon!</h3>
                  <Badge variant="secondary">New</Badge>
                </div>
                <p className="mt-1 text-sm text-blue-700">
                  The notification center will include real-time updates for:
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-blue-700">
                  <li>Academic announcements and schedule changes</li>
                  <li>Exam results and grade updates</li>
                  <li>Fee payment reminders</li>
                  <li>Event notifications and invitations</li>
                  <li>Messages from faculty and administration</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              <CardDescription>You have no new notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold">All caught up!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You'll see new notifications here when they arrive.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No academic notifications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Academic updates will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No event notifications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Event invitations and reminders will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No messages</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Messages from faculty will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notification preferences will be available soon. You'll be able to customize
            which notifications you receive via email, SMS, and in-app alerts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
