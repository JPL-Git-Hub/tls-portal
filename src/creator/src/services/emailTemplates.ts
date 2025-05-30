/**
 * Email templates for Gmail-based email service
 */

import { EmailTemplate, EmailTemplateData } from './EmailInterface';

export function getEmailTemplate(template: EmailTemplate, data: EmailTemplateData): { subject: string; html: string; text: string } {
  switch (template) {
    case EmailTemplate.CLIENT_WELCOME:
      return getClientWelcomeEmail(data);
    
    case EmailTemplate.LAWYER_NOTIFICATION:
      return getLawyerNotificationEmail(data);
    
    case EmailTemplate.PASSWORD_RESET:
      return getPasswordResetEmail(data);
    
    case EmailTemplate.DOCUMENT_UPLOADED:
      return getDocumentUploadedEmail(data);
    
    case EmailTemplate.DOCUMENT_SHARED:
      return getDocumentSharedEmail(data);
    
    case EmailTemplate.PAYMENT_RECEIVED:
      return getPaymentReceivedEmail(data);
    
    case EmailTemplate.INVOICE_CREATED:
      return getInvoiceCreatedEmail(data);
    
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

function getClientWelcomeEmail(data: EmailTemplateData) {
  const { recipientName, portalUrl } = data;
  
  const subject = 'Welcome to Your Client Portal';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Your Client Portal</h1>
          </div>
          <div class="content">
            <p>Hi ${recipientName || 'there'},</p>
            
            <p>Your secure client portal has been created! You can access it anytime at:</p>
            
            <p style="text-align: center;">
              <a href="${portalUrl}" class="button">Access Your Portal</a>
            </p>
            
            <p><strong>Your portal URL:</strong><br>
            <a href="${portalUrl}">${portalUrl}</a></p>
            
            <p>This portal is where you can:</p>
            <ul>
              <li>View and download your documents</li>
              <li>Track the status of your matters</li>
              <li>Communicate securely with your legal team</li>
              <li>Access invoices and payment information</li>
            </ul>
            
            <p>Please bookmark this link for easy access. If you have any questions, don't hesitate to reach out.</p>
            
            <p>Best regards,<br>
            The Legal Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} The Law Shop. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Welcome to Your Client Portal

Hi ${recipientName || 'there'},

Your secure client portal has been created! You can access it anytime at:
${portalUrl}

This portal is where you can:
- View and download your documents
- Track the status of your matters
- Communicate securely with your legal team
- Access invoices and payment information

Please bookmark this link for easy access. If you have any questions, don't hesitate to reach out.

Best regards,
The Legal Team

This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} The Law Shop. All rights reserved.
  `;
  
  return { subject, html, text };
}

function getLawyerNotificationEmail(data: EmailTemplateData) {
  const subject = 'New Client Portal Created';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Client Portal Created</h1>
          </div>
          <div class="content">
            <p>A new client has created their portal through the web form.</p>
            
            <div class="info-box">
              <h3>Client Information</h3>
              <p><strong>Name:</strong> ${data.clientName}<br>
              <strong>Email:</strong> <a href="mailto:${data.clientEmail}">${data.clientEmail}</a><br>
              <strong>Phone:</strong> ${data.clientPhone}<br>
              <strong>Portal:</strong> <a href="${data.portalUrl}">${data.portalUrl}</a><br>
              <strong>Created:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>Please follow up with the client to:</p>
            <ul>
              <li>Confirm their portal access</li>
              <li>Schedule an initial consultation if needed</li>
              <li>Upload any relevant documents to their portal</li>
            </ul>
            
            <p>The client has been sent a welcome email with their portal access information.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from the TLS Portal system.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
New Client Portal Created

A new client has created their portal through the web form.

Client Information:
- Name: ${data.clientName}
- Email: ${data.clientEmail}
- Phone: ${data.clientPhone}
- Portal: ${data.portalUrl}
- Created: ${new Date().toLocaleString()}

Please follow up with the client to:
- Confirm their portal access
- Schedule an initial consultation if needed
- Upload any relevant documents to their portal

The client has been sent a welcome email with their portal access information.

This is an automated notification from the TLS Portal system.
  `;
  
  return { subject, html, text };
}

