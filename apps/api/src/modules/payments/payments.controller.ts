import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  PaymentWebhookDto,
} from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create a Razorpay order for fee payment
   * POST /api/payments/create-order
   */
  @Post('create-order')
  createOrder(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-student-id') studentId: string,
    @Body() createOrderDto: CreatePaymentOrderDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!studentId) {
      throw new BadRequestException('Student ID is required');
    }
    return this.paymentsService.createOrder(tenantId, studentId, createOrderDto);
  }

  /**
   * Verify payment after Razorpay checkout
   * POST /api/payments/verify
   */
  @Post('verify')
  verifyPayment(
    @Headers('x-tenant-id') tenantId: string,
    @Body() verifyDto: VerifyPaymentDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.verifyPayment(tenantId, verifyDto);
  }

  /**
   * Razorpay webhook endpoint
   * POST /api/payments/webhook
   * This endpoint should NOT require authentication
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: PaymentWebhookDto,
  ) {
    if (!signature) {
      throw new BadRequestException('Webhook signature is required');
    }
    return this.paymentsService.handleWebhook(payload, signature);
  }

  /**
   * Get payment status by order ID
   * GET /api/payments/order/:orderId
   */
  @Get('order/:orderId')
  getPaymentStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.getPaymentStatus(tenantId, orderId);
  }

  /**
   * Get student's payment history
   * GET /api/payments/student/:studentId
   */
  @Get('student/:studentId')
  getStudentPaymentHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.getStudentPaymentHistory(
      tenantId,
      studentId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  /**
   * Get student's fees with summary
   * GET /api/payments/fees/:studentId
   */
  @Get('fees/:studentId')
  getStudentFees(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.paymentsService.getStudentFees(tenantId, studentId);
  }
}
