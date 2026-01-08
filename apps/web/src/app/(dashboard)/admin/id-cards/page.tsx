"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CreditCard,
  Download,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Users,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useIdCards,
  useIdCardStats,
  useBulkGenerateIdCards,
  useDownloadIdCardPdf,
  useRevokeIdCard,
} from "@/hooks/use-api";
import { toast } from "sonner";

export default function AdminIdCardsPage() {
  const tenantId = useTenantId();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkDepartmentId, setBulkDepartmentId] = useState("");
  const [bulkBatch, setBulkBatch] = useState("");

  const { data: cards, isLoading: cardsLoading, refetch } = useIdCards(tenantId || "", {
    status: statusFilter !== "all" ? statusFilter : undefined,
    departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
  });
  const { data: stats, isLoading: statsLoading } = useIdCardStats(tenantId || "");
  const bulkGenerate = useBulkGenerateIdCards(tenantId || "");
  const downloadPdf = useDownloadIdCardPdf(tenantId || "");
  const revokeCard = useRevokeIdCard(tenantId || "");

  const handleBulkGenerate = async () => {
    if (!bulkDepartmentId) {
      toast.error("Please select a department");
      return;
    }

    try {
      const result = await bulkGenerate.mutateAsync({
        departmentId: bulkDepartmentId,
        batch: bulkBatch || undefined,
      });
      toast.success(`Generated ${result.generated} ID cards`);
      setBulkDialogOpen(false);
      setBulkDepartmentId("");
      setBulkBatch("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate ID cards");
    }
  };

  const handleDownloadPdf = async (cardId: string) => {
    try {
      await downloadPdf.mutateAsync(cardId);
      toast.success("PDF downloaded");
    } catch (error: any) {
      toast.error(error.message || "Failed to download PDF");
    }
  };

  const handleRevokeCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to revoke this ID card?")) return;

    try {
      await revokeCard.mutateAsync({ id: cardId, reason: "Admin revoked" });
      toast.success("ID card revoked");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke ID card");
    }
  };

  const cardsList = cards?.cards || [];
  const filteredCards = cardsList.filter((card: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      card.cachedName?.toLowerCase().includes(search) ||
      card.cachedRollNo?.toLowerCase().includes(search) ||
      card.cardNumber?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "expired":
        return <Badge className="bg-yellow-500"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      case "revoked":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get unique departments from stats for filter
  const departments = stats?.cardsByDepartment
    ? Object.keys(stats.cardsByDepartment).map((name) => ({ name }))
    : [];

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No tenant selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ID Card Management</h1>
          <p className="text-muted-foreground">
            Generate and manage student ID cards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Bulk Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Generate ID Cards</DialogTitle>
                <DialogDescription>
                  Generate ID cards for all students in a department/batch who don't have one yet.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select value={bulkDepartmentId} onValueChange={setBulkDepartmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.name} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch (optional)</label>
                  <Input
                    placeholder="e.g., 2021-2025"
                    value={bulkBatch}
                    onChange={(e) => setBulkBatch(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkGenerate} disabled={bulkGenerate.isPending}>
                  {bulkGenerate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Generate Cards
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalCards || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.activeCards || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.expiredCards || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revoked</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.revokedCards || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ID Cards</CardTitle>
          <CardDescription>View and manage all student ID cards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, roll no, or card number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.name} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {cardsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCards?.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium">No ID cards found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" || departmentFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Generate ID cards to get started"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card Number</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCards?.map((card: any) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-mono font-medium">
                      {card.cardNumber}
                    </TableCell>
                    <TableCell>{card.cachedName}</TableCell>
                    <TableCell className="font-mono">{card.cachedRollNo}</TableCell>
                    <TableCell>{card.cachedDepartment}</TableCell>
                    <TableCell>{card.cachedBatch}</TableCell>
                    <TableCell>{getStatusBadge(card.status)}</TableCell>
                    <TableCell>
                      {new Date(card.validUntil).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownloadPdf(card.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          {card.status === "active" && (
                            <DropdownMenuItem
                              onClick={() => handleRevokeCard(card.id)}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Revoke Card
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stats by Department */}
      {stats?.cardsByDepartment && Object.keys(stats.cardsByDepartment).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cards by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(stats.cardsByDepartment).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{dept}</span>
                  <Badge variant="secondary">{count as number}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats by Batch */}
      {stats?.cardsByBatch && Object.keys(stats.cardsByBatch).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cards by Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {Object.entries(stats.cardsByBatch).map(([batch, count]) => (
                <div key={batch} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{batch}</span>
                  <Badge variant="secondary">{count as number}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