function getPasswordResetEmail(data: EmailTemplateData) {
  const { recipientName, resetUrl, resetToken } = data;
  
  const subject = 'Password Reset Request';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .code-box { background: #fff; padding: 15px; margin: 15px 0; border: 2px solid #ddd; text-align: center; font-family: monospace; font-size: 18px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${recipientName || 'there'},</p>
            
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>Or use this code:</p>
            <div class="code-box">${resetToken}</div>
            
            <p><strong>Important:</strong> This link and code will expire in 1 hour for security reasons.</p>
            
            <p>If you're having trouble with the button above, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            
            <p>Best regards,<br>
            The Law Shop Security Team</p>
          </div>
          <div class="footer">
            <p>This is an automated security message. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} The Law Shop. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Password Reset Request

Hi ${recipientName || 'there'},

We received a request to reset your password. If you didn't make this request, you can safely ignore this email.

To reset your password, visit: ${resetUrl}

Or use this code: ${resetToken}

Important: This link and code will expire in 1 hour for security reasons.

Best regards,
The Law Shop Security Team

This is an automated security message. Please do not reply to this email.
© ${new Date().getFullYear()} The Law Shop. All rights reserved.
  `;
  
  return { subject, html, text };
}

function getDocumentUploadedEmail(data: EmailTemplateData) {
  const { recipientName, documentName, documentType, portalUrl } = data;
  
  const subject = `New Document Uploaded: ${documentName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .document-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3b82f6; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Document Available</h1>
          </div>
          <div class="content">
            <p>Hi ${recipientName || 'there'},</p>
            
            <p>A new document has been uploaded to your client portal:</p>
            
            <div class="document-box">
              <h3>${documentName}</h3>
              <p><strong>Type:</strong> ${documentType || 'Document'}<br>
              <strong>Uploaded:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p style="text-align: center;">
              <a href="${portalUrl}" class="button">View in Portal</a>
            </p>
            
            <p>You can download this document and view all your files in your secure client portal.</p>
            
            <p>Best regards,<br>
            The Legal Team</p>
          </div>
          <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} The Law Shop. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
New Document Available

Hi ${recipientName || 'there'},

A new document has been uploaded to your client portal:

Document: ${documentName}
Type: ${documentType || 'Document'}
Uploaded: ${new Date().toLocaleString()}

You can view and download this document in your portal: ${portalUrl}

Best regards,
The Legal Team

This is an automated notification. Please do not reply to this email.
© ${new Date().getFullYear()} The Law Shop. All rights reserved.
  `;
  
  return { subject, html, text };
}

function getDocumentSharedEmail(data: EmailTemplateData) {
  const { recipientName, documentName, documentUrl, sharedBy } = data;
  
  const subject = `Document Shared With You: ${documentName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8b5cf6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .share-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #8b5cf6; }
          .button { display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Document Shared With You</h1>
          </div>
          <div class="content">
            <p>Hi ${recipientName || 'there'},</p>
            
            <p>${sharedBy || 'Someone'} has shared a document with you:</p>
            
            <div class="share-box">
              <h3>${documentName}</h3>
              <p><strong>Shared by:</strong> ${sharedBy || 'Your legal team'}<br>
              <strong>Shared on:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p style="text-align: center;">
              <a href="${documentUrl}" class="button">View Document</a>
            </p>
            
            <p>This document will be available for 30 days. Please download it if you need to keep a copy.</p>
            
            <p>Best regards,<br>
            The Law Shop</p>
          </div>
          <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} The Law Shop. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Document Shared With You

Hi ${recipientName || 'there'},

${sharedBy || 'Someone'} has shared a document with you:

Document: ${documentName}
Shared by: ${sharedBy || 'Your legal team'}
Shared on: ${new Date().toLocaleString()}

View document: ${documentUrl}

This document will be available for 30 days. Please download it if you need to keep a copy.

Best regards,
The Law Shop

This is an automated notification. Please do not reply to this email.
© ${new Date().getFullYear()} The Law Shop. All rights reserved.
  `;
  
  return { subject, html, text };
}

function getPaymentReceivedEmail(data: EmailTemplateData) {
  const { recipientName, amount, paymentMethod, invoiceNumber } = data;
  
  const subject = 'Payment Received - Thank You!';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .payment-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Received</h1>
          </div>
          <div class="content">
            <p>Hi ${recipientName || 'there'},</p>
            
            <p>Thank you for your payment! We've successfully received your payment.</p>
            
            <div class="payment-box">
              <h3>Payment Details</h3>
              <p><strong>Amount:</strong> $${amount}<br>
              <strong>Payment Method:</strong> ${paymentMethod || 'Credit Card'}<br>
              ${invoiceNumber ? `<strong>Invoice Number:</strong> ${invoiceNumber}<br>` : ''}
              <strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>A receipt has been sent to your email address. You can also view your payment history in your client portal.</p>
            
            <p>If you have any questions about this payment, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            The Law Shop Billing Team</p>
          </div>
          <div class="footer">
            <p>This is an automated receipt. Please keep it for your records.</p>
            <p>&copy; ${new Date().getFullYear()} The Law Shop. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Payment Received

Hi ${recipientName || 'there'},

Thank you for your payment! We've successfully received your payment.

Payment Details:
- Amount: $${amount}
- Payment Method: ${paymentMethod || 'Credit Card'}
${invoiceNumber ? `- Invoice Number: ${invoiceNumber}` : ''}
- Date: ${new Date().toLocaleString()}

A receipt has been sent to your email address. You can also view your payment history in your client portal.

If you have any questions about this payment, please don't hesitate to contact us.

Best regards,
The Law Shop Billing Team

This is an automated receipt. Please keep it for your records.
© ${new Date().getFullYear()} The Law Shop. All rights reserved.
  `;
  
  return { subject, html, text };
}

function getInvoiceCreatedEmail(data: EmailTemplateData) {
  const { recipientName, invoiceNumber, amount, dueDate, portalUrl } = data;
  
  const subject = `New Invoice #${invoiceNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .invoice-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b; }
          .button { display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Invoice Available</h1>
          </div>
          <div class="content">
            <p>Hi ${recipientName || 'there'},</p>
            
            <p>A new invoice has been created for your account:</p>
            
            <div class="invoice-box">
              <h3>Invoice #${invoiceNumber}</h3>
              <p><strong>Amount Due:</strong> $${amount}<br>
              <strong>Due Date:</strong> ${dueDate}<br>
              <strong>Status:</strong> Pending Payment</p>
            </div>
            
            <p style="text-align: center;">
              <a href="${portalUrl}" class="button">View & Pay Invoice</a>
            </p>
            
            <p>You can view the full invoice details and make a payment through your secure client portal.</p>
            
            <p>If you have any questions about this invoice, please contact us.</p>
            
            <p>Best regards,<br>
            The Law Shop Billing Team</p>
          </div>
          <div class="footer">
            <p>This is an automated billing notification.</p>
            <p>&copy; ${new Date().getFullYear()} The Law Shop. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
New Invoice Available

Hi ${recipientName || 'there'},

A new invoice has been created for your account:

Invoice #${invoiceNumber}
Amount Due: $${amount}
Due Date: ${dueDate}
Status: Pending Payment

You can view and pay this invoice in your portal: ${portalUrl}

If you have any questions about this invoice, please contact us.

Best regards,
The Law Shop Billing Team

This is an automated billing notification.
© ${new Date().getFullYear()} The Law Shop. All rights reserved.
  `;
  
  return { subject, html, text };
}