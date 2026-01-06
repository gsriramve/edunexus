// Email templates for EduNexus notifications

export interface EmailTemplateData {
  studentName?: string;
  parentName?: string;
  collegeName?: string;
  amount?: number;
  currency?: string;
  feeType?: string;
  dueDate?: string;
  paymentId?: string;
  receiptNumber?: string;
  transactionDate?: string;
  paymentMethod?: string;
  semester?: string;
  academicYear?: string;
  [key: string]: unknown;
}

// Base layout wrapper
const baseLayout = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f7;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px;
    }
    .content h2 {
      color: #4F46E5;
      margin-top: 0;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #4F46E5;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6c757d;
      font-weight: 500;
    }
    .info-value {
      color: #333;
      font-weight: 600;
    }
    .amount {
      font-size: 28px;
      font-weight: bold;
      color: #4F46E5;
      text-align: center;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 10px 0;
    }
    .btn-secondary {
      background: #6c757d;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #6c757d;
    }
    .footer a {
      color: #4F46E5;
      text-decoration: none;
    }
    .success-icon {
      width: 60px;
      height: 60px;
      background-color: #10B981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .success-icon::after {
      content: "✓";
      color: white;
      font-size: 30px;
    }
    .warning-box {
      background-color: #FEF3C7;
      border: 1px solid #F59E0B;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
    .warning-box .icon {
      font-size: 24px;
      margin-right: 10px;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
      .content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <div class="logo">E</div>
        <h1>EduNexus</h1>
      </div>
      ${content}
      <div class="footer">
        <p>This is an automated message from EduNexus.</p>
        <p>© ${new Date().getFullYear()} EduNexus. All rights reserved.</p>
        <p>
          <a href="#">Privacy Policy</a> •
          <a href="#">Terms of Service</a> •
          <a href="#">Contact Support</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Payment Receipt Template
export const paymentReceiptTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div class="content">
      <div class="success-icon"></div>
      <h2 style="text-align: center;">Payment Successful!</h2>
      <p>Dear ${data.studentName || data.parentName || 'Student'},</p>
      <p>Your payment has been successfully processed. Here are the details:</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Receipt Number</span>
          <span class="info-value">${data.receiptNumber || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Transaction ID</span>
          <span class="info-value">${data.paymentId || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fee Type</span>
          <span class="info-value">${data.feeType || 'Tuition Fee'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment Method</span>
          <span class="info-value">${data.paymentMethod || 'Online'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date</span>
          <span class="info-value">${data.transactionDate || new Date().toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      <div class="amount">
        ${data.currency || '₹'}${Number(data.amount || 0).toLocaleString('en-IN')}
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn">Download Receipt</a>
      </p>

      <p>Thank you for your payment. If you have any questions, please contact the accounts department.</p>
    </div>
  `;

  return baseLayout(content, 'Payment Receipt - EduNexus');
};

// Fee Reminder Template
export const feeReminderTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div class="content">
      <h2>Fee Payment Reminder</h2>
      <p>Dear ${data.parentName || data.studentName || 'Parent/Guardian'},</p>
      <p>This is a friendly reminder that the following fee payment is due:</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Student Name</span>
          <span class="info-value">${data.studentName || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fee Type</span>
          <span class="info-value">${data.feeType || 'Tuition Fee'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Semester</span>
          <span class="info-value">${data.semester || 'Current'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Due Date</span>
          <span class="info-value" style="color: #DC2626;">${data.dueDate || 'N/A'}</span>
        </div>
      </div>

      <div class="amount">
        ${data.currency || '₹'}${Number(data.amount || 0).toLocaleString('en-IN')}
      </div>

      <div class="warning-box">
        <span class="icon">⚠️</span>
        <span>Please make the payment by the due date to avoid late fees.</span>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn">Pay Now</a>
      </p>

      <p>If you have already made the payment, please disregard this message.</p>
    </div>
  `;

  return baseLayout(content, 'Fee Payment Reminder - EduNexus');
};

// Fee Overdue Template
export const feeOverdueTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div class="content">
      <h2 style="color: #DC2626;">Fee Payment Overdue</h2>
      <p>Dear ${data.parentName || data.studentName || 'Parent/Guardian'},</p>
      <p>This is an urgent reminder that the following fee payment is <strong>overdue</strong>:</p>

      <div class="info-box" style="border-left-color: #DC2626;">
        <div class="info-row">
          <span class="info-label">Student Name</span>
          <span class="info-value">${data.studentName || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fee Type</span>
          <span class="info-value">${data.feeType || 'Tuition Fee'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Original Due Date</span>
          <span class="info-value" style="color: #DC2626;">${data.dueDate || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount Due</span>
          <span class="info-value" style="color: #DC2626;">₹${Number(data.amount || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div class="warning-box" style="background-color: #FEE2E2; border-color: #DC2626;">
        <span class="icon">🚨</span>
        <span><strong>Important:</strong> Continued non-payment may result in additional late fees and restrictions on academic services.</span>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn" style="background: #DC2626;">Pay Now</a>
      </p>

      <p>If you are facing financial difficulties, please contact the accounts department to discuss payment options.</p>
    </div>
  `;

  return baseLayout(content, 'Urgent: Fee Payment Overdue - EduNexus');
};

// Welcome Email Template
export const welcomeTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div class="content">
      <h2>Welcome to EduNexus!</h2>
      <p>Dear ${data.studentName || 'Student'},</p>
      <p>Welcome to <strong>${data.collegeName || 'our college'}</strong>! Your account has been successfully created on EduNexus, our college management platform.</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">Getting Started</h3>
        <p>With EduNexus, you can:</p>
        <ul>
          <li>View your attendance and academic records</li>
          <li>Check and pay fees online</li>
          <li>Access exam schedules and results</li>
          <li>Download study materials</li>
          <li>Track your academic progress</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn">Login to Your Account</a>
      </p>

      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best wishes for your academic journey!</p>
    </div>
  `;

  return baseLayout(content, 'Welcome to EduNexus');
};

// Attendance Alert Template
export const attendanceAlertTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div class="content">
      <h2>Attendance Alert</h2>
      <p>Dear ${data.parentName || 'Parent/Guardian'},</p>
      <p>This is to inform you about your ward's attendance status:</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Student Name</span>
          <span class="info-value">${data.studentName || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Current Attendance</span>
          <span class="info-value" style="color: ${Number(data.attendancePercentage) < 75 ? '#DC2626' : '#10B981'};">${data.attendancePercentage || '0'}%</span>
        </div>
        <div class="info-row">
          <span class="info-label">Required Attendance</span>
          <span class="info-value">75%</span>
        </div>
      </div>

      ${Number(data.attendancePercentage) < 75 ? `
      <div class="warning-box">
        <span class="icon">⚠️</span>
        <span>Attendance is below the required minimum. Please ensure regular attendance to avoid academic consequences.</span>
      </div>
      ` : ''}

      <p>For detailed attendance records, please log in to the parent portal.</p>

      <p style="text-align: center;">
        <a href="#" class="btn">View Attendance</a>
      </p>
    </div>
  `;

  return baseLayout(content, 'Attendance Alert - EduNexus');
};

// Plain text versions for fallback
export const getPlainTextVersion = (type: string, data: EmailTemplateData): string => {
  switch (type) {
    case 'payment_receipt':
      return `
Payment Receipt - EduNexus

Dear ${data.studentName || data.parentName || 'Student'},

Your payment has been successfully processed.

Receipt Number: ${data.receiptNumber || 'N/A'}
Transaction ID: ${data.paymentId || 'N/A'}
Fee Type: ${data.feeType || 'Tuition Fee'}
Amount: ${data.currency || '₹'}${Number(data.amount || 0).toLocaleString('en-IN')}
Date: ${data.transactionDate || new Date().toLocaleDateString('en-IN')}

Thank you for your payment.

Best regards,
EduNexus Team
      `.trim();

    case 'fee_reminder':
      return `
Fee Payment Reminder - EduNexus

Dear ${data.parentName || data.studentName || 'Parent/Guardian'},

This is a reminder that the following fee payment is due:

Student Name: ${data.studentName || 'N/A'}
Fee Type: ${data.feeType || 'Tuition Fee'}
Amount: ${data.currency || '₹'}${Number(data.amount || 0).toLocaleString('en-IN')}
Due Date: ${data.dueDate || 'N/A'}

Please make the payment by the due date to avoid late fees.

Best regards,
EduNexus Team
      `.trim();

    default:
      return 'Please view this email in an HTML-compatible email client.';
  }
};
