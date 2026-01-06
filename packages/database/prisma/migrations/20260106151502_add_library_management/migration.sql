-- CreateTable
CREATE TABLE "book_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_books" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isbn" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT,
    "publishYear" INTEGER,
    "edition" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "pages" INTEGER,
    "description" TEXT,
    "coverImage" TEXT,
    "location" TEXT,
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(8,2),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_cards" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT,
    "staffId" TEXT,
    "cardNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "maxBooks" INTEGER NOT NULL DEFAULT 5,
    "currentBooks" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_issues" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "renewCount" INTEGER NOT NULL DEFAULT 0,
    "maxRenewals" INTEGER NOT NULL DEFAULT 2,
    "fineAmount" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "finePaid" BOOLEAN NOT NULL DEFAULT false,
    "fineWaived" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'issued',
    "remarks" TEXT,
    "issuedBy" TEXT,
    "returnedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_reservations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_resources" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "url" TEXT,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "format" TEXT,
    "accessType" TEXT NOT NULL DEFAULT 'open',
    "subjectId" TEXT,
    "publisher" TEXT,
    "publishYear" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "e_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "finePerDay" DECIMAL(6,2) NOT NULL DEFAULT 5,
    "maxFineAmount" DECIMAL(8,2) NOT NULL DEFAULT 500,
    "loanPeriodDays" INTEGER NOT NULL DEFAULT 14,
    "renewalPeriodDays" INTEGER NOT NULL DEFAULT 7,
    "maxRenewals" INTEGER NOT NULL DEFAULT 2,
    "reservationDays" INTEGER NOT NULL DEFAULT 3,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 1,
    "lostBookMultiplier" DECIMAL(3,1) NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_categories_tenantId_idx" ON "book_categories"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "book_categories_tenantId_code_key" ON "book_categories"("tenantId", "code");

-- CreateIndex
CREATE INDEX "library_books_tenantId_idx" ON "library_books"("tenantId");

-- CreateIndex
CREATE INDEX "library_books_title_idx" ON "library_books"("title");

-- CreateIndex
CREATE INDEX "library_books_author_idx" ON "library_books"("author");

-- CreateIndex
CREATE UNIQUE INDEX "library_books_tenantId_isbn_key" ON "library_books"("tenantId", "isbn");

-- CreateIndex
CREATE UNIQUE INDEX "library_cards_studentId_key" ON "library_cards"("studentId");

-- CreateIndex
CREATE INDEX "library_cards_tenantId_idx" ON "library_cards"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "library_cards_tenantId_cardNumber_key" ON "library_cards"("tenantId", "cardNumber");

-- CreateIndex
CREATE INDEX "book_issues_tenantId_idx" ON "book_issues"("tenantId");

-- CreateIndex
CREATE INDEX "book_issues_bookId_idx" ON "book_issues"("bookId");

-- CreateIndex
CREATE INDEX "book_issues_cardId_idx" ON "book_issues"("cardId");

-- CreateIndex
CREATE INDEX "book_issues_status_idx" ON "book_issues"("status");

-- CreateIndex
CREATE INDEX "book_reservations_tenantId_idx" ON "book_reservations"("tenantId");

-- CreateIndex
CREATE INDEX "book_reservations_bookId_idx" ON "book_reservations"("bookId");

-- CreateIndex
CREATE INDEX "book_reservations_cardId_idx" ON "book_reservations"("cardId");

-- CreateIndex
CREATE INDEX "e_resources_tenantId_idx" ON "e_resources"("tenantId");

-- CreateIndex
CREATE INDEX "e_resources_type_idx" ON "e_resources"("type");

-- CreateIndex
CREATE INDEX "e_resources_category_idx" ON "e_resources"("category");

-- CreateIndex
CREATE UNIQUE INDEX "library_settings_tenantId_key" ON "library_settings"("tenantId");

-- AddForeignKey
ALTER TABLE "book_categories" ADD CONSTRAINT "book_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "book_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_books" ADD CONSTRAINT "library_books_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "book_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_cards" ADD CONSTRAINT "library_cards_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_issues" ADD CONSTRAINT "book_issues_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "library_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_issues" ADD CONSTRAINT "book_issues_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "library_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_reservations" ADD CONSTRAINT "book_reservations_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "library_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_reservations" ADD CONSTRAINT "book_reservations_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "library_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
