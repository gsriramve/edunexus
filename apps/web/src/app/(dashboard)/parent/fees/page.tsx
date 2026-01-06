"use client";

import { useState } from "react";
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
} from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data for children
const children = [
  { id: "child-1", name: "Rahul Sharma", rollNo: "21CSE101", department: "Computer Science", semester: 5 },
  { id: "child-2", name: "Priya Sharma", rollNo: "23ECE045", department: "Electronics", semester: 3 },
];

// Mock fee data per child
const childFeeData: Record<string, {
  summary: { totalFees: number; paid: number; pending: number; dueDate: string; nextInstallment: number };
  pendingFees: Array<{ id: string; type: string; description: string; amount: number; dueDate: string; status: string; late_fine?: number }>;
  paymentHistory: Array<{ id: string; date: string; type: string; amount: number; mode: string; transactionId: string; receipt: string }>;
  feeStructure: Array<{ type: string; amount: number; frequency: string; description: string }>;
}> = {
  "child-1": {
    summary: {
      totalFees: 125000,
      paid: 80000,
      pending: 45000,
      dueDate: "Jan 31, 2026",
      nextInstallment: 25000,
    },
    pendingFees: [
      { id: "fee-1", type: "Tuition Fee", description: "Semester 5 - Installment 2", amount: 25000, dueDate: "Jan 31, 2026", status: "due_soon" },
      { id: "fee-2", type: "Lab Fee", description: "Computer Lab - Semester 5", amount: 5000, dueDate: "Jan 31, 2026", status: "due_soon" },
      { id: "fee-3", type: "Library Fee", description: "Annual Library Fee 2025-26", amount: 2000, dueDate: "Feb 15, 2026", status: "upcoming" },
      { id: "fee-4", type: "Exam Fee", description: "Semester 5 End Term Exam", amount: 3000, dueDate: "Mar 1, 2026", status: "upcoming" },
      { id: "fee-5", type: "Transport Fee", description: "Bus Pass - Jan to Mar 2026", amount: 10000, dueDate: "Jan 15, 2026", status: "overdue", late_fine: 500 },
    ],
    paymentHistory: [
      { id: "pay-1", date: "Oct 15, 2025", type: "Tuition Fee", amount: 25000, mode: "UPI", transactionId: "TXN789456123", receipt: "REC-2025-001" },
      { id: "pay-2", date: "Oct 15, 2025", type: "Lab Fee", amount: 5000, mode: "UPI", transactionId: "TXN789456124", receipt: "REC-2025-002" },
      { id: "pay-3", date: "Jul 10, 2025", type: "Tuition Fee", amount: 25000, mode: "Net Banking", transactionId: "TXN456789012", receipt: "REC-2025-003" },
      { id: "pay-4", date: "Jul 10, 2025", type: "Hostel Fee", amount: 20000, mode: "Net Banking", transactionId: "TXN456789013", receipt: "REC-2025-004" },
      { id: "pay-5", date: "Jun 25, 2025", type: "Admission Fee", amount: 5000, mode: "Card", transactionId: "TXN123456789", receipt: "REC-2025-005" },
    ],
    feeStructure: [
      { type: "Tuition Fee", amount: 100000, frequency: "Per Year (4 Installments)", description: "Academic tuition charges" },
      { type: "Lab Fee", amount: 10000, frequency: "Per Semester", description: "Laboratory usage and consumables" },
      { type: "Library Fee", amount: 2000, frequency: "Per Year", description: "Library access and resources" },
      { type: "Exam Fee", amount: 6000, frequency: "Per Year (2 terms)", description: "Examination and evaluation" },
      { type: "Transport Fee", amount: 40000, frequency: "Per Year", description: "Bus transportation (optional)" },
      { type: "Hostel Fee", amount: 80000, frequency: "Per Year", description: "Accommodation (if applicable)" },
    ],
  },
  "child-2": {
    summary: {
      totalFees: 115000,
      paid: 90000,
      pending: 25000,
      dueDate: "Feb 15, 2026",
      nextInstallment: 25000,
    },
    pendingFees: [
      { id: "fee-1", type: "Tuition Fee", description: "Semester 3 - Installment 2", amount: 25000, dueDate: "Feb 15, 2026", status: "upcoming" },
    ],
    paymentHistory: [
      { id: "pay-1", date: "Nov 1, 2025", type: "Tuition Fee", amount: 25000, mode: "UPI", transactionId: "TXN111222333", receipt: "REC-2025-101" },
      { id: "pay-2", date: "Aug 15, 2025", type: "Tuition Fee", amount: 25000, mode: "Net Banking", transactionId: "TXN444555666", receipt: "REC-2025-102" },
      { id: "pay-3", date: "Jul 1, 2025", type: "Admission Fee", amount: 40000, mode: "Card", transactionId: "TXN777888999", receipt: "REC-2025-103" },
    ],
    feeStructure: [
      { type: "Tuition Fee", amount: 100000, frequency: "Per Year (4 Installments)", description: "Academic tuition charges" },
      { type: "Lab Fee", amount: 8000, frequency: "Per Semester", description: "Laboratory usage and consumables" },
      { type: "Library Fee", amount: 2000, frequency: "Per Year", description: "Library access and resources" },
      { type: "Exam Fee", amount: 5000, frequency: "Per Year (2 terms)", description: "Examination and evaluation" },
    ],
  },
};

