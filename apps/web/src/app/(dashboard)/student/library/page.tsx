'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import {
  BookOpen,
  Search,
  BookMarked,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Calendar,
  BookCopy,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantId } from '@/hooks/use-tenant';
import { useStudentByUserId } from '@/hooks/use-api';
import {
  useStudentLibraryCard,
  useCardIssues,
  useReservations,
  useBooks,
  useEResources,
  useCategories,
  useBookIssues,
  useRenewBook,
  useCancelReservation,
  useCreateReservation,
  useRecordEResourceView,
  useRecordEResourceDownload,
} from '@/hooks/use-library';
import type { LibraryBook } from '@/lib/api';

export default function StudentLibraryPage() {
  const { user } = useAuth();
  const tenantId = useTenantId() || '';
  const [activeTab, setActiveTab] = useState('mybooks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);

  // Fetch student data
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');
  const studentId = studentData?.id || '';

  // Fetch library card for student
  const { data: libraryCard, isLoading: cardLoading } = useStudentLibraryCard(tenantId, studentId);

  // Fetch borrowed books (current issues for the card)
  const { data: borrowedBooks, isLoading: issuesLoading } = useCardIssues(tenantId, libraryCard?.id || '');

  // Fetch reservations for this card
  const { data: reservationsData, isLoading: reservationsLoading } = useReservations(tenantId, { cardId: libraryCard?.id });

  // Fetch book catalog
  const { data: catalogData, isLoading: catalogLoading } = useBooks(tenantId, {
    search: searchQuery || undefined,
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
    isActive: true,
  });

  // Fetch e-resources
  const { data: eResourcesData, isLoading: eResourcesLoading } = useEResources(tenantId);

  // Fetch categories
  const { data: categoriesData } = useCategories(tenantId);

  // Fetch borrow history (returned books)
  const { data: historyData, isLoading: historyLoading } = useBookIssues(tenantId, {
    cardId: libraryCard?.id,
    status: 'returned',
  });

  // Mutations
  const renewBookMutation = useRenewBook(tenantId);
  const cancelReservationMutation = useCancelReservation(tenantId);
  const createReservationMutation = useCreateReservation(tenantId);
  const recordViewMutation = useRecordEResourceView(tenantId);
  const recordDownloadMutation = useRecordEResourceDownload(tenantId);

  // Derived data
  const currentIssues = borrowedBooks?.filter(issue => issue.status !== 'returned') || [];
  const reservations = reservationsData?.data?.filter(r => r.status !== 'collected' && r.status !== 'cancelled') || [];
  const catalog = catalogData?.data || [];
  const eResources = eResourcesData?.data || [];
  const categories = categoriesData || [];
  const history = historyData?.data || [];

  const isLoading = studentLoading || cardLoading;

  // Days until due helper
  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      issued: { variant: 'secondary', label: 'Issued' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      returned: { variant: 'outline', label: 'Returned' },
      pending: { variant: 'secondary', label: 'Pending' },
      ready: { variant: 'default', label: 'Ready to Collect' },
      active: { variant: 'default', label: 'Active' },
      open: { variant: 'default', label: 'Open Access' },
      subscription: { variant: 'secondary', label: 'Subscription' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Access level to display type mapping
  const getAccessTypeDisplay = (accessLevel: string) => {
    const mapping: Record<string, string> = {
      public: 'open',
      students: 'open',
      faculty: 'subscription',
      restricted: 'subscription',
    };
    return mapping[accessLevel] || 'open';
  };

  // Handlers
  const handleRenewBook = async (issueId: string) => {
    try {
      await renewBookMutation.mutateAsync({ id: issueId, data: {} });
    } catch (error) {
      console.error('Failed to renew book:', error);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservationMutation.mutateAsync(reservationId);
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
    }
  };

  const handleReserveBook = async (bookId: string) => {
    if (!libraryCard?.id) return;
    try {
      await createReservationMutation.mutateAsync({
        cardId: libraryCard.id,
        bookId,
      });
    } catch (error) {
      console.error('Failed to reserve book:', error);
    }
  };

  const handleViewEResource = (resourceId: string) => {
    recordViewMutation.mutate(resourceId);
  };

  const handleDownloadEResource = (resourceId: string) => {
    recordDownloadMutation.mutate(resourceId);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-40 md:col-span-2" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // No library card state
  if (!libraryCard) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Library</h1>
          <p className="text-muted-foreground">Browse catalog, manage borrowed books, and access e-resources</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Library Card</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              You don&apos;t have a library card yet. Please contact the library to get your card issued.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-muted-foreground">Browse catalog, manage borrowed books, and access e-resources</p>
      </div>

      {/* Library Card Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">My Library Card</CardTitle>
                <CardDescription className="font-mono">{libraryCard.cardNumber}</CardDescription>
              </div>
              <Badge variant={libraryCard.status === 'active' ? 'default' : 'destructive'}>
                {libraryCard.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Books Borrowed</span>
                <span className="font-medium">{libraryCard.currentIssued} / {libraryCard.maxBooks}</span>
              </div>
              <Progress value={(libraryCard.currentIssued / libraryCard.maxBooks) * 100} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valid Until</span>
                <span className="font-medium">{new Date(libraryCard.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length + currentIssues.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fines Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{libraryCard.finesDue}</div>
            <p className="text-xs text-muted-foreground">Pending payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mybooks" className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            <span className="hidden sm:inline">My Books</span>
          </TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Catalog</span>
          </TabsTrigger>
          <TabsTrigger value="eresources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">E-Resources</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* My Books Tab */}
        <TabsContent value="mybooks" className="space-y-4">
          {/* Currently Borrowed */}
          <Card>
            <CardHeader>
              <CardTitle>Currently Borrowed</CardTitle>
              <CardDescription>Books you currently have checked out</CardDescription>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : currentIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No books currently borrowed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentIssues.map((issue) => {
                    const daysUntilDue = getDaysUntilDue(issue.dueDate);
                    return (
                      <div key={issue.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{issue.book?.title || 'Unknown Book'}</h4>
                            <p className="text-sm text-muted-foreground">{issue.book?.authors?.join(', ') || 'Unknown Author'}</p>
                            {issue.book?.isbn && (
                              <p className="text-xs text-muted-foreground font-mono mt-1">ISBN: {issue.book.isbn}</p>
                            )}
                          </div>
                          {getStatusBadge(issue.status)}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Due: {new Date(issue.dueDate).toLocaleDateString()}</span>
                            </div>
                            {issue.status === 'overdue' ? (
                              <span className="text-destructive flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {Math.abs(daysUntilDue)} days overdue • ₹{issue.fineAmount} fine
                              </span>
                            ) : (
                              <span className={daysUntilDue <= 3 ? 'text-orange-500' : 'text-muted-foreground'}>
                                {daysUntilDue} days remaining
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {issue.renewCount < issue.maxRenewals && issue.status !== 'overdue' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRenewBook(issue.id)}
                                disabled={renewBookMutation.isPending}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Renew ({issue.maxRenewals - issue.renewCount} left)
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reservations */}
          <Card>
            <CardHeader>
              <CardTitle>My Reservations</CardTitle>
              <CardDescription>Books you have reserved</CardDescription>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : reservations.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No active reservations</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Reserved On</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((res) => (
                      <TableRow key={res.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{res.book?.title || 'Unknown Book'}</div>
                            <div className="text-sm text-muted-foreground">{res.book?.authors?.join(', ') || 'Unknown Author'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(res.reservationDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(res.expiryDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(res.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleCancelReservation(res.id)}
                            disabled={cancelReservationMutation.isPending}
                          >
                            Cancel
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

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Book Catalog</CardTitle>
              <CardDescription>Search and browse available books</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, author, ISBN..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat._count?.books || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {catalogLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : catalog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No books found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Available</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catalog.map((book) => {
                      const isAvailable = book.availableCopies > 0;
                      return (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.title}</TableCell>
                          <TableCell>{book.authors?.join(', ') || '-'}</TableCell>
                          <TableCell>{book.category?.name || '-'}</TableCell>
                          <TableCell className="text-center">
                            <span className={isAvailable ? 'text-green-600' : 'text-destructive'}>
                              {book.availableCopies}/{book.totalCopies}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedBook(book)}
                                >
                                  <Eye className="h-4 w-4 mr-1" /> View
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{book.title}</DialogTitle>
                                  <DialogDescription>by {book.authors?.join(', ') || 'Unknown Author'}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Category:</span>
                                      <p className="font-medium">{book.category?.name || 'Uncategorized'}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Availability:</span>
                                      <p className="font-medium">{book.availableCopies}/{book.totalCopies} copies</p>
                                    </div>
                                    {book.isbn && (
                                      <div>
                                        <span className="text-muted-foreground">ISBN:</span>
                                        <p className="font-medium font-mono">{book.isbn}</p>
                                      </div>
                                    )}
                                    {book.publisher && (
                                      <div>
                                        <span className="text-muted-foreground">Publisher:</span>
                                        <p className="font-medium">{book.publisher}</p>
                                      </div>
                                    )}
                                  </div>
                                  {book.description && (
                                    <div>
                                      <span className="text-muted-foreground text-sm">Description:</span>
                                      <p className="text-sm mt-1">{book.description}</p>
                                    </div>
                                  )}
                                  {!isAvailable && (
                                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm">
                                      <AlertCircle className="h-4 w-4 inline mr-2 text-yellow-600" />
                                      All copies are currently borrowed. You can reserve this book.
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  {isAvailable ? (
                                    <Button>
                                      <BookCopy className="h-4 w-4 mr-2" />
                                      Request to Borrow
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="secondary"
                                      onClick={() => handleReserveBook(book.id)}
                                      disabled={createReservationMutation.isPending}
                                    >
                                      <BookMarked className="h-4 w-4 mr-2" />
                                      Reserve Book
                                    </Button>
                                  )}
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-Resources Tab */}
        <TabsContent value="eresources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>E-Resources</CardTitle>
              <CardDescription>Digital books, journals, videos, and courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search e-resources..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ebook">eBooks</SelectItem>
                    <SelectItem value="journal">Journals</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {eResourcesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : eResources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No e-resources available</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {eResources.map((resource) => (
                    <div key={resource.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{resource.title}</h4>
                            <Badge variant="outline" className="capitalize">{resource.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{resource.category?.name || 'Uncategorized'}</p>
                          {resource.authors && resource.authors.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">by {resource.authors.join(', ')}</p>
                          )}
                        </div>
                        {getStatusBadge(getAccessTypeDisplay(resource.accessLevel))}
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        {resource.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleViewEResource(resource.id);
                              window.open(resource.url, '_blank');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        )}
                        {resource.downloadable && resource.fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleDownloadEResource(resource.id);
                              window.open(resource.fileUrl, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Button>
                        )}
                        {(resource.type === 'video' || resource.type === 'audio') && resource.url && (
                          <Button
                            size="sm"
                            onClick={() => {
                              handleViewEResource(resource.id);
                              window.open(resource.url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" /> Open
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Borrowing History</CardTitle>
              <CardDescription>Your past book borrowings</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No borrowing history yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Borrowed Date</TableHead>
                      <TableHead>Returned Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.book?.title || 'Unknown Book'}</div>
                            <div className="text-sm text-muted-foreground">{item.book?.authors?.join(', ') || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(item.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
