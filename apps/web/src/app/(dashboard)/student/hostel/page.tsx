'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  Loader2,
} from 'lucide-react';
import { useTenantId } from '@/hooks/use-tenant';
import { useStudentByUserId } from '@/hooks/use-api';
import {
  useStudentHostelAllocation,
  useStudentHostelFees,
  useStudentHostelComplaints,
  useWeeklyMenu,
  useCreateComplaint,
  useHostelBlock,
} from '@/hooks/use-hostel';
import { useToast } from '@/hooks/use-toast';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const today = days[new Date().getDay()];

export default function StudentHostelPage() {
  const [activeTab, setActiveTab] = useState('room');
  const [selectedDay, setSelectedDay] = useState(today);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
  });

  // API hooks
  const { user } = useUser();
  const tenantId = useTenantId() || '';
  const { toast } = useToast();
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');
  const studentId = studentData?.id || '';

  const { data: allocation, isLoading: allocationLoading } = useStudentHostelAllocation(tenantId, studentId);
  const { data: fees, isLoading: feesLoading } = useStudentHostelFees(tenantId, studentId);
  const { data: complaints, isLoading: complaintsLoading } = useStudentHostelComplaints(tenantId, studentId);
  const { data: menuData, isLoading: menuLoading } = useWeeklyMenu(tenantId, allocation?.room?.blockId);
  const { data: blockData } = useHostelBlock(tenantId, allocation?.room?.blockId || '');
  const createComplaint = useCreateComplaint(tenantId);

  // Transform menu data into day-indexed format (dayOfWeek is 0-6, map to day names)
  const menu: Record<string, Array<{ mealType: string; timing: string; items: string[] }>> = {};
  if (menuData && Array.isArray(menuData)) {
    menuData.forEach((item) => {
      const dayName = days[item.dayOfWeek];
      if (!menu[dayName]) menu[dayName] = [];
      menu[dayName].push({
        mealType: item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1),
        timing: item.timingFrom && item.timingTo ? `${item.timingFrom} - ${item.timingTo}` : item.timingFrom || '',
        items: item.items || [],
      });
    });
  }

  const handleSubmitComplaint = async () => {
    if (!complaintForm.category || !complaintForm.subject || !complaintForm.description) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    try {
      await createComplaint.mutateAsync({
        studentId,
        category: complaintForm.category as 'maintenance' | 'cleanliness' | 'food' | 'security' | 'other',
        title: complaintForm.subject,
        description: complaintForm.description,
        priority: complaintForm.priority as 'low' | 'medium' | 'high' | 'urgent',
      });
      toast({ title: 'Success', description: 'Complaint submitted successfully' });
      setIsComplaintOpen(false);
      setComplaintForm({ category: '', subject: '', description: '', priority: 'medium' });
    } catch {
      toast({ title: 'Error', description: 'Failed to submit complaint', variant: 'destructive' });
    }
  };

  const isLoading = studentLoading || allocationLoading;

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

  const pendingFee = fees?.find((f: { status: string }) => f.status === 'pending');

  // Show loading skeleton while initial data loads
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Show message if no hostel allocation
  if (!allocation) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Hostel</h1>
          <p className="text-muted-foreground">View your room details, mess menu, fees, and complaints</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Hostel Allocation</h3>
            <p className="text-muted-foreground">You are not currently allocated to any hostel room.</p>
            <p className="text-sm text-muted-foreground mt-2">Contact the hostel office for allocation details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <p className="text-2xl font-bold">{allocation.room?.roomNumber || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{blockData?.name || allocation.room?.block?.name || ''}</p>
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
                <p className="text-lg font-semibold">{blockData?.wardenName || 'Not assigned'}</p>
                <p className="text-sm text-muted-foreground">{blockData?.wardenPhone || ''}</p>
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
                  <p className="text-2xl font-bold">₹{pendingFee.amount.toLocaleString()}</p>
                  <p className="text-sm text-red-500">Due: {pendingFee.dueDate ? new Date(pendingFee.dueDate).toLocaleDateString() : 'N/A'}</p>
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
                    <p className="font-semibold">{allocation.room?.roomNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Floor</p>
                    <p className="font-semibold">{allocation.room?.floor ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Room Type</p>
                    <p className="font-semibold capitalize">{allocation.room?.type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bed Number</p>
                    <p className="font-semibold">{allocation.bedNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Allocated Date</p>
                    <p className="font-semibold">{new Date(allocation.allocatedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(allocation.status)}>{allocation.status}</Badge>
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
                    <p className="font-semibold">{blockData?.name || allocation.room?.block?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Block Code</p>
                    <p className="font-semibold">{blockData?.code || allocation.room?.block?.code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Warden</p>
                    <p className="font-semibold">{blockData?.wardenName || 'Not assigned'}</p>
                    <p className="text-sm text-muted-foreground">{blockData?.wardenPhone || ''}</p>
                  </div>
                  {blockData?.amenities && blockData.amenities.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Amenities</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {blockData.amenities.map((amenity: string) => (
                          <Badge key={amenity} variant="outline" className="capitalize">
                            {amenity.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                {(menu[selectedDay as keyof typeof menu] || []).map((meal) => (
                  <div key={meal.mealType} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-lg">{meal.mealType}</span>
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
                {!menu[selectedDay as keyof typeof menu] && (
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
          {feesLoading ? (
            <div className="grid gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : !fees || fees.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hostel fees found</p>
              </CardContent>
            </Card>
          ) : (
          <div className="grid gap-4">
            {fees.map((fee) => (
              <Card key={fee.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold capitalize">{fee.feeType} Fee</span>
                        {fee.month && fee.year && (
                          <span className="text-sm text-muted-foreground">
                            ({new Date(fee.year, fee.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
                          </span>
                        )}
                      </div>
                      {fee.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(fee.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹{fee.amount.toLocaleString()}</p>
                      <Badge className={getStatusColor(fee.status)}>{fee.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      {fee.paidDate && (
                        <span className="text-sm text-muted-foreground">
                          Paid on: {new Date(fee.paidDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {fee.status === 'pending' && (
                      <Button size="sm">Pay Now</Button>
                    )}
                    {fee.status === 'overdue' && (
                      <Button size="sm" variant="destructive">Pay Now</Button>
                    )}
                    {fee.status === 'paid' && (
                      <Button size="sm" variant="outline">Download Receipt</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
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
                    <Select value={complaintForm.category} onValueChange={(value) => setComplaintForm(prev => ({ ...prev, category: value }))}>
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
                    <Input
                      placeholder="Brief description of the issue"
                      value={complaintForm.subject}
                      onChange={(e) => setComplaintForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Provide detailed information about your complaint..."
                      rows={4}
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={complaintForm.priority} onValueChange={(value) => setComplaintForm(prev => ({ ...prev, priority: value }))}>
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
                  <Button onClick={handleSubmitComplaint} disabled={createComplaint.isPending}>
                    {createComplaint.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Complaint'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {complaintsLoading ? (
            <div className="grid gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : !complaints || complaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No complaints raised yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getComplaintStatusIcon(complaint.status)}
                        <div>
                          <p className="font-semibold">{complaint.title}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {complaint.category} | Priority: {complaint.priority}
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
                    {complaint.description && (
                      <p className="text-sm text-muted-foreground mb-3">{complaint.description}</p>
                    )}
                    {complaint.feedback && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Feedback:</p>
                        <p className="text-sm text-green-700">{complaint.feedback}</p>
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
