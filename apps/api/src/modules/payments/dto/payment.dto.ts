import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsObject,
} from 'class-validator';

export class CreatePaymentOrderDto {
  @IsArray()
  @IsString({ each: true })
  feeIds: string[];

  @IsNumber()
  @Min(100) // Minimum 1 INR (100 paise)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @IsObject()
  @IsOptional()
  notes?: Record<string, string>;
}

export class VerifyPaymentDto {
  @IsString()
  razorpayOrderId: string;

  @IsString()
  razorpayPaymentId: string;

  @IsString()
  razorpaySignature: string;

  @IsArray()
  @IsString({ each: true })
  feeIds: string[];
}

export class PaymentWebhookDto {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        description?: string;
        bank?: string;
        wallet?: string;
        vpa?: string;
        email: string;
        contact: string;
        fee?: number;
        tax?: number;
        error_code?: string;
        error_description?: string;
        error_source?: string;
        error_step?: string;
        error_reason?: string;
        notes?: Record<string, string>;
        created_at: number;
      };
    };
    order?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        receipt: string;
        status: string;
        notes?: Record<string, string>;
        created_at: number;
      };
    };
  };
  created_at: number;
}

export class PaymentQueryDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  offset?: number;
}
