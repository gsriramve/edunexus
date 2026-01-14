"use client";

import { useState, useEffect } from "react";
import {
  Bus,
  MapPin,
  Clock,
  Phone,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  RefreshCw,
  User,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId } from "@/hooks/use-api";
import {
  useStudentPass,
  useRoute,
  useRouteStops,
  useVehicle,
  useLatestTracking,
} from "@/hooks/use-transport";

export default function StudentTransportPage() {
  const { user, isLoading: authLoading } = useAuth();
  const tenantId = useTenantId();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get student data
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(
    tenantId || '',
    user?.id || ''
  );
  const studentId = studentData?.id || '';

  // Get transport pass
  const { data: passData, isLoading: passLoading, refetch: refetchPass } = useStudentPass(
    tenantId || '',
    studentId
  );

  // Get route details (if pass exists)
  const { data: routeData, isLoading: routeLoading } = useRoute(
    tenantId || '',
    passData?.routeId || ''
  );

  // Get route stops
  const { data: stopsData, isLoading: stopsLoading } = useRouteStops(
    tenantId || '',
    passData?.routeId || ''
  );

  // Get vehicle details (if pass exists) - vehicleId comes from route, not pass
  const vehicleId = routeData?.vehicleId || '';
  const { data: vehicleData, isLoading: vehicleLoading } = useVehicle(
    tenantId || '',
    vehicleId
  );

  // Get live tracking
  const { data: trackingData, isLoading: trackingLoading } = useLatestTracking(
    tenantId || '',
    vehicleId
  );

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Derived state
  const isLoading = authLoading || studentLoading || passLoading;
  const hasPass = !!passData;

  // Build pass display data - using correct TransportPass properties
  const pass = passData ? {
    id: passData.id,
    passNumber: `TP${passData.id.slice(-6).toUpperCase()}`,
    routeName: routeData?.name || 'Loading...',
    routeCode: routeData?.code || '',
    stopName: passData.boardingStop?.name || 'N/A',
    pickupTime: passData.boardingStop?.pickupTime || 'N/A',
    dropTime: passData.dropStop?.dropTime || 'N/A',
    validFrom: passData.validFrom,
    validUntil: passData.validTo, // validTo not validUntil
    fare: Number(passData.amount || 0), // amount not fare
    paidAmount: passData.paymentStatus === 'paid' ? Number(passData.amount || 0) : 0,
    paymentStatus: passData.paymentStatus || 'pending',
    status: passData.status || 'active',
  } : null;

  // Build route display data - using correct TransportRoute properties
  const route = routeData ? {
    id: routeData.id,
    name: routeData.name,
    code: routeData.code,
    startPoint: routeData.startLocation || 'Start',
    endPoint: routeData.endLocation || 'End',
    totalDistance: routeData.distanceKm || 0,
    estimatedTime: routeData.estimatedDurationMinutes || 0,
    stops: (stopsData || []).map((stop: any, index: number) => ({
      id: stop.id,
      name: stop.name,
      pickupTime: stop.pickupTime || 'N/A',
      dropTime: stop.dropTime || 'N/A',
      sequence: stop.sequence || index + 1,
    })),
  } : null;

  // Build vehicle display data - using correct TransportVehicle and TransportTracking properties
  const vehicle = vehicleData ? {
    id: vehicleData.id,
    vehicleNumber: vehicleData.vehicleNumber || 'N/A',
    vehicleType: vehicleData.type || 'bus',
    make: vehicleData.make || 'N/A',
    model: vehicleData.model || 'N/A',
    driverName: vehicleData.driverName || 'N/A',
    driverPhone: vehicleData.driverPhone || 'N/A',
    conductorName: vehicleData.conductorName || 'N/A',
    conductorPhone: vehicleData.conductorPhone || 'N/A',
    lastLocation: trackingData ? {
      latitude: trackingData.latitude,
      longitude: trackingData.longitude,
      speed: trackingData.speed || 0,
      recordedAt: trackingData.timestamp, // timestamp not recordedAt
      nearestStop: 'En route', // Not available in API, using placeholder
      eta: 'Calculating...', // Not available in API, using placeholder
    } : null,
  } : null;

  const handleRefresh = () => {
    refetchPass();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      suspended: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={styles[status] || "bg-gray-100"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800",
      pending: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={styles[status] || "bg-gray-100"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = pass ? calculateDaysRemaining(pass.validUntil) : 0;
  const validityProgress = Math.max(
    0,
    Math.min(100, (daysRemaining / 180) * 100)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!hasPass || !pass) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport</h1>
          <p className="text-muted-foreground">Manage your transport pass and track your bus</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bus className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Transport Pass</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                You don&apos;t have an active transport pass. Contact the admin office to apply for a transport pass.
              </p>
              <Button className="mt-6">Apply for Transport Pass</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport</h1>
          <p className="text-muted-foreground">
            View your pass details and track your bus
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Pass Card */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bus className="h-6 w-6" />
                <span className="text-lg font-semibold">Transport Pass</span>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Pass Number</p>
                <p className="text-2xl font-bold font-mono">{pass.passNumber}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-blue-100 text-sm">Route</p>
                  <p className="font-medium">{pass.routeName}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Stop</p>
                  <p className="font-medium">{pass.stopName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  {pass.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Valid Until</p>
                <p className="text-xl font-bold">
                  {new Date(pass.validUntil).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">{daysRemaining} days remaining</p>
                <Progress
                  value={validityProgress}
                  className="h-2 bg-blue-400 mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pickup Time</p>
                <p className="text-2xl font-bold">{pass.pickupTime}</p>
                <p className="text-xs text-muted-foreground">{pass.stopName}</p>
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
                <p className="text-sm text-muted-foreground">Drop Time</p>
                <p className="text-2xl font-bold">{pass.dropTime}</p>
                <p className="text-xs text-muted-foreground">{pass.stopName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <IndianRupee className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment</p>
                <p className="text-2xl font-bold">₹{pass.paidAmount}</p>
                <div className="mt-1">{getPaymentBadge(pass.paymentStatus)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="route">Route & Stops</TabsTrigger>
          <TabsTrigger value="driver">Driver Info</TabsTrigger>
        </TabsList>

        {/* Live Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Live Bus Location
              </CardTitle>
              <CardDescription>
                Real-time tracking of your bus
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Map placeholder */}
              <div className="h-[300px] bg-muted rounded-lg flex items-center justify-center mb-6">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Map view will be displayed here
                  </p>
                </div>
              </div>

              {/* Bus Status */}
              {vehicleLoading || trackingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !vehicle ? (
                <div className="text-center py-8 text-muted-foreground">
                  Vehicle tracking not available
                </div>
              ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-green-100">
                        <Bus className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{vehicle.vehicleNumber}</p>
                          <Badge className={vehicle.lastLocation ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                            {vehicle.lastLocation ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.make} {vehicle.model}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    {vehicle.lastLocation ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Location</span>
                        <span className="font-medium">{vehicle.lastLocation.nearestStop}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Speed</span>
                        <span className="font-medium">{vehicle.lastLocation.speed} km/h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">ETA to your stop</span>
                        <span className="font-medium text-green-600">{vehicle.lastLocation.eta}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last updated</span>
                        <span className="text-sm">Just now</span>
                      </div>
                    </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Live tracking data not available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Route & Stops Tab */}
        <TabsContent value="route" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{route?.name || 'Route Details'}</CardTitle>
              <CardDescription>
                {route ? `${route.startPoint} → ${route.endPoint} • ${route.totalDistance} km • ${route.estimatedTime} min` : 'Loading route details...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {routeLoading || stopsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !route?.stops?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No stops information available
                </div>
              ) : (
              <div className="space-y-4">
                {route.stops.map((stop, index) => {
                  const isMyStop = stop.name === pass?.stopName;
                  return (
                    <div key={stop.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isMyStop
                              ? "bg-blue-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < route.stops.length - 1 && (
                          <div className="w-0.5 h-8 bg-muted" />
                        )}
                      </div>
                      <div
                        className={`flex-1 pb-4 ${
                          isMyStop ? "bg-blue-50 -mx-2 px-4 py-2 rounded-lg" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${isMyStop ? "text-blue-700" : ""}`}>
                              {stop.name}
                            </p>
                            {isMyStop && (
                              <Badge className="bg-blue-100 text-blue-700">Your Stop</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Pickup: {stop.pickupTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Drop: {stop.dropTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Driver Info Tab */}
        <TabsContent value="driver" className="space-y-4">
          {vehicleLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !vehicle ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Vehicle information not available
                </div>
              </CardContent>
            </Card>
          ) : (
          <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Driver
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{vehicle.driverName}</p>
                    <p className="text-sm text-muted-foreground">Driver</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" disabled={vehicle.driverPhone === 'N/A'}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Driver: {vehicle.driverPhone}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Conductor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{vehicle.conductorName}</p>
                    <p className="text-sm text-muted-foreground">Conductor</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" disabled={vehicle.conductorPhone === 'N/A'}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Conductor: {vehicle.conductorPhone}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Number</p>
                  <p className="font-medium">{vehicle.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{vehicle.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Make</p>
                  <p className="font-medium">{vehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium">{vehicle.model}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          </>
          )}

          {/* Emergency Contact */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="font-semibold text-red-800">Emergency Contact</p>
                  <p className="text-sm text-red-700 mt-1">
                    In case of emergency, contact the transport office at{" "}
                    <span className="font-medium">080-1234-5678</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
