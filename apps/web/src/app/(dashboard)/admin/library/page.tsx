'use client';

import { useState } from 'react';
import {
  BookOpen,
  FolderTree,
  CreditCard,
  BookMarked,
  FileText,
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RotateCcw,
  Check,
  Download,
  BookCopy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Textarea } from '@/components/ui/textarea';
import { useTenantId } from '@/hooks/use-tenant';
import {
  useBooks,
  useCategories,
  useLibraryCards,
  useBookIssues,
  useEResources,
  useLibrarySettings,
  useLibraryStats,
  useUpdateLibrarySettings,
} from '@/hooks/use-library';
import type { LibraryBook, BookCategory, LibraryCard, BookIssue, EResource, LibrarySettings } from '@/lib/api';

// Default settings for fallback
const defaultSettings: LibrarySettings = {
  finePerDay: 5,
  maxFineAmount: 500,
  loanPeriodDays: 14,
  renewalPeriodDays: 7,
  maxRenewals: 2,
  reservationDays: 3,
  gracePeriodDays: 1,
  lostBookMultiplier: 2,
};

export default function AdminLibraryPage() {
  const tenantId = useTenantId() || '';
  const [activeTab, setActiveTab] = useState('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBookDialog, setShowAddBookDialog] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showAddResourceDialog, setShowAddResourceDialog] = useState(false);
  const [showIssueBookDialog, setShowIssueBookDialog] = useState(false);

  // Fetch all library data using real API hooks
  const { data: booksData, isLoading: booksLoading } = useBooks(tenantId);
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories(tenantId);
  const { data: cardsData, isLoading: cardsLoading } = useLibraryCards(tenantId);
  const { data: issuesData, isLoading: issuesLoading } = useBookIssues(tenantId);
  const { data: eResourcesData, isLoading: eResourcesLoading } = useEResources(tenantId);
  const { data: settingsData, isLoading: settingsLoading } = useLibrarySettings(tenantId);
  const { data: statsData, isLoading: statsLoading } = useLibraryStats(tenantId);
  const updateSettingsMutation = useUpdateLibrarySettings(tenantId);

  // Use API data with fallbacks
  const books = booksData?.data || [];
  const categories = categoriesData?.data || [];
  const cards = cardsData?.data || [];
  const issues = issuesData?.data || [];
  const eResources = eResourcesData?.data || [];
  const settings = settingsData || defaultSettings;
  const stats = statsData || {
    totalBooks: 0,
    totalCopies: 0,
    availableCopies: 0,
    activeCards: 0,
    currentIssues: 0,
    overdueBooks: 0,
    totalEResources: 0,
    pendingReservations: 0,
  };

  // Local state for settings form
  const [localSettings, setLocalSettings] = useState<LibrarySettings>(defaultSettings);

  // Update local settings when API data loads
  useState(() => {
    if (settingsData) {
      setLocalSettings(settingsData);
    }
  });

  const handleSaveSettings = async () => {
    await updateSettingsMutation.mutateAsync(localSettings);
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      available: { variant: 'default', label: 'Available' },
      limited: { variant: 'secondary', label: 'Limited' },
      unavailable: { variant: 'destructive', label: 'Unavailable' },
      active: { variant: 'default', label: 'Active' },
      suspended: { variant: 'destructive', label: 'Suspended' },
      expired: { variant: 'secondary', label: 'Expired' },
      issued: { variant: 'secondary', label: 'Issued' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      returned: { variant: 'outline', label: 'Returned' },
      open: { variant: 'default', label: 'Open Access' },
      subscription: { variant: 'secondary', label: 'Subscription' },
      restricted: { variant: 'outline', label: 'Restricted' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Library Management</h1>
          <p className="text-muted-foreground">Manage books, cards, issues and e-resources</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalBooks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{stats.availableCopies.toLocaleString()} available</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Cards</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.activeCards.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Library memberships</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.currentIssues}</div>
                <p className="text-xs text-destructive">{stats.overdueBooks} overdue</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">E-Resources</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalEResources}</div>
                <p className="text-xs text-muted-foreground">Digital content</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="books" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Books</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Cards</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            <span className="hidden sm:inline">Issues</span>
          </TabsTrigger>
          <TabsTrigger value="eresources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">E-Resources</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Book Catalog</CardTitle>
                  <CardDescription>Manage library book inventory</CardDescription>
                </div>
                <Dialog open={showAddBookDialog} onOpenChange={setShowAddBookDialog}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" /> Add Book</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Book</DialogTitle>
                      <DialogDescription>Enter book details to add to the catalog</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label>ISBN</Label>
                        <Input placeholder="978-0-13-468599-1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Title</Label>
                        <Input placeholder="Enter book title" />
                      </div>
                      <div className="space-y-2">
                        <Label>Author</Label>
                        <Input placeholder="Enter author name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Publisher</Label>
                        <Input placeholder="Enter publisher" />
                      </div>
                      <div className="space-y-2">
                        <Label>Publish Year</Label>
                        <Input type="number" placeholder="2024" />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Copies</Label>
                        <Input type="number" placeholder="5" defaultValue="1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input placeholder="Shelf A-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (₹)</Label>
                        <Input type="number" placeholder="500" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Enter book description" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddBookDialog(false)}>Cancel</Button>
                      <Button onClick={() => setShowAddBookDialog(false)}>Add Book</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search books by title, author, ISBN..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Copies</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell className="text-center">{book.availableCopies}/{book.totalCopies}</TableCell>
                      <TableCell>{getStatusBadge(book.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Book Categories</CardTitle>
                  <CardDescription>Organize books by category</CardDescription>
                </div>
                <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                      <DialogDescription>Create a new book category</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Category Name</Label>
                        <Input placeholder="e.g., Data Structures" />
                      </div>
                      <div className="space-y-2">
                        <Label>Category Code</Label>
                        <Input placeholder="e.g., DSA" maxLength={5} />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Optional description" />
                      </div>
                      <div className="space-y-2">
                        <Label>Parent Category (Optional)</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None (Top Level)</SelectItem>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>Cancel</Button>
                      <Button onClick={() => setShowAddCategoryDialog(false)}>Create Category</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-center">Books</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-mono">{category.code}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-center">{category.bookCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Library Cards</CardTitle>
                  <CardDescription>Manage student library memberships</CardDescription>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" /> Issue New Card</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name, roll no, card number..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card Number</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead className="text-center">Books</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-mono">{card.cardNumber}</TableCell>
                      <TableCell className="font-medium">{card.studentName}</TableCell>
                      <TableCell>{card.rollNo}</TableCell>
                      <TableCell className="text-center">{card.currentBooks}/{card.maxBooks}</TableCell>
                      <TableCell>{card.expiryDate}</TableCell>
                      <TableCell>{getStatusBadge(card.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Book Issues</CardTitle>
                  <CardDescription>Track book loans and returns</CardDescription>
                </div>
                <Dialog open={showIssueBookDialog} onOpenChange={setShowIssueBookDialog}>
                  <DialogTrigger asChild>
                    <Button><BookCopy className="h-4 w-4 mr-2" /> Issue Book</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Issue Book</DialogTitle>
                      <DialogDescription>Issue a book to a library card holder</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Book</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
                          <SelectContent>
                            {books.filter(b => b.availableCopies > 0).map(book => (
                              <SelectItem key={book.id} value={book.id}>{book.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Library Card</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select card" /></SelectTrigger>
                          <SelectContent>
                            {cards.filter(c => c.status === 'active').map(card => (
                              <SelectItem key={card.id} value={card.id}>{card.cardNumber} - {card.studentName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Loan Period (days)</Label>
                        <Input type="number" defaultValue="14" />
                      </div>
                      <div className="space-y-2">
                        <Label>Remarks (Optional)</Label>
                        <Textarea placeholder="Any additional notes" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowIssueBookDialog(false)}>Cancel</Button>
                      <Button onClick={() => setShowIssueBookDialog(false)}>Issue Book</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by book, student, card number..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Card #</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.bookTitle}</TableCell>
                      <TableCell>{issue.studentName}</TableCell>
                      <TableCell className="font-mono">{issue.cardNumber}</TableCell>
                      <TableCell>{issue.issueDate}</TableCell>
                      <TableCell>{issue.dueDate}</TableCell>
                      <TableCell>{getStatusBadge(issue.status)}</TableCell>
                      <TableCell className="text-right">
                        {issue.status !== 'returned' && (
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm">
                              <RotateCcw className="h-4 w-4 mr-1" /> Renew
                            </Button>
                            <Button variant="default" size="sm">
                              <Check className="h-4 w-4 mr-1" /> Return
                            </Button>
                          </div>
                        )}
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>E-Resources</CardTitle>
                  <CardDescription>Digital books, journals, and learning materials</CardDescription>
                </div>
                <Dialog open={showAddResourceDialog} onOpenChange={setShowAddResourceDialog}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" /> Add E-Resource</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add E-Resource</DialogTitle>
                      <DialogDescription>Add a new digital resource to the library</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2 col-span-2">
                        <Label>Title</Label>
                        <Input placeholder="Enter resource title" />
                      </div>
                      <div className="space-y-2">
                        <Label>Author</Label>
                        <Input placeholder="Enter author" />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ebook">eBook</SelectItem>
                            <SelectItem value="journal">Journal</SelectItem>
                            <SelectItem value="paper">Research Paper</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="course">Course</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input placeholder="e.g., Algorithms" />
                      </div>
                      <div className="space-y-2">
                        <Label>Access Type</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select access" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open Access</SelectItem>
                            <SelectItem value="restricted">Restricted</SelectItem>
                            <SelectItem value="subscription">Subscription</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>URL</Label>
                        <Input placeholder="https://..." />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Enter description" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddResourceDialog(false)}>Cancel</Button>
                      <Button onClick={() => setShowAddResourceDialog(false)}>Add Resource</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search e-resources..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ebook">eBooks</SelectItem>
                    <SelectItem value="journal">Journals</SelectItem>
                    <SelectItem value="paper">Papers</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Access" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Access</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-center">Downloads</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.title}</TableCell>
                      <TableCell>{resource.author}</TableCell>
                      <TableCell className="capitalize">{resource.type}</TableCell>
                      <TableCell>{resource.category}</TableCell>
                      <TableCell className="text-center">{resource.views}</TableCell>
                      <TableCell className="text-center">{resource.downloads}</TableCell>
                      <TableCell>{getStatusBadge(resource.accessType)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Library Settings</CardTitle>
              <CardDescription>Configure library policies and fine rules</CardDescription>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Loan Settings</h3>
                  <div className="space-y-2">
                    <Label>Loan Period (days)</Label>
                    <Input
                      type="number"
                      value={localSettings.loanPeriodDays}
                      onChange={(e) => setLocalSettings({ ...localSettings, loanPeriodDays: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Default number of days a book can be borrowed</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Renewal Period (days)</Label>
                    <Input
                      type="number"
                      value={localSettings.renewalPeriodDays}
                      onChange={(e) => setLocalSettings({ ...localSettings, renewalPeriodDays: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Days added when renewing a book</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Renewals</Label>
                    <Input
                      type="number"
                      value={localSettings.maxRenewals}
                      onChange={(e) => setLocalSettings({ ...localSettings, maxRenewals: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">How many times a book can be renewed</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Reservation Period (days)</Label>
                    <Input
                      type="number"
                      value={localSettings.reservationDays}
                      onChange={(e) => setLocalSettings({ ...localSettings, reservationDays: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Days to collect a reserved book</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Fine Settings</h3>
                  <div className="space-y-2">
                    <Label>Fine Per Day (₹)</Label>
                    <Input
                      type="number"
                      value={localSettings.finePerDay}
                      onChange={(e) => setLocalSettings({ ...localSettings, finePerDay: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Daily fine for overdue books</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Fine (₹)</Label>
                    <Input
                      type="number"
                      value={localSettings.maxFineAmount}
                      onChange={(e) => setLocalSettings({ ...localSettings, maxFineAmount: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Cap on total fine per book</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Grace Period (days)</Label>
                    <Input
                      type="number"
                      value={localSettings.gracePeriodDays}
                      onChange={(e) => setLocalSettings({ ...localSettings, gracePeriodDays: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Days after due date before fines apply</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Lost Book Multiplier</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={localSettings.lostBookMultiplier}
                      onChange={(e) => setLocalSettings({ ...localSettings, lostBookMultiplier: parseFloat(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Multiplier applied to book price for lost books</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveSettings} disabled={updateSettingsMutation.isPending}>
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
