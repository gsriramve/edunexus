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
  attendancePercentage?: string | number;
  // Invitation fields
  recipientName?: string;
  role?: string;
  inviteUrl?: string;
  inviterName?: string;
  expiryDays?: string;
  // Principal invitation fields (legacy)
  principalName?: string;
  customMessage?: string;
  invitationLink?: string;
  expiresAt?: string;
  daysRemaining?: string | number;
  reason?: string;
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

// Principal Invitation Template
export const principalInvitationTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div class="content">
      <h2>You're Invited!</h2>
      <p>Hello${data.principalName ? ` ${data.principalName}` : ''},</p>
      <p>You have been invited to join <strong>EduNexus</strong> as the Principal Administrator for <strong>${data.collegeName || 'a new college'}</strong>.</p>

      ${data.customMessage ? `
      <div class="info-box">
        <p style="margin: 0; font-style: italic;">"${data.customMessage}"</p>
      </div>
      ` : ''}

      <div class="info-box">
        <h3 style="margin-top: 0;">As Principal, you will be able to:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Manage departments and staff</li>
          <li>Oversee student records and academics</li>
          <li>Monitor attendance and fee collections</li>
          <li>Access comprehensive reports and analytics</li>
          <li>Configure college settings and branding</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="${data.invitationLink || '#'}" class="btn">Accept Invitation</a>
      </p>

      <div class="warning-box">
        <span class="icon">⏰</span>
        <span>This invitation will expire on <strong>${data.expiresAt || '7 days from now'}</strong>. Please accept before it expires.</span>
      </div>

      <p>If you did not expect this invitation or believe it was sent in error, you can safely ignore this email.</p>

      <p>
        Best regards,<br>
        <strong>EduNexus Team</strong>
      </p>
    </div>
  `;

  return baseLayout(content, `You're Invited to Manage ${data.collegeName || 'a College'} on EduNexus`);
};

// Generic Invitation Template (for all roles)
export const invitationTemplate = (data: EmailTemplateData): string => {
  const roleDescriptions: Record<string, string> = {
    PRINCIPAL: 'manage your institution as Principal Administrator',
    HOD: 'manage your department as Head of Department',
    TEACHER: 'access your classes and students as a Teacher',
    ADMIN_STAFF: 'manage administrative operations as Admin Staff',
    LAB_ASSISTANT: 'manage lab resources as Lab Assistant',
    STUDENT: 'access your academic portal as a Student',
    PARENT: 'monitor your child\'s progress as a Parent',
  };

  const rolePermissions: Record<string, string[]> = {
    PRINCIPAL: [
      'Manage departments and staff',
      'Oversee student records and academics',
      'Monitor attendance and fee collections',
      'Access comprehensive reports and analytics',
      'Configure college settings and branding',
    ],
    HOD: [
      'Manage department faculty',
      'Oversee curriculum and subjects',
      'Review student performance',
      'Access department reports',
    ],
    TEACHER: [
      'Manage your class schedules',
      'Mark attendance',
      'Enter and manage grades',
      'Communicate with students and parents',
    ],
    ADMIN_STAFF: [
      'Manage student records',
      'Process fee collections',
      'Handle transport and hostel operations',
      'Generate administrative reports',
    ],
    LAB_ASSISTANT: [
      'Manage lab equipment inventory',
      'Schedule lab sessions',
      'Track lab attendance',
      'Report equipment issues',
    ],
    STUDENT: [
      'View your attendance and grades',
      'Access study materials',
      'Pay fees online',
      'Track academic progress',
    ],
    PARENT: [
      'Monitor your child\'s attendance',
      'View academic performance',
      'Pay fees online',
      'Communicate with teachers',
    ],
  };

  const roleName = data.role || 'TEACHER';
  const description = roleDescriptions[roleName] || 'join the institution';
  const permissions = rolePermissions[roleName] || ['Access the platform'];

  const content = `
    <div class="content">
      <h2>You're Invited!</h2>
      <p>Hello ${data.recipientName || 'there'},</p>
      <p>You have been invited by <strong>${data.inviterName || 'an administrator'}</strong> to join <strong>${data.collegeName || 'EduNexus'}</strong> and ${description}.</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">As ${roleName.replace('_', ' ')}, you will be able to:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${permissions.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="${data.inviteUrl || '#'}" class="btn">Accept Invitation</a>
      </p>

      <div class="warning-box">
        <span class="icon">⏰</span>
        <span>This invitation will expire in <strong>${data.expiryDays || '7'} days</strong>. Please accept before it expires.</span>
      </div>

      <p>If you did not expect this invitation or believe it was sent in error, you can safely ignore this email.</p>

      <p>
        Best regards,<br>
        <strong>EduNexus Team</strong>
      </p>
    </div>
  `;

  return baseLayout(content, `You're Invited to ${data.collegeName || 'EduNexus'}`);
};

