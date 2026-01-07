'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  DoorOpen,
  Users,
  AlertTriangle,
  UtensilsCrossed,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useTenantId } from '@/hooks/use-tenant';
import {
  useHostelBlocks,
  useHostelRooms,
  useHostelAllocations,
  useHostelComplaints,
  useWeeklyMenu,
  useHostelStats,
  useDeleteBlock,
  useDeleteRoom,
} from '@/hooks/use-hostel';

export default function AdminHostelPage() {
  const tenantId = useTenantId() || '';
  const [activeTab, setActiveTab] = useState('blocks');
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);

  // Fetch data from API
  const { data: blocksData, isLoading: blocksLoading } = useHostelBlocks(tenantId);
  const { data: roomsData, isLoading: roomsLoading } = useHostelRooms(tenantId);
  const { data: allocationsData, isLoading: allocationsLoading } = useHostelAllocations(tenantId);
  const { data: complaintsData, isLoading: complaintsLoading } = useHostelComplaints(tenantId);
  const { data: menuData, isLoading: menuLoading } = useWeeklyMenu(tenantId);
  const { data: statsData, isLoading: statsLoading } = useHostelStats(tenantId);

  // Mutations
  const deleteBlockMutation = useDeleteBlock(tenantId);
  const deleteRoomMutation = useDeleteRoom(tenantId);

  // Extract arrays from paginated responses
  const blocks = blocksData?.data || [];
  const rooms = roomsData?.data || [];
  const allocations = allocationsData?.data || [];
  const complaints = complaintsData?.data || [];

  const isLoading = blocksLoading || roomsLoading || allocationsLoading || complaintsLoading || statsLoading;

  // Calculate stats - use API data when available
  const stats = useMemo(() => {
    if (statsData) {
      return {
        totalBlocks: statsData.totalBlocks,
        totalRooms: statsData.totalRooms,
        totalCapacity: statsData.totalCapacity,
        activeAllocations: statsData.activeAllocations,
        occupancyRate: Math.round(statsData.occupancyRate),
        openComplaints: statsData.pendingComplaints,
      };
    }
    return {
      totalBlocks: blocks.length,
      totalRooms: rooms.length,
      totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
      activeAllocations: allocations.filter(a => a.status === 'active').length,
      occupancyRate: 0,
      openComplaints: complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length,
    };
  }, [statsData, blocks, rooms, allocations, complaints]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'full':
        return 'bg-orange-100 text-orange-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplaintStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hostel Management</h1>
          <p className="text-muted-foreground">Manage hostel blocks, rooms, allocations, and complaints</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Blocks</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalBlocks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Rooms</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalRooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Capacity</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalCapacity}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Allocated</span>
            </div>
            <p className="text-2xl font-bold">{stats.activeAllocations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Occupancy</span>
            </div>
            <p className="text-2xl font-bold">{stats.occupancyRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Complaints</span>
            </div>
            <p className="text-2xl font-bold">{stats.openComplaints}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="blocks" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Blocks
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="allocations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Allocations
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Complaints
          </TabsTrigger>
          <TabsTrigger value="mess" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Mess Menu
          </TabsTrigger>
        </TabsList>

        {/* Blocks Tab */}
        <TabsContent value="blocks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search blocks..." className="w-64" />
            </div>
            <Dialog open={isAddBlockOpen} onOpenChange={setIsAddBlockOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Block
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Block</DialogTitle>
                  <DialogDescription>Create a new hostel block</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Block Name</Label>
                      <Input placeholder="e.g., Boys Hostel Block A" />
                    </div>
                    <div className="space-y-2">
                      <Label>Block Code</Label>
                      <Input placeholder="e.g., BH-A" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boys">Boys</SelectItem>
                          <SelectItem value="girls">Girls</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Floors</Label>
                      <Input type="number" placeholder="4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Warden Name</Label>
                      <Input placeholder="Mr. Sharma" />
                    </div>
                    <div className="space-y-2">
                      <Label>Warden Phone</Label>
                      <Input placeholder="9876543210" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddBlockOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsAddBlockOpen(false)}>Create Block</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {blocks.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hostel blocks found</p>
                <p className="text-sm">Click "Add Block" to create your first block</p>
              </div>
            ) : (
              blocks.map((block) => (
                <Card key={block.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{block.name}</CardTitle>
                        <CardDescription>{block.code}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(block.isActive ? 'active' : 'inactive')}>
                        {block.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 capitalize">{block.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Floors:</span>
                        <span className="ml-2">{block.totalFloors}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rooms:</span>
                        <span className="ml-2">{block._count?.rooms || 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Allocations:</span>
                        <span className="ml-2">{block._count?.allocations || 0}</span>
                      </div>
                      {block.wardenName && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Warden:</span>
                          <span className="ml-2">{block.wardenName} {block.wardenPhone && `(${block.wardenPhone})`}</span>
                        </div>
                      )}
                      {block.amenities && block.amenities.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Amenities:</span>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {block.amenities.map((a) => (
                              <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => deleteBlockMutation.mutate(block.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search rooms..." className="w-64" />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Blocks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blocks</SelectItem>
                  <SelectItem value="BH-A">BH-A</SelectItem>
                  <SelectItem value="GH-1">GH-1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rooms
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Add Rooms</DialogTitle>
                  <DialogDescription>Add multiple rooms at once</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Block</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BH-A">BH-A - Boys Hostel Block A</SelectItem>
                        <SelectItem value="GH-1">GH-1 - Girls Hostel Block 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Floor</Label>
                      <Input type="number" placeholder="1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Room Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                          <SelectItem value="triple">Triple</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Start Number</Label>
                      <Input type="number" placeholder="1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Count</Label>
                      <Input type="number" placeholder="10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Rent</Label>
                      <Input type="number" placeholder="5000" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsAddRoomOpen(false)}>Create Rooms</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <DoorOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No rooms found</p>
                      <p className="text-sm">Click "Add Rooms" to create rooms</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>{room.block?.code || 'N/A'}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell className="capitalize">{room.type}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{room.occupancy}/{room.capacity}</TableCell>
                      <TableCell>₹{room.monthlyRent.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => deleteRoomMutation.mutate(room.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Allocations Tab */}
        <TabsContent value="allocations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by student name or roll no..." className="w-80" />
            </div>
            <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Allocate Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Allocate Room</DialogTitle>
                  <DialogDescription>Assign a student to a hostel room</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Input placeholder="Search student by name or roll no..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Block</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select block" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BH-A">BH-A</SelectItem>
                          <SelectItem value="GH-1">GH-1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Room</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="102">102 (1/2)</SelectItem>
                          <SelectItem value="103">103 (0/1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bed Number</Label>
                      <Input type="number" placeholder="1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-in Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAllocateOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsAllocateOpen(false)}>Allocate</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Bed</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No allocations found</p>
                      <p className="text-sm">Click "Allocate Room" to assign students</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  allocations.map((alloc) => (
                    <TableRow key={alloc.id}>
                      <TableCell className="font-medium">
                        {alloc.student ? `${alloc.student.user.firstName} ${alloc.student.user.lastName}` : 'N/A'}
                      </TableCell>
                      <TableCell>{alloc.student?.rollNo || 'N/A'}</TableCell>
                      <TableCell>{alloc.room?.block?.code || 'N/A'}</TableCell>
                      <TableCell>{alloc.room?.roomNumber || 'N/A'}</TableCell>
                      <TableCell>{alloc.bedNumber || '-'}</TableCell>
                      <TableCell>{new Date(alloc.allocatedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(alloc.status)}>{alloc.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">Transfer</Button>
                          <Button variant="outline" size="sm" className="text-red-600">Check Out</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search complaints..." className="w-64" />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No complaints found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">{complaint.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        {complaint.student ? `${complaint.student.user.firstName} ${complaint.student.user.lastName}` : 'N/A'}
                      </TableCell>
                      <TableCell>{complaint.room?.roomNumber || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{complaint.category}</TableCell>
                      <TableCell>{complaint.title}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getComplaintStatusColor(complaint.status)}>{complaint.status.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Update</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Mess Menu Tab */}
        <TabsContent value="mess" className="space-y-4">
          <div className="flex justify-between items-center">
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Blocks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                {blocks.map((block) => (
                  <SelectItem key={block.id} value={block.id}>{block.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {(() => {
              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              type MenuItem = { id: string; dayOfWeek: number; mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner'; items: string[]; timingFrom?: string; timingTo?: string };
              const menuByDay: Record<number, MenuItem[]> = {};

              // Group menu items by day
              if (menuData && Array.isArray(menuData)) {
                menuData.forEach((item) => {
                  if (!menuByDay[item.dayOfWeek]) {
                    menuByDay[item.dayOfWeek] = [];
                  }
                  menuByDay[item.dayOfWeek].push(item);
                });
              }

              const sortedDays = Object.keys(menuByDay).map(Number).sort();

              if (sortedDays.length === 0) {
                return (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No menu items found</p>
                    <p className="text-sm">Click "Add Menu" to create a menu</p>
                  </div>
                );
              }

              return sortedDays.map((dayNum) => {
                const dayMeals = menuByDay[dayNum] || [];
                return (
                  <Card key={dayNum}>
                    <CardHeader>
                      <CardTitle>{dayNames[dayNum]}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dayMeals
                        .sort((a, b) => {
                          const order: Record<string, number> = { breakfast: 0, lunch: 1, snacks: 2, dinner: 3 };
                          return (order[a.mealType] ?? 4) - (order[b.mealType] ?? 4);
                        })
                        .map((meal) => (
                          <div key={meal.id} className="border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium capitalize">{meal.mealType}</span>
                              <span className="text-sm text-muted-foreground">
                                {meal.timingFrom && meal.timingTo ? `${meal.timingFrom} - ${meal.timingTo}` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {meal.items.map((item) => (
                                <Badge key={item} variant="outline">{item}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                );
              });
            })()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
