"use client";

import { useState, useMemo } from "react";
import {
  Bus,
  MapPin,
  Route,
  Users,
  Plus,
  Pencil,
  Trash2,
  Navigation,
  Phone,
  Clock,
  IndianRupee,
  Search,
  Filter,
  MoreVertical,
  Eye,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useRoutes,
  useVehicles,
  usePasses,
  useTransportStats,
  useVehicleLocations,
  useCreateRoute,
  useCreateVehicle,
  useCreatePass,
  useDeleteRoute,
  useDeleteVehicle,
  useCancelPass,
} from "@/hooks/use-transport";

export default function AdminTransportPage() {
  const tenantId = useTenantId() || '';
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddPassOpen, setIsAddPassOpen] = useState(false);

  // Fetch data from API
  const { data: routesData, isLoading: routesLoading } = useRoutes(tenantId);
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles(tenantId);
  const { data: passesData, isLoading: passesLoading } = usePasses(tenantId);
  const { data: statsData, isLoading: statsLoading } = useTransportStats(tenantId);

  // Extract arrays from paginated responses
  const routes = routesData?.data || [];
  const vehicles = vehiclesData?.data || [];
  const passes = passesData?.data || [];

  // Mutations for CRUD operations
  const createRouteMutation = useCreateRoute(tenantId);
  const createVehicleMutation = useCreateVehicle(tenantId);
  const createPassMutation = useCreatePass(tenantId);
  const deleteRouteMutation = useDeleteRoute(tenantId);
  const deleteVehicleMutation = useDeleteVehicle(tenantId);
  const cancelPassMutation = useCancelPass(tenantId);

  const isLoading = routesLoading || vehiclesLoading || passesLoading || statsLoading;

  // Calculate stats - use API data when available, fallback to derived stats
  const stats = useMemo(() => {
    const pendingPaymentPasses = passes.filter((p) => p.paymentStatus === 'pending').length;
    const monthlyRev = statsData?.monthlyRevenue || 0;

    if (statsData) {
      return {
        routes: {
          total: statsData.totalRoutes || 0,
          active: statsData.activeRoutes || 0,
        },
        vehicles: {
          total: statsData.totalVehicles || 0,
          active: statsData.activeVehicles || 0,
        },
        passes: {
          active: statsData.activePasses || 0,
          pendingPayments: pendingPaymentPasses,
        },
        revenue: {
          collected: monthlyRev,
          pending: 0, // Not available in API
        },
      };
    }
    return {
      routes: { total: routes.length, active: routes.filter((r) => r.isActive).length },
      vehicles: { total: vehicles.length, active: vehicles.filter((v) => v.isActive).length },
      passes: { active: passes.filter((p) => p.status === 'active').length, pendingPayments: pendingPaymentPasses },
      revenue: { collected: 0, pending: 0 },
    };
  }, [statsData, routes, vehicles, passes]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      expired: "bg-red-100 text-red-800",
      suspended: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={statusStyles[status] || "bg-gray-100"}>
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport Management</h1>
          <p className="text-muted-foreground">
            Manage routes, vehicles, and student transport passes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Route className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Routes</p>
                <p className="text-2xl font-bold">{stats.routes.total}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.routes.active} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Bus className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicles</p>
                <p className="text-2xl font-bold">{stats.vehicles.total}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.vehicles.active} operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Passes</p>
                <p className="text-2xl font-bold">{stats.passes.active}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.passes.pendingPayments} pending payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <IndianRupee className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">
                  ₹{(stats.revenue.collected / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-muted-foreground">
                  ₹{(stats.revenue.pending / 1000).toFixed(0)}K pending
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="passes">Passes</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
        </TabsList>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[300px]"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Route
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Route</DialogTitle>
                  <DialogDescription>
                    Create a new transport route with stops and fare details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Route Name</Label>
                      <Input placeholder="e.g., Route 1 - North Campus" />
                    </div>
                    <div className="space-y-2">
                      <Label>Route Code</Label>
                      <Input placeholder="e.g., R001" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Point</Label>
                      <Input placeholder="Starting location" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Point</Label>
                      <Input placeholder="Ending location" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Distance (km)</Label>
                      <Input type="number" placeholder="15.5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time (min)</Label>
                      <Input type="number" placeholder="45" />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Fare (₹)</Label>
                      <Input type="number" placeholder="2500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Route description..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRouteOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddRouteOpen(false)}>Create Route</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Start → End</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead>Passes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No routes found</p>
                      <p className="text-sm">Click "Add Route" to create your first route</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{route.name}</p>
                          <p className="text-sm text-muted-foreground">{route.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3" />
                          {route.startLocation || 'N/A'} → {route.endLocation || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{route.distanceKm || 0} km</p>
                          <p className="text-muted-foreground">{route.estimatedDurationMinutes || 0} min</p>
                        </div>
                      </TableCell>
                      <TableCell>N/A</TableCell>
                      <TableCell>{route._count?.stops || 0}</TableCell>
                      <TableCell>{route.vehicleId ? 1 : 0}</TableCell>
                      <TableCell>{route._count?.passes || 0}</TableCell>
                      <TableCell>{getStatusBadge(route.isActive ? 'active' : 'inactive')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MapPin className="h-4 w-4 mr-2" />
                              Manage Stops
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Route
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteRouteMutation.mutate(route.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vehicles..."
                  className="pl-10 w-[300px]"
                />
              </div>
            </div>
            <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                  <DialogDescription>
                    Register a new vehicle for transport service.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vehicle Number</Label>
                      <Input placeholder="KA-01-AB-1234" />
                    </div>
                    <div className="space-y-2">
                      <Label>Vehicle Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bus">Bus</SelectItem>
                          <SelectItem value="mini_bus">Mini Bus</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Make</Label>
                      <Input placeholder="Tata" />
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input placeholder="Starbus" />
                    </div>
                    <div className="space-y-2">
                      <Label>Capacity</Label>
                      <Input type="number" placeholder="40" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Driver Name</Label>
                      <Input placeholder="Driver name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Driver Phone</Label>
                      <Input placeholder="9876543210" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign to Route</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route: { id: string; name: string }) => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddVehicleOpen(false)}>Add Vehicle</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Assigned Route</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Bus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No vehicles found</p>
                      <p className="text-sm">Click "Add Vehicle" to register your first vehicle</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <Bus className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{vehicle.vehicleNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.make || 'N/A'} {vehicle.model || ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{vehicle.type?.replace("_", " ") || 'N/A'}</TableCell>
                      <TableCell>
                        <div>
                          <p>{vehicle.driverName || 'Unassigned'}</p>
                          {vehicle.driverPhone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {vehicle.driverPhone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.currentRouteId ? 'Assigned' : 'Unassigned'}</TableCell>
                      <TableCell>{vehicle.capacity} seats</TableCell>
                      <TableCell>{getStatusBadge(vehicle.isActive ? 'active' : 'inactive')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Navigation className="h-4 w-4 mr-2" />
                              Track Location
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteVehicleMutation.mutate(vehicle.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Passes Tab */}
        <TabsContent value="passes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search passes..."
                  className="pl-10 w-[300px]"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddPassOpen} onOpenChange={setIsAddPassOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Issue Pass
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Issue Transport Pass</DialogTitle>
                  <DialogDescription>
                    Create a new transport pass for a student.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Input placeholder="Search student by name or roll number..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Route</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route: { id: string; name: string; fare?: number }) => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.name} (₹{route.fare || 0}/month)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pickup/Drop Stop</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stop" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Main Gate (07:00 / 17:30)</SelectItem>
                        <SelectItem value="2">Koramangala (07:15 / 17:15)</SelectItem>
                        <SelectItem value="3">HSR Layout (07:30 / 17:00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valid From</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valid Until</Label>
                      <Input type="date" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddPassOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddPassOpen(false)}>Issue Pass</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pass #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Stop</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No transport passes found</p>
                      <p className="text-sm">Click "Issue Pass" to create a new pass</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  passes.map((pass) => (
                    <TableRow key={pass.id}>
                      <TableCell className="font-mono">{pass.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {pass.student ? `${pass.student.user.firstName} ${pass.student.user.lastName}` : 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">{pass.student?.rollNo || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{pass.route?.name || 'N/A'}</TableCell>
                      <TableCell>{pass.boardingStop?.name || pass.dropStop?.name || 'N/A'}</TableCell>
                      <TableCell>{new Date(pass.validTo).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div>
                          <p>₹{pass.amount}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPaymentBadge(pass.paymentStatus)}</TableCell>
                      <TableCell>{getStatusBadge(pass.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <IndianRupee className="h-4 w-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => cancelPassMutation.mutate(pass.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel Pass
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Live Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Live Vehicle Tracking
              </CardTitle>
              <CardDescription>
                Real-time location of all active vehicles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">Google Maps Integration</p>
                    <p className="text-sm text-muted-foreground">
                      Configure Google Maps API key to enable live tracking
                    </p>
                  </div>
                  <Button variant="outline">
                    Configure Maps API
                  </Button>
                </div>
              </div>

              {/* Vehicle List for tracking */}
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Active Vehicles</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  {vehicles.filter((v) => v.isActive).length === 0 ? (
                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                      <Bus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active vehicles</p>
                    </div>
                  ) : (
                    vehicles
                      .filter((v) => v.isActive)
                      .map((vehicle) => (
                        <Card key={vehicle.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-green-100">
                                  <Bus className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{vehicle.vehicleNumber}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {vehicle.currentRouteId ? 'On Route' : 'Unassigned'}
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-800">Online</Badge>
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>Last updated: N/A</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Navigation className="h-4 w-4 text-muted-foreground" />
                                <span>Speed: N/A</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>Location: N/A</span>
                              </div>
                            </div>
                            {vehicle.driverPhone && (
                              <Button variant="outline" size="sm" className="w-full mt-4">
                                <Phone className="h-4 w-4 mr-2" />
                                Call Driver
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
