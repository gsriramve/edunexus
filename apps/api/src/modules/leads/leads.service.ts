import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { CreateLeadDto, UpdateLeadDto, LeadResponseDto, LeadStatus, LeadSource } from './dto/leads.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);
  private readonly salesEmail = process.env.SALES_NOTIFICATION_EMAIL || 'gsriramv@gmail.com';

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createLead(dto: CreateLeadDto): Promise<LeadResponseDto> {
    this.logger.log(`Creating new lead: ${dto.email} from ${dto.institutionName}`);

    // Save lead to database
    const lead = await this.prisma.lead.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        institutionName: dto.institutionName,
        message: dto.message,
        source: dto.source || LeadSource.WEBSITE,
        status: LeadStatus.NEW,
      },
    });

    // Send notification email to sales team
    await this.sendLeadNotification(lead);

    this.logger.log(`Lead created successfully: ${lead.id}`);
    return this.mapToResponse(lead);
  }

  private async sendLeadNotification(lead: any): Promise<void> {
    try {
      const html = this.getLeadNotificationHtml(lead);
      const text = this.getLeadNotificationText(lead);

      await this.emailService.sendEmail({
        to: this.salesEmail,
        subject: `🎯 New Lead: ${lead.institutionName} - ${lead.name}`,
        templateType: 'custom' as any,
        customHtml: html,
        customText: text,
      });

      this.logger.log(`Lead notification sent to ${this.salesEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send lead notification: ${error.message}`);
      // Don't throw - lead is already saved, notification failure shouldn't fail the request
    }
  }

  private getLeadNotificationHtml(lead: any): string {
    const demoUrl = process.env.DEMO_URL || 'http://15.206.243.177';
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af, #0d9488); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #1e40af; font-size: 12px; text-transform: uppercase; }
    .value { font-size: 16px; margin-top: 4px; }
    .message-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #0d9488; margin-top: 15px; }
    .cta { text-align: center; margin-top: 20px; }
    .btn { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { text-align: center; padding: 15px; color: #6b7280; font-size: 12px; }
    .badge { display: inline-block; background: #059669; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Lead from EduNexus Website</h1>
      <span class="badge">NEW LEAD</span>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Contact Name</div>
        <div class="value">${lead.name}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${lead.email}">${lead.email}</a></div>
      </div>
      ${lead.phone ? `
      <div class="field">
        <div class="label">Phone</div>
        <div class="value"><a href="tel:${lead.phone}">${lead.phone}</a></div>
      </div>
      ` : ''}
      <div class="field">
        <div class="label">Institution</div>
        <div class="value" style="font-size: 18px; color: #1e40af;">${lead.institutionName}</div>
      </div>
      ${lead.message ? `
      <div class="message-box">
        <div class="label">Message</div>
        <div class="value">${lead.message}</div>
      </div>
      ` : ''}
      <div class="field" style="margin-top: 20px;">
        <div class="label">Received At</div>
        <div class="value">${new Date(lead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
      </div>
      <div class="cta">
        <a href="mailto:${lead.email}?subject=RE: EduNexus Demo Request - ${lead.institutionName}&body=Hi ${lead.name},%0D%0A%0D%0AThank you for your interest in EduNexus!%0D%0A%0D%0AI'd love to schedule a demo to show you how EduNexus can help ${lead.institutionName}.%0D%0A%0D%0AWould any of these times work for a 30-minute call?%0D%0A%0D%0ABest regards" class="btn">
          📧 Reply to Lead
        </a>
      </div>
    </div>
    <div class="footer">
      <p>Lead captured from EduNexus website contact form</p>
      <p>Demo Environment: <a href="${demoUrl}">${demoUrl}</a></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getLeadNotificationText(lead: any): string {
    return `
NEW LEAD FROM EDUNEXUS WEBSITE
==============================

Contact Name: ${lead.name}
Email: ${lead.email}
${lead.phone ? `Phone: ${lead.phone}` : ''}
Institution: ${lead.institutionName}
${lead.message ? `\nMessage:\n${lead.message}` : ''}

Received: ${new Date(lead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

---
Reply to: ${lead.email}
Demo URL: ${process.env.DEMO_URL || 'http://15.206.243.177'}
    `.trim();
  }

  async getLeads(status?: LeadStatus): Promise<LeadResponseDto[]> {
    const leads = await this.prisma.lead.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return leads.map(this.mapToResponse);
  }

  async getLeadById(id: string): Promise<LeadResponseDto | null> {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    return lead ? this.mapToResponse(lead) : null;
  }

  async updateLead(id: string, dto: UpdateLeadDto): Promise<LeadResponseDto> {
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
      },
    });
    return this.mapToResponse(lead);
  }

  private mapToResponse(lead: any): LeadResponseDto {
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      institutionName: lead.institutionName,
      message: lead.message,
      status: lead.status as LeadStatus,
      source: lead.source as LeadSource,
      createdAt: lead.createdAt,
      notes: lead.notes,
    };
  }
}
