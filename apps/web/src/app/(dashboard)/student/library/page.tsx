'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
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
  CreditCard,
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

// Mock data
const mockLibraryCard = {
  cardNumber: 'LIB000042',
  status: 'active',
  issueDate: '2023-08-01',
  expiryDate: '2026-12-31',
  currentBooks: 2,
  maxBooks: 5,
  totalBorrowed: 28,
  finesDue: 15,
};

const mockBorrowedBooks = [
  {
    id: '1',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0-13-468599-1',
    issueDate: '2026-01-01',
    dueDate: '2026-01-15',
    status: 'issued',
    renewCount: 0,
    maxRenewals: 2,
  },
  {
    id: '2',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas, Andrew Hunt',
    isbn: '978-0-13-595705-9',
    issueDate: '2025-12-20',
    dueDate: '2026-01-03',
    status: 'overdue',
    renewCount: 1,
    maxRenewals: 2,
    fine: 15,
  },
];

const mockReservations = [
  {
    id: '1',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Gang of Four',
    reservedAt: '2026-01-05',
    expiryDate: '2026-01-08',
    status: 'pending',
    queuePosition: 2,
  },
];

const mockBorrowHistory = [
  { title: 'Introduction to Algorithms', author: 'CLRS', borrowedDate: '2025-11-01', returnedDate: '2025-11-14' },
  { title: 'Database System Concepts', author: 'Silberschatz', borrowedDate: '2025-10-15', returnedDate: '2025-10-28' },
  { title: 'Computer Networks', author: 'Tanenbaum', borrowedDate: '2025-09-20', returnedDate: '2025-10-04' },
];

const mockCatalog = [
  { id: '1', title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming', available: true, copies: '2/5' },
  { id: '2', title: 'Design Patterns', author: 'Gang of Four', category: 'Software Engineering', available: false, copies: '0/3' },
  { id: '3', title: 'The Linux Command Line', author: 'William Shotts', category: 'Operating Systems', available: true, copies: '4/6' },
  { id: '4', title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Programming', available: true, copies: '1/4' },
  { id: '5', title: 'Structure and Interpretation of Computer Programs', author: 'Abelson & Sussman', category: 'Computer Science', available: true, copies: '3/5' },
];

const mockEResources = [
  { id: '1', title: 'Introduction to Algorithms (eBook)', type: 'ebook', category: 'Algorithms', accessType: 'open' },
  { id: '2', title: 'Machine Learning Fundamentals', type: 'video', category: 'AI/ML', accessType: 'open' },
  { id: '3', title: 'IEEE Transactions on Software Engineering', type: 'journal', category: 'Research', accessType: 'subscription' },
  { id: '4', title: 'Deep Learning Specialization', type: 'course', category: 'AI/ML', accessType: 'open' },
  { id: '5', title: 'ACM Digital Library - SIGPLAN', type: 'journal', category: 'Research', accessType: 'subscription' },
];

const mockCategories = [
  { id: '1', name: 'Programming', count: 45 },
  { id: '2', name: 'Software Engineering', count: 28 },
  { id: '3', name: 'Operating Systems', count: 15 },
  { id: '4', name: 'Computer Networks', count: 22 },
  { id: '5', name: 'AI/ML', count: 18 },
];

export default function StudentLibraryPage() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('mybooks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<typeof mockCatalog[0] | null>(null);

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
                <CardDescription className="font-mono">{mockLibraryCard.cardNumber}</CardDescription>
              </div>
              <Badge variant={mockLibraryCard.status === 'active' ? 'default' : 'destructive'}>
                {mockLibraryCard.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Books Borrowed</span>
                <span className="font-medium">{mockLibraryCard.currentBooks} / {mockLibraryCard.maxBooks}</span>
              </div>
              <Progress value={(mockLibraryCard.currentBooks / mockLibraryCard.maxBooks) * 100} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valid Until</span>
                <span className="font-medium">{mockLibraryCard.expiryDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLibraryCard.totalBorrowed}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fines Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{mockLibraryCard.finesDue}</div>
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
              {mockBorrowedBooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No books currently borrowed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockBorrowedBooks.map((book) => {
                    const daysUntilDue = getDaysUntilDue(book.dueDate);
                    return (
                      <div key={book.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{book.title}</h4>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-1">ISBN: {book.isbn}</p>
                          </div>
                          {getStatusBadge(book.status)}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Due: {book.dueDate}</span>
                            </div>
                            {book.status === 'overdue' ? (
                              <span className="text-destructive flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {Math.abs(daysUntilDue)} days overdue • ₹{book.fine} fine
                              </span>
                            ) : (
                              <span className={daysUntilDue <= 3 ? 'text-orange-500' : 'text-muted-foreground'}>
                                {daysUntilDue} days remaining
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {book.renewCount < book.maxRenewals && book.status !== 'overdue' && (
                              <Button variant="outline" size="sm">
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Renew ({book.maxRenewals - book.renewCount} left)
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
              {mockReservations.length === 0 ? (
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
                      <TableHead>Queue Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReservations.map((res) => (
                      <TableRow key={res.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{res.title}</div>
                            <div className="text-sm text-muted-foreground">{res.author}</div>
                          </div>
                        </TableCell>
                        <TableCell>{res.reservedAt}</TableCell>
                        <TableCell>{res.expiryDate}</TableCell>
                        <TableCell>#{res.queuePosition}</TableCell>
                        <TableCell>{getStatusBadge(res.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="text-destructive">
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
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {mockCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  {mockCatalog.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell className="text-center">
                        <span className={book.available ? 'text-green-600' : 'text-destructive'}>
                          {book.copies}
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
                              <DialogDescription>by {book.author}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Category:</span>
                                  <p className="font-medium">{book.category}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Availability:</span>
                                  <p className="font-medium">{book.copies} copies</p>
                                </div>
                              </div>
                              {!book.available && (
                                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm">
                                  <AlertCircle className="h-4 w-4 inline mr-2 text-yellow-600" />
                                  All copies are currently borrowed. You can reserve this book.
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              {book.available ? (
                                <Button>
                                  <BookCopy className="h-4 w-4 mr-2" />
                                  Request to Borrow
                                </Button>
                              ) : (
                                <Button variant="secondary">
                                  <BookMarked className="h-4 w-4 mr-2" />
                                  Reserve Book
                                </Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                    <SelectItem value="course">Courses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {mockEResources.map((resource) => (
                  <div key={resource.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{resource.title}</h4>
                          <Badge variant="outline" className="capitalize">{resource.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{resource.category}</p>
                      </div>
                      {getStatusBadge(resource.accessType)}
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      {resource.type === 'ebook' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                      )}
                      {(resource.type === 'video' || resource.type === 'course') && (
                        <Button size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" /> Open
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Borrowed Date</TableHead>
                    <TableHead>Returned Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBorrowHistory.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.author}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.borrowedDate}</TableCell>
                      <TableCell>{item.returnedDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
