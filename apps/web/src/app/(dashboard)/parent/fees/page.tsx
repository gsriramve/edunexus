"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  Building2,
  IndianRupee,
  FileText,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTenantId } from "@/hooks/use-tenant";
import { useParentChildren } from "@/hooks/use-parents";
import { useStudentFees, usePaymentHistory, useCreatePaymentOrder, useVerifyPayment } from "@/hooks/use-api";
import { usePaymentFlow } from "@/hooks/use-razorpay";

interface Fee {
  id: string;
  feeType: string;
  amount: string | number;
  dueDate: string;
  status: string;
  paidAmount?: string | number;
  paidDate?: string;
  paymentMethod?: string;
  razorpayPaymentId?: string;
}

interface PaymentTransaction {
  id: string;
  amount: string | number;
  currency: string;
  status: string;
  paymentMethod?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  studentFee?: {
    feeType: string;
  };
}

export default function ParentFees() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const tenantId = useTenantId();

  // Fetch parent's children
  const { data: children, isLoading: childrenLoading, error: childrenError } = useParentChildren(
    tenantId || '',
    user?.id || ''
  );

  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Set default selected child when children are loaded
  useEffect(() => {
    if (children && children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  const currentChild = children?.find((c) => c.id === selectedChild);

  // API hooks - use safe tenantId and selectedChild
  const effectiveTenantId = tenantId || '';
  const { data: feesData, isLoading: feesLoading, error: feesError, refetch: refetchFees } = useStudentFees(effectiveTenantId, selectedChild);
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = usePaymentHistory(effectiveTenantId, selectedChild);
  const createOrderMutation = useCreatePaymentOrder(effectiveTenantId, selectedChild);
  const verifyPaymentMutation = useVerifyPayment(effectiveTenantId);

  // Razorpay hooks
  const { isRazorpayLoaded, initiatePayment, paymentStatus, resetPayment } = usePaymentFlow();

  // Reset selected fees when child changes
  useEffect(() => {
    setSelectedFees([]);
  }, [selectedChild]);

  // Calculate summary from API data
  const apiSummary = feesData?.summary || { totalPending: 0, totalPaid: 0, pendingCount: 0, paidCount: 0 };
  const summary = {
    totalFees: Number(apiSummary.totalPending) + Number(apiSummary.totalPaid),
    paidFees: Number(apiSummary.totalPaid),
    pendingFees: Number(apiSummary.totalPending),
    nextDueDate: null as string | null,
  };
  const fees: Fee[] = feesData?.fees || [];
  const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'partial');
  const transactions: PaymentTransaction[] = historyData?.data || [];

  // Calculate next due date from pending fees
  if (pendingFees.length > 0) {
    const sortedByDue = [...pendingFees].sort((a, b) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    summary.nextDueDate = sortedByDue[0].dueDate;
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (status === 'paid') {
      return <Badge className="bg-green-500">Paid</Badge>;
    }
    if (daysUntilDue < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (daysUntilDue <= 7) {
      return <Badge className="bg-orange-500">Due Soon</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleSelectFee = (feeId: string, checked: boolean) => {
    if (checked) {
      setSelectedFees([...selectedFees, feeId]);
    } else {
      setSelectedFees(selectedFees.filter((id) => id !== feeId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFees(pendingFees.map((fee) => fee.id));
    } else {
      setSelectedFees([]);
    }
  };

  const calculateSelectedTotal = () => {
    return pendingFees
      .filter((fee) => selectedFees.includes(fee.id))
      .reduce((sum, fee) => sum + Number(fee.amount) - Number(fee.paidAmount || 0), 0);
  };

  const getSelectedFees = () => {
    return pendingFees.filter((fee) => selectedFees.includes(fee.id));
  };

  const paidPercentage = summary.totalFees > 0
    ? Math.round((Number(summary.paidFees) / Number(summary.totalFees)) * 100)
    : 0;

  const handlePayment = async () => {
    setIsProcessing(true);
    resetPayment();

    try {
      // Calculate amount in paise
      const amountInPaise = calculateSelectedTotal() * 100;

      // Try to create Razorpay order
      const orderResponse = await createOrderMutation.mutateAsync({
        feeIds: selectedFees,
        amount: amountInPaise,
        currency: "INR",
      });

      // Check if Razorpay is loaded and available
      if (!isRazorpayLoaded) {
        // Demo mode - simulate successful payment
        toast({
          title: "Demo Mode - Payment Simulated",
          description: `In production, payment of ₹${calculateSelectedTotal().toLocaleString()} would be processed via Razorpay. Contact admin to enable real payments.`,
        });
        setPaymentDialogOpen(false);
        setSelectedFees([]);
        return;
      }

      // Open Razorpay checkout
      const childName = currentChild ? `${currentChild.firstName} ${currentChild.lastName}`.trim() : 'Student';
      initiatePayment({
        orderId: orderResponse.orderId,
        amount: amountInPaise,
        currency: "INR",
        name: "EduNexus",
        description: `Fee payment for ${childName}`,
        prefill: {
          name: childName,
          email: currentChild?.email || "",
          contact: currentChild?.phone || "",
        },
        onSuccess: async (response) => {
          try {
            // Verify payment on backend
            await verifyPaymentMutation.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              feeIds: selectedFees,
            });

            toast({
              title: "Payment Successful!",
              description: `Payment of ₹${calculateSelectedTotal().toLocaleString()} completed successfully.`,
            });

            // Close dialog and reset state
            setPaymentDialogOpen(false);
            setSelectedFees([]);

            // Refresh data
            refetchFees();
            refetchHistory();
          } catch (verifyError: any) {
            toast({
              title: "Payment verification failed",
              description: verifyError.message || "Please contact support with your transaction ID.",
              variant: "destructive",
            });
          }
        },
        onError: (error) => {
          toast({
            title: "Payment Failed",
            description: error?.description || error?.message || "Payment could not be completed. Please try again.",
            variant: "destructive",
          });
        },
      });
    } catch (error: any) {
      // Check if this is a demo environment without Razorpay configured
      const errorMessage = error?.message || '';
      if (errorMessage.includes('Razorpay') || errorMessage.includes('payment') || errorMessage.includes('Failed to fetch') || errorMessage.includes('order')) {
        toast({
          title: "Demo Environment",
          description: `Online payment is not configured in demo mode. Amount: ₹${calculateSelectedTotal().toLocaleString()}. Contact admin to enable payments.`,
        });
        setPaymentDialogOpen(false);
        setSelectedFees([]);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to initiate payment. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Fee structure (static for now)
  const feeStructure = [
    { type: "Tuition Fee", amount: 100000, frequency: "Per Year (4 Installments)", description: "Academic tuition charges" },
    { type: "Lab Fee", amount: 10000, frequency: "Per Semester", description: "Laboratory usage and consumables" },
    { type: "Library Fee", amount: 2000, frequency: "Per Year", description: "Library access and resources" },
    { type: "Exam Fee", amount: 6000, frequency: "Per Year (2 terms)", description: "Examination and evaluation" },
    { type: "Transport Fee", amount: 40000, frequency: "Per Year", description: "Bus transportation (optional)" },
    { type: "Hostel Fee", amount: 80000, frequency: "Per Year", description: "Accommodation (if applicable)" },
  ];

  // Show loading state while fetching user or children
  if (authLoading || childrenLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Show error state if children fetch failed
  if (childrenError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
        <p className="text-lg font-medium">Error Loading Data</p>
        <p className="text-muted-foreground">Unable to load your children's information. Please try again later.</p>
      </div>
    );
  }

  if (!children || children.length === 0 || !currentChild) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No children found linked to your account.</p>
      </div>
    );
  }

  // Build child name from first and last name
  const getChildName = (child: typeof currentChild) =>
    `${child.firstName} ${child.lastName}`.trim();
  const getChildDepartment = (child: typeof currentChild) =>
    child.department?.name || 'N/A';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground">
            View and pay fees for your children
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {getChildName(child)} ({child.rollNo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Child Info Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{getChildName(currentChild)}</h2>
              <p className="text-sm text-muted-foreground">
                {currentChild.rollNo} • {getChildDepartment(currentChild)} • Semester {currentChild.currentSemester || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <IndianRupee className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">
                  {feesLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `₹${Number(summary.totalFees).toLocaleString()}`
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {feesLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `₹${Number(summary.paidFees).toLocaleString()}`
                  )}
                </p>
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
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-600">
                  {feesLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `₹${Number(summary.pendingFees).toLocaleString()}`
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Due Date</p>
                <p className="text-2xl font-bold">
                  {feesLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : summary.nextDueDate ? (
                    formatDate(summary.nextDueDate)
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Progress</CardTitle>
          <CardDescription>Annual fee payment status for {getChildName(currentChild)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>₹{Number(summary.paidFees).toLocaleString()} paid</span>
              <span>₹{Number(summary.pendingFees).toLocaleString()} remaining</span>
            </div>
            <Progress value={paidPercentage} className="h-3" />
            <p className="text-center text-sm text-muted-foreground">
              {paidPercentage}% of annual fees paid
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Fees {pendingFees.length > 0 && `(${pendingFees.length})`}
          </TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
        </TabsList>

        {/* Pending Fees */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Fee Payments</CardTitle>
                  <CardDescription>Select fees to pay together</CardDescription>
                </div>
                {selectedFees.length > 0 && (
                  <Button onClick={() => setPaymentDialogOpen(true)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay ₹{calculateSelectedTotal().toLocaleString()}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {feesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : feesError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-lg font-medium">Error Loading Fees</p>
                  <p className="text-muted-foreground">Please try again later</p>
                </div>
              ) : pendingFees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedFees.length === pendingFees.length && pendingFees.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingFees.map((fee) => (
                      <TableRow key={fee.id} className={isOverdue(fee.dueDate) ? "bg-red-50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedFees.includes(fee.id)}
                            onCheckedChange={(checked) => handleSelectFee(fee.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{fee.feeType}</TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{Number(fee.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          ₹{Number(fee.paidAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold text-orange-600">
                          ₹{(Number(fee.amount) - Number(fee.paidAmount || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell>{formatDate(fee.dueDate)}</TableCell>
                        <TableCell>{getStatusBadge(fee.status, fee.dueDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-medium">All Fees Paid!</p>
                  <p className="text-muted-foreground">No pending fees for {getChildName(currentChild)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>All past fee payments</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download All Receipts
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell className="font-medium">
                          {payment.studentFee?.feeType || "Fee Payment"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ₹{Number(payment.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.paymentMethod || "Online"}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.razorpayPaymentId || payment.id.slice(0, 12)}
                        </TableCell>
                        <TableCell>
                          <Badge className={payment.status === 'captured' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {payment.status === 'captured' ? 'Success' : payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Receipt className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-lg font-medium">No Payment History</p>
                  <p className="text-muted-foreground">No payments have been made yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Structure */}
        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure</CardTitle>
              <CardDescription>
                Annual fee breakdown for {getChildDepartment(currentChild)} - Academic Year 2025-26
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructure.map((fee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{fee.type}</TableCell>
                      <TableCell className="text-muted-foreground">{fee.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{fee.frequency}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">₹{fee.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Note: Fee structure may vary based on hostel/transport opt-in. Contact admin for scholarship details.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              You are about to pay <span className="font-bold text-foreground">₹{calculateSelectedTotal().toLocaleString()}</span> for{" "}
              <span className="font-bold text-foreground">{selectedFees.length}</span> item(s) for {getChildName(currentChild)}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selected fees list */}
            <div className="rounded-lg border p-4 space-y-2 max-h-48 overflow-y-auto">
              {getSelectedFees().map((fee) => (
                <div key={fee.id} className="flex justify-between text-sm">
                  <span>{fee.feeType}</span>
                  <span className="font-medium">
                    ₹{(Number(fee.amount) - Number(fee.paidAmount || 0)).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{calculateSelectedTotal().toLocaleString()}</span>
              </div>
            </div>

            {/* Payment methods info */}
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Payment Methods Available:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>UPI (GPay, PhonePe, Paytm, etc.)</li>
                <li>Credit/Debit Cards</li>
                <li>Net Banking (All major banks)</li>
                <li>Wallets</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              disabled={isProcessing || paymentStatus === 'processing'}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing || paymentStatus === 'processing'}
            >
              {isProcessing || paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {createOrderMutation.isPending ? "Creating Order..." : "Processing..."}
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overdue Alert */}
      {pendingFees.some((fee) => isOverdue(fee.dueDate)) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Overdue Payment Alert</h3>
                <p className="text-sm text-red-700 mt-1">
                  {getChildName(currentChild)} has overdue fees. Late payment may incur additional fines
                  and could affect exam eligibility. Please clear dues at the earliest.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    // Select all overdue fees
                    const overdueFeeIds = pendingFees
                      .filter(fee => isOverdue(fee.dueDate))
                      .map(fee => fee.id);
                    setSelectedFees(overdueFeeIds);
                    setPaymentDialogOpen(true);
                  }}
                >
                  Pay Overdue Fees Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
