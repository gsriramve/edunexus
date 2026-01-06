'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  Building2,
  DoorOpen,
  User,
  Phone,
  UtensilsCrossed,
  AlertTriangle,
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

// Mock data
const mockAllocation = {
  block: {
    name: 'Boys Hostel Block A',
    code: 'BH-A',
    wardenName: 'Mr. Sharma',
    wardenPhone: '9876543210',
    amenities: ['wifi', 'laundry', 'gym', 'reading_room'],
  },
  room: {
    number: '101',
    floor: 1,
    type: 'Double',
    capacity: 2,
  },
  bedNumber: 1,
  checkInDate: '2024-07-15',
  expectedCheckOut: '2026-05-31',
  status: 'active',
  roommates: [
    { name: 'Bob Smith', rollNo: 'CS2021002', department: 'Computer Science' },
  ],
};

const mockFees = [
  { id: '1', academicYear: '2025-26', semester: 1, roomRent: 30000, messCharges: 20000, electricity: 2000, other: 500, total: 52500, paid: 52500, status: 'paid', dueDate: '2025-07-15' },
  { id: '2', academicYear: '2025-26', semester: 2, roomRent: 30000, messCharges: 20000, electricity: 2000, other: 500, total: 52500, paid: 0, status: 'pending', dueDate: '2026-01-15' },
];

const mockComplaints = [
  { id: '1', number: 'HC000001', category: 'maintenance', subject: 'AC not working', status: 'in_progress', priority: 'high', createdAt: '2026-01-05', resolution: null },
  { id: '2', number: 'HC000002', category: 'cleanliness', subject: 'Bathroom cleaning', status: 'resolved', priority: 'medium', createdAt: '2025-12-20', resolution: 'Bathroom has been deep cleaned. Regular schedule updated.' },
];

const mockMenu = {
  Monday: [
    { mealType: 'Breakfast', items: ['Idli', 'Sambar', 'Chutney', 'Coffee/Tea'], timing: '07:00 - 09:00', isVeg: true },
    { mealType: 'Lunch', items: ['Rice', 'Dal', 'Sabzi', 'Roti', 'Curd'], timing: '12:30 - 14:00', isVeg: true },
    { mealType: 'Snacks', items: ['Samosa', 'Tea'], timing: '16:30 - 17:30', isVeg: true },
    { mealType: 'Dinner', items: ['Chapati', 'Paneer Curry', 'Dal', 'Rice', 'Salad'], timing: '19:30 - 21:00', isVeg: true },
  ],
  Tuesday: [
    { mealType: 'Breakfast', items: ['Poha', 'Jalebi', 'Tea'], timing: '07:00 - 09:00', isVeg: true },
    { mealType: 'Lunch', items: ['Rice', 'Rajma', 'Roti', 'Salad', 'Buttermilk'], timing: '12:30 - 14:00', isVeg: true },
    { mealType: 'Snacks', items: ['Bread Pakoda', 'Tea'], timing: '16:30 - 17:30', isVeg: true },
    { mealType: 'Dinner', items: ['Dosa', 'Sambar', 'Chutney', 'Kesari'], timing: '19:30 - 21:00', isVeg: true },
  ],
  Wednesday: [
    { mealType: 'Breakfast', items: ['Paratha', 'Curd', 'Pickle', 'Tea'], timing: '07:00 - 09:00', isVeg: true },
    { mealType: 'Lunch', items: ['Rice', 'Chole', 'Roti', 'Onion Salad'], timing: '12:30 - 14:00', isVeg: true },
    { mealType: 'Snacks', items: ['Bhel Puri', 'Tea'], timing: '16:30 - 17:30', isVeg: true },
    { mealType: 'Dinner', items: ['Roti', 'Mixed Veg', 'Dal Tadka', 'Rice'], timing: '19:30 - 21:00', isVeg: true },
  ],
};

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const today = days[new Date().getDay()];

