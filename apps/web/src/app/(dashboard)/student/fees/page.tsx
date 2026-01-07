"use client";

import { useState } from "react";
import {
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Calendar,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useStudentFees, usePaymentHistory, useCreatePaymentOrder, useVerifyPayment, useStudentByUserId } from "@/hooks/use-api";
import { useTenantId } from "@/hooks/use-tenant";
import { usePaymentFlow } from "@/hooks/use-razorpay";
import type { StudentFee } from "@/lib/api";

// Fee structure (static for now)
const feeStructure = [
  { type: "Tuition Fee", amount: 70000, frequency: "Per Semester" },
  { type: "Lab Fee", amount: 10000, frequency: "Per Semester" },
  { type: "Library Fee", amount: 5000, frequency: "Per Year" },
  { type: "Exam Fee", amount: 5000, frequency: "Per Semester" },
  { type: "Development Fee", amount: 10000, frequency: "Per Year" },
  { type: "Hostel Fee", amount: 100000, frequency: "Per Year (Optional)" },
  { type: "Transport Fee", amount: 30000, frequency: "Per Year (Optional)" },
];

export default function StudentFees() {
  const { toast } = useToast();
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Auth context
  const tenantId = useTenantId();
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get student data from user ID
  const { data: studentData, isLoading: isLoadingStudent } = useStudentByUserId(
    tenantId || '',
    user?.id || ''
  );

  const studentId = studentData?.id || '';
  const studentName = user?.fullName || user?.firstName || 'Student';
  const studentEmail = user?.primaryEmailAddress?.emailAddress || '';

  // API Hooks
  const { data: feesData, isLoading: isLoadingFees, refetch: refetchFees } = useStudentFees(tenantId || '', studentId);
  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = usePaymentHistory(tenantId || '', studentId);
  const createOrderMutation = useCreatePaymentOrder(tenantId || '', studentId);
  const verifyPaymentMutation = useVerifyPayment(tenantId || '');

  // Razorpay
  const { isRazorpayLoaded, initiatePayment, paymentStatus, paymentError, resetPayment } = usePaymentFlow();

  // Computed values
  const fees = feesData?.fees || [];
  const summary = feesData?.summary || { totalPending: 0, totalPaid: 0, pendingCount: 0, paidCount: 0 };
  const paymentHistory = historyData?.data || [];

  const pendingFees = fees.filter((f) => ["pending", "partial"].includes(f.status));
  const paidFees = fees.filter((f) => f.status === "paid");

  const totalFees = summary.totalPending + summary.totalPaid;
  const paidPercentage = totalFees > 0 ? Math.round((summary.totalPaid / totalFees) * 100) : 0;

  // Get next due date from pending fees
  const nextDueDate = pendingFees.length > 0
    ? pendingFees.reduce((earliest, fee) => {
        const feeDate = new Date(fee.dueDate);
        return feeDate < earliest ? feeDate : earliest;
      }, new Date(pendingFees[0].dueDate))
    : null;

  const toggleFeeSelection = (feeId: string) => {
    setSelectedFees((prev) =>
      prev.includes(feeId) ? prev.filter((id) => id !== feeId) : [...prev, feeId]
    );
  };

  const selectedTotal = pendingFees
    .filter((fee) => selectedFees.includes(fee.id))
    .reduce((sum, fee) => sum + (Number(fee.amount) - Number(fee.paidAmount || 0)), 0);

  const handlePayNow = async () => {
    if (!isRazorpayLoaded) {
      toast({
        title: "Loading payment gateway",
        description: "Please wait while we load the payment gateway...",
      });
      return;
    }

    if (selectedFees.length === 0) {
      toast({
        title: "No fees selected",
        description: "Please select at least one fee to pay.",
        variant: "destructive",
      });
      return;
    }

    setIsPaymentDialogOpen(true);
  };

  const handleProceedToPayment = async () => {
    try {
      // Create Razorpay order
      const orderResponse = await createOrderMutation.mutateAsync({
        feeIds: selectedFees,
        amount: Math.round(selectedTotal * 100), // Convert to paise
        currency: "INR",
      });

      // Close dialog
      setIsPaymentDialogOpen(false);

      // Open Razorpay checkout
      initiatePayment({
        orderId: orderResponse.orderId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "EduNexus",
        description: orderResponse.description,
        prefill: {
          name: studentName,
          email: studentEmail,
        },
        onSuccess: async (response) => {
          try {
            // Verify payment
            await verifyPaymentMutation.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              feeIds: selectedFees,
            });

            toast({
              title: "Payment Successful!",
              description: `Receipt: ${orderResponse.receipt}`,
            });

            // Reset selection and refetch data
            setSelectedFees([]);
            refetchFees();
            refetchHistory();
          } catch (error: any) {
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support.",
              variant: "destructive",
            });
          }
        },
        onError: (error) => {
          toast({
            title: "Payment Failed",
            description: error?.description || error?.message || "Please try again.",
            variant: "destructive",
          });
        },
      });
    } catch (error: any) {
      toast({
        title: "Error Creating Order",
        description: error.message || "Failed to create payment order.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-red-500">Due</Badge>;
      case "partial":
        return <Badge className="bg-orange-500">Partial</Badge>;
      case "overdue":
        return <Badge className="bg-red-700">Overdue</Badge>;
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoadingFees) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fees & Payments</h1>
          <p className="text-muted-foreground">
            View fee details, make payments, and download receipts
          </p>
        </div>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Fee Structure
        </Button>
      </div>

      {/* Fee Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <IndianRupee className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">{formatCurrency(totalFees)}</p>
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
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(summary.totalPending)}
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
                <p className="text-lg font-bold">
                  {nextDueDate ? formatDate(nextDueDate.toISOString()) : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Progress */}
      {totalFees > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Progress (Academic Year 2025-26)</span>
                <span className="font-medium">{paidPercentage}% paid</span>
              </div>
              <Progress value={paidPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(summary.totalPaid)} paid</span>
                <span>{formatCurrency(summary.totalPending)} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Fees {summary.pendingCount > 0 && `(${summary.pendingCount})`}
          </TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
        </TabsList>

        {/* Pending Fees Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Fees</CardTitle>
              <CardDescription>Select fees to pay</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingFees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="font-medium">All fees are paid!</p>
                  <p className="text-sm">You have no pending fees at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingFees.map((fee) => (
                    <div
                      key={fee.id}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedFees.includes(fee.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleFeeSelection(fee.id)}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedFees.includes(fee.id)}
                          onChange={() => {}}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">{fee.feeType}</p>
                          <p className="text-sm text-muted-foreground">
                            {fee.paidAmount && Number(fee.paidAmount) > 0
                              ? `Partial: ${formatCurrency(Number(fee.paidAmount))} paid`
                              : "Not paid"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">
                            {formatCurrency(Number(fee.amount) - Number(fee.paidAmount || 0))}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDate(fee.dueDate)}
                          </p>
                        </div>
                        {getStatusBadge(fee.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedFees.length > 0 && (
                <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Items: {selectedFees.length}</p>
                    <p className="text-2xl font-bold">{formatCurrency(selectedTotal)}</p>
                  </div>
                  <Button size="lg" onClick={handlePayNow} disabled={!isRazorpayLoaded}>
                    {!isRazorpayLoaded ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Pay Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Due Date Alert */}
          {summary.totalPending > 0 && nextDueDate && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-orange-800">Payment Reminder</h3>
                    <p className="text-sm text-orange-700 mt-1">
                      Your next fee payment of {formatCurrency(summary.totalPending)} is due on{" "}
                      {formatDate(nextDueDate.toISOString())}. Late payment may attract a fine.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your past payments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No payment history found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell className="font-mono text-xs">{payment.receiptNumber || "-"}</TableCell>
                        <TableCell className="capitalize">{payment.paymentMethod || "-"}</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            payment.status === "captured" ? "bg-green-500" :
                            payment.status === "failed" ? "bg-red-500" :
                            "bg-yellow-500"
                          }>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Structure Tab */}
        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure</CardTitle>
              <CardDescription>Academic Year 2025-26</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructure.map((fee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{fee.type}</TableCell>
                      <TableCell>{fee.frequency}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(fee.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Note: Fee structure is subject to change. Optional fees like Hostel and Transport
                  are applicable only if the student opts for these services.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Confirmation Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              You are about to pay {formatCurrency(selectedTotal)} for{" "}
              {selectedFees.length} item(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {pendingFees
                .filter((fee) => selectedFees.includes(fee.id))
                .map((fee) => (
                  <div key={fee.id} className="flex justify-between text-sm">
                    <span>{fee.feeType}</span>
                    <span className="font-medium">
                      {formatCurrency(Number(fee.amount) - Number(fee.paidAmount || 0))}
                    </span>
                  </div>
                ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(selectedTotal)}</span>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-2">Payment Methods Available:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>UPI (GPay, PhonePe, Paytm, etc.)</li>
                <li>Credit/Debit Cards</li>
                <li>Net Banking (All major banks)</li>
                <li>Wallets</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProceedToPayment}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Order...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