export default function ParentFees() {
  const [selectedChild, setSelectedChild] = useState(children[0].id);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const currentChild = children.find((c) => c.id === selectedChild)!;
  const feeData = childFeeData[selectedChild];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "due_soon":
        return <Badge className="bg-orange-500">Due Soon</Badge>;
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
      setSelectedFees(feeData.pendingFees.map((fee) => fee.id));
    } else {
      setSelectedFees([]);
    }
  };

  const calculateSelectedTotal = () => {
    return feeData.pendingFees
      .filter((fee) => selectedFees.includes(fee.id))
      .reduce((sum, fee) => sum + fee.amount + (fee.late_fine || 0), 0);
  };

  const paidPercentage = Math.round((feeData.summary.paid / feeData.summary.totalFees) * 100);

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
                  {child.name} ({child.rollNo})
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
              <h2 className="text-xl font-semibold">{currentChild.name}</h2>
              <p className="text-sm text-muted-foreground">
                {currentChild.rollNo} • {currentChild.department} • Semester {currentChild.semester}
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
                <p className="text-2xl font-bold">₹{feeData.summary.totalFees.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-green-600">₹{feeData.summary.paid.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-orange-600">₹{feeData.summary.pending.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{feeData.summary.dueDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Progress</CardTitle>
          <CardDescription>Annual fee payment status for {currentChild.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>₹{feeData.summary.paid.toLocaleString()} paid</span>
              <span>₹{feeData.summary.pending.toLocaleString()} remaining</span>
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
          <TabsTrigger value="pending">Pending Fees</TabsTrigger>
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
                  <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay ₹{calculateSelectedTotal().toLocaleString()}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                          You are about to pay for {selectedFees.length} fee item(s)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="rounded-lg border p-4 space-y-2">
                          {feeData.pendingFees
                            .filter((fee) => selectedFees.includes(fee.id))
                            .map((fee) => (
                              <div key={fee.id} className="flex justify-between text-sm">
                                <span>{fee.type}</span>
                                <span>₹{(fee.amount + (fee.late_fine || 0)).toLocaleString()}</span>
                              </div>
                            ))}
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total</span>
                            <span>₹{calculateSelectedTotal().toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Select Payment Method</p>
                          <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" className="h-16 flex-col">
                              <span className="text-lg">📱</span>
                              <span className="text-xs">UPI</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col">
                              <span className="text-lg">💳</span>
                              <span className="text-xs">Card</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col">
                              <span className="text-lg">🏦</span>
                              <span className="text-xs">Net Banking</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setPaymentDialogOpen(false)}>
                          Proceed to Pay
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {feeData.pendingFees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedFees.length === feeData.pendingFees.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Late Fine</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeData.pendingFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedFees.includes(fee.id)}
                            onCheckedChange={(checked) => handleSelectFee(fee.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{fee.type}</TableCell>
                        <TableCell className="text-muted-foreground">{fee.description}</TableCell>
                        <TableCell className="text-right font-medium">₹{fee.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {fee.late_fine ? `₹${fee.late_fine.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell>{fee.dueDate}</TableCell>
                        <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-medium">All Fees Paid!</p>
                  <p className="text-muted-foreground">No pending fees for {currentChild.name}</p>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeData.paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell className="font-medium">{payment.type}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ₹{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.mode}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.transactionId}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Receipt className="h-4 w-4 mr-1" />
                          {payment.receipt}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Structure */}
        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure</CardTitle>
              <CardDescription>
                Annual fee breakdown for {currentChild.department} - Academic Year 2025-26
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
                  {feeData.feeStructure.map((fee, index) => (
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

      {/* Overdue Alert */}
      {feeData.pendingFees.some((fee) => fee.status === "overdue") && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Overdue Payment Alert</h3>
                <p className="text-sm text-red-700 mt-1">
                  {currentChild.name} has overdue fees. Late payment may incur additional fines
                  and could affect exam eligibility. Please clear dues at the earliest.
                </p>
                <Button variant="destructive" size="sm" className="mt-3">
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
