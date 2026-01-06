// SMS templates for EduNexus notifications
// Note: SMS templates must be registered with DLT (Distributed Ledger Technology)
// in India for compliance. Template IDs should be configured in environment.

export interface SmsTemplateData {
  studentName?: string;
  parentName?: string;
  amount?: number;
  feeType?: string;
  dueDate?: string;
  receiptNumber?: string;
  attendancePercentage?: number;
  collegeName?: string;
  otp?: string;
  [key: string]: unknown;
}

export enum SmsTemplateType {
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  FEE_REMINDER = 'fee_reminder',
  FEE_OVERDUE = 'fee_overdue',
  ATTENDANCE_ALERT = 'attendance_alert',
  OTP = 'otp',
  WELCOME = 'welcome',
  EXAM_REMINDER = 'exam_reminder',
  RESULT_PUBLISHED = 'result_published',
}

// SMS Templates (max 160 characters for single SMS, 306 for long SMS)
// These templates should match DLT registered templates

const templates: Record<SmsTemplateType, (data: SmsTemplateData) => string> = {
  [SmsTemplateType.PAYMENT_CONFIRMATION]: (data) =>
    `Dear Parent, Payment of Rs.${data.amount} for ${data.studentName} (${data.feeType}) received successfully. Receipt: ${data.receiptNumber}. -EduNexus`,

  [SmsTemplateType.FEE_REMINDER]: (data) =>
    `Dear Parent, Fee payment of Rs.${data.amount} for ${data.studentName} (${data.feeType}) is due on ${data.dueDate}. Please pay on time. -EduNexus`,

  [SmsTemplateType.FEE_OVERDUE]: (data) =>
    `URGENT: Fee of Rs.${data.amount} for ${data.studentName} (${data.feeType}) is overdue. Please pay immediately to avoid penalty. -EduNexus`,

  [SmsTemplateType.ATTENDANCE_ALERT]: (data) =>
    `Alert: ${data.studentName}'s attendance is ${data.attendancePercentage}%, below required 75%. Please ensure regular attendance. -EduNexus`,

  [SmsTemplateType.OTP]: (data) =>
    `Your EduNexus OTP is ${data.otp}. Valid for 10 minutes. Do not share with anyone. -EduNexus`,

  [SmsTemplateType.WELCOME]: (data) =>
    `Welcome to EduNexus! ${data.studentName} has been registered at ${data.collegeName}. Download our app for updates. -EduNexus`,

  [SmsTemplateType.EXAM_REMINDER]: (data) =>
    `Reminder: ${data.studentName}'s ${data.feeType} exam is scheduled for ${data.dueDate}. All the best! -EduNexus`,

  [SmsTemplateType.RESULT_PUBLISHED]: (data) =>
    `Results declared! ${data.studentName}'s ${data.feeType} results are now available on EduNexus portal. Login to view. -EduNexus`,
};

export function getSmsTemplate(type: SmsTemplateType, data: SmsTemplateData): string {
  const templateFn = templates[type];
  if (!templateFn) {
    throw new Error(`Unknown SMS template type: ${type}`);
  }
  return templateFn(data);
}

// DLT Template IDs mapping (to be configured based on registered templates)
export const DLT_TEMPLATE_IDS: Partial<Record<SmsTemplateType, string>> = {
  [SmsTemplateType.PAYMENT_CONFIRMATION]: process.env.MSG91_DLT_PAYMENT_TEMPLATE_ID,
  [SmsTemplateType.FEE_REMINDER]: process.env.MSG91_DLT_FEE_REMINDER_TEMPLATE_ID,
  [SmsTemplateType.FEE_OVERDUE]: process.env.MSG91_DLT_FEE_OVERDUE_TEMPLATE_ID,
  [SmsTemplateType.ATTENDANCE_ALERT]: process.env.MSG91_DLT_ATTENDANCE_TEMPLATE_ID,
  [SmsTemplateType.OTP]: process.env.MSG91_DLT_OTP_TEMPLATE_ID,
  [SmsTemplateType.WELCOME]: process.env.MSG91_DLT_WELCOME_TEMPLATE_ID,
};

// Validate phone number (Indian format)
export function validateIndianPhone(phone: string): { valid: boolean; formatted: string } {
  // Remove spaces, dashes, and country code
  let cleaned = phone.replace(/[\s-]/g, '');

  // Remove +91 or 91 prefix if present
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  }

  // Check if it's a valid 10-digit Indian mobile number
  const isValid = /^[6-9]\d{9}$/.test(cleaned);

  return {
    valid: isValid,
    formatted: isValid ? `91${cleaned}` : phone, // MSG91 expects 91XXXXXXXXXX format
  };
}
