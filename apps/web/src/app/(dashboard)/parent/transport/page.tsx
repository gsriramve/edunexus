"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  Bus,
  MapPin,
  Clock,
  Phone,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useParentChildren } from "@/hooks/use-parents";

export default function ParentTransport() {
  const { user } = useAuth();
  const tenantId = useTenantId() || '';
  const [selectedChildId, setSelectedChildId] = useState<string>('');

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
        <Skeleton className="h-64" />
      </div>
    );
  }

  // No children state
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport Information</h1>
          <p className="text-muted-foreground">
            Track your child's bus route and transport details
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

  // Mock transport data - in a real app, this would come from an API
  const transportInfo = {
    busNo: "BUS-07",
    routeName: "North Campus Route",
    pickupPoint: "Green Park Metro Station",
    pickupTime: "7:30 AM",
    dropTime: "4:15 PM",
    driverName: "Ramesh Kumar",
    driverPhone: "+91 98765 43210",
    attendantName: "Sunita Devi",
    attendantPhone: "+91 98765 43211",
    status: "active",
  };

  const routeStops = [
    { stop: "College Gate", time: "8:00 AM", order: 1 },
    { stop: "Metro Station", time: "7:45 AM", order: 2 },
    { stop: "Green Park", time: "7:30 AM", order: 3, isPickup: true },
    { stop: "Safdarjung", time: "7:15 AM", order: 4 },
    { stop: "AIIMS", time: "7:00 AM", order: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport Information</h1>
          <p className="text-muted-foreground">
            Track {currentChild.name}'s bus route and transport details
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
        </div>
      </div>

      {/* Status Banner */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Transport Active</h3>
              <p className="text-sm text-green-700">
                {currentChild.name} is registered for college transport on {transportInfo.routeName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Info Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-blue-50 shrink-0">
                <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Bus Number</p>
                <p className="text-lg sm:text-xl font-bold">{transportInfo.busNo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-green-50 shrink-0">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Pickup Point</p>
                <p className="text-sm sm:text-lg font-semibold truncate">{transportInfo.pickupPoint}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-orange-50 shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Pickup Time</p>
                <p className="text-lg sm:text-xl font-bold">{transportInfo.pickupTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-purple-50 shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Drop Time</p>
                <p className="text-lg sm:text-xl font-bold">{transportInfo.dropTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Route Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Route Details
            </CardTitle>
            <CardDescription>{transportInfo.routeName}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stop</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routeStops.sort((a, b) => b.order - a.order).map((stop) => (
                  <TableRow key={stop.order} className={stop.isPickup ? "bg-green-50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className={`h-4 w-4 ${stop.isPickup ? "text-green-600" : "text-muted-foreground"}`} />
                        {stop.stop}
                      </div>
                    </TableCell>
                    <TableCell>{stop.time}</TableCell>
                    <TableCell>
                      {stop.isPickup && (
                        <Badge className="bg-green-500">Your Stop</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
            <CardDescription>Driver and attendant contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-full bg-blue-100 shrink-0">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">{transportInfo.driverName}</p>
                    <p className="text-sm text-muted-foreground">Bus Driver</p>
                    <p className="text-sm text-muted-foreground sm:hidden">
                      {transportInfo.driverPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {transportInfo.driverPhone}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${transportInfo.driverPhone}`}>
                      <Phone className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-full bg-purple-100 shrink-0">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">{transportInfo.attendantName}</p>
                    <p className="text-sm text-muted-foreground">Bus Attendant</p>
                    <p className="text-sm text-muted-foreground sm:hidden">
                      {transportInfo.attendantPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {transportInfo.attendantPhone}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${transportInfo.attendantPhone}`}>
                      <Phone className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Transport Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">Pickup Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Be at the pickup point 5 minutes before scheduled time</li>
                <li>• Carry college ID card at all times</li>
                <li>• Inform the driver in advance for any planned absence</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-orange-50">
              <h4 className="font-medium text-orange-800 mb-2">Safety Rules</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Remain seated while the bus is in motion</li>
                <li>• No eating or drinking inside the bus</li>
                <li>• Report any issues to the attendant immediately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