export default function StudentHostelPage() {
  const [activeTab, setActiveTab] = useState('room');
  const [selectedDay, setSelectedDay] = useState(today);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
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

  const getComplaintStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const pendingFee = mockFees.find(f => f.status === 'pending');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hostel</h1>
        <p className="text-muted-foreground">View your room details, mess menu, fees, and complaints</p>
      </div>

      {/* Quick Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Room Number</p>
                <p className="text-2xl font-bold">{mockAllocation.room.number}</p>
                <p className="text-sm text-muted-foreground">{mockAllocation.block.name}</p>
              </div>
              <DoorOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warden Contact</p>
                <p className="text-lg font-semibold">{mockAllocation.block.wardenName}</p>
                <p className="text-sm text-muted-foreground">{mockAllocation.block.wardenPhone}</p>
              </div>
              <Phone className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {pendingFee && (
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Fee</p>
                  <p className="text-2xl font-bold">₹{(pendingFee.total - pendingFee.paid).toLocaleString()}</p>
                  <p className="text-sm text-red-500">Due: {new Date(pendingFee.dueDate).toLocaleDateString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="room" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Room Details
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Mess Menu
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Complaints
          </TabsTrigger>
        </TabsList>

        {/* Room Details Tab */}
        <TabsContent value="room" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DoorOpen className="h-5 w-5" />
                  Room Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Room Number</p>
                    <p className="font-semibold">{mockAllocation.room.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Floor</p>
                    <p className="font-semibold">{mockAllocation.room.floor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Room Type</p>
                    <p className="font-semibold">{mockAllocation.room.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bed Number</p>
                    <p className="font-semibold">{mockAllocation.bedNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in Date</p>
                    <p className="font-semibold">{new Date(mockAllocation.checkInDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(mockAllocation.status)}>{mockAllocation.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Block Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Block Name</p>
                    <p className="font-semibold">{mockAllocation.block.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Block Code</p>
                    <p className="font-semibold">{mockAllocation.block.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Warden</p>
                    <p className="font-semibold">{mockAllocation.block.wardenName}</p>
                    <p className="text-sm text-muted-foreground">{mockAllocation.block.wardenPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amenities</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mockAllocation.block.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline" className="capitalize">
                          {amenity.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {mockAllocation.roommates.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Roommates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {mockAllocation.roommates.map((roommate, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{roommate.name}</p>
                          <p className="text-sm text-muted-foreground">{roommate.rollNo} - {roommate.department}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Mess Menu Tab */}
        <TabsContent value="menu" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {days.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDay(day)}
              >
                {day}
                {day === today && <span className="ml-1 text-xs">(Today)</span>}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{selectedDay}'s Menu</CardTitle>
              <CardDescription>Meal schedule and items for {selectedDay.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(mockMenu[selectedDay as keyof typeof mockMenu] || []).map((meal) => (
                  <div key={meal.mealType} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-lg">{meal.mealType}</span>
                        {meal.isVeg && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Veg
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {meal.timing}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {meal.items.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {!mockMenu[selectedDay as keyof typeof mockMenu] && (
                  <p className="text-center text-muted-foreground py-8">
                    Menu not available for {selectedDay}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="space-y-4">
          <div className="grid gap-4">
            {mockFees.map((fee) => (
              <Card key={fee.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {fee.academicYear} - Semester {fee.semester}
                      </CardTitle>
                      <CardDescription>
                        Due Date: {new Date(fee.dueDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(fee.status)}>{fee.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Room Rent</p>
                      <p className="font-semibold">₹{fee.roomRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mess Charges</p>
                      <p className="font-semibold">₹{fee.messCharges.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Electricity</p>
                      <p className="font-semibold">₹{fee.electricity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Other</p>
                      <p className="font-semibold">₹{fee.other.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-bold text-lg">₹{fee.total.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <span className="text-muted-foreground">Paid: </span>
                      <span className="font-semibold text-green-600">₹{fee.paid.toLocaleString()}</span>
                      {fee.total > fee.paid && (
                        <>
                          <span className="text-muted-foreground"> | Due: </span>
                          <span className="font-semibold text-red-600">
                            ₹{(fee.total - fee.paid).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                    {fee.status === 'pending' && (
                      <Button>Pay Now</Button>
                    )}
                    {fee.status === 'paid' && (
                      <Button variant="outline">Download Receipt</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isComplaintOpen} onOpenChange={setIsComplaintOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Raise a Complaint</DialogTitle>
                  <DialogDescription>
                    Submit a complaint or request for hostel-related issues
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="cleanliness">Cleanliness</SelectItem>
                        <SelectItem value="food">Food Quality</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input placeholder="Brief description of the issue" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Provide detailed information about your complaint..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsComplaintOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsComplaintOpen(false)}>
                    Submit Complaint
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {mockComplaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No complaints raised yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {mockComplaints.map((complaint) => (
                <Card key={complaint.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getComplaintStatusIcon(complaint.status)}
                        <div>
                          <p className="font-semibold">{complaint.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {complaint.number} | {complaint.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getComplaintStatusColor(complaint.status)}>
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {complaint.resolution && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Resolution:</p>
                        <p className="text-sm text-green-700">{complaint.resolution}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