// Invitation Resent Template
export const invitationResentTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div class="content">
      <h2>Invitation Reminder</h2>
      <p>Hello${data.principalName ? ` ${data.principalName}` : ''},</p>
      <p>This is a reminder that you have a pending invitation to join <strong>EduNexus</strong> as the Principal Administrator for <strong>${data.collegeName || 'a college'}</strong>.</p>

      ${data.customMessage ? `
      <div class="info-box">
        <p style="margin: 0; font-style: italic;">"${data.customMessage}"</p>
      </div>
      ` : ''}

      <p style="text-align: center;">
        <a href="${data.invitationLink || '#'}" class="btn">Accept Invitation</a>
      </p>

      <div class="warning-box">
        <span class="icon">⏰</span>
        <span>This invitation will expire on <strong>${data.expiresAt || '7 days from now'}</strong>.</span>
      </div>

      <p>If you have any questions, please contact our support team.</p>

      <p>
        Best regards,<br>
        <strong>EduNexus Team</strong>
      </p>
    </div>
  `;

  return baseLayout(content, `Reminder: Accept Your EduNexus Invitation`);
};

// Tenant Activated Notification Template
export const tenantActivatedTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div class="content">
      <div class="success-icon"></div>
      <h2 style="text-align: center;">Your Account is Now Active!</h2>
      <p>Dear ${data.principalName || 'Administrator'},</p>
      <p>Great news! <strong>${data.collegeName || 'Your college'}</strong> has been activated on EduNexus. Your trial period has ended and you now have full access to all features.</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">What's Next?</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Complete your college profile and branding</li>
          <li>Set up departments and invite staff members</li>
          <li>Import student data or start enrolling students</li>
          <li>Configure fee structures and academic calendars</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="#" class="btn">Go to Dashboard</a>
      </p>

      <p>If you have any questions or need assistance, our support team is here to help.</p>

      <p>
        Best regards,<br>
        <strong>EduNexus Team</strong>
      </p>
    </div>
  `;

  return baseLayout(content, `${data.collegeName || 'Your College'} is Now Active on EduNexus`);
};

// Tenant Suspended Notification Template
export const tenantSuspendedTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div class="content">
      <h2 style="color: #DC2626;">Account Suspended</h2>
      <p>Dear ${data.principalName || 'Administrator'},</p>
      <p>We regret to inform you that <strong>${data.collegeName || 'your college'}</strong>'s access to EduNexus has been suspended.</p>

      ${data.reason ? `
      <div class="info-box" style="border-left-color: #DC2626;">
        <p style="margin: 0;"><strong>Reason:</strong> ${data.reason}</p>
      </div>
      ` : ''}

      <div class="warning-box" style="background-color: #FEE2E2; border-color: #DC2626;">
        <span class="icon">⚠️</span>
        <span>During suspension, users will not be able to access the platform. Data remains intact.</span>
      </div>

      <p>To resolve this issue and restore access, please contact our support team.</p>

      <p style="text-align: center;">
        <a href="mailto:support@edunexus.io" class="btn" style="background: #DC2626;">Contact Support</a>
      </p>

      <p>
        Regards,<br>
        <strong>EduNexus Team</strong>
      </p>
    </div>
  `;

  return baseLayout(content, `Important: Account Suspended - EduNexus`);
};

// Trial Expiring Warning Template
export const trialExpiringTemplate = (data: EmailTemplateData): string => {
  const content = `
    <div class="content">
      <h2>Your Trial is Ending Soon</h2>
      <p>Dear ${data.principalName || 'Administrator'},</p>
      <p>Your free trial for <strong>${data.collegeName || 'your college'}</strong> on EduNexus will expire in <strong>${data.daysRemaining || 'a few'} days</strong>.</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">Don't lose access to:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>All your student and staff data</li>
          <li>Academic records and attendance history</li>
          <li>Fee management and payment records</li>
          <li>Reports and analytics</li>
        </ul>
      </div>

      <div class="warning-box">
        <span class="icon">⏰</span>
        <span>Trial expires on: <strong>${data.expiresAt || 'Soon'}</strong></span>
      </div>

      <p>To continue using EduNexus without interruption, please contact our sales team to activate your subscription.</p>

      <p style="text-align: center;">
        <a href="mailto:sales@edunexus.io" class="btn">Contact Sales</a>
      </p>

      <p>
        Best regards,<br>
        <strong>EduNexus Team</strong>
      </p>
    </div>
  `;

  return baseLayout(content, `Your EduNexus Trial is Ending Soon`);
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

    case 'principal_invitation':
      return `
