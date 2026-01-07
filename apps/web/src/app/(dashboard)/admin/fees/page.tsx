"use client";

import { useState } from "react";
import {
  IndianRupee,
  Search,
  Filter,
  Download,
  Printer,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Eye,
  FileText,
  Send,
  Calendar,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";

// TODO: Replace mock data with API calls when backend endpoints are implemented
// The following data types will need endpoints:
// - GET /fees/admin/stats - Collection stats (today, week, month, pending, overdue)
// - GET /fees/admin/categories - Fee categories with collected/pending amounts
// - GET /fees/admin/pending-students - Students with pending fees
// - GET /fees/admin/transactions - Recent transactions

// Mock data
const collectionStats = {
  todayCollected: 485000,
  weekCollected: 2350000,
  monthCollected: 8750000,
  monthTarget: 12000000,
  pendingTotal: 3250000,
  overdueTotal: 850000,
  studentsWithDues: 312,
  transactionsToday: 45,
};

const feeCategories = [
  { id: "tuition", name: "Tuition Fee", collected: 5500000, pending: 1500000, total: 7000000 },
  { id: "hostel", name: "Hostel Fee", collected: 1800000, pending: 700000, total: 2500000 },
  { id: "transport", name: "Transport Fee", collected: 650000, pending: 350000, total: 1000000 },
  { id: "exam", name: "Exam Fee", collected: 450000, pending: 150000, total: 600000 },
  { id: "library", name: "Library Fee", collected: 180000, pending: 70000, total: 250000 },
  { id: "lab", name: "Lab Fee", collected: 170000, pending: 80000, total: 250000 },
];

const pendingFeeStudents = [
  { id: 1, name: "Rahul Sharma", rollNo: "21CS101", branch: "CSE", semester: 6, totalDue: 85000, overdue: 45000, dueDate: "Jan 15, 2026", phone: "9876543210" },
  { id: 2, name: "Priya Patel", rollNo: "21EC045", branch: "ECE", semester: 6, totalDue: 65000, overdue: 0, dueDate: "Jan 20, 2026", phone: "9876543211" },
  { id: 3, name: "Amit Kumar", rollNo: "22ME032", branch: "ME", semester: 4, totalDue: 72000, overdue: 32000, dueDate: "Jan 10, 2026", phone: "9876543212" },
  { id: 4, name: "Sneha Reddy", rollNo: "21CE078", branch: "CE", semester: 6, totalDue: 55000, overdue: 0, dueDate: "Jan 25, 2026", phone: "9876543213" },
  { id: 5, name: "Vikram Singh", rollNo: "22CS089", branch: "CSE", semester: 4, totalDue: 90000, overdue: 50000, dueDate: "Jan 5, 2026", phone: "9876543214" },
  { id: 6, name: "Neha Gupta", rollNo: "21IT056", branch: "IT", semester: 6, totalDue: 48000, overdue: 0, dueDate: "Jan 30, 2026", phone: "9876543215" },
  { id: 7, name: "Kiran Rao", rollNo: "23EE012", branch: "EE", semester: 2, totalDue: 95000, overdue: 55000, dueDate: "Jan 8, 2026", phone: "9876543216" },
  { id: 8, name: "Ravi Prasad", rollNo: "22CE034", branch: "CE", semester: 4, totalDue: 62000, overdue: 22000, dueDate: "Jan 12, 2026", phone: "9876543217" },
];

const recentTransactions = [
  { id: "TXN-001", date: "Jan 6, 2026", time: "10:30 AM", student: "Rahul Sharma", rollNo: "21CS101", amount: 45000, type: "Tuition Fee", mode: "UPI", status: "success", receipt: "RCP-2026-001" },
  { id: "TXN-002", date: "Jan 6, 2026", time: "10:15 AM", student: "Priya Patel", rollNo: "21EC045", amount: 25000, type: "Hostel Fee", mode: "Card", status: "success", receipt: "RCP-2026-002" },
  { id: "TXN-003", date: "Jan 6, 2026", time: "09:45 AM", student: "Amit Kumar", rollNo: "22ME032", amount: 15000, type: "Exam Fee", mode: "Cash", status: "success", receipt: "RCP-2026-003" },
  { id: "TXN-004", date: "Jan 6, 2026", time: "09:30 AM", student: "Sneha Reddy", rollNo: "21CE078", amount: 35000, type: "Tuition Fee", mode: "Net Banking", status: "success", receipt: "RCP-2026-004" },
  { id: "TXN-005", date: "Jan 6, 2026", time: "09:15 AM", student: "Vikram Singh", rollNo: "22CS089", amount: 20000, type: "Transport Fee", mode: "UPI", status: "success", receipt: "RCP-2026-005" },
  { id: "TXN-006", date: "Jan 5, 2026", time: "04:30 PM", student: "Neha Gupta", rollNo: "21IT056", amount: 55000, type: "Tuition Fee", mode: "Net Banking", status: "success", receipt: "RCP-2026-006" },
  { id: "TXN-007", date: "Jan 5, 2026", time: "03:45 PM", student: "Kiran Rao", rollNo: "23EE012", amount: 30000, type: "Hostel Fee", mode: "Card", status: "success", receipt: "RCP-2026-007" },
];

const feeTypes = [
  { id: "tuition", name: "Tuition Fee", amount: 45000 },
  { id: "hostel", name: "Hostel Fee", amount: 25000 },
  { id: "transport", name: "Transport Fee", amount: 15000 },
  { id: "exam", name: "Exam Fee", amount: 5000 },
  { id: "library", name: "Library Fee", amount: 2000 },
  { id: "lab", name: "Lab Fee", amount: 3000 },
  { id: "misc", name: "Miscellaneous", amount: 0 },
];

export default function FeeCollectionPage() {
  const tenantId = useTenantId() || '';
  const [selectedTab, setSelectedTab] = useState("collect");

  // TODO: Replace with actual API hooks when backend is implemented
  // const { data: statsData, isLoading: statsLoading } = useFeeStats(tenantId);
  // const { data: categoriesData, isLoading: categoriesLoading } = useFeeCategories(tenantId);
  // const { data: pendingStudentsData, isLoading: pendingLoading } = usePendingFeeStudents(tenantId);
  // const { data: transactionsData, isLoading: transactionsLoading } = useRecentTransactions(tenantId);
  const isLoading = false; // Set to true when actual data loading is implemented
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof pendingFeeStudents[0] | null>(null);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedForReminder, setSelectedForReminder] = useState<number[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredStudents = pendingFeeStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = branchFilter === "all" || student.branch === branchFilter;
    const matchesSemester = semesterFilter === "all" || student.semester.toString() === semesterFilter;
    const matchesOverdue = !overdueOnly || student.overdue > 0;
    return matchesSearch && matchesBranch && matchesSemester && matchesOverdue;
  });

  const handleCollectFee = (student: typeof pendingFeeStudents[0]) => {
    setSelectedStudent(student);
    setSelectedFees([]);
    setPaymentMode("");
    setTransactionId("");
    setCollectDialogOpen(true);
  };

  const handleToggleReminder = (studentId: number) => {
    setSelectedForReminder((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "upi":
        return <Smartphone className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "net banking":
        return <Building2 className="h-4 w-4" />;
      default:
        return <IndianRupee className="h-4 w-4" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Collection</h1>
          <p className="text-muted-foreground">Collect fees, view transactions, and manage dues</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Send Reminders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Collection</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(collectionStats.todayCollected)}</p>
                <p className="text-xs text-muted-foreground">{collectionStats.transactionsToday} transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(collectionStats.monthCollected)}</p>
                <p className="text-xs text-muted-foreground">Target: {formatCurrency(collectionStats.monthTarget)}</p>
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
                <p className="text-sm text-muted-foreground">Pending Fees</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(collectionStats.pendingTotal)}</p>
                <p className="text-xs text-muted-foreground">{collectionStats.studentsWithDues} students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(collectionStats.overdueTotal)}</p>
                <p className="text-xs text-muted-foreground">Action required</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collect">Collect Fee</TabsTrigger>
          <TabsTrigger value="pending">Pending Dues</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Category Reports</TabsTrigger>
        </TabsList>

        {/* Collect Fee Tab */}
        <TabsContent value="collect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Student</CardTitle>
              <CardDescription>Search by roll number or name to collect fee</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter Roll Number or Student Name..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>

              {searchQuery && (
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead className="text-right">Total Due</TableHead>
                        <TableHead className="text-right">Overdue</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.slice(0, 5).map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                            </div>
                          </TableCell>
                          <TableCell>{student.branch}</TableCell>
                          <TableCell>Sem {student.semester}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(student.totalDue)}</TableCell>
                          <TableCell className="text-right">
                            {student.overdue > 0 ? (
                              <span className="text-red-600 font-medium">{formatCurrency(student.overdue)}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => handleCollectFee(student)}>
                              <IndianRupee className="mr-1 h-4 w-4" />
                              Collect
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Dues Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Students with Pending Fees</CardTitle>
                  <CardDescription>Filter and send reminders to students</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {selectedForReminder.length > 0 && (
                    <Button onClick={() => setReminderDialogOpen(true)}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reminder ({selectedForReminder.length})
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search student..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="ME">ME</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="EE">EE</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="overdue"
                    checked={overdueOnly}
                    onCheckedChange={(checked) => setOverdueOnly(checked as boolean)}
                  />
                  <Label htmlFor="overdue" className="text-sm">
                    Overdue only
                  </Label>
                </div>
              </div>

              {/* Students Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedForReminder.length === filteredStudents.length}
                        onCheckedChange={(checked) =>
                          setSelectedForReminder(checked ? filteredStudents.map((s) => s.id) : [])
                        }
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-right">Total Due</TableHead>
                    <TableHead className="text-right">Overdue</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className={student.overdue > 0 ? "bg-red-50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedForReminder.includes(student.id)}
                          onCheckedChange={() => handleToggleReminder(student.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.branch}</TableCell>
                      <TableCell>Sem {student.semester}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(student.totalDue)}</TableCell>
                      <TableCell className="text-right">
                        {student.overdue > 0 ? (
                          <Badge variant="destructive">{formatCurrency(student.overdue)}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={student.overdue > 0 ? "text-red-600" : ""}>{student.dueDate}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleCollectFee(student)}>
                            <IndianRupee className="mr-1 h-4 w-4" />
                            Collect
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>All fee payments received</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{txn.date}</p>
                          <p className="text-xs text-muted-foreground">{txn.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{txn.student}</p>
                          <p className="text-sm text-muted-foreground">{txn.rollNo}</p>
                        </div>
                      </TableCell>
                      <TableCell>{txn.type}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentModeIcon(txn.mode)}
                          <span>{txn.mode}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Success
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Receipt className="mr-1 h-4 w-4" />
                            Receipt
                          </Button>
                          <Button size="sm" variant="outline">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Collection by Category</CardTitle>
              <CardDescription>Category-wise collection status for current semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {feeCategories.map((category) => {
                  const percentage = (category.collected / category.total) * 100;
                  return (
                    <div key={category.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Total: {formatCurrency(category.total)}
                          </p>
                        </div>
                        <Badge className={percentage >= 80 ? "bg-green-500" : percentage >= 50 ? "bg-orange-500" : "bg-red-500"}>
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div className="text-center p-2 rounded bg-green-50">
                          <p className="text-sm text-muted-foreground">Collected</p>
                          <p className="font-semibold text-green-600">{formatCurrency(category.collected)}</p>
                        </div>
                        <div className="text-center p-2 rounded bg-orange-50">
                          <p className="text-sm text-muted-foreground">Pending</p>
                          <p className="font-semibold text-orange-600">{formatCurrency(category.pending)}</p>
                        </div>
                        <div className="text-center p-2 rounded bg-muted">
                          <p className="text-sm text-muted-foreground">Collection Rate</p>
                          <p className="font-semibold">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Collect Fee Dialog */}
      <Dialog open={collectDialogOpen} onOpenChange={setCollectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Fee</DialogTitle>
            <DialogDescription>
              {selectedStudent && `Collecting fee for ${selectedStudent.name} (${selectedStudent.rollNo})`}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Due:</span>
                    <span className="ml-2 font-semibold">{formatCurrency(selectedStudent.totalDue)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Overdue:</span>
                    <span className="ml-2 font-semibold text-red-600">{formatCurrency(selectedStudent.overdue)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Fee Type(s)</Label>
                <div className="space-y-2">
                  {feeTypes.map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={fee.id}
                          checked={selectedFees.includes(fee.id)}
                          onCheckedChange={(checked) =>
                            setSelectedFees((prev) =>
                              checked ? [...prev, fee.id] : prev.filter((f) => f !== fee.id)
                            )
                          }
                        />
                        <Label htmlFor={fee.id} className="text-sm">
                          {fee.name}
                        </Label>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(fee.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                    <SelectItem value="dd">Demand Draft</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMode && paymentMode !== "cash" && (
                <div className="space-y-2">
                  <Label>Transaction ID / Reference Number</Label>
                  <Input
                    placeholder="Enter transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              )}

              <div className="p-3 rounded-lg bg-green-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(
                      selectedFees.reduce((sum, feeId) => {
                        const fee = feeTypes.find((f) => f.id === feeId);
                        return sum + (fee?.amount || 0);
                      }, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={selectedFees.length === 0 || !paymentMode}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Fee Reminder</DialogTitle>
            <DialogDescription>
              Send SMS reminder to {selectedForReminder.length} selected student(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm">
                <strong>{selectedForReminder.length}</strong> students selected with total pending fees of{" "}
                <strong>
                  {formatCurrency(
                    pendingFeeStudents
                      .filter((s) => selectedForReminder.includes(s.id))
                      .reduce((sum, s) => sum + s.totalDue, 0)
                  )}
                </strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Message Template</Label>
              <Textarea
                rows={4}
                defaultValue={`Dear Parent, This is a reminder that fee payment of Rs. [AMOUNT] for [STUDENT_NAME] is due on [DUE_DATE]. Please pay at the earliest to avoid late fee. - College Admin`}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sms" defaultChecked />
              <Label htmlFor="sms">Send SMS</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="whatsapp" />
              <Label htmlFor="whatsapp">Send WhatsApp</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
