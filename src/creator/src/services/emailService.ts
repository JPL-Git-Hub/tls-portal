/**
 * Gmail SMTP Email Service Implementation
 * Simplified email service using Gmail SMTP for all environments
 */

import nodemailer from 'nodemailer';
import type { Client } from '@tls-portal/shared';
import { EmailService, EmailOptions, EmailTemplate, EmailTemplateData } from './EmailInterface';
import { getEmailTemplate } from './emailTemplates';

export class GmailSMTPService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Gmail SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER || '',
        pass: process.env.GMAIL_APP_PASSWORD || '' // Use App Password, not regular password
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });

    // Verify connection on initialization
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Gmail SMTP service connected successfully');
    } catch (error) {
      console.error('Gmail SMTP connection failed:', error);
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Failed to connect to Gmail SMTP service');
      }
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: options.from || process.env.GMAIL_FROM || process.env.GMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
      attachments: options.attachments
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendBulkEmails(recipients: string[], options: Omit<EmailOptions, 'to'>): Promise<void> {
    // Gmail has rate limits, so batch carefully
    const batchSize = 20;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.all(
        batch.map(to => this.sendEmail({ ...options, to }))
      );
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    throw new Error('Email service not initialized. Call initializeEmailService() first.');
  }
  return emailService;
}

export function initializeEmailService() {
  if (emailService) return;

  try {
    // Check which service to use based on environment variables
    if (process.env.USE_GOOGLE_WORKSPACE_API === 'true' && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use Google Workspace API (imported dynamically to avoid circular dependencies)
      const { GoogleWorkspaceEmailService } = require('./GoogleWorkspaceEmailService');
      emailService = new GoogleWorkspaceEmailService();
      console.log('Using Google Workspace API for emails');
    } else {
      // Default to Gmail SMTP
      emailService = new GmailSMTPService();
      console.log('Using Gmail SMTP for emails');
    }
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

// Helper function to send templated emails
export async function sendTemplatedEmail(template: EmailTemplate, data: EmailTemplateData) {
  const emailService = getEmailService();
  const { subject, html, text } = getEmailTemplate(template, data);
  
  await emailService.sendEmail({
    to: data.recipientEmail,
    subject,
    html,
    text
  });
}

export async function sendClientWelcomeEmail(client: Client) {
  await sendTemplatedEmail(EmailTemplate.CLIENT_WELCOME, {
    recipientName: client.profile.firstName,
    recipientEmail: client.profile.email,
    portalUrl: client.portalUrl
  });
}

export async function sendNotificationToLawyer(client: Client) {
  const lawyerEmail = process.env.LAWYER_NOTIFICATION_EMAIL || 'lawyer@thelawshop.com';
  
  try {
    await sendTemplatedEmail(EmailTemplate.LAWYER_NOTIFICATION, {
      recipientEmail: lawyerEmail,
      clientName: `${client.profile.firstName} ${client.profile.lastName}`,
      clientEmail: client.profile.email,
      clientPhone: client.profile.mobile,
      portalUrl: client.portalUrl
    });
  } catch (error) {
    console.error('Failed to send lawyer notification:', error);
    // Don't throw - lawyer notification is not critical
  }
}

// Additional email functions for new templates
export async function sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string) {
  await sendTemplatedEmail(EmailTemplate.PASSWORD_RESET, {
    recipientEmail: email,
    resetToken,
    resetUrl
  });
}

export async function sendDocumentUploadedEmail(client: Client, documentName: string, documentType?: string) {
  await sendTemplatedEmail(EmailTemplate.DOCUMENT_UPLOADED, {
    recipientName: client.profile.firstName,
    recipientEmail: client.profile.email,
    documentName,
    documentType,
    portalUrl: client.portalUrl
  });
}

export async function sendDocumentSharedEmail(recipientEmail: string, recipientName: string, documentName: string, documentUrl: string, sharedBy?: string) {
  await sendTemplatedEmail(EmailTemplate.DOCUMENT_SHARED, {
    recipientEmail,
    recipientName,
    documentName,
    documentUrl,
    sharedBy
  });
}

export async function sendPaymentReceivedEmail(client: Client, amount: string, paymentMethod?: string, invoiceNumber?: string) {
  await sendTemplatedEmail(EmailTemplate.PAYMENT_RECEIVED, {
    recipientName: client.profile.firstName,
    recipientEmail: client.profile.email,
    amount,
    paymentMethod,
    invoiceNumber
  });
}

export async function sendInvoiceCreatedEmail(client: Client, invoiceNumber: string, amount: string, dueDate: string) {
  await sendTemplatedEmail(EmailTemplate.INVOICE_CREATED, {
    recipientName: client.profile.firstName,
    recipientEmail: client.profile.email,
    invoiceNumber,
    amount,
    dueDate,
    portalUrl: client.portalUrl
  });
}