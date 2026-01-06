import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateBookDto,
  UpdateBookDto,
  BookQueryDto,
  CreateCardDto,
  UpdateCardDto,
  CardQueryDto,
  IssueBookDto,
  ReturnBookDto,
  RenewBookDto,
  IssueQueryDto,
  CreateReservationDto,
  ReservationQueryDto,
  CreateEResourceDto,
  UpdateEResourceDto,
  EResourceQueryDto,
  UpdateSettingsDto,
} from './dto/library.dto';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // CATEGORIES
  // =============================================================================

  async createCategory(tenantId: string, dto: CreateCategoryDto) {
    return this.prisma.bookCategory.create({
      data: {
        tenantId,
        ...dto,
      },
    });
  }

  async findAllCategories(tenantId: string) {
    return this.prisma.bookCategory.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { books: true } },
        children: true,
      },
    });
  }

  async findCategoryById(tenantId: string, id: string) {
    const category = await this.prisma.bookCategory.findFirst({
      where: { id, tenantId },
      include: { books: { take: 10 }, children: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async updateCategory(tenantId: string, id: string, dto: UpdateCategoryDto) {
    await this.findCategoryById(tenantId, id);
    return this.prisma.bookCategory.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCategory(tenantId: string, id: string) {
    await this.findCategoryById(tenantId, id);
    return this.prisma.bookCategory.delete({ where: { id } });
  }

  // =============================================================================
  // BOOKS
  // =============================================================================

  async createBook(tenantId: string, dto: CreateBookDto) {
    const book = await this.prisma.libraryBook.create({
      data: {
        tenantId,
        ...dto,
        availableCopies: dto.totalCopies || 1,
      },
      include: { category: true },
    });
    return book;
  }

  async findAllBooks(tenantId: string, query: BookQueryDto) {
    const { search, categoryId, author, status, availableOnly, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (author) where.author = { contains: author, mode: 'insensitive' };
    if (status) where.status = status;
    if (availableOnly) where.availableCopies = { gt: 0 };

    const [books, total] = await Promise.all([
      this.prisma.libraryBook.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { title: 'asc' },
        include: { category: { select: { id: true, name: true, code: true } } },
      }),
      this.prisma.libraryBook.count({ where }),
    ]);

    return { data: books, total, limit, offset };
  }

  async findBookById(tenantId: string, id: string) {
    const book = await this.prisma.libraryBook.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        issues: {
          where: { status: 'issued' },
          include: { card: true },
        },
        reservations: {
          where: { status: 'pending' },
          include: { card: true },
        },
      },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async updateBook(tenantId: string, id: string, dto: UpdateBookDto) {
    const book = await this.findBookById(tenantId, id);

    // If totalCopies changed, adjust availableCopies
    let availableCopies = book.availableCopies;
    if (dto.totalCopies !== undefined) {
      const issuedCount = book.totalCopies - book.availableCopies;
      availableCopies = Math.max(0, dto.totalCopies - issuedCount);
    }

    return this.prisma.libraryBook.update({
      where: { id },
      data: { ...dto, availableCopies },
    });
  }

  async deleteBook(tenantId: string, id: string) {
    const book = await this.findBookById(tenantId, id);
    if (book.issues.length > 0) {
      throw new BadRequestException('Cannot delete book with active issues');
    }
    return this.prisma.libraryBook.delete({ where: { id } });
  }

  // =============================================================================
  // LIBRARY CARDS
  // =============================================================================

  async createCard(tenantId: string, dto: CreateCardDto) {
    if (!dto.studentId && !dto.staffId) {
      throw new BadRequestException('Either studentId or staffId is required');
    }

    // Check if card already exists
    if (dto.studentId) {
      const existing = await this.prisma.libraryCard.findFirst({
        where: { tenantId, studentId: dto.studentId },
      });
      if (existing) throw new BadRequestException('Student already has a library card');
    }

    // Generate card number
    const count = await this.prisma.libraryCard.count({ where: { tenantId } });
    const cardNumber = `LIB${String(count + 1).padStart(6, '0')}`;

    return this.prisma.libraryCard.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        staffId: dto.staffId,
        cardNumber,
        expiryDate: new Date(dto.expiryDate),
        maxBooks: dto.maxBooks || 5,
      },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
      },
    });
  }

  async findAllCards(tenantId: string, query: CardQueryDto) {
    const { search, status, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { cardNumber: { contains: search, mode: 'insensitive' } },
        { student: { user: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }
    if (status) where.status = status;

    const [cards, total] = await Promise.all([
      this.prisma.libraryCard.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          _count: { select: { issues: { where: { status: 'issued' } } } },
        },
      }),
      this.prisma.libraryCard.count({ where }),
    ]);

    return { data: cards, total, limit, offset };
  }

  async findCardById(tenantId: string, id: string) {
    const card = await this.prisma.libraryCard.findFirst({
      where: { id, tenantId },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        issues: {
          where: { status: 'issued' },
          include: { book: { select: { id: true, title: true, author: true } } },
        },
      },
    });
    if (!card) throw new NotFoundException('Library card not found');
    return card;
  }

  async getStudentCard(tenantId: string, studentId: string) {
    return this.prisma.libraryCard.findFirst({
      where: { tenantId, studentId },
      include: {
        issues: {
          where: { status: { in: ['issued', 'overdue'] } },
          include: { book: true },
          orderBy: { dueDate: 'asc' },
        },
        reservations: {
          where: { status: 'pending' },
          include: { book: true },
        },
      },
    });
  }

  async findCardByStudent(tenantId: string, studentId: string) {
    const card = await this.prisma.libraryCard.findFirst({
      where: { tenantId, studentId },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        issues: {
          where: { status: { in: ['issued', 'overdue'] } },
          include: { book: { select: { id: true, title: true, author: true } } },
          orderBy: { dueDate: 'asc' },
        },
        reservations: {
          where: { status: 'pending' },
          include: { book: { select: { id: true, title: true, author: true } } },
        },
      },
    });
    if (!card) throw new NotFoundException('Library card not found for this student');
    return card;
  }

  async updateCard(tenantId: string, id: string, dto: UpdateCardDto) {
    await this.findCardById(tenantId, id);
    return this.prisma.libraryCard.update({
      where: { id },
      data: {
        ...dto,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  // =============================================================================
  // BOOK ISSUES
  // =============================================================================

  async issueBook(tenantId: string, dto: IssueBookDto, issuedBy?: string) {
    // Verify book exists and is available
    const book = await this.prisma.libraryBook.findFirst({
      where: { id: dto.bookId, tenantId },
    });
    if (!book) throw new NotFoundException('Book not found');
    if (book.availableCopies <= 0) {
      throw new BadRequestException('No copies available');
    }

    // Verify card exists and is active
    const card = await this.prisma.libraryCard.findFirst({
      where: { id: dto.cardId, tenantId },
    });
    if (!card) throw new NotFoundException('Library card not found');
    if (card.status !== 'active') {
      throw new BadRequestException('Library card is not active');
    }
    if (card.currentBooks >= card.maxBooks) {
      throw new BadRequestException('Maximum book limit reached');
    }

    // Check if already has this book
    const existing = await this.prisma.bookIssue.findFirst({
      where: { bookId: dto.bookId, cardId: dto.cardId, status: 'issued' },
    });
    if (existing) {
      throw new BadRequestException('This book is already issued to this card');
    }

    // Get settings for loan period
    const settings = await this.getOrCreateSettings(tenantId);
    const loanDays = dto.loanDays || settings.loanPeriodDays;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDays);

    // Create issue and update book/card
    const [issue] = await this.prisma.$transaction([
      this.prisma.bookIssue.create({
        data: {
          tenantId,
          bookId: dto.bookId,
          cardId: dto.cardId,
          dueDate,
          maxRenewals: settings.maxRenewals,
          issuedBy,
          remarks: dto.remarks,
        },
        include: {
          book: { select: { title: true, author: true } },
          card: { include: { student: { include: { user: { select: { name: true } } } } } },
        },
      }),
      this.prisma.libraryBook.update({
        where: { id: dto.bookId },
        data: { availableCopies: { decrement: 1 } },
      }),
      this.prisma.libraryCard.update({
        where: { id: dto.cardId },
        data: { currentBooks: { increment: 1 } },
      }),
    ]);

    // Cancel any reservation for this book by this card
    await this.prisma.bookReservation.updateMany({
      where: { bookId: dto.bookId, cardId: dto.cardId, status: 'pending' },
      data: { status: 'collected' },
    });

    return issue;
  }

  async returnBook(tenantId: string, issueId: string, dto: ReturnBookDto, returnedTo?: string) {
    const issue = await this.prisma.bookIssue.findFirst({
      where: { id: issueId, tenantId, status: { in: ['issued', 'overdue'] } },
      include: { book: true },
    });
    if (!issue) throw new NotFoundException('Active issue not found');

    // Calculate fine
    const settings = await this.getOrCreateSettings(tenantId);
    const now = new Date();
    let fineAmount = 0;

    if (now > issue.dueDate) {
      const gracePeriod = new Date(issue.dueDate);
      gracePeriod.setDate(gracePeriod.getDate() + settings.gracePeriodDays);

      if (now > gracePeriod) {
        const overdueDays = Math.ceil(
          (now.getTime() - gracePeriod.getTime()) / (1000 * 60 * 60 * 24)
        );
        fineAmount = Math.min(
          overdueDays * Number(settings.finePerDay),
          Number(settings.maxFineAmount)
        );
      }
    }

    // Update issue and book/card
    const [updated] = await this.prisma.$transaction([
      this.prisma.bookIssue.update({
        where: { id: issueId },
        data: {
          returnDate: now,
          status: 'returned',
          fineAmount,
          fineWaived: dto.waiveFine || false,
          finePaid: dto.waiveFine || fineAmount === 0,
          returnedTo,
          remarks: dto.remarks || issue.remarks,
        },
      }),
      this.prisma.libraryBook.update({
        where: { id: issue.bookId },
        data: { availableCopies: { increment: 1 } },
      }),
      this.prisma.libraryCard.update({
        where: { id: issue.cardId },
        data: { currentBooks: { decrement: 1 } },
      }),
    ]);

    return updated;
  }

  async renewBook(tenantId: string, issueId: string, dto: RenewBookDto) {
    const issue = await this.prisma.bookIssue.findFirst({
      where: { id: issueId, tenantId, status: 'issued' },
    });
    if (!issue) throw new NotFoundException('Active issue not found');

    if (issue.renewCount >= issue.maxRenewals) {
      throw new BadRequestException('Maximum renewals reached');
    }

    // Check for reservations
    const reservation = await this.prisma.bookReservation.findFirst({
      where: { bookId: issue.bookId, status: 'pending' },
    });
    if (reservation) {
      throw new BadRequestException('Book has pending reservations');
    }

    const settings = await this.getOrCreateSettings(tenantId);
    const additionalDays = dto.additionalDays || settings.renewalPeriodDays;
    const newDueDate = new Date(issue.dueDate);
    newDueDate.setDate(newDueDate.getDate() + additionalDays);

    return this.prisma.bookIssue.update({
      where: { id: issueId },
      data: {
        dueDate: newDueDate,
        renewCount: { increment: 1 },
      },
    });
  }

  async findIssueById(tenantId: string, id: string) {
    const issue = await this.prisma.bookIssue.findFirst({
      where: { id, tenantId },
      include: {
        book: { select: { id: true, title: true, author: true, isbn: true } },
        card: {
          include: { student: { include: { user: { select: { name: true, email: true } } } } },
        },
      },
    });
    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  async findIssuesByCard(tenantId: string, cardId: string) {
    return this.prisma.bookIssue.findMany({
      where: { tenantId, cardId },
      orderBy: { createdAt: 'desc' },
      include: {
        book: { select: { id: true, title: true, author: true } },
      },
    });
  }

  async findAllIssues(tenantId: string, query: IssueQueryDto) {
    const { bookId, cardId, status, overdueOnly, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (bookId) where.bookId = bookId;
    if (cardId) where.cardId = cardId;
    if (status) where.status = status;
    if (overdueOnly) {
      where.status = 'issued';
      where.dueDate = { lt: new Date() };
    }

    const [issues, total] = await Promise.all([
      this.prisma.bookIssue.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          book: { select: { id: true, title: true, author: true } },
          card: {
            include: { student: { include: { user: { select: { name: true } } } } },
          },
        },
      }),
      this.prisma.bookIssue.count({ where }),
    ]);

    return { data: issues, total, limit, offset };
  }

  // =============================================================================
  // RESERVATIONS
  // =============================================================================

  async createReservation(tenantId: string, dto: CreateReservationDto) {
    // Verify book exists
    const book = await this.prisma.libraryBook.findFirst({
      where: { id: dto.bookId, tenantId },
    });
    if (!book) throw new NotFoundException('Book not found');

    // Verify card exists
    const card = await this.prisma.libraryCard.findFirst({
      where: { id: dto.cardId, tenantId, status: 'active' },
    });
    if (!card) throw new NotFoundException('Active library card not found');

    // Check existing reservation
    const existing = await this.prisma.bookReservation.findFirst({
      where: { bookId: dto.bookId, cardId: dto.cardId, status: 'pending' },
    });
    if (existing) {
      throw new BadRequestException('Already reserved this book');
    }

    const settings = await this.getOrCreateSettings(tenantId);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + settings.reservationDays);

    return this.prisma.bookReservation.create({
      data: {
        tenantId,
        bookId: dto.bookId,
        cardId: dto.cardId,
        expiryDate,
      },
      include: { book: true },
    });
  }

  async findReservationById(tenantId: string, id: string) {
    const reservation = await this.prisma.bookReservation.findFirst({
      where: { id, tenantId },
      include: {
        book: { select: { id: true, title: true, author: true, availableCopies: true } },
        card: {
          include: { student: { include: { user: { select: { name: true, email: true } } } } },
        },
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async cancelReservation(tenantId: string, id: string) {
    const reservation = await this.prisma.bookReservation.findFirst({
      where: { id, tenantId, status: 'pending' },
    });
    if (!reservation) throw new NotFoundException('Active reservation not found');

    return this.prisma.bookReservation.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async collectReservation(tenantId: string, id: string) {
    const reservation = await this.prisma.bookReservation.findFirst({
      where: { id, tenantId, status: { in: ['pending', 'ready'] } },
      include: { book: true },
    });
    if (!reservation) throw new NotFoundException('Active reservation not found');

    // Update reservation status
    return this.prisma.bookReservation.update({
      where: { id },
      data: { status: 'collected' },
    });
  }

  async findAllReservations(tenantId: string, query: ReservationQueryDto) {
    const { bookId, cardId, status, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };

    if (bookId) where.bookId = bookId;
    if (cardId) where.cardId = cardId;
    if (status) where.status = status;

    const [reservations, total] = await Promise.all([
      this.prisma.bookReservation.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          book: { select: { id: true, title: true, author: true } },
          card: {
            include: { student: { include: { user: { select: { name: true } } } } },
          },
        },
      }),
      this.prisma.bookReservation.count({ where }),
    ]);

    return { data: reservations, total, limit, offset };
  }

  // =============================================================================
  // E-RESOURCES
  // =============================================================================

  async createEResource(tenantId: string, dto: CreateEResourceDto) {
    return this.prisma.eResource.create({
      data: { tenantId, ...dto },
    });
  }

  async findAllEResources(tenantId: string, query: EResourceQueryDto) {
    const { search, type, category, accessType, limit = 50, offset = 0 } = query;

    const where: any = { tenantId, status: 'active' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (category) where.category = category;
    if (accessType) where.accessType = accessType;

    const [resources, total] = await Promise.all([
      this.prisma.eResource.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.eResource.count({ where }),
    ]);

    return { data: resources, total, limit, offset };
  }

  async findEResourceById(tenantId: string, id: string) {
    const resource = await this.prisma.eResource.findFirst({
      where: { id, tenantId },
    });
    if (!resource) throw new NotFoundException('E-Resource not found');
    return resource;
  }

  async updateEResource(tenantId: string, id: string, dto: UpdateEResourceDto) {
    await this.findEResourceById(tenantId, id);
    return this.prisma.eResource.update({
      where: { id },
      data: dto,
    });
  }

  async deleteEResource(tenantId: string, id: string) {
    await this.findEResourceById(tenantId, id);
    return this.prisma.eResource.delete({ where: { id } });
  }

  async incrementResourceView(tenantId: string, id: string) {
    return this.prisma.eResource.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async incrementResourceDownload(tenantId: string, id: string) {
    return this.prisma.eResource.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });
  }

  async recordView(tenantId: string, id: string) {
    await this.findEResourceById(tenantId, id);
    return this.incrementResourceView(tenantId, id);
  }

  async recordDownload(tenantId: string, id: string) {
    await this.findEResourceById(tenantId, id);
    return this.incrementResourceDownload(tenantId, id);
  }

  // =============================================================================
  // SETTINGS
  // =============================================================================

  async getSettings(tenantId: string) {
    return this.getOrCreateSettings(tenantId);
  }

  async getOrCreateSettings(tenantId: string) {
    let settings = await this.prisma.librarySettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      settings = await this.prisma.librarySettings.create({
        data: { tenantId },
      });
    }

    return settings;
  }

  async updateSettings(tenantId: string, dto: UpdateSettingsDto) {
    await this.getOrCreateSettings(tenantId);
    return this.prisma.librarySettings.update({
      where: { tenantId },
      data: dto,
    });
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  async getStats(tenantId: string) {
    const [
      totalBooks,
      totalCategories,
      activeCards,
      currentIssues,
      overdueIssues,
      totalEResources,
      pendingReservations,
    ] = await Promise.all([
      this.prisma.libraryBook.count({ where: { tenantId } }),
      this.prisma.bookCategory.count({ where: { tenantId } }),
      this.prisma.libraryCard.count({ where: { tenantId, status: 'active' } }),
      this.prisma.bookIssue.count({ where: { tenantId, status: 'issued' } }),
      this.prisma.bookIssue.count({
        where: { tenantId, status: 'issued', dueDate: { lt: new Date() } },
      }),
      this.prisma.eResource.count({ where: { tenantId, status: 'active' } }),
      this.prisma.bookReservation.count({ where: { tenantId, status: 'pending' } }),
    ]);

    const totalCopies = await this.prisma.libraryBook.aggregate({
      where: { tenantId },
      _sum: { totalCopies: true, availableCopies: true },
    });

    return {
      totalBooks,
      totalCopies: totalCopies._sum.totalCopies || 0,
      availableCopies: totalCopies._sum.availableCopies || 0,
      totalCategories,
      activeCards,
      currentIssues,
      overdueIssues,
      totalEResources,
      pendingReservations,
    };
  }
}
