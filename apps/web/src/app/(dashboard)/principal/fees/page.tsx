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
  AlertCircle,
  CheckCircle2,
  Clock,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { usePrincipalFeeOverview } from "@/hooks/use-principal-dashboard";
import { useTenantId } from "@/hooks/use-tenant";

export default function PrincipalFeesPage() {
  const tenantId = useTenantId();
  const [selectedYear, setSelectedYear] = useState("2025-26");

  const { data: feeData, isLoading, error } = usePrincipalFeeOverview(tenantId || '');

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <p className="text-red-800">Failed to load fee data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = feeData?.stats || {
    totalExpected: 0,
    totalCollected: 0,
    collectionRate: 0,
    pendingAmount: 0,
    studentsPaid: 0,
    studentsPending: 0,
    studentsPartial: 0,
    thisMonthCollection: 0,
    lastMonthCollection: 0,
    overdueCount: 0,
  };

  const departmentFees = feeData?.departmentFees || [];
  const feeCategories = feeData?.feeCategories || [];
  const recentTransactions = feeData?.recentTransactions || [];
  const monthlyTrend = feeData?.monthlyTrend || [];
  const paymentMethods = feeData?.paymentMethods || [];

  const percentChange = stats.lastMonthCollection > 0
    ? ((stats.thisMonthCollection - stats.lastMonthCollection) / stats.lastMonthCollection * 100).toFixed(1)
    : '0';

  const totalStudents = stats.studentsPaid + stats.studentsPending + stats.studentsPartial;

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
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</div>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(stats.totalExpected)} expected
            </p>
            <Progress value={stats.collectionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.studentsPending + stats.studentsPartial} students with dues
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
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonthCollection)}</div>
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
            <div className="text-2xl font-bold">{stats.collectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.studentsPaid} of {totalStudents} students paid
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
              {departmentFees.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No fee data available yet.
                </p>
              ) : (
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
                      <TableRow key={dept.departmentId}>
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
              )}
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
                <div className="text-3xl font-bold text-green-700">{stats.studentsPaid}</div>
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
                <div className="text-3xl font-bold text-yellow-700">{stats.studentsPartial}</div>
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
                <div className="text-3xl font-bold text-red-700">{stats.studentsPending}</div>
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
              {feeCategories.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No fee categories available yet.
                </p>
              ) : (
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
              )}
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Collection Trend</CardTitle>
              <CardDescription>Fee collection over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyTrend.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No collection data available yet.
                </p>
              ) : (
                <div className="flex items-end justify-between h-48 gap-2">
                  {monthlyTrend.map((month) => {
                    const maxValue = Math.max(...monthlyTrend.map(m => m.collected), 1);
                    const height = (month.collected / maxValue) * 100;
                    return (
                      <div key={`${month.month}-${month.year}`} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-primary rounded-t-md transition-all duration-300"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        />
                        <span className="text-xs mt-2 text-muted-foreground">{month.month}</span>
                        <span className="text-xs font-medium">{formatCurrency(month.collected)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
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
              {recentTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recent transactions available.
                </p>
              ) : (
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
                    {recentTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-medium">{txn.studentName}</TableCell>
                        <TableCell>{txn.department}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{txn.feeType}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          ₹{txn.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(txn.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
                {paymentMethods.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No payment method data available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.slice(0, 5).map((method) => (
                      <div key={method.method} className="flex items-center justify-between">
                        <span className="text-sm">{method.method}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={method.percentage} className="w-24 h-2" />
                          <span className="text-sm font-medium">{method.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Collection summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">This Month Collection</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(stats.thisMonthCollection)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Overdue Fees</span>
                    <span className="text-lg font-bold text-red-600">{stats.overdueCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Last Month Collection</span>
                    <span className="text-lg font-bold">{formatCurrency(stats.lastMonthCollection)}</span>
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