You're Invited to EduNexus!

Hello${data.principalName ? ` ${data.principalName}` : ''},

You have been invited to join EduNexus as the Principal Administrator for ${data.collegeName || 'a new college'}.

${data.customMessage ? `Message: "${data.customMessage}"` : ''}

As Principal, you will be able to:
- Manage departments and staff
- Oversee student records and academics
- Monitor attendance and fee collections
- Access comprehensive reports and analytics
- Configure college settings and branding

Accept your invitation by clicking this link:
${data.invitationLink || '[Invitation Link]'}

This invitation will expire on ${data.expiresAt || '7 days from now'}.

If you did not expect this invitation, you can safely ignore this email.

Best regards,
EduNexus Team
      `.trim();

    case 'invitation_resent':
      return `
Invitation Reminder - EduNexus

Hello${data.principalName ? ` ${data.principalName}` : ''},

This is a reminder that you have a pending invitation to join EduNexus as the Principal Administrator for ${data.collegeName || 'a college'}.

Accept your invitation by clicking this link:
${data.invitationLink || '[Invitation Link]'}

This invitation will expire on ${data.expiresAt || '7 days from now'}.

Best regards,
EduNexus Team
      `.trim();

    case 'tenant_activated':
      return `
Your College is Now Active on EduNexus!

Dear ${data.principalName || 'Administrator'},

Great news! ${data.collegeName || 'Your college'} has been activated on EduNexus. Your trial period has ended and you now have full access to all features.

Best regards,
EduNexus Team
      `.trim();

    case 'tenant_suspended':
      return `
Account Suspended - EduNexus

Dear ${data.principalName || 'Administrator'},

We regret to inform you that ${data.collegeName || 'your college'}'s access to EduNexus has been suspended.

${data.reason ? `Reason: ${data.reason}` : ''}

To resolve this issue and restore access, please contact our support team.

Regards,
EduNexus Team
      `.trim();

    case 'trial_expiring':
      return `
Your EduNexus Trial is Ending Soon

Dear ${data.principalName || 'Administrator'},

Your free trial for ${data.collegeName || 'your college'} on EduNexus will expire in ${data.daysRemaining || 'a few'} days.

Trial expires on: ${data.expiresAt || 'Soon'}

To continue using EduNexus without interruption, please contact our sales team.

Best regards,
EduNexus Team
      `.trim();

    case 'invitation':
      return `
You're Invited to ${data.collegeName || 'EduNexus'}!

Hello ${data.recipientName || 'there'},

You have been invited by ${data.inviterName || 'an administrator'} to join ${data.collegeName || 'EduNexus'} as ${data.role || 'a team member'}.

Accept your invitation by clicking this link:
${data.inviteUrl || '[Invitation Link]'}

This invitation will expire in ${data.expiryDays || '7'} days.

If you did not expect this invitation, you can safely ignore this email.

Best regards,
EduNexus Team
      `.trim();

    default:
      return 'Please view this email in an HTML-compatible email client.';
  }
};
