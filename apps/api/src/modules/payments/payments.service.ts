import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  PaymentWebhookDto,
} from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }

  async createOrder(
    tenantId: string,
    studentId: string,
    createOrderDto: CreatePaymentOrderDto,
  ) {
    const { feeIds, amount, currency = 'INR', notes = {} } = createOrderDto;

    // Verify the student exists
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify all fees exist and belong to the student
    const fees = await this.prisma.studentFee.findMany({
      where: {
        id: { in: feeIds },
        studentId,
        tenantId,
        status: { in: ['pending', 'partial'] },
      },
    });

    if (fees.length !== feeIds.length) {
      throw new BadRequestException(
        'One or more fees are invalid or already paid',
      );
    }

    // Verify the amount matches
    const totalAmount = fees.reduce(
      (sum, fee) => sum + (Number(fee.amount) - Number(fee.paidAmount || 0)),
      0,
    );
    const expectedAmountInPaise = Math.round(totalAmount * 100);

    if (amount !== expectedAmountInPaise) {
      throw new BadRequestException(
        `Amount mismatch. Expected: ${expectedAmountInPaise} paise, Received: ${amount} paise`,
      );
    }

    // Generate receipt number
    const receiptNumber = `RCP-${Date.now()}-${studentId.slice(-6)}`;

    try {
      // Create Razorpay order
      const razorpayOrder = await this.razorpay.orders.create({
        amount,
        currency,
        receipt: receiptNumber,
        notes: {
          tenantId,
          studentId,
          feeIds: feeIds.join(','),
          studentEmail: student.user.email,
          studentName: student.user.name,
          ...notes,
        },
      });

      // Create payment transaction record
      await this.prisma.paymentTransaction.create({
        data: {
          tenantId,
          studentFeeId: feeIds[0], // Link to first fee (main reference)
          studentId,
          amount: totalAmount,
          currency,
          razorpayOrderId: razorpayOrder.id,
          status: 'created',
          receiptNumber,
          notes: {
            feeIds,
            ...notes,
          },
        },
      });

      // Update fees with order ID
      await this.prisma.studentFee.updateMany({
        where: { id: { in: feeIds } },
        data: { razorpayOrderId: razorpayOrder.id },
      });

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: receiptNumber,
        keyId: process.env.RAZORPAY_KEY_ID,
        studentName: student.user.name,
        studentEmail: student.user.email,
        description: `Fee payment for ${fees.map((f) => f.feeType).join(', ')}`,
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new InternalServerErrorException('Failed to create payment order');
    }
  }

  async verifyPayment(tenantId: string, verifyDto: VerifyPaymentDto) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, feeIds } =
      verifyDto;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Get payment details from Razorpay
    let payment;
    try {
      payment = await this.razorpay.payments.fetch(razorpayPaymentId);
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new InternalServerErrorException('Failed to verify payment');
    }

    if (payment.status !== 'captured') {
      throw new BadRequestException(
        `Payment not captured. Status: ${payment.status}`,
      );
    }

    // Update database in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update payment transaction
      const transaction = await tx.paymentTransaction.update({
        where: { razorpayOrderId },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          paymentMethod: payment.method,
          status: 'captured',
        },
      });

      // Update all fees as paid
      const now = new Date();
      await tx.studentFee.updateMany({
        where: { id: { in: feeIds } },
        data: {
          razorpayPaymentId,
          paymentMethod: payment.method,
          paidDate: now,
          status: 'paid',
          receiptNumber: transaction.receiptNumber,
        },
      });

      // Get updated fees
      const updatedFees = await tx.studentFee.findMany({
        where: { id: { in: feeIds } },
      });

      return {
        transaction,
        fees: updatedFees,
      };
    });

    // Send payment receipt email asynchronously
    try {
      // Get student and parent details
      const student = await this.prisma.student.findFirst({
        where: { id: result.transaction.studentId },
        include: {
          user: true,
          parent: {
            include: { user: true },
          },
        },
      });

      if (student) {
        const parentRecord = student.parent?.[0];
        const feeTypes = result.fees.map((f) => f.feeType).join(', ');

        await this.notificationsService.queuePaymentReceipt({
          studentId: student.id,
          studentName: student.user.name,
          studentEmail: student.user.email,
          parentEmail: parentRecord?.user?.email,
          parentName: parentRecord?.user?.name,
          amount: Number(payment.amount) / 100,
          feeType: feeTypes,
          paymentId: razorpayPaymentId,
          receiptNumber: result.transaction.receiptNumber || undefined,
          paymentMethod: payment.method,
        });

        this.logger.log(`Payment receipt email queued for student ${student.id}`);

        // Send push notification to student
        await this.notificationsService.queuePaymentSuccessPush(
          student.userId,
          student.tenantId,
          student.user.name,
          Number(payment.amount) / 100,
          result.transaction.receiptNumber || razorpayPaymentId,
        );

        // Send push notification to parent if available
        if (parentRecord) {
          await this.notificationsService.queuePaymentSuccessPush(
            parentRecord.userId,
            parentRecord.tenantId,
            student.user.name,
            Number(payment.amount) / 100,
            result.transaction.receiptNumber || razorpayPaymentId,
          );
        }

        this.logger.log(`Payment success push notifications queued`);
      }
    } catch (emailError) {
      // Don't fail the payment verification if email fails
      this.logger.error('Failed to queue payment receipt email:', emailError);
    }

    return {
      success: true,
      message: 'Payment verified successfully',
      receiptNumber: result.transaction.receiptNumber,
      paymentId: razorpayPaymentId,
      method: payment.method,
      amount: Number(payment.amount) / 100, // Convert paise to INR
      fees: result.fees,
    };
  }

  async handleWebhook(payload: PaymentWebhookDto, signature: string) {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = payload.event;

    switch (event) {
      case 'payment.captured': {
        const payment = payload.payload.payment?.entity;
        if (payment) {
          await this.handlePaymentCaptured(payment);
        }
        break;
      }
      case 'payment.failed': {
        const payment = payload.payload.payment?.entity;
        if (payment) {
          await this.handlePaymentFailed(payment);
        }
        break;
      }
      case 'order.paid': {
        const order = payload.payload.order?.entity;
        if (order) {
          await this.handleOrderPaid(order);
        }
        break;
      }
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return { received: true };
  }

  private async handlePaymentCaptured(payment: any) {
    const { order_id, id: paymentId, method, amount } = payment;

    try {
      // Update transaction
      await this.prisma.paymentTransaction.update({
        where: { razorpayOrderId: order_id },
        data: {
          razorpayPaymentId: paymentId,
          paymentMethod: method,
          status: 'captured',
          webhookData: payment,
        },
      });

      // Update associated fees
      await this.prisma.studentFee.updateMany({
        where: { razorpayOrderId: order_id },
        data: {
          razorpayPaymentId: paymentId,
          paymentMethod: method,
          paidDate: new Date(),
          paidAmount: amount / 100,
          status: 'paid',
        },
      });

      console.log(`Payment captured: ${paymentId} for order ${order_id}`);
    } catch (error) {
      console.error('Error handling payment captured webhook:', error);
    }
  }

  private async handlePaymentFailed(payment: any) {
    const {
      order_id,
      id: paymentId,
      error_code,
      error_description,
      error_reason,
    } = payment;

    try {
      // Update transaction
      await this.prisma.paymentTransaction.update({
        where: { razorpayOrderId: order_id },
        data: {
          razorpayPaymentId: paymentId,
          status: 'failed',
          webhookData: payment,
        },
      });

      // Update associated fees
      await this.prisma.studentFee.updateMany({
        where: { razorpayOrderId: order_id },
        data: {
          failureReason: `${error_code}: ${error_description} (${error_reason})`,
        },
      });

      console.log(`Payment failed: ${paymentId} for order ${order_id}`);
    } catch (error) {
      console.error('Error handling payment failed webhook:', error);
    }
  }

  private async handleOrderPaid(order: any) {
    // Order paid is a confirmation that payment was successful
    console.log(`Order paid: ${order.id}`);
  }

  async getPaymentStatus(tenantId: string, orderId: string) {
    const transaction = await this.prisma.paymentTransaction.findFirst({
      where: { razorpayOrderId: orderId, tenantId },
      include: {
        student: {
          include: { user: true },
        },
        studentFee: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Payment transaction not found');
    }

    return transaction;
  }

  async getStudentPaymentHistory(
    tenantId: string,
    studentId: string,
    limit = 20,
    offset = 0,
  ) {
    const [transactions, total] = await Promise.all([
      this.prisma.paymentTransaction.findMany({
        where: { studentId, tenantId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          studentFee: true,
        },
      }),
      this.prisma.paymentTransaction.count({
        where: { studentId, tenantId },
      }),
    ]);

    return {
      data: transactions,
      total,
      limit,
      offset,
    };
  }

  async getStudentFees(tenantId: string, studentId: string) {
    const fees = await this.prisma.studentFee.findMany({
      where: { studentId, tenantId },
      orderBy: { dueDate: 'asc' },
    });

    const pendingFees = fees.filter((f) =>
      ['pending', 'partial'].includes(f.status),
    );
    const paidFees = fees.filter((f) => f.status === 'paid');
    const totalPending = pendingFees.reduce(
      (sum, f) => sum + (Number(f.amount) - Number(f.paidAmount || 0)),
      0,
    );
    const totalPaid = paidFees.reduce((sum, f) => sum + Number(f.paidAmount || f.amount), 0);

    return {
      fees,
      summary: {
        totalPending,
        totalPaid,
        pendingCount: pendingFees.length,
        paidCount: paidFees.length,
      },
    };
  }
}
