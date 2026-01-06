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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data - to be replaced with API calls
const mockPass = {
  id: "1",
  passNumber: "TP000001",
  routeName: "Route 1 - North Campus",
  routeCode: "R001",
  stopName: "Koramangala",
  pickupTime: "07:15",
  dropTime: "17:15",
  validFrom: "2026-01-01",
  validUntil: "2026-06-30",
  fare: 2500,
  paidAmount: 2500,
  paymentStatus: "paid",
  status: "active",
};

const mockRoute = {
  id: "1",
  name: "Route 1 - North Campus",
  code: "R001",
  startPoint: "Main Gate",
  endPoint: "North Campus",
  totalDistance: 15.5,
  estimatedTime: 45,
  stops: [
    { id: "1", name: "Main Gate", pickupTime: "07:00", dropTime: "17:30", sequence: 1 },
    { id: "2", name: "Koramangala", pickupTime: "07:15", dropTime: "17:15", sequence: 2 },
    { id: "3", name: "HSR Layout", pickupTime: "07:30", dropTime: "17:00", sequence: 3 },
    { id: "4", name: "BTM Layout", pickupTime: "07:45", dropTime: "16:45", sequence: 4 },
    { id: "5", name: "Jayanagar", pickupTime: "08:00", dropTime: "16:30", sequence: 5 },
    { id: "6", name: "JP Nagar", pickupTime: "08:15", dropTime: "16:15", sequence: 6 },
    { id: "7", name: "Banashankari", pickupTime: "08:30", dropTime: "16:00", sequence: 7 },
    { id: "8", name: "North Campus", pickupTime: "08:45", dropTime: "15:45", sequence: 8 },
  ],
};

const mockVehicle = {
  id: "1",
  vehicleNumber: "KA-01-AB-1234",
  vehicleType: "bus",
  make: "Tata",
  model: "Starbus",
  driverName: "Rajesh Kumar",
  driverPhone: "9876543210",
  conductorName: "Suresh",
  conductorPhone: "9876543211",
  lastLocation: {
    latitude: 12.9352,
    longitude: 77.6245,
    speed: 35,
    recordedAt: new Date().toISOString(),
    nearestStop: "Koramangala",
    eta: "5 min",
  },
};

export default function StudentTransportPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPass, setHasPass] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

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

  const daysRemaining = calculateDaysRemaining(mockPass.validUntil);
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

  if (!hasPass) {
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
        <Button variant="outline" size="sm">
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
                <p className="text-2xl font-bold font-mono">{mockPass.passNumber}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-blue-100 text-sm">Route</p>
                  <p className="font-medium">{mockPass.routeName}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Stop</p>
                  <p className="font-medium">{mockPass.stopName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  {mockPass.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Valid Until</p>
                <p className="text-xl font-bold">
                  {new Date(mockPass.validUntil).toLocaleDateString("en-IN", {
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
                <p className="text-2xl font-bold">{mockPass.pickupTime}</p>
                <p className="text-xs text-muted-foreground">{mockPass.stopName}</p>
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
                <p className="text-2xl font-bold">{mockPass.dropTime}</p>
                <p className="text-xs text-muted-foreground">{mockPass.stopName}</p>
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
                <p className="text-2xl font-bold">₹{mockPass.paidAmount}</p>
                <div className="mt-1">{getPaymentBadge(mockPass.paymentStatus)}</div>
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
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-green-100">
                        <Bus className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{mockVehicle.vehicleNumber}</p>
                          <Badge className="bg-green-500 text-white">Online</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {mockVehicle.make} {mockVehicle.model}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Location</span>
                        <span className="font-medium">{mockVehicle.lastLocation.nearestStop}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Speed</span>
                        <span className="font-medium">{mockVehicle.lastLocation.speed} km/h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">ETA to your stop</span>
                        <span className="font-medium text-green-600">{mockVehicle.lastLocation.eta}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last updated</span>
                        <span className="text-sm">Just now</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Route & Stops Tab */}
        <TabsContent value="route" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{mockRoute.name}</CardTitle>
              <CardDescription>
                {mockRoute.startPoint} → {mockRoute.endPoint} • {mockRoute.totalDistance} km • {mockRoute.estimatedTime} min
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRoute.stops.map((stop, index) => {
                  const isMyStop = stop.name === mockPass.stopName;
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
                        {index < mockRoute.stops.length - 1 && (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Driver Info Tab */}
        <TabsContent value="driver" className="space-y-4">
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
                    <p className="text-lg font-semibold">{mockVehicle.driverName}</p>
                    <p className="text-sm text-muted-foreground">Driver</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Driver: {mockVehicle.driverPhone}
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
                    <p className="text-lg font-semibold">{mockVehicle.conductorName}</p>
                    <p className="text-sm text-muted-foreground">Conductor</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Conductor: {mockVehicle.conductorPhone}
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
                  <p className="font-medium">{mockVehicle.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{mockVehicle.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Make</p>
                  <p className="font-medium">{mockVehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium">{mockVehicle.model}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
