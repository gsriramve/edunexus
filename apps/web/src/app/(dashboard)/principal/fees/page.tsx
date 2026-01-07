"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  IndianRupee,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState } from "react";

// Mock data - Replace with real API calls
const feeStats = {
  totalExpected: 15000000, // 1.5 Cr
  totalCollected: 12750000, // 1.275 Cr
  collectionRate: 85,
  pendingAmount: 2250000, // 22.5 L
  studentsPaid: 1062,
  studentsPending: 188,
  thisMonthCollection: 850000,
  lastMonthCollection: 780000,
};

const departmentFees = [
  {
    department: "Computer Science",
    students: 245,
    expected: 3675000,
    collected: 3380000,
    pending: 295000,
    collectionRate: 92,
    defaulters: 12,
  },
  {
    department: "Electronics",
    students: 198,
    expected: 2970000,
    collected: 2525000,
    pending: 445000,
    collectionRate: 85,
    defaulters: 28,
  },
  {
    department: "Mechanical",
    students: 220,
    expected: 3300000,
    collected: 2640000,
    pending: 660000,
    collectionRate: 80,
    defaulters: 45,
  },
  {
    department: "Civil",
    students: 180,
    expected: 2700000,
    collected: 2295000,
    pending: 405000,
    collectionRate: 85,
    defaulters: 32,
  },
  {
    department: "Electrical",
    students: 165,
    expected: 2475000,
    collected: 2103000,
    pending: 372000,
    collectionRate: 85,
    defaulters: 28,
  },
];

const feeCategories = [
  { category: "Tuition Fee", collected: 8500000, expected: 9500000, percentage: 89 },
  { category: "Lab Fee", collected: 1200000, expected: 1500000, percentage: 80 },
  { category: "Library Fee", collected: 450000, expected: 500000, percentage: 90 },
  { category: "Exam Fee", collected: 600000, expected: 750000, percentage: 80 },
  { category: "Hostel Fee", collected: 1800000, expected: 2500000, percentage: 72 },
  { category: "Transport Fee", collected: 200000, expected: 250000, percentage: 80 },
];

const recentTransactions = [
  { student: "Rahul Sharma", department: "Computer Science", amount: 75000, date: "2026-01-07", type: "Tuition" },
  { student: "Priya Patel", department: "Electronics", amount: 75000, date: "2026-01-07", type: "Tuition" },
  { student: "Amit Kumar", department: "Mechanical", amount: 25000, date: "2026-01-06", type: "Hostel" },
  { student: "Sneha Reddy", department: "Civil", amount: 15000, date: "2026-01-06", type: "Exam" },
  { student: "Vikram Singh", department: "Electrical", amount: 75000, date: "2026-01-05", type: "Tuition" },
];

const monthlyTrend = [
  { month: "Aug", collected: 4500000 },
  { month: "Sep", collected: 2100000 },
  { month: "Oct", collected: 1500000 },
  { month: "Nov", collected: 1200000 },
  { month: "Dec", collected: 780000 },
  { month: "Jan", collected: 850000 },
];

export default function PrincipalFeesPage() {
  const [selectedYear, setSelectedYear] = useState("2025-26");

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const percentChange = ((feeStats.thisMonthCollection - feeStats.lastMonthCollection) / feeStats.lastMonthCollection * 100).toFixed(1);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Collection Overview</h1>
          <p className="text-muted-foreground">
            Institution-wide fee collection and financial summary
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Academic Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-26">2025-26</SelectItem>
            <SelectItem value="2024-25">2024-25</SelectItem>
            <SelectItem value="2023-24">2023-24</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(feeStats.totalCollected)}</div>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(feeStats.totalExpected)} expected
            </p>
            <Progress value={feeStats.collectionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(feeStats.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {feeStats.studentsPending} students with dues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            {Number(percentChange) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(feeStats.thisMonthCollection)}</div>
            <p className={`text-xs flex items-center gap-1 ${Number(percentChange) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {Number(percentChange) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {percentChange}% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feeStats.collectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {feeStats.studentsPaid} of {feeStats.studentsPaid + feeStats.studentsPending} students paid
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments">By Department</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Collection</CardTitle>
              <CardDescription>Fee collection status across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-right">Expected</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-center">Rate</TableHead>
                    <TableHead className="text-center">Defaulters</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentFees.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell className="font-medium">{dept.department}</TableCell>
                      <TableCell className="text-center">{dept.students}</TableCell>
                      <TableCell className="text-right">{formatCurrency(dept.expected)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(dept.collected)}</TableCell>
                      <TableCell className="text-right text-yellow-600">{formatCurrency(dept.pending)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={dept.collectionRate} className="w-16 h-2" />
                          <span className={dept.collectionRate >= 90 ? "text-green-600 font-medium" : "text-yellow-600"}>
                            {dept.collectionRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={dept.defaulters > 30 ? "destructive" : "secondary"}>
                          {dept.defaulters}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Fully Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">{feeStats.studentsPaid}</div>
                <p className="text-xs text-green-600 mt-1">Students with no pending dues</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
                  <Clock className="h-4 w-4" />
                  Partial Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-700">142</div>
                <p className="text-xs text-yellow-600 mt-1">Students with partial dues</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  No Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700">46</div>
                <p className="text-xs text-red-600 mt-1">Students with zero payment</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Category Breakdown</CardTitle>
              <CardDescription>Collection status by fee type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {feeCategories.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(category.collected)} of {formatCurrency(category.expected)}
                        </p>
                      </div>
                      <span className={`text-lg font-bold ${category.percentage >= 85 ? "text-green-600" : category.percentage >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                        {category.percentage}%
                      </span>
                    </div>
                    <Progress value={category.percentage} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Collection Trend</CardTitle>
              <CardDescription>Fee collection over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-2">
                {monthlyTrend.map((month) => {
                  const maxValue = Math.max(...monthlyTrend.map(m => m.collected));
                  const height = (month.collected / maxValue) * 100;
                  return (
                    <div key={month.month} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-primary rounded-t-md transition-all duration-300"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs mt-2 text-muted-foreground">{month.month}</span>
                      <span className="text-xs font-medium">{formatCurrency(month.collected)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest fee payments received</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((txn, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{txn.student}</TableCell>
                      <TableCell>{txn.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{txn.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        ₹{txn.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>How students are paying fees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Online (UPI/Card)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-24 h-2" />
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bank Transfer</span>
                    <div className="flex items-center gap-2">
                      <Progress value={25} className="w-24 h-2" />
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cash/DD</span>
                    <div className="flex items-center gap-2">
                      <Progress value={10} className="w-24 h-2" />
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Today&apos;s collection summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Today&apos;s Collection</span>
                    <span className="text-lg font-bold text-green-600">₹1,50,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Transactions Today</span>
                    <span className="text-lg font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Average Transaction</span>
                    <span className="text-lg font-bold">₹12,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
