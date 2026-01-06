"use client";

import { useState } from "react";
import {
  CreditCard,
  Download,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Calendar,
  FileText,
  ArrowRight,
} from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const feesSummary = {
  totalFees: 185000,
  paidAmount: 140000,
  pendingAmount: 45000,
  nextDueDate: "2026-01-15",
  paidPercentage: 76,
};

const pendingFees = [
  {
    id: "fee-001",
    type: "Tuition Fee",
    amount: 35000,
    dueDate: "2026-01-15",
    status: "pending",
    semester: "Semester 5",
  },
  {
    id: "fee-002",
    type: "Lab Fee",
    amount: 5000,
    dueDate: "2026-01-15",
    status: "pending",
    semester: "Semester 5",
  },
  {
    id: "fee-003",
    type: "Library Fee",
    amount: 2500,
    dueDate: "2026-01-31",
    status: "upcoming",
    semester: "Semester 5",
  },
  {
    id: "fee-004",
    type: "Exam Fee",
    amount: 2500,
    dueDate: "2026-02-15",
    status: "upcoming",
    semester: "Semester 5",
  },
];

const paymentHistory = [
  {
    id: "pay-001",
    type: "Tuition Fee",
    amount: 35000,
    paidDate: "2025-07-10",
    transactionId: "TXN2025071012345",
    method: "UPI",
    semester: "Semester 4",
    status: "success",
  },
  {
    id: "pay-002",
    type: "Hostel Fee",
    amount: 50000,
    paidDate: "2025-07-05",
    transactionId: "TXN2025070598765",
    method: "Net Banking",
    semester: "Semester 4",
    status: "success",
  },
  {
    id: "pay-003",
    type: "Lab Fee",
    amount: 5000,
    paidDate: "2025-07-10",
    transactionId: "TXN2025071054321",
    method: "UPI",
    semester: "Semester 4",
    status: "success",
  },
  {
    id: "pay-004",
    type: "Tuition Fee",
    amount: 35000,
    paidDate: "2025-01-15",
    transactionId: "TXN2025011512345",
    method: "Card",
    semester: "Semester 3",
    status: "success",
  },
  {
    id: "pay-005",
    type: "Registration Fee",
    amount: 15000,
    paidDate: "2024-07-01",
    transactionId: "TXN2024070187654",
    method: "Net Banking",
    semester: "Semester 1",
    status: "success",
  },
];

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
  const [selectedFees, setSelectedFees] = useState<string[]>([]);

  const toggleFeeSelection = (feeId: string) => {
    setSelectedFees((prev) =>
      prev.includes(feeId) ? prev.filter((id) => id !== feeId) : [...prev, feeId]
    );
  };

  const selectedTotal = pendingFees
    .filter((fee) => selectedFees.includes(fee.id))
    .reduce((sum, fee) => sum + fee.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-red-500">Due</Badge>;
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>;
      case "success":
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
                <p className="text-2xl font-bold">{formatCurrency(feesSummary.totalFees)}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(feesSummary.paidAmount)}</p>
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
                  {formatCurrency(feesSummary.pendingAmount)}
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
                  {new Date(feesSummary.nextDueDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Progress (Academic Year 2025-26)</span>
              <span className="font-medium">{feesSummary.paidPercentage}% paid</span>
            </div>
            <Progress value={feesSummary.paidPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(feesSummary.paidAmount)} paid</span>
              <span>{formatCurrency(feesSummary.pendingAmount)} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Fees</TabsTrigger>
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
                        <p className="font-medium">{fee.type}</p>
                        <p className="text-sm text-muted-foreground">{fee.semester}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(fee.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(fee.dueDate).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      {getStatusBadge(fee.status)}
                    </div>
                  </div>
                ))}
              </div>

              {selectedFees.length > 0 && (
                <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Items: {selectedFees.length}</p>
                    <p className="text-2xl font-bold">{formatCurrency(selectedTotal)}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </DialogTrigger>
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
                                <span>{fee.type}</span>
                                <span className="font-medium">{formatCurrency(fee.amount)}</span>
                              </div>
                            ))}
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total</span>
                            <span>{formatCurrency(selectedTotal)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Button variant="outline" className="flex flex-col h-auto py-4">
                            <span className="text-xs text-muted-foreground">UPI</span>
                            <span className="text-sm">GPay/PhonePe</span>
                          </Button>
                          <Button variant="outline" className="flex flex-col h-auto py-4">
                            <span className="text-xs text-muted-foreground">Card</span>
                            <span className="text-sm">Credit/Debit</span>
                          </Button>
                          <Button variant="outline" className="flex flex-col h-auto py-4">
                            <span className="text-xs text-muted-foreground">Net Banking</span>
                            <span className="text-sm">All Banks</span>
                          </Button>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button className="w-full">
                          Proceed to Payment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Due Date Alert */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-orange-800">Payment Reminder</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Your next fee payment of {formatCurrency(40000)} is due on{" "}
                    {new Date(feesSummary.nextDueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    . Late payment may attract a fine.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your past payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.paidDate).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="font-medium">{payment.type}</TableCell>
                      <TableCell>{payment.semester}</TableCell>
                      <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
    </div>
  );
}
