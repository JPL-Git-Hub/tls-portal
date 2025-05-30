/**
 * Email service interface and types
 * Provides a unified interface for both Gmail SMTP and Google Workspace API implementations
 */

export interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailService {
  sendEmail(options: EmailOptions): Promise<void>;
  sendBulkEmails?(recipients: string[], options: Omit<EmailOptions, 'to'>): Promise<void>;
}

export interface EmailTemplateData {
  // Common data for all templates
  recipientName?: string;
  recipientEmail: string;
  
  // Client welcome email
  portalUrl?: string;
  
  // Password reset
  resetToken?: string;
  resetUrl?: string;
  
  // Document notification
  documentName?: string;
  documentUrl?: string;
  documentType?: string;
  
  // Generic template data
  [key: string]: any;
}

export enum EmailTemplate {
  CLIENT_WELCOME = 'client_welcome',
  LAWYER_NOTIFICATION = 'lawyer_notification',
  PASSWORD_RESET = 'password_reset',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_SHARED = 'document_shared',
  PAYMENT_RECEIVED = 'payment_received',
  INVOICE_CREATED = 'invoice_created'
}