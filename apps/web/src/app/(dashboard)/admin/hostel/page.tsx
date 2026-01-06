'use client';

import { useState } from 'react';
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

// Mock data for demonstration
const mockBlocks = [
  {
    id: '1',
    name: 'Boys Hostel Block A',
    code: 'BH-A',
    type: 'boys',
    totalFloors: 4,
    totalRooms: 40,
    totalCapacity: 80,
    wardenName: 'Mr. Sharma',
    wardenPhone: '9876543210',
    status: 'active',
    amenities: ['wifi', 'laundry', 'gym'],
  },
  {
    id: '2',
    name: 'Girls Hostel Block 1',
    code: 'GH-1',
    type: 'girls',
    totalFloors: 5,
    totalRooms: 50,
    totalCapacity: 100,
    wardenName: 'Mrs. Patel',
    wardenPhone: '9876543211',
    status: 'active',
    amenities: ['wifi', 'laundry', 'reading_room'],
  },
];

const mockRooms = [
  { id: '1', blockName: 'BH-A', roomNumber: '101', floor: 1, roomType: 'double', capacity: 2, occupancy: 2, monthlyRent: 5000, status: 'full' },
  { id: '2', blockName: 'BH-A', roomNumber: '102', floor: 1, roomType: 'double', capacity: 2, occupancy: 1, monthlyRent: 5000, status: 'occupied' },
  { id: '3', blockName: 'BH-A', roomNumber: '103', floor: 1, roomType: 'single', capacity: 1, occupancy: 0, monthlyRent: 7000, status: 'available' },
  { id: '4', blockName: 'GH-1', roomNumber: '201', floor: 2, roomType: 'triple', capacity: 3, occupancy: 2, monthlyRent: 4000, status: 'occupied' },
];

const mockAllocations = [
  { id: '1', studentName: 'Alice Johnson', rollNo: 'CS2021001', room: '101', block: 'BH-A', bedNumber: 1, checkInDate: '2024-07-15', status: 'active' },
  { id: '2', studentName: 'Bob Smith', rollNo: 'CS2021002', room: '101', block: 'BH-A', bedNumber: 2, checkInDate: '2024-07-15', status: 'active' },
  { id: '3', studentName: 'Carol Davis', rollNo: 'EC2021001', room: '102', block: 'BH-A', bedNumber: 1, checkInDate: '2024-08-01', status: 'active' },
];

const mockComplaints = [
  { id: '1', complaintNumber: 'HC000001', studentName: 'Alice Johnson', room: '101', category: 'maintenance', subject: 'AC not working', priority: 'high', status: 'open', createdAt: '2026-01-05' },
  { id: '2', complaintNumber: 'HC000002', studentName: 'Bob Smith', room: '101', category: 'cleanliness', subject: 'Bathroom cleaning', priority: 'medium', status: 'in_progress', createdAt: '2026-01-04' },
  { id: '3', complaintNumber: 'HC000003', studentName: 'Carol Davis', room: '102', category: 'food', subject: 'Food quality issue', priority: 'low', status: 'resolved', createdAt: '2026-01-03' },
];

const mockMenu = {
  Monday: [
    { mealType: 'breakfast', items: ['Idli', 'Sambar', 'Chutney', 'Coffee'], timing: '07:00 - 09:00' },
    { mealType: 'lunch', items: ['Rice', 'Dal', 'Sabzi', 'Roti', 'Curd'], timing: '12:30 - 14:00' },
    { mealType: 'dinner', items: ['Chapati', 'Paneer', 'Dal', 'Rice', 'Salad'], timing: '19:30 - 21:00' },
  ],
  Tuesday: [
    { mealType: 'breakfast', items: ['Poha', 'Jalebi', 'Tea'], timing: '07:00 - 09:00' },
    { mealType: 'lunch', items: ['Rice', 'Rajma', 'Roti', 'Salad'], timing: '12:30 - 14:00' },
    { mealType: 'dinner', items: ['Dosa', 'Sambar', 'Chutney'], timing: '19:30 - 21:00' },
  ],
};

export default function AdminHostelPage() {
  const [activeTab, setActiveTab] = useState('blocks');
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);

  const stats = {
    totalBlocks: mockBlocks.length,
    totalRooms: mockRooms.length,
    totalCapacity: mockBlocks.reduce((sum, b) => sum + b.totalCapacity, 0),
    activeAllocations: mockAllocations.filter(a => a.status === 'active').length,
    occupancyRate: 75,
    openComplaints: mockComplaints.filter(c => c.status === 'open' || c.status === 'in_progress').length,
  };

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
            {mockBlocks.map((block) => (
              <Card key={block.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{block.name}</CardTitle>
                      <CardDescription>{block.code}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(block.status)}>{block.status}</Badge>
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
                      <span className="ml-2">{block.totalRooms}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="ml-2">{block.totalCapacity}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Warden:</span>
                      <span className="ml-2">{block.wardenName} ({block.wardenPhone})</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Amenities:</span>
                      <div className="flex gap-1 mt-1">
                        {block.amenities.map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                {mockRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.roomNumber}</TableCell>
                    <TableCell>{room.blockName}</TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell className="capitalize">{room.roomType}</TableCell>
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
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
                {mockAllocations.map((alloc) => (
                  <TableRow key={alloc.id}>
                    <TableCell className="font-medium">{alloc.studentName}</TableCell>
                    <TableCell>{alloc.rollNo}</TableCell>
                    <TableCell>{alloc.block}</TableCell>
                    <TableCell>{alloc.room}</TableCell>
                    <TableCell>{alloc.bedNumber}</TableCell>
                    <TableCell>{new Date(alloc.checkInDate).toLocaleDateString()}</TableCell>
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
                ))}
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
                {mockComplaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">{complaint.complaintNumber}</TableCell>
                    <TableCell>{complaint.studentName}</TableCell>
                    <TableCell>{complaint.room}</TableCell>
                    <TableCell className="capitalize">{complaint.category}</TableCell>
                    <TableCell>{complaint.subject}</TableCell>
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
                ))}
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
                <SelectItem value="BH-A">BH-A</SelectItem>
                <SelectItem value="GH-1">GH-1</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(mockMenu).map(([day, meals]) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meals.map((meal) => (
                    <div key={meal.mealType} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{meal.mealType}</span>
                        <span className="text-sm text-muted-foreground">{meal.timing}</span>
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
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
