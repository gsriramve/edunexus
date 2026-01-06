-- AlterTable
ALTER TABLE "student_fees" ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "receiptNumber" TEXT,
ADD COLUMN     "transactionId" TEXT;

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentFeeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "receiptNumber" TEXT,
    "notes" JSONB,
    "webhookData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_razorpayOrderId_key" ON "payment_transactions"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "payment_transactions_tenantId_idx" ON "payment_transactions"("tenantId");

-- CreateIndex
CREATE INDEX "payment_transactions_razorpayOrderId_idx" ON "payment_transactions"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "payment_transactions_studentId_idx" ON "payment_transactions"("studentId");

-- CreateIndex
CREATE INDEX "student_fees_razorpayOrderId_idx" ON "student_fees"("razorpayOrderId");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_studentFeeId_fkey" FOREIGN KEY ("studentFeeId") REFERENCES "student_fees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
