/**
 * Email service for sending notifications
 */

import nodemailer from 'nodemailer';
import type { Client } from '@tls-portal/shared';

// Email transport configuration
let transporter: nodemailer.Transporter | null = null;

export function initializeEmailService() {
  if (transporter) return;

  if (process.env.NODE_ENV === 'production') {
    // Production: Use real email service
    // Could be SendGrid, AWS SES, or SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      console.warn('Email service not configured in production. Emails will not be sent.');
    }
  } else {
    // Development: Use console output or ethereal email
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
    
    console.log('Email service initialized in DEVELOPMENT mode');
    console.log('Emails will be logged to console');
  }
}

export async function sendClientWelcomeEmail(client: Client) {
  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      // Development: Just log the email
      console.log('\n=== EMAIL NOTIFICATION ===');
      console.log('To:', client.profile.email);
      console.log('Subject: Welcome to Your Client Portal');
      console.log('Portal URL:', client.portalUrl);
      console.log('========================\n');
      return;
    }
    throw new Error('Email service not initialized');
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@thelawshop.com',
    to: client.profile.email,
    subject: 'Welcome to Your Client Portal',
    html: `
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
              <p>Hi ${client.profile.firstName},</p>
              
              <p>Your secure client portal has been created! You can access it anytime at:</p>
              
              <p style="text-align: center;">
                <a href="${client.portalUrl}" class="button">Access Your Portal</a>
              </p>
              
              <p><strong>Your portal URL:</strong><br>
              <a href="${client.portalUrl}">${client.portalUrl}</a></p>
              
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
    `,
    text: `
Welcome to Your Client Portal

Hi ${client.profile.firstName},

Your secure client portal has been created! You can access it anytime at:
${client.portalUrl}

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
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // In development with ethereal, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw in development - just log
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

export async function sendNotificationToLawyer(client: Client) {
  const lawyerEmail = process.env.LAWYER_NOTIFICATION_EMAIL || 'lawyer@thelawshop.com';
  
  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      // Development: Just log the notification
      console.log('\n=== LAWYER NOTIFICATION ===');
      console.log('To:', lawyerEmail);
      console.log('Subject: New Client Portal Created');
      console.log('Client:', `${client.profile.firstName} ${client.profile.lastName}`);
      console.log('Email:', client.profile.email);
      console.log('Phone:', client.profile.mobile);
      console.log('Portal:', client.portalUrl);
      console.log('========================\n');
      return;
    }
    throw new Error('Email service not initialized');
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@thelawshop.com',
    to: lawyerEmail,
    subject: 'New Client Portal Created',
    html: `
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
                <p><strong>Name:</strong> ${client.profile.firstName} ${client.profile.lastName}<br>
                <strong>Email:</strong> <a href="mailto:${client.profile.email}">${client.profile.email}</a><br>
                <strong>Phone:</strong> ${client.profile.mobile}<br>
                <strong>Portal:</strong> <a href="${client.portalUrl}">${client.portalUrl}</a><br>
                <strong>Created:</strong> ${new Date(client.createdAt).toLocaleString()}</p>
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
    `,
    text: `
New Client Portal Created

A new client has created their portal through the web form.

Client Information:
- Name: ${client.profile.firstName} ${client.profile.lastName}
- Email: ${client.profile.email}
- Phone: ${client.profile.mobile}
- Portal: ${client.portalUrl}
- Created: ${new Date(client.createdAt).toLocaleString()}

Please follow up with the client to:
- Confirm their portal access
- Schedule an initial consultation if needed
- Upload any relevant documents to their portal

The client has been sent a welcome email with their portal access information.

This is an automated notification from the TLS Portal system.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Lawyer notification sent:', info.messageId);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Failed to send lawyer notification:', error);
    // Don't throw - lawyer notification is not critical
  }
}